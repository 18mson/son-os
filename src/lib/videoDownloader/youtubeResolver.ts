// src/lib/videoDownloader/youtubeResolver.ts

export interface ResolvedYouTubeStream {
  downloadUrl: string;
  filename: string;
  quality?: string;
  source: string;
}

// Fallback pool of known active Cobalt API instances (prioritizing open instances)
const DEFAULT_COBALT_APIS = [
  "https://rue-cobalt.xenon.zone",
  "https://dog.kittycat.boo",
  "https://cobalt-api.kwiatekm.pl",
  "https://cobalt.tools",
  "https://api.cobalt.tools",
  "https://cobalt-alpha.wolfy.love",
  "https://subito-c.meowing.de",
  "https://bergung-api.hoffnungfuerdiezukunft.net",
  "https://kitty.tame.gg",
];

/**
 * Mengambil daftar endpoint API yang sedang aktif dari directory
 */
async function getActiveCobaltApis(): Promise<string[]> {
  try {
    const res = await fetch("https://cobalt.directory/api/working?type=api", {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data?.youtube) && json.data.youtube.length > 0) {
        // Prioritaskan instance yang diketahui bekerja tanpa otentikasi JWT
        const workingList = [
          "https://rue-cobalt.xenon.zone",
          "https://dog.kittycat.boo",
          ...json.data.youtube,
          ...DEFAULT_COBALT_APIS,
        ];
        return Array.from(new Set(workingList));
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_COBALT_APIS;
}

/**
 * Mengekstrak direct download URL untuk video YouTube (MP4 atau MP3)
 * Menghasilkan direct file stream tanpa perlu dialihkan ke situs pihak ketiga
 */
export async function resolveYouTubeStream(
  youtubeUrlOrId: string,
  options: {
    format?: "mp4" | "mp3";
    quality?: "720" | "1080" | "360" | "480" | "1440" | "2160" | "max";
  } = {}
): Promise<ResolvedYouTubeStream | null> {
  const isAudio = options.format === "mp3";
  const videoQuality = options.quality || "720";

  let fullUrl = youtubeUrlOrId.trim();
  if (!fullUrl.startsWith("http")) {
    fullUrl = `https://www.youtube.com/watch?v=${youtubeUrlOrId.trim()}`;
  }

  const apis = await getActiveCobaltApis();

  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const endpoint = api.endsWith("/") ? api : `${api}/`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "SonOS/1.0",
        },
        body: JSON.stringify({
          url: fullUrl,
          videoQuality: isAudio ? "720" : videoQuality,
          downloadMode: isAudio ? "audio" : "auto",
          audioFormat: isAudio ? "mp3" : undefined,
          youtubeVideoCodec: "h264",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();

        if (data.url && (data.status === "tunnel" || data.status === "redirect" || data.status === "stream" || !data.status)) {
          const filename =
            data.filename ||
            `youtube_${Date.now()}.${isAudio ? "mp3" : "mp4"}`;

          return {
            downloadUrl: data.url,
            filename,
            quality: videoQuality,
            source: api,
          };
        }

        // Support status picker format (array of streams)
        if (data.status === "picker" && Array.isArray(data.picker) && data.picker.length > 0) {
          const firstItem = data.picker[0];
          if (firstItem?.url) {
            return {
              downloadUrl: firstItem.url,
              filename: `youtube_${Date.now()}.${isAudio ? "mp3" : "mp4"}`,
              quality: videoQuality,
              source: api,
            };
          }
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

