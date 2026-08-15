// src/components/apps/videoDownloader/AudioExtractorTab.tsx
"use client";

import React, { useState, useRef } from "react";
import {
  Music,
  Upload,
  Download,
  Loader2,
  FileVideo,
  Volume2,
} from "lucide-react";
import { runAudioConversion } from "../audioConverter/ffmpegService";
import { VideoStreamInfo } from "./types";

interface AudioExtractorTabProps {
  initialStreamInfo?: VideoStreamInfo | null;
}

export const AudioExtractorTab: React.FC<AudioExtractorTabProps> = ({
  initialStreamInfo,
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState(initialStreamInfo?.url || "");
  const [targetFormat, setTargetFormat] = useState<"mp3" | "aac" | "wav">("mp3");
  const [bitrate, setBitrate] = useState<"128k" | "192k" | "320k">("192k");

  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [extractedAudioUrl, setExtractedAudioUrl] = useState<string | null>(null);
  const [extractedFileName, setExtractedFileName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mkv|mov|avi|ts|m4v|flv)$/i)) {
      setStatusMsg("Format file tidak didukung. Harap pilih file video.");
      return;
    }

    setVideoFile(file);
    setExtractedAudioUrl(null);
    setStatusMsg(null);
  };

  // Ekstrak Audio dari Local Video File via FFmpeg WASM
  const handleExtractFromFile = async () => {
    if (!videoFile || isExtracting) return;

    setIsExtracting(true);
    setProgress(0);
    setStatusMsg("Menyiapkan engine FFmpeg WASM...");

    try {
      const result = await runAudioConversion(
        videoFile,
        targetFormat,
        bitrate,
        false,
        "0",
        "0",
        (p) => {
          setProgress(p);
          setStatusMsg(`Mengekstrak audio (${p}%)...`);
        }
      );

      setExtractedAudioUrl(result.url);
      setExtractedFileName(result.fileName);
      setStatusMsg("Ekstraksi audio selesai!");
    } catch (err: unknown) {
      console.error("Audio extraction error:", err);
      setStatusMsg(`Gagal mengekstrak audio: ${err instanceof Error ? err.message : "Error"}`);
    } finally {
      setIsExtracting(false);
    }
  };

  // Ekstrak Audio dari URL Video (Direct Server Audio Extraction)
  const handleExtractFromUrl = async () => {
    if (!videoUrlInput.trim() || isExtracting) return;

    setIsExtracting(true);
    setProgress(15);
    setStatusMsg("Menghubungkan ke stream audio server...");

    try {
      const url = videoUrlInput.trim();
      const isYt = url.includes("youtube.com") || url.includes("youtu.be");
      const streamUrl = isYt
        ? `/api/video-downloader/stream?youtubeUrl=${encodeURIComponent(url)}&format=audio`
        : `/api/video-downloader/stream?url=${encodeURIComponent(url)}&format=audio`;

      setProgress(40);
      setStatusMsg("Mengekstrak dan mengunduh track audio...");

      const res = await fetch(streamUrl);
      if (!res.ok) throw new Error("Gagal mengambil stream audio");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const outputFilename = `audio_${Date.now()}.${isYt ? "m4a" : targetFormat}`;

      setProgress(100);
      setExtractedAudioUrl(blobUrl);
      setExtractedFileName(outputFilename);
      setStatusMsg("Ekstraksi audio selesai!");
    } catch (err: unknown) {
      console.error("URL audio extraction error:", err);
      setStatusMsg(`Gagal: ${err instanceof Error ? err.message : "Koneksi gagal"}`);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Input Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Source 1: Dari URL Video */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
              <Volume2 size={16} className="text-purple-400" />
              <span>Ekstrak dari URL Video</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Masukkan URL video untuk langsung diambil track suaranya.
            </p>

            <input
              type="url"
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="w-full p-2.5 bg-black/50 text-zinc-100 text-xs font-mono rounded-xl border border-white/10 focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 focus:outline-none placeholder:text-zinc-600"
            />
          </div>

          <button
            onClick={handleExtractFromUrl}
            disabled={!videoUrlInput.trim() || isExtracting}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            {isExtracting ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Music size={14} />
            )}
            <span>Ekstrak Audio dari URL</span>
          </button>
        </div>

        {/* Source 2: Upload File Video Lokal */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
              <FileVideo size={16} className="text-cyan-400" />
              <span>Ekstrak dari File Video Lokal</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Pilih file MP4, WebM, MKV, atau MOV dari perangkat Anda.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,.mp4,.webm,.mkv,.mov,.avi"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 border-2 border-dashed border-white/20 hover:border-cyan-400/50 rounded-xl bg-black/30 text-xs text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Upload size={15} className="text-cyan-400" />
              <span className="truncate">
                {videoFile ? videoFile.name : "Pilih File Video..."}
              </span>
            </button>
          </div>

          <button
            onClick={handleExtractFromFile}
            disabled={!videoFile || isExtracting}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            {isExtracting ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Music size={14} />
            )}
            <span>Ekstrak Audio dari File</span>
          </button>
        </div>
      </div>

      {/* Format & Quality Settings */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 font-semibold">Format Output:</span>
          <div className="flex gap-1.5">
            {(["mp3", "aac", "wav"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setTargetFormat(fmt)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all cursor-pointer ${targetFormat === fmt
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white/10 text-zinc-400 hover:text-white"
                  }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-400 font-semibold">Bitrate Kualitas:</span>
          <div className="flex gap-1.5">
            {(["128k", "192k", "320k"] as const).map((br) => (
              <button
                key={br}
                onClick={() => setBitrate(br)}
                className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] transition-all cursor-pointer ${bitrate === br
                    ? "bg-cyan-600 text-white shadow-md"
                    : "bg-white/10 text-zinc-400 hover:text-white"
                  }`}
              >
                {br.replace("k", " kbps")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress & Result Box */}
      {statusMsg && (
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-medium">{statusMsg}</span>
            {isExtracting && (
              <span className="font-mono text-purple-400 font-bold">{progress}%</span>
            )}
          </div>

          {isExtracting && (
            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {extractedAudioUrl && (
            <div className="pt-2 flex items-center justify-between flex-wrap gap-3 border-t border-white/10">
              <audio src={extractedAudioUrl} controls className="h-8 max-w-xs" />

              <a
                href={extractedAudioUrl}
                download={extractedFileName}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Simpan Audio ({extractedFileName})</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
