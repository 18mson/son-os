// src/app/api/video-downloader/inspect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { VideoStreamOption } from "@/components/apps/videoDownloader/types";
import { getYtDlpMetadata, formatByteSize } from "@/lib/videoDownloader/ytDlpEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "URL tidak valid. Masukkan URL video yang lengkap." },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Format URL tidak valid. Contoh: https://example.com/video.mp4 atau https://www.youtube.com/watch?v=...",
        },
        { status: 400 }
      );
    }

    const domain = parsedUrl.hostname.toLowerCase();

    // Helper untuk membuat nama file default dari URL
    const getCleanFilename = (targetUrl: URL, contentType?: string): string => {
      const pathname = targetUrl.pathname;
      const base = pathname.substring(pathname.lastIndexOf("/") + 1) || "downloaded_video";
      const cleanBase = base.split("?")[0].replace(/[^a-zA-Z0-9._-]/g, "_");

      if (cleanBase.includes(".")) return cleanBase;

      if (contentType?.includes("mp4")) return `${cleanBase}.mp4`;
      if (contentType?.includes("webm")) return `${cleanBase}.webm`;
      if (contentType?.includes("ogg")) return `${cleanBase}.ogg`;
      if (contentType?.includes("quicktime")) return `${cleanBase}.mov`;
      return `${cleanBase}.mp4`;
    };

    // =========================================================================
    // 1. DUKUNGAN YOUTUBE (watch?v=..., youtu.be/..., shorts/..., embed/...)
    // =========================================================================
    if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
      let youtubeId: string | null = null;

      if (domain.includes("youtu.be")) {
        youtubeId = parsedUrl.pathname.replace(/^\//, "").split("/")[0].split("?")[0];
      } else if (parsedUrl.searchParams.has("v")) {
        youtubeId = parsedUrl.searchParams.get("v");
      } else if (parsedUrl.pathname.includes("/shorts/")) {
        youtubeId = parsedUrl.pathname.split("/shorts/")[1]?.split("/")[0]?.split("?")[0];
      } else if (parsedUrl.pathname.includes("/embed/")) {
        youtubeId = parsedUrl.pathname.split("/embed/")[1]?.split("/")[0]?.split("?")[0];
      }

      if (!youtubeId) {
        return NextResponse.json(
          { success: false, error: "ID Video YouTube tidak ditemukan dalam URL." },
          { status: 400 }
        );
      }

      const directYoutubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

      // Ekstrak metadata via yt-dlp dengan oEmbed fallback
      let videoTitle = `YouTube Video (${youtubeId})`;
      let authorName = "YouTube Creator";
      let thumbnailUrl = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;
      let durationSeconds: number | undefined = undefined;

      const ytdlpData = await getYtDlpMetadata(directYoutubeUrl);

      const streamOptions: VideoStreamOption[] = [];

      if (ytdlpData) {
        if (ytdlpData.title) videoTitle = ytdlpData.title;
        if (ytdlpData.uploader) authorName = ytdlpData.uploader;
        if (ytdlpData.thumbnail) thumbnailUrl = ytdlpData.thumbnail;
        if (ytdlpData.duration) durationSeconds = ytdlpData.duration;

        const safeVideoFilename = `${videoTitle
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 60)}_${youtubeId}.mp4`;
        const safeAudioFilename = `${videoTitle
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 60)}_${youtubeId}.m4a`;

        // Daftar resolusi yang ingin ditampilkan (diurutkan dari tertinggi ke terendah)
        const allTargetHeights = [2160, 1440, 1080, 720, 480, 360, 240, 144];
        const activeHeights = allTargetHeights.filter((h) =>
          ytdlpData.availableResolutions.includes(h)
        );

        // Jika resolusi terdeteksi, tambahkan hanya yang benar-benar tersedia
        if (activeHeights.length > 0) {
          activeHeights.forEach((height) => {
            // Cari format video untuk resolusi ini (prioritaskan mp4 / avc1)
            const matchingFormats = ytdlpData.formats?.filter(
              (f) => f.height === height && f.vcodec && f.vcodec !== "none"
            ) || [];

            const vFormat =
              matchingFormats.find(
                (f) =>
                  f.vcodec?.toLowerCase().startsWith("avc") ||
                  f.vcodec?.toLowerCase().includes("h264")
              ) ||
              matchingFormats.find((f) => f.ext === "mp4") ||
              matchingFormats[0];

            // Khusus 360p: periksa apakah format 18 (pre-muxed 360p) tersedia
            let chosenFormat = vFormat;
            if (height === 360) {
              const fmt18 = ytdlpData.formats?.find((f) => f.format_id === "18");
              if (fmt18) chosenFormat = fmt18;
            }

            const vSize =
              chosenFormat?.filesize ||
              chosenFormat?.filesize_approx ||
              (chosenFormat?.tbr && durationSeconds
                ? Math.round((chosenFormat.tbr * 1024 * durationSeconds) / 8)
                : chosenFormat?.vbr && durationSeconds
                ? Math.round((chosenFormat.vbr * 1024 * durationSeconds) / 8)
                : 0);

            const aSize = ytdlpData.audioSizeEstimate || 0;
            const isCombined = chosenFormat?.acodec && chosenFormat.acodec !== "none";
            const totalBytes = vSize > 0 ? (isCombined ? vSize : vSize + aSize) : undefined;

            let qualityLabel = `${height}p`;
            let nameDesc = `${height}p SD`;
            if (height >= 2160) {
              qualityLabel = "4K UHD";
              nameDesc = "Video MP4 (4K Ultra HD)";
            } else if (height >= 1440) {
              qualityLabel = "1440p QHD";
              nameDesc = "Video MP4 (1440p 2K)";
            } else if (height >= 1080) {
              qualityLabel = "1080p FHD";
              nameDesc = "Video MP4 (1080p Full HD)";
            } else if (height >= 720) {
              qualityLabel = "720p HD";
              nameDesc = "Video MP4 (720p HD)";
            } else if (height >= 480) {
              qualityLabel = "480p SD";
              nameDesc = "Video MP4 (480p Standard)";
            } else if (height >= 360) {
              qualityLabel = "360p SD";
              nameDesc = "Video MP4 (360p Standard)";
            } else {
              qualityLabel = `${height}p`;
              nameDesc = `Video MP4 (${height}p Low)`;
            }

            const proxyUrl = `/api/video-downloader/stream?youtubeUrl=${encodeURIComponent(
              directYoutubeUrl
            )}&format=video&quality=${height}&filename=${encodeURIComponent(safeVideoFilename)}`;

            streamOptions.push({
              quality: qualityLabel,
              label: nameDesc,
              ext: "mp4",
              url: directYoutubeUrl,
              proxyUrl,
              isAudioOnly: false,
              sizeEstimate: totalBytes ? formatByteSize(totalBytes) : "Ukuran dinamis",
              sizeBytes: totalBytes,
            });
          });
        } else {
          // Fallback standar jika data resolusi parsial
          const proxyUrl = `/api/video-downloader/stream?youtubeUrl=${encodeURIComponent(
            directYoutubeUrl
          )}&format=video&quality=720&filename=${encodeURIComponent(safeVideoFilename)}`;
          streamOptions.push({
            quality: "720p HD",
            label: "Video MP4 (720p HD)",
            ext: "mp4",
            url: directYoutubeUrl,
            proxyUrl,
            isAudioOnly: false,
            sizeEstimate: "Ukuran dinamis",
          });
        }

        // Opsi Audio M4A/MP3
        const audioProxyUrl = `/api/video-downloader/stream?youtubeUrl=${encodeURIComponent(
          directYoutubeUrl
        )}&format=audio&filename=${encodeURIComponent(safeAudioFilename)}`;

        streamOptions.push({
          quality: "HQ Audio",
          label: "Audio M4A / MP3 (High Quality)",
          ext: "m4a",
          url: directYoutubeUrl,
          proxyUrl: audioProxyUrl,
          isAudioOnly: true,
          sizeEstimate: ytdlpData.audioSizeEstimate
            ? formatByteSize(ytdlpData.audioSizeEstimate)
            : "~3 MB",
          sizeBytes: ytdlpData.audioSizeEstimate || undefined,
        });

        // Opsi Poster HD
        const posterProxyUrl = `/api/video-downloader/stream?url=${encodeURIComponent(
          thumbnailUrl
        )}&filename=thumbnail_${youtubeId}.jpg`;

        streamOptions.push({
          quality: "HD Poster",
          label: "Gambar Sampul Thumbnail HD",
          ext: "image",
          url: thumbnailUrl,
          proxyUrl: posterProxyUrl,
          isAudioOnly: false,
          sizeEstimate: "< 1 MB",
        });
      } else {
        // Fallback ke oEmbed API resmi jika yt-dlp metadata gagal total
        try {
          const oembedRes = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`,
            { headers: { "User-Agent": "Mozilla/5.0" } }
          );
          if (oembedRes.ok) {
            const oembedData = await oembedRes.json();
            if (oembedData.title) videoTitle = oembedData.title;
            if (oembedData.author_name) authorName = oembedData.author_name;
            if (oembedData.thumbnail_url) thumbnailUrl = oembedData.thumbnail_url;
          }
        } catch {
          // ignore
        }

        const safeVideoFilename = `${videoTitle
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 60)}_${youtubeId}.mp4`;
        const safeAudioFilename = `${videoTitle
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 60)}_${youtubeId}.m4a`;

        // Hitung estimasi ukuran berbasis durasi atau standar rata-rata
        const dur = durationSeconds || 180; // default 3 menit jika tidak ada durasi
        const estSize = (kbps: number) => {
          const bytes = Math.round((kbps * 1024 * dur) / 8);
          return formatByteSize(bytes);
        };

        const resolutions = [
          { height: 2160, quality: "4K UHD", label: "Video MP4 (4K Ultra HD)", kbps: 15000 },
          { height: 1440, quality: "1440p QHD", label: "Video MP4 (1440p 2K)", kbps: 8000 },
          { height: 1080, quality: "1080p FHD", label: "Video MP4 (1080p Full HD)", kbps: 4500 },
          { height: 720, quality: "720p HD", label: "Video MP4 (720p HD)", kbps: 2200 },
          { height: 480, quality: "480p SD", label: "Video MP4 (480p Standard)", kbps: 1200 },
          { height: 360, quality: "360p SD", label: "Video MP4 (360p Standard)", kbps: 650 },
        ];

        resolutions.forEach((r) => {
          const videoProxyUrl = `/api/video-downloader/stream?youtubeUrl=${encodeURIComponent(
            directYoutubeUrl
          )}&format=video&quality=${r.height}&filename=${encodeURIComponent(safeVideoFilename)}`;

          const estimatedBytes = Math.round((r.kbps * 1024 * dur) / 8);

          streamOptions.push({
            quality: r.quality,
            label: r.label,
            ext: "mp4",
            url: directYoutubeUrl,
            proxyUrl: videoProxyUrl,
            isAudioOnly: false,
            sizeEstimate: estSize(r.kbps),
            sizeBytes: estimatedBytes,
          });
        });

        // Opsi Audio M4A / MP3
        const audioProxyUrl = `/api/video-downloader/stream?youtubeUrl=${encodeURIComponent(
          directYoutubeUrl
        )}&format=audio&filename=${encodeURIComponent(safeAudioFilename)}`;

        const audioEstBytes = Math.round((160 * 1024 * dur) / 8);

        streamOptions.push({
          quality: "HQ Audio",
          label: "Audio M4A / MP3 (High Quality)",
          ext: "m4a",
          url: directYoutubeUrl,
          proxyUrl: audioProxyUrl,
          isAudioOnly: true,
          sizeEstimate: estSize(160),
          sizeBytes: audioEstBytes,
        });

        // Opsi Poster HD
        const posterProxyUrl = `/api/video-downloader/stream?url=${encodeURIComponent(
          thumbnailUrl
        )}&filename=thumbnail_${youtubeId}.jpg`;

        streamOptions.push({
          quality: "HD Poster",
          label: "Gambar Sampul Thumbnail HD",
          ext: "image",
          url: thumbnailUrl,
          proxyUrl: posterProxyUrl,
          isAudioOnly: false,
          sizeEstimate: "< 1 MB",
        });
      }

      const defaultProxyUrl = streamOptions[0]?.proxyUrl || "";

      return NextResponse.json({
        success: true,
        data: {
          url: directYoutubeUrl,
          proxyUrl: defaultProxyUrl,
          title: videoTitle,
          filename: streamOptions[0]?.ext === "mp4" ? `${videoTitle}.mp4` : `${videoTitle}.m4a`,
          mimeType: "video/mp4",
          thumbnailUrl,
          domain: "youtube.com",
          isDirectStream: true,
          isYouTube: true,
          youtubeId,
          author: authorName,
          durationSeconds,
          quality: streamOptions[0]?.quality || "720p HD",
          streamOptions,
        },
      });
    }

    // =========================================================================
    // 2. DUKUNGAN DIRECT VIDEO STREAM (.mp4, .webm, .mkv, cdn links)
    // =========================================================================
    let headResponse: Response | null = null;
    try {
      headResponse = await fetch(parsedUrl.toString(), {
        method: "HEAD",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        redirect: "follow",
      });
    } catch {
      headResponse = null;
    }

    const contentType = headResponse?.headers.get("content-type") || "";
    const contentLength = headResponse?.headers.get("content-length");
    const contentDisposition = headResponse?.headers.get("content-disposition");

    let filename = getCleanFilename(parsedUrl, contentType);
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1].trim());
      }
    }

    const isDirectVideo =
      contentType.startsWith("video/") ||
      contentType.startsWith("audio/") ||
      contentType.includes("application/ogg") ||
      /\.(mp4|webm|mkv|mov|avi|ts|m4v|3gp|flv|mp3|wav|m4a|aac)(\?|$)/i.test(parsedUrl.pathname);

    if (isDirectVideo) {
      const sizeBytes = contentLength ? parseInt(contentLength, 10) : undefined;
      const title = filename.replace(/\.[^/.]+$/, "").replace(/[_.-]+/g, " ");

      const proxyUrl = `/api/video-downloader/stream?url=${encodeURIComponent(
        parsedUrl.toString()
      )}&filename=${encodeURIComponent(filename)}`;

      return NextResponse.json({
        success: true,
        data: {
          url: parsedUrl.toString(),
          proxyUrl,
          title: title || "Video Stream",
          filename,
          mimeType: contentType || "video/mp4",
          sizeBytes,
          domain,
          isDirectStream: true,
          isYouTube: false,
          quality: sizeBytes && sizeBytes > 50 * 1024 * 1024 ? "Full HD / Original" : "Standard",
        },
      });
    }

    // =========================================================================
    // 3. DUKUNGAN HALAMAN WEB HTML (OpenGraph / <video> tags)
    // =========================================================================
    try {
      const htmlResponse = await fetch(parsedUrl.toString(), {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });

      if (!htmlResponse.ok) {
        throw new Error(`Server target merespons status ${htmlResponse.status}`);
      }

      const html = await htmlResponse.text();

      const titleMatch =
        html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<title>([^<]+)<\/title>/i);
      const pageTitle = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

      const thumbMatch =
        html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
      const thumbnailUrl = thumbMatch ? thumbMatch[1].trim() : undefined;

      const extractedStreamUrls: string[] = [];

      const ogVideoMatches = Array.from(
        html.matchAll(
          /<meta\s+(?:property|name)=["'](?:og:video|og:video:url|og:video:secure_url|twitter:player:stream)["']\s+content=["']([^"']+)["']/gi
        )
      );
      for (const m of ogVideoMatches) {
        if (m[1] && !extractedStreamUrls.includes(m[1])) {
          extractedStreamUrls.push(m[1]);
        }
      }

      const videoTagMatches = Array.from(
        html.matchAll(
          /<(?:video|source)[^>]+src=["']([^"']+\.(?:mp4|webm|mov|mkv|ogg|m4v)[^"']*)["']/gi
        )
      );
      for (const m of videoTagMatches) {
        let src = m[1];
        if (src.startsWith("//")) {
          src = `${parsedUrl.protocol}${src}`;
        } else if (src.startsWith("/")) {
          src = `${parsedUrl.origin}${src}`;
        }
        if (src && !extractedStreamUrls.includes(src)) {
          extractedStreamUrls.push(src);
        }
      }

      if (extractedStreamUrls.length > 0) {
        const streams = extractedStreamUrls.map((streamUrl, idx) => {
          let streamParsed: URL;
          try {
            streamParsed = new URL(streamUrl);
          } catch {
            streamParsed = new URL(streamUrl, parsedUrl.origin);
          }

          const streamFilename = getCleanFilename(streamParsed, "video/mp4");
          const proxyUrl = `/api/video-downloader/stream?url=${encodeURIComponent(
            streamParsed.toString()
          )}&filename=${encodeURIComponent(streamFilename)}`;

          return {
            url: streamParsed.toString(),
            proxyUrl,
            title: `${pageTitle} (Stream ${idx + 1})`,
            filename: streamFilename,
            mimeType: "video/mp4",
            thumbnailUrl,
            domain: streamParsed.hostname,
            isDirectStream: true,
            isYouTube: false,
          };
        });

        return NextResponse.json({
          success: true,
          data: streams[0],
          streams,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Tidak dapat menemukan stream video langsung pada tautan halaman web ini. Pastikan Anda memasukkan URL video langsung (.mp4, .webm) atau URL YouTube / OpenGraph video.",
          details: `URL: ${parsedUrl.toString()} (Tipe: ${contentType || "text/html"})`,
        },
        { status: 422 }
      );
    } catch (fetchErr: unknown) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      return NextResponse.json(
        {
          success: false,
          error: `Gagal menganalisis URL: ${msg}`,
        },
        { status: 502 }
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan server: ${msg}` },
      { status: 500 }
    );
  }
}
