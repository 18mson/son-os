// src/lib/videoDownloader/cobaltEngine.ts
/**
 * Engine Stream Resolver Berkecepatan Tinggi untuk Vercel Serverless
 * Menggunakan Promise.any parallel racing ke pool instance terbuka
 */

interface StreamResult {
  downloadUrl: string;
  filename: string;
}

const PUBLIC_INSTANCES = [
  "https://rue-cobalt.xenon.zone",
  "https://dog.kittycat.boo",
  "https://cobalt.krawaller.se",
  "https://cobalt.synced.club",
  "https://cobalt-api.kwiatekm.pl",
  "https://cobalt.tools",
];

export async function resolveStreamFast(
  youtubeUrl: string,
  options: {
    format?: "mp4" | "mp3";
    quality?: "360" | "480" | "720" | "1080" | "1440" | "2160";
  } = {}
): Promise<StreamResult | null> {
  const isAudio = options.format === "mp3";
  const quality = options.quality || "720";

  const payload = {
    url: youtubeUrl,
    videoQuality: quality,
    downloadMode: isAudio ? "audio" : "auto",
    audioFormat: "mp3",
    filenameStyle: "pretty",
  };

  const requests = PUBLIC_INSTANCES.map(async (baseUrl) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`Instance ${baseUrl} returned ${res.status}`);
      }

      const data = await res.json();

      if (data.status === "tunnel" || data.status === "redirect" || data.url) {
        const streamUrl = data.url;
        if (streamUrl && typeof streamUrl === "string" && streamUrl.startsWith("http")) {
          return {
            downloadUrl: streamUrl,
            filename: data.filename || `youtube_${quality}p.${isAudio ? "mp3" : "mp4"}`,
          };
        }
      }

      throw new Error(`Instance ${baseUrl} did not return a valid stream`);
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  });

  try {
    return await Promise.any(requests);
  } catch {
    return null;
  }
}
