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
  "https://co.wuk.sh",
  "https://cobalt.tools",
  "https://api.cobalt.tools",
  "https://cobalt-alpha.wolfy.love",
  "https://subito-c.meowing.de",
];

/**
 * Mengambil daftar endpoint API yang sedang aktif dari directory
 */
async function getActiveCobaltApis(): Promise<string[]> {
  try {
    const res = await fetch("https://cobalt.directory/api/working?type=api", {
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data?.youtube) && json.data.youtube.length > 0) {
        // Gabungkan dengan prioritas instance terbuka
        const combined = [
          "https://rue-cobalt.xenon.zone",
          "https://dog.kittycat.boo",
          ...json.data.youtube,
          ...DEFAULT_COBALT_APIS,
        ];
        return Array.from(new Set(combined));
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_COBALT_APIS;
}

/**
 * Helper untuk query 1 instance API secara independen
 */
async function querySingleApi(
  api: string,
  payload: Record<string, unknown>,
  timeoutMs = 5000
): Promise<ResolvedYouTubeStream> {
  const endpoint = api.endsWith("/") ? api : `${api}/`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "SonOS/2.0",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data.status === "error" || data.error) {
    throw new Error(data.error?.code || "API error");
  }

  if (
    data.url &&
    (data.status === "tunnel" || data.status === "redirect" || data.status === "stream" || !data.status)
  ) {
    return {
      downloadUrl: data.url,
      filename:
        data.filename ||
        `youtube_${Date.now()}.${payload.downloadMode === "audio" ? "mp3" : "mp4"}`,
      quality: String(payload.videoQuality || "720"),
      source: api,
    };
  }

  // Support format picker jika mengembalikan opsi array
  if (data.status === "picker" && Array.isArray(data.picker) && data.picker.length > 0) {
    const firstItem = data.picker[0];
    if (firstItem?.url) {
      return {
        downloadUrl: firstItem.url,
        filename: `youtube_${Date.now()}.${payload.downloadMode === "audio" ? "mp3" : "mp4"}`,
        quality: String(payload.videoQuality || "720"),
        source: api,
      };
    }
  }

  throw new Error("No usable stream URL in response");
}

/**
 * Mengekstrak direct download URL untuk video YouTube (MP4 atau MP3)
 * Menggunakan Concurrent Racing (Promise.any) agar respon instan dalam < 1.5 detik
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

  const payload = {
    url: fullUrl,
    videoQuality: isAudio ? "720" : videoQuality,
    downloadMode: isAudio ? "audio" : "auto",
    audioFormat: isAudio ? "mp3" : undefined,
    youtubeVideoCodec: "h264",
  };

  try {
    // Jalankan query ke semua instance sekaligus secara paralel (Promise.any)
    // Respon tercepat yang berhasil akan langsung menang & dikembalikan seketika
    const fastestResult = await Promise.any(
      apis.map((api) => querySingleApi(api, payload, 5500))
    );

    return fastestResult;
  } catch (err) {
    console.warn("[resolveYouTubeStream] All concurrent instances failed:", err);
    return null;
  }
}


