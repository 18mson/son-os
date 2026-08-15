// src/app/api/video-downloader/stream/route.ts
import { NextRequest, NextResponse } from "next/server";
import { spawnYtDlpStream, downloadYtDlpToTempFile } from "@/lib/videoDownloader/ytDlpEngine";
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
  // 1. ENGINE YT-DLP UNTUK YOUTUBE / STREAM KHUSUS
  // =========================================================================
  if (
    youtubeUrl ||
    (targetUrl && (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be")))
  ) {
    const streamTarget = youtubeUrl || targetUrl!;

    // Untuk semua video MP4, unduh dan muxing via temp file untuk memastikan file 100% valid & playable
    if (format === "video") {
      try {
        const tempResult = await downloadYtDlpToTempFile(streamTarget, { format, quality });
        if (tempResult && fs.existsSync(tempResult.filePath)) {
          const stats = fs.statSync(tempResult.filePath);
          const nodeStream = fs.createReadStream(tempResult.filePath);

          if (!filename.endsWith(`.${tempResult.extension}`)) {
            filename = `${filename.replace(/\.[^/.]+$/, "")}.${tempResult.extension}`;
          }

          // Hapus file sementara setelah stream selesai ditransmisikan
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
        } else {
          return new NextResponse("Gagal memproses render video stream. Silakan coba lagi.", {
            status: 500,
          });
        }
      } catch (e) {
        console.warn("[yt-dlp temp download error]:", e);
        return new NextResponse(`Terjadi kesalahan server saat memproses video: ${e}`, {
          status: 502,
        });
      }
    }

    // Direct stdout streaming (untuk Audio m4a / format audio)
    try {
      const { process: child, mimeType, extension } = spawnYtDlpStream(streamTarget, {
        format,
        quality,
      });

      if (!filename.endsWith(`.${extension}`)) {
        filename = `${filename.replace(/\.[^/.]+$/, "")}.${extension}`;
      }

      if (!child.stdout) {
        return new NextResponse("Gagal menginisialisasi streaming process", { status: 500 });
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return new NextResponse(`yt-dlp stream error: ${msg}`, { status: 502 });
    }
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
