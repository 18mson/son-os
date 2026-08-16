// src/app/api/video-downloader/stream/route.ts
import { NextRequest, NextResponse } from "next/server";
import { spawnYtDlpStream, downloadYtDlpToTempFile, getYtDlpPath } from "@/lib/videoDownloader/ytDlpEngine";
import { resolveStreamFast } from "@/lib/videoDownloader/cobaltEngine";
import { Readable } from "stream";
import fs from "fs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  const youtubeUrl = searchParams.get("youtubeUrl");
  const format = (searchParams.get("format") as "video" | "audio") || "video";
  const quality =
    (searchParams.get("quality") as
      | "720"
      | "360"
      | "480"
      | "1080"
      | "1440"
      | "2160"
      | "best") || "720";
  let filename =
    searchParams.get("filename") || `video_${Date.now()}.${format === "audio" ? "m4a" : "mp4"}`;

  // =========================================================================
  // 0. DEDICATED MICROSERVICE REDIRECT (Jika DOWNLOADER_API_URL diatur)
  // =========================================================================
  const externalServiceUrl =
    process.env.DOWNLOADER_API_URL || process.env.NEXT_PUBLIC_DOWNLOADER_API_URL;

  if (
    externalServiceUrl &&
    (youtubeUrl || (targetUrl && (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be"))))
  ) {
    const extStreamUrl = `${externalServiceUrl.replace(/\/$/, "")}/stream?${searchParams.toString()}`;
    return NextResponse.redirect(extStreamUrl, 307);
  }

  // =========================================================================
  // 1. ENGINE YT-DLP (LOKAL) DENGAN CLOUD STREAM RESOLVER (VERCEL)
  // =========================================================================
  if (
    youtubeUrl ||
    (targetUrl && (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be")))
  ) {
    const streamTarget = youtubeUrl || targetUrl!;

    // 1A. Coba yt-dlp lokal jika binary tersedia (di komputer lokal macOS/Linux/Windows)
    if (format === "video") {
      try {
        const bin = getYtDlpPath();
        if (fs.existsSync(bin) || bin !== "yt-dlp") {
          const tempResult = await downloadYtDlpToTempFile(streamTarget, { format, quality });
          if (tempResult && fs.existsSync(tempResult.filePath)) {
            const stats = fs.statSync(tempResult.filePath);
            const nodeStream = fs.createReadStream(tempResult.filePath);

            if (!filename.endsWith(`.${tempResult.extension}`)) {
              filename = `${filename.replace(/\.[^/.]+$/, "")}.${tempResult.extension}`;
            }

            nodeStream.on("close", () => {
              try {
                if (fs.existsSync(tempResult.filePath)) {
                  fs.unlinkSync(tempResult.filePath);
                }
              } catch {
                // ignore
              }
            });

            const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;
            const responseHeaders = new Headers();
            responseHeaders.set("Content-Type", tempResult.mimeType);
            responseHeaders.set("Content-Length", stats.size.toString());
            responseHeaders.set(
              "Content-Disposition",
              `attachment; filename="${encodeURIComponent(filename)}"`
            );
            responseHeaders.set("Access-Control-Allow-Origin", "*");
            responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");

            return new NextResponse(webStream, {
              status: 200,
              headers: responseHeaders,
            });
          }
        }
      } catch (e) {
        console.warn("[yt-dlp local bypassed, switching to fast stream resolver]:", e);
      }
    } else {
      // Audio stream via local yt-dlp jika binary tersedia
      try {
        const bin = getYtDlpPath();
        if (fs.existsSync(bin) || bin !== "yt-dlp") {
          const { process: child, mimeType, extension } = spawnYtDlpStream(streamTarget, {
            format,
            quality,
          });

          if (child.stdout) {
            if (!filename.endsWith(`.${extension}`)) {
              filename = `${filename.replace(/\.[^/.]+$/, "")}.${extension}`;
            }

            const webStream = Readable.toWeb(child.stdout) as unknown as ReadableStream;
            const responseHeaders = new Headers();
            responseHeaders.set("Content-Type", mimeType);
            responseHeaders.set(
              "Content-Disposition",
              `attachment; filename="${encodeURIComponent(filename)}"`
            );
            responseHeaders.set("Access-Control-Allow-Origin", "*");
            responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");

            return new NextResponse(webStream, {
              status: 200,
              headers: responseHeaders,
            });
          }
        }
      } catch {
        // fallback
      }
    }

    // 1B. Fast Cloud Stream Resolver (Untuk Vercel Deployment)
    try {
      const q =
        quality === "360"
          ? "360"
          : quality === "480"
          ? "480"
          : quality === "1080"
          ? "1080"
          : quality === "1440"
          ? "1440"
          : quality === "2160"
          ? "2160"
          : "720";

      const resolved = await resolveStreamFast(streamTarget, {
        format: format === "audio" ? "mp3" : "mp4",
        quality: q,
      });

      if (resolved && resolved.downloadUrl) {
        // Stream / redirect langsung ke file CDN
        return NextResponse.redirect(resolved.downloadUrl, 307);
      }
    } catch (resolverErr) {
      console.warn("[Fast Stream Resolver Error]:", resolverErr);
    }

    return new NextResponse(
      "Gagal mengunduh stream video YouTube. Silakan coba kualitas lain (misal: 720p atau 360p).",
      { status: 502 }
    );
  }

  // =========================================================================
  // 2. DIRECT URL PROXY STREAMING
  // =========================================================================
  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const rangeHeader = req.headers.get("range");

    const fetchHeaders: HeadersInit = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "*/*",
    };

    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const remoteRes = await fetch(targetUrl, {
      headers: fetchHeaders,
      redirect: "follow",
    });

    if (!remoteRes.ok && remoteRes.status !== 206) {
      return new NextResponse(`Remote server returned status ${remoteRes.status}`, {
        status: remoteRes.status,
      });
    }

    const responseHeaders = new Headers();
    const contentType = remoteRes.headers.get("content-type") || "video/mp4";
    const contentLength = remoteRes.headers.get("content-length");
    const contentRange = remoteRes.headers.get("content-range");
    const acceptRanges = remoteRes.headers.get("accept-ranges") || "bytes";

    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Accept-Ranges", acceptRanges);

    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    responseHeaders.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Cache-Control", "public, max-age=3600");

    return new NextResponse(remoteRes.body, {
      status: remoteRes.status,
      statusText: remoteRes.statusText,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Failed to stream video: ${msg}`, { status: 502 });
  }
}
