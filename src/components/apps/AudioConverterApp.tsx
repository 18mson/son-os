"use client";

import React, { useState, useRef } from "react";
import {
  Music,
  Upload,
  RefreshCw,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  FileAudio,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { ConverterOptionsGrid, TargetFormat, BitrateOption } from "./audioConverter/ConverterOptionsGrid";
import { AudioTrimPanel } from "./audioConverter/AudioTrimPanel";
import { runAudioConversion } from "./audioConverter/ffmpegService";

export const AudioConverterApp: React.FC = () => {
  const { theme } = useWindowStore();
  const isLight = theme === "light";

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("mp3");
  const [bitrate, setBitrate] = useState<BitrateOption>("192k");

  const [enableTrim, setEnableTrim] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>("0");
  const [endTime, setEndTime] = useState<string>("0");
  const [duration, setDuration] = useState<number>(0);

  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|ogg|flac|m4a|aac|webm|wma)$/i)) {
      setStatusMsg("Format file tidak didukung. Harap pilih file audio.");
      return;
    }

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      setDuration(tempAudio.duration);
      setEndTime(Math.floor(tempAudio.duration).toString());
    };

    setConvertedUrl(null);
    setStatusMsg(null);
    setProgress(0);
  };

  const handleConvert = async () => {
    if (!audioFile) return;

    setIsConverting(true);
    setProgress(0);
    setStatusMsg("Menyiapkan konversi audio WebAssembly...");

    try {
      const res = await runAudioConversion(
        audioFile,
        targetFormat,
        bitrate,
        enableTrim,
        startTime,
        endTime,
        (p) => setProgress(p)
      );

      setConvertedUrl(res.url);
      setConvertedFileName(res.fileName);
      setStatusMsg("Konversi berhasil diselesaikan!");
    } catch (err: unknown) {
      console.error(err);
      setStatusMsg("Gagal mengonversi file audio. Pastikan file audio valid.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className={`flex flex-col h-full w-full select-none font-sans overflow-hidden ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Top Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 shrink-0 ${
        isLight ? "bg-slate-200/90 border-slate-300" : "bg-zinc-900/90 border-white/10"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md">
            <Music size={18} />
          </div>
          <div>
            <h1 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Audio Converter & Cutter</h1>
            <p className={`text-[10px] ${isLight ? "text-slate-600" : "text-zinc-400"}`}>Konversi & Potong Format Audio WebAssembly</p>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <Upload size={14} /> Pilih Audio
        </button>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {audioFile ? (
          <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${
            isLight ? "bg-white border-slate-300 shadow-sm" : "bg-zinc-900/80 border-white/12"
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileAudio size={28} className="text-purple-500 shrink-0" />
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                    {audioFile.name}
                  </p>
                  <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    Ukuran: {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300" : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                }`}
              >
                Ganti
              </button>
            </div>

            {audioUrl && <audio controls src={audioUrl} className="w-full h-8 mt-1" />}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isLight
                ? "border-slate-300 bg-white/60 hover:bg-slate-100/80"
                : "border-white/15 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="p-4 rounded-3xl bg-purple-500/10 text-purple-500 mb-3">
              <Upload size={32} />
            </div>
            <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Pilih file audio yang ingin dikonversi</h3>
            <p className={`text-xs mt-1 max-w-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Mendukung MP3, WAV, OGG, FLAC, AAC, WebM, M4A
            </p>
          </div>
        )}

        <ConverterOptionsGrid
          isLight={isLight}
          targetFormat={targetFormat}
          setTargetFormat={setTargetFormat}
          bitrate={bitrate}
          setBitrate={setBitrate}
        />

        <AudioTrimPanel
          isLight={isLight}
          enableTrim={enableTrim}
          setEnableTrim={setEnableTrim}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          duration={duration}
        />

        {statusMsg && (
          <div className={`p-3 rounded-2xl border text-xs font-medium flex items-center gap-2 ${
            convertedUrl
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : isConverting
              ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
              : "bg-rose-500/15 border-rose-500/30 text-rose-400"
          }`}>
            {convertedUrl ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg}</span>
          </div>
        )}

        {isConverting && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span>Proses Konversi...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {convertedUrl ? (
          <div className="flex items-center gap-3 pt-2">
            <a
              href={convertedUrl}
              download={convertedFileName}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all text-center"
            >
              <Download size={16} /> Unduh File Konversi ({targetFormat.toUpperCase()})
            </a>
            <audio controls src={convertedUrl} className="hidden sm:block h-9" />
          </div>
        ) : (
          <button
            onClick={handleConvert}
            disabled={!audioFile || isConverting}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              !audioFile || isConverting
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-500 text-white"
            }`}
          >
            {isConverting ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
            {isConverting ? "Sedang Mengonversi..." : `Mulai Konversi ke ${targetFormat.toUpperCase()}`}
          </button>
        )}
      </div>
    </div>
  );
};
