// src/components/apps/videoDownloader/VideoPreviewCard.tsx
"use client";

import React, { useState, useRef } from "react";
import {
  Download,
  Play,
  Copy,
  Check,
  Music,
  HardDrive,
  Globe,
  Film,
  Zap,
  Loader2,
  User,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  XCircle,
  Gauge,
} from "lucide-react";
import { VideoStreamInfo, VideoStreamOption } from "./types";

interface VideoPreviewCardProps {
  streamInfo: VideoStreamInfo;
  onDownloadStarted?: (item: VideoStreamInfo) => void;
  onExtractAudio?: (streamInfo: VideoStreamInfo) => void;
}

export const VideoPreviewCard: React.FC<VideoPreviewCardProps> = ({
  streamInfo,
  onDownloadStarted,
  onExtractAudio,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState("");
  const [downloadedBytesStr, setDownloadedBytesStr] = useState("");
  const [downloadStage, setDownloadStage] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ w: number; h: number } | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>(
    streamInfo.streamOptions?.[0]?.quality || "720p HD"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return "Ukuran dinamis";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(streamInfo.url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  // Batalkan proses download yang sedang berjalan
  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsDownloading(false);
    setDownloadProgress(0);
    setDownloadSpeed("");
    setDownloadedBytesStr("");
    setDownloadStage("");
    setErrorMessage("Unduhan dibatalkan oleh pengguna.");
    setTimeout(() => setErrorMessage(null), 3000);
  };

  // Unduh via Fetch Stream dengan Progress Bar real-time & simpan langsung ke Disk
  const handleProgressDownload = async (targetStreamOpt?: VideoStreamOption) => {
    if (isDownloading) return;

    const opt =
      targetStreamOpt ||
      streamInfo.streamOptions?.find((o) => o.quality === selectedQuality) ||
      streamInfo.streamOptions?.[0];

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadSpeed("Memulai...");
    setDownloadStage("Menghubungkan ke server...");
    setErrorMessage(null);
    onDownloadStarted?.(streamInfo);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Khusus thumbnail gambar: simpan langsung HD image
    if (opt?.ext === "image") {
      try {
        const thumbUrl = opt.proxyUrl || streamInfo.thumbnailUrl;
        if (thumbUrl) {
          const res = await fetch(thumbUrl, { signal: abortController.signal });
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = `thumbnail_${streamInfo.youtubeId || Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setIsDownloading(false);
          return;
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }

    const targetUrl = opt?.proxyUrl || streamInfo.proxyUrl;
    const ext = opt?.ext || (streamInfo.mimeType.includes("audio") ? "m4a" : "mp4");
    const downloadFilename =
      ext === "image"
        ? `thumbnail_${streamInfo.youtubeId || Date.now()}.jpg`
        : ext === "m4a" || ext === "mp3"
          ? `${streamInfo.filename.replace(/\.[^/.]+$/, "")}.${ext}`
          : streamInfo.filename.endsWith(".mp4")
            ? streamInfo.filename
            : `${streamInfo.filename.replace(/\.[^/.]+$/, "")}.mp4`;

    const startTime = Date.now();
    let receivedBytes = 0;
    const targetExpectedBytes = opt?.sizeBytes || streamInfo.sizeBytes || 0;

    try {
      setDownloadStage("Menerima data stream...");
      const response = await fetch(targetUrl, { signal: abortController.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const headerContentLength = response.headers.get("content-length");
      const totalBytes = headerContentLength
        ? parseInt(headerContentLength, 10)
        : targetExpectedBytes;

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Body reader tidak tersedia");

      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          chunks.push(value);
          receivedBytes += value.length;

          if (totalBytes > 0) {
            const percent = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
            setDownloadProgress(percent);
          } else {
            // Animasi simulated progress bertahap jika total size tidak terkirim
            setDownloadProgress((prev) => (prev < 90 ? prev + 3 : prev));
          }

          // Hitung kecepatan download & perkiraan ukuran
          const elapsedSec = (Date.now() - startTime) / 1000;
          if (elapsedSec > 0.3) {
            const speedMbps = (receivedBytes / (1024 * 1024) / elapsedSec).toFixed(1);
            setDownloadSpeed(`${speedMbps} MB/s`);
            const currentMb = (receivedBytes / (1024 * 1024)).toFixed(1);
            const totalMb =
              totalBytes > 0 ? `${(totalBytes / (1024 * 1024)).toFixed(1)} MB` : "Stream...";
            setDownloadedBytesStr(`${currentMb} MB / ${totalMb}`);
          }
        }
      }

      if (receivedBytes === 0) {
        throw new Error("Stream video tidak mengembalikan data (0 bytes).");
      }

      setDownloadProgress(100);
      setDownloadStage("Menyimpan ke folder Download...");

      // Buat Blob dan trigger download langsung ke penyimpanan lokal
      const mime =
        ext === "mp3"
          ? "audio/mpeg"
          : ext === "m4a"
            ? "audio/mp4"
            : streamInfo.mimeType || "video/mp4";

      const blob = new Blob(chunks as BlobPart[], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadSpeed("");
        setDownloadedBytesStr("");
        setDownloadStage("");
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadSpeed("");
      setDownloadedBytesStr("");
      setDownloadStage("");
      const msg = err instanceof Error ? err.message : String(err);

      if (streamInfo.isYouTube) {
        setErrorMessage(
          `Gagal mengunduh stream: ${msg}. Anda dapat memutar video di atas atau menyimpan Poster HD.`
        );
      } else {
        setErrorMessage(`Gagal mengunduh: ${msg}`);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
        setVideoDimensions({
          w: videoRef.current.videoWidth,
          h: videoRef.current.videoHeight,
        });
      }
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds || isNaN(seconds)) return "Streaming";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentSelectedOpt =
    streamInfo.streamOptions?.find((o) => o.quality === selectedQuality) ||
    streamInfo.streamOptions?.[0];

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 sm:p-5 rounded-3xl bg-zinc-900/80 border border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      {/* Video Viewport / Preview Player */}
      <div className="lg:w-7/12 flex flex-col gap-2">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner flex items-center justify-center group">
          {streamInfo.isYouTube && streamInfo.youtubeId ? (
            /* YouTube IFrame Embed Player */
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${streamInfo.youtubeId}?autoplay=0&rel=0`}
              title={streamInfo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            /* Native Video Player */
            <>
              <video
                ref={videoRef}
                src={streamInfo.url}
                controls
                playsInline
                onLoadedMetadata={handleLoadedMetadata}
                poster={streamInfo.thumbnailUrl}
                className="w-full h-full object-contain"
              />

              {/* Quick Resolution Badge */}
              {videoDimensions && (
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 border border-white/15 text-[10px] font-mono text-cyan-300 backdrop-blur-md pointer-events-none">
                  {videoDimensions.w}x{videoDimensions.h}
                </div>
              )}
            </>
          )}
        </div>

        {/* Real-time Download Progress & Control Bar */}
        {isDownloading && (
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-200">
              <span className="flex items-center gap-1.5 truncate">
                <Loader2 className="animate-spin text-cyan-400 shrink-0" size={14} />
                <span>
                  {downloadStage || "Mengunduh Video..."} ({downloadProgress}%)
                </span>
              </span>

              <div className="flex items-center gap-2 shrink-0">
                {downloadSpeed && (
                  <span className="font-mono text-[11px] text-cyan-300 flex items-center gap-1">
                    <Gauge size={11} className="text-cyan-400" />
                    {downloadSpeed}
                  </span>
                )}

                {/* Tombol Cancel Download */}
                <button
                  type="button"
                  onClick={handleCancelDownload}
                  className="px-2 py-0.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Batalkan proses unduhan"
                >
                  <XCircle size={12} />
                  <span>Batal</span>
                </button>
              </div>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-2.5 bg-black/70 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className="h-full bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-150"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>

            {/* Bytes Counter & Target info */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="text-cyan-300 truncate">
                Kualitas: {selectedQuality}
              </span>
              <span>{downloadedBytesStr || "Menyiapkan file..."}</span>
            </div>
          </div>
        )}

        {/* In-App Error / Status Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs animate-in fade-in">
            <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{errorMessage}</span>
            </div>
          </div>
        )}
      </div>

      {/* Video Details & Action Panel */}
      <div className="lg:w-5/12 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {streamInfo.isYouTube ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-600/20 border border-red-500/40 text-red-300 flex items-center gap-1">
                  <Film size={11} className="text-red-400" /> YouTube
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                  <Film size={11} /> {streamInfo.mimeType.split("/")[1] || "Video"}
                </span>
              )}

              <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 truncate">
                <Globe size={11} /> {streamInfo.domain}
              </span>

              {streamInfo.author && (
                <span className="text-[10px] text-purple-300 font-medium flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 truncate">
                  <User size={10} /> {streamInfo.author}
                </span>
              )}
            </div>

            <h3
              className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2"
              title={streamInfo.title}
            >
              {streamInfo.title}
            </h3>
            <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
              {streamInfo.filename}
            </p>
          </div>

          {/* YouTube Quality Options Selector (Hanya resolusi yang benar-benar ada) */}
          {streamInfo.isYouTube && streamInfo.streamOptions && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" /> Pilihan Format / Resolusi Asli:
              </span>

              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {streamInfo.streamOptions.map((opt) => {
                  const isSelected = selectedQuality === opt.quality;
                  return (
                    <button
                      key={opt.quality}
                      type="button"
                      onClick={() => {
                        setSelectedQuality(opt.quality);
                        setErrorMessage(null);
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-0.5 ${isSelected
                          ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-sm ring-1 ring-cyan-500/40"
                          : "bg-black/30 border-white/5 text-zinc-300 hover:bg-white/5 hover:border-white/10"
                        }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span>{opt.quality}</span>
                        <span className="text-[9px] uppercase font-mono text-zinc-400">
                          {opt.ext}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 truncate font-mono">
                        {opt.sizeEstimate}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata Specs Grid for Direct Videos */}
          {!streamInfo.isYouTube && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <HardDrive size={11} className="text-purple-400" /> Ukuran File
                </span>
                <span className="font-bold text-white text-xs sm:text-sm mt-0.5">
                  {formatBytes(streamInfo.sizeBytes)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Play size={11} className="text-emerald-400" /> Durasi
                </span>
                <span className="font-bold text-white text-xs sm:text-sm mt-0.5">
                  {formatDuration(videoDuration || streamInfo.durationSeconds)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          {/* Primary Download / Cancel Button */}
          {isDownloading ? (
            <button
              type="button"
              onClick={handleCancelDownload}
              className="w-full py-3 px-4 rounded-2xl bg-linear-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <XCircle size={17} />
              <span>Batalkan Unduhan</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleProgressDownload(currentSelectedOpt)}
              className="w-full py-3 px-4 rounded-2xl bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Download size={17} />
              <span>
                {streamInfo.isYouTube
                  ? `Unduh ${selectedQuality} (${currentSelectedOpt?.sizeEstimate || "HD"})`
                  : "Unduh Video Sekarang (HD)"}
              </span>
            </button>
          )}

          {/* Secondary Buttons Row */}
          <div className="grid grid-cols-2 gap-2">
            {/* Extract Audio Button */}
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => {
                const audioOpt = streamInfo.streamOptions?.find((o) => o.isAudioOnly);
                if (audioOpt) {
                  handleProgressDownload(audioOpt);
                } else if (onExtractAudio) {
                  onExtractAudio(streamInfo);
                }
              }}
              className="py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Unduh trek suara ke format audio M4A/MP3"
            >
              <Music size={14} className="text-purple-400" />
              <span>Ambil Audio</span>
            </button>

            {/* Direct Link or Poster download */}
            {streamInfo.isYouTube ? (
              <button
                type="button"
                disabled={isDownloading}
                onClick={() => {
                  const posterOpt = streamInfo.streamOptions?.find((o) => o.ext === "image");
                  handleProgressDownload(posterOpt);
                }}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-center cursor-pointer disabled:opacity-50"
                title="Simpan Poster Thumbnail HD ke Disk"
              >
                <ImageIcon size={14} className="text-amber-400" />
                <span>Simpan Poster HD</span>
              </button>
            ) : (
              <a
                href={streamInfo.proxyUrl}
                download={streamInfo.filename}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-center"
                title="Unduh langsung via proxy stream browser"
              >
                <Zap size={14} className="text-amber-400" />
                <span>Direct Link</span>
              </a>
            )}
          </div>

          {/* Aux Options */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{isCopied ? "Tautan Tersalin!" : "Salin URL Asli"}</span>
            </button>

            <span className="text-[11px] text-zinc-500 font-mono">
              SonOS Video Downloader
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
