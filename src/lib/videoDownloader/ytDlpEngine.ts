// src/lib/videoDownloader/ytDlpEngine.ts
import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import ffmpegStatic from "ffmpeg-static";

/**
 * Mendapatkan lokasi executable binary yt-dlp (Mendukung Vercel Serverless /tmp execution)
 */
export function getYtDlpPath(): string {
  const isLinux = process.platform === "linux";

  // Pada Linux / Vercel Serverless: gunakan binary standalone ELF yang telah dibundle
  if (isLinux) {
    const tmpBin = path.join(os.tmpdir(), "yt-dlp");
    if (fs.existsSync(tmpBin)) {
      try {
        fs.chmodSync(tmpBin, 0o755);
      } catch {
        // ignore
      }
      return tmpBin;
    }

    const bundledBin = path.join(process.cwd(), "bin/yt-dlp");
    if (fs.existsSync(bundledBin)) {
      try {
        fs.copyFileSync(bundledBin, tmpBin);
        fs.chmodSync(tmpBin, 0o755);
        return tmpBin;
      } catch {
        return bundledBin;
      }
    }
  }

  // Pada Local Environment (macOS / Windows): gunakan binary local dari node_modules / sistem
  const localBin = path.join(process.cwd(), "node_modules/youtube-dl-exec/bin/yt-dlp");
  if (fs.existsSync(localBin)) {
    return localBin;
  }

  return "yt-dlp";
}

/**
 * Mendeteksi direktori FFmpeg (Mendukung ffmpeg-static & sistem OS)
 */
export function findFfmpegDir(): string | null {
  // 1. Cek ffmpeg-static package
  if (ffmpegStatic && typeof ffmpegStatic === "string" && fs.existsSync(ffmpegStatic)) {
    return path.dirname(ffmpegStatic);
  }

  // 2. Cek direktori sistem OS
  const possibleDirs = [
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
  ];
  for (const dir of possibleDirs) {
    if (fs.existsSync(path.join(dir, "ffmpeg"))) {
      return dir;
    }
  }
  return null;
}

/**
 * Helper untuk mendapatkan environment path yang menyertakan lokasi FFmpeg & Python
 */
function getEnhancedEnv(): NodeJS.ProcessEnv {
  const defaultPath = process.env.PATH || "";
  const ffmpegDir = findFfmpegDir();
  const extraPaths = ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin", os.tmpdir()];
  if (ffmpegDir && !extraPaths.includes(ffmpegDir)) {
    extraPaths.unshift(ffmpegDir);
  }
  const combinedPath = `${defaultPath}:${extraPaths.join(":")}`;
  return {
    ...process.env,
    PATH: combinedPath,
  };
}

/**
 * Mendapatkan folder temporary yang aman untuk Serverless (Vercel / Lambda) maupun Local
 */
function getTempDownloadsDir(): string {
  const tmpDir = path.join(os.tmpdir(), "son_downloads");
  if (!fs.existsSync(tmpDir)) {
    try {
      fs.mkdirSync(tmpDir, { recursive: true });
    } catch {
      // fallback ke os.tmpdir() langsung
      return os.tmpdir();
    }
  }
  return tmpDir;
}

export interface YtDlpFormat {
  format_id: string;
  ext: string;
  height?: number;
  width?: number;
  filesize?: number;
  filesize_approx?: number;
  vcodec?: string;
  acodec?: string;
  tbr?: number;
  vbr?: number;
  abr?: number;
}

export interface YtDlpVideoInfo {
  id: string;
  title: string;
  uploader?: string;
  duration?: number;
  thumbnail?: string;
  description?: string;
  formats?: YtDlpFormat[];
  availableResolutions: number[];
  audioSizeEstimate?: number;
}

/**
 * Mengekstrak informasi metadata video menggunakan yt-dlp
 */
export async function getYtDlpMetadata(url: string): Promise<YtDlpVideoInfo | null> {
  const bin = getYtDlpPath();

  return new Promise((resolve) => {
    const child = spawn(
      bin,
      [
        "--no-check-certificates",
        "--dump-single-json",
        "--no-playlist",
        "--extractor-args",
        "youtube:player_client=android_vr,web,mweb",
        url,
      ],
      { env: getEnhancedEnv() }
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(stdout);
          const rawFormats: YtDlpFormat[] = parsed.formats || [];

          // Ambil semua resolusi video unik yang benar-benar ada di sumber video
          const videoFormats = rawFormats.filter(
            (f) => f.vcodec && f.vcodec !== "none" && typeof f.height === "number" && f.height > 0
          );
          const availableResolutions = Array.from(
            new Set(videoFormats.map((f) => f.height as number))
          ).sort((a, b) => b - a);

          // Cari estimasi ukuran stream audio terbaik (Format 140 AAC 128k)
          const audioFormats = rawFormats.filter(
            (f) => f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none")
          );
          const bestAudio =
            audioFormats.find((f) => f.format_id === "140") ||
            audioFormats.find((f) => f.format_id === "251") ||
            audioFormats.find((f) => f.ext === "m4a" && (f.abr || 0) >= 120) ||
            audioFormats.sort(
              (a, b) =>
                (b.filesize || b.filesize_approx || b.abr || 0) -
                (a.filesize || a.filesize_approx || a.abr || 0)
            )[0];
          const audioSizeEstimate = bestAudio?.filesize || bestAudio?.filesize_approx || 0;

          resolve({
            id: parsed.id,
            title: parsed.title,
            uploader: parsed.uploader || parsed.channel,
            duration: parsed.duration,
            thumbnail: parsed.thumbnail,
            description: parsed.description,
            formats: rawFormats,
            availableResolutions,
            audioSizeEstimate,
          });
          return;
        } catch {
          resolve(null);
        }
      } else {
        console.warn(`[yt-dlp] metadata inspection failed (code ${code}):`, stderr.slice(0, 150));
        resolve(null);
      }
    });

    child.on("error", (err) => {
      console.warn("[yt-dlp] execution error:", err.message);
      resolve(null);
    });
  });
}

/**
 * Helper untuk menghitung estimasi ukuran file yang akurat dalam format teks (MB/KB)
 */
export function formatByteSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "Ukuran dinamis";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Menghasilkan child process yang men-stream audio langsung ke stdout (-o -)
 */
export function spawnYtDlpStream(
  url: string,
  options: {
    format?: "video" | "audio";
    quality?: string;
  } = {}
): {
  process: ChildProcess;
  mimeType: string;
  extension: string;
} {
  const bin = getYtDlpPath();
  const isAudio = options.format === "audio";

  const formatArg = isAudio ? "140/bestaudio[ext=m4a]/251/bestaudio" : "18/best";
  const extension = isAudio ? "m4a" : "mp4";
  const mimeType = isAudio ? "audio/mp4" : "video/mp4";

  const child = spawn(
    bin,
    [
      "--no-check-certificates",
      "--no-playlist",
      "--extractor-args",
      "youtube:player_client=android_vr,web,mweb",
      "-f",
      formatArg,
      "-o",
      "-",
      url,
    ],
    { env: getEnhancedEnv() }
  );

  return {
    process: child,
    mimeType,
    extension,
  };
}

/**
 * Mengunduh video menggunakan yt-dlp ke temporary file untuk memastikan hasil muxing MP4 utuh (H.264 + AAC)
 */
export async function downloadYtDlpToTempFile(
  url: string,
  options: {
    format?: "video" | "audio";
    quality?: string;
  } = {}
): Promise<{ filePath: string; extension: string; mimeType: string } | null> {
  const bin = getYtDlpPath();
  const isAudio = options.format === "audio";
  const quality = options.quality || "720";

  const tmpDir = getTempDownloadsDir();
  const uniqueId = `son_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const ext = isAudio ? "m4a" : "mp4";
  const outputTemplate = path.join(tmpDir, `${uniqueId}.%(ext)s`);
  const mimeType = isAudio ? "audio/mp4" : "video/mp4";

  // Prioritaskan format H.264 / AVC1 (vcodec^=avc1) dan AAC (140) untuk hasil muxing 100% playable
  let formatArg = `bestvideo[height<=${quality}][vcodec^=avc1]+140/bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`;
  if (isAudio) {
    formatArg = "140/bestaudio[ext=m4a]/251/bestaudio";
  } else if (quality === "360") {
    formatArg = "18/bestvideo[height<=360][vcodec^=avc1]+140/best";
  } else if (quality === "480") {
    formatArg = "bestvideo[height<=480][vcodec^=avc1]+140/bestvideo[height<=480]+bestaudio/best";
  } else if (quality === "720") {
    formatArg = "bestvideo[height<=720][vcodec^=avc1]+140/bestvideo[height<=720]+bestaudio/best";
  } else if (quality === "1080") {
    formatArg = "bestvideo[height<=1080][vcodec^=avc1]+140/bestvideo[height<=1080]+bestaudio/best";
  }

  const ffmpegDir = findFfmpegDir();

  return new Promise((resolve) => {
    const args: string[] = [
      "--no-check-certificates",
      "--no-playlist",
      "--extractor-args",
      "youtube:player_client=android_vr,web,mweb",
      "-f",
      formatArg,
    ];

    if (ffmpegDir) {
      args.push("--ffmpeg-location", ffmpegDir);
    }

    if (!isAudio && quality !== "360") {
      args.push("--merge-output-format", "mp4");
    }

    args.push("-o", outputTemplate, url);

    const child = spawn(bin, args, { env: getEnhancedEnv() });

    let stderrOutput = "";
    child.stderr.on("data", (chunk) => {
      stderrOutput += chunk.toString();
    });

    child.on("close", (code) => {
      let files: string[] = [];
      try {
        files = fs.readdirSync(/*turbopackIgnore: true*/ tmpDir).filter((f: string) =>
          f.startsWith(uniqueId)
        );
      } catch {
        files = [];
      }

      const finalFile =
        files.find(
          (f) =>
            !f.includes(".part") &&
            (f.endsWith(".mp4") || f.endsWith(".m4a") || f.endsWith(".webm"))
        ) || files[0];

      if (code === 0 && finalFile && fs.existsSync(path.join(tmpDir, finalFile))) {
        const fullPath = path.join(tmpDir, finalFile);
        const actualExt = finalFile.split(".").pop() || ext;
        resolve({ filePath: fullPath, extension: actualExt, mimeType });
      } else {
        console.warn(
          `[yt-dlp temp download failed with code ${code}]:`,
          stderrOutput.slice(0, 300)
        );
        try {
          files.forEach((f) => fs.unlinkSync(path.join(tmpDir, f)));
        } catch {
          // ignore
        }
        resolve(null);
      }
    });

    child.on("error", (err) => {
      console.warn("[yt-dlp error]:", err.message);
      resolve(null);
    });
  });
}
