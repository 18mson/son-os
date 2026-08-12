"use client";

import React, { useState, useRef } from "react";
import {
  Music,
  Upload,
  RefreshCw,
  Download,
  Play,
  Scissors,
  CheckCircle,
  AlertCircle,
  FileAudio,
  Sliders,
  Radio,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";

type TargetFormat = "mp3" | "wav" | "ogg" | "aac";
type BitrateOption = "128k" | "192k" | "256k" | "320k";

export const AudioConverterApp: React.FC = () => {
  const { theme } = useWindowStore();
  const isLight = theme === "light";

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("mp3");
  const [bitrate, setBitrate] = useState<BitrateOption>("192k");

  // Trim state
  const [enableTrim, setEnableTrim] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>("0");
  const [endTime, setEndTime] = useState<string>("0");
  const [duration, setDuration] = useState<number>(0);

  // Conversion state
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<unknown>(null);

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

    // Get audio duration
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      setDuration(tempAudio.duration);
      setEndTime(Math.floor(tempAudio.duration).toString());
    };

    setConvertedUrl(null);
    setStatusMsg(null);
    setProgress(0);
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current && isLoaded) return ffmpegRef.current;

    setStatusMsg("Memuat modul FFmpeg WebAssembly...");
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();

    ffmpeg.on("progress", ({ progress }) => {
      setProgress(Math.min(100, Math.round(progress * 100)));
    });

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpegRef.current = ffmpeg;
    setIsLoaded(true);
    return ffmpeg;
  };

  const handleConvert = async () => {
    if (!audioFile) {
      setStatusMsg("Silakan pilih file audio terlebih dahulu.");
      return;
    }

    try {
      setIsConverting(true);
      setProgress(5);
      setStatusMsg("Menginisialisasi modul FFmpeg...");

      const { fetchFile } = await import("@ffmpeg/util");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ffmpeg = (await loadFFmpeg()) as any;

      const inputName = `input_${Date.now()}_${audioFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const outputName = `output_${Date.now()}.${targetFormat}`;

      setStatusMsg("Membaca file audio...");
      await ffmpeg.writeFile(inputName, await fetchFile(audioFile));

      // Build FFmpeg Command Arguments
      const args: string[] = ["-i", inputName];

      if (enableTrim) {
        const startSec = parseFloat(startTime) || 0;
        const endSec = parseFloat(endTime) || duration;
        if (endSec > startSec) {
          args.push("-ss", startSec.toString());
          args.push("-to", endSec.toString());
        }
      }

      if (targetFormat === "mp3" || targetFormat === "aac") {
        args.push("-b:a", bitrate);
      }

      args.push(outputName);

      setStatusMsg("Mengompres & mengonversi file audio...");
      await ffmpeg.exec(args);

      setStatusMsg("Membaca hasil konversi...");
      const data = await ffmpeg.readFile(outputName);

      const mimeTypes: Record<TargetFormat, string> = {
        mp3: "audio/mp3",
        wav: "audio/wav",
        ogg: "audio/ogg",
        aac: "audio/aac",
      };

      const uint8Array = new Uint8Array(data as ArrayBuffer);
      const blob = new Blob([uint8Array.buffer], { type: mimeTypes[targetFormat] });
      const convertedBlobUrl = URL.createObjectURL(blob);

      const baseName = audioFile.name.substring(0, audioFile.name.lastIndexOf(".")) || audioFile.name;
      const finalFileName = `${baseName}_sonos.${targetFormat}`;

      setConvertedUrl(convertedBlobUrl);
      setConvertedFileName(finalFileName);
      setProgress(100);
      setStatusMsg(`Konversi selesai! File siap diunduh.`);
    } catch (err: unknown) {
      console.error("Audio conversion error:", err);
      setStatusMsg("Gagal mengonversi file audio. Pastikan file audio tidak korup.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl) return;
    const a = document.createElement("a");
    a.href = convertedUrl;
    a.download = convertedFileName || `converted-audio.${targetFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className={`flex flex-col h-full w-full select-none overflow-hidden font-sans ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Header Banner */}
      <div className={`px-6 py-5 border-b shrink-0 flex items-center justify-between gap-4 ${
        isLight
          ? "border-slate-200 bg-linear-to-r from-purple-100 via-indigo-50 to-slate-100"
          : "border-white/10 bg-linear-to-r from-purple-950/80 via-indigo-950/40 to-zinc-950"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-linear-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
            <Music size={22} />
          </div>
          <div>
            <h1 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              Son-OS Audio Converter & Trimmer
            </h1>
            <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
              Konversi format MP3, WAV, OGG, AAC dan potong durasi audio dengan FFmpeg WASM.
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac,.webm"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Upload size={15} /> Pilih Audio
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6 no-scrollbar">
        {!audioFile ? (
          /* Empty Drag & Drop Dropzone */
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
              isLight
                ? "border-slate-300 bg-white/70 hover:border-indigo-500 hover:bg-indigo-50/50"
                : "border-white/15 bg-zinc-900/40 hover:border-indigo-400/50 hover:bg-zinc-900/80"
            }`}
          >
            <div className="p-5 rounded-3xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform mb-4">
              <FileAudio size={44} />
            </div>
            <h3 className={`text-base font-bold mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>
              Klik atau Lepas File Audio Di Sini
            </h3>
            <p className={`text-xs max-w-md ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Mendukung format WAV, MP3, OGG, FLAC, M4A, AAC, dan WEBM. Proses konversi sepenuhnya di browser tanpa mengunggah ke server luar.
            </p>
          </div>
        ) : (
          /* Selected File & Settings Grid */
          <div className="space-y-6">
            {/* File Overview Card */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
            }`}>
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 rounded-xl bg-purple-500/15 text-purple-500 shrink-0">
                  <Play size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className={`text-sm font-semibold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                    {audioFile.name}
                  </h4>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Durasi: {formatSeconds(duration)}
                  </p>
                </div>
              </div>

              {audioUrl && (
                <audio controls src={audioUrl} className="h-9 w-full sm:w-64 accent-indigo-600 rounded-lg shrink-0" />
              )}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Format & Quality Card */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-purple-500" />
                  <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Format Output</h3>
                </div>

                {/* Format Radio Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium opacity-75 block">Pilih Format Tujuan</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["mp3", "wav", "ogg", "aac"] as TargetFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setTargetFormat(fmt)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                          targetFormat === fmt
                            ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30"
                            : isLight
                              ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                              : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bitrate Selection (For MP3/AAC) */}
                {(targetFormat === "mp3" || targetFormat === "aac") && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium opacity-75 block">Kualitas Bitrate</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["128k", "192k", "256k", "320k"] as BitrateOption[]).map((b) => (
                        <button
                          key={b}
                          onClick={() => setBitrate(b)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                            bitrate === b
                              ? "bg-indigo-600 text-white border-indigo-500"
                              : isLight
                                ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                                : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Trimmer Card */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors size={16} className="text-indigo-500" />
                    <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Pemotong Audio (Trim)</h3>
                  </div>

                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTrim}
                      onChange={(e) => setEnableTrim(e.target.checked)}
                      className="accent-indigo-600 rounded-sm cursor-pointer w-4 h-4"
                    />
                    <span>Aktifkan</span>
                  </label>
                </div>

                {enableTrim ? (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs opacity-75 block mb-1">Mulai (Detik)</label>
                        <input
                          type="number"
                          min={0}
                          max={duration}
                          step={1}
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border text-xs outline-hidden ${
                            isLight ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-white/8 border-white/10 text-white"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-xs opacity-75 block mb-1">Selesai (Detik)</label>
                        <input
                          type="number"
                          min={0}
                          max={duration}
                          step={1}
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border text-xs outline-hidden ${
                            isLight ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-white/8 border-white/10 text-white"
                          }`}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] opacity-70">
                      Audio akan dipotong mulai detik {startTime}s sampai {endTime}s (Durasi potongan: {Math.max(0, parseFloat(endTime) - parseFloat(startTime))}s).
                    </p>
                  </div>
                ) : (
                  <p className="text-xs opacity-60 pt-4 leading-relaxed">
                    Centang &quot;Aktifkan&quot; jika Anda ingin memotong bagian tertentu dari file audio ini.
                  </p>
                )}
              </div>
            </div>

            {/* Convert Button */}
            <button
              disabled={isConverting}
              onClick={handleConvert}
              className="w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isConverting ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Mengonversi ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Radio size={18} />
                  <span>Konversi Sekarang ke .{targetFormat.toUpperCase()}</span>
                </>
              )}
            </button>

            {/* Progress Bar & Status Toast */}
            {(isConverting || statusMsg) && (
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLight ? "bg-white border-slate-200" : "bg-zinc-900/90 border-white/10"
              }`}>
                {statusMsg && (
                  <div className="flex items-center gap-2 text-xs">
                    {progress === 100 ? (
                      <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                    ) : isConverting ? (
                      <RefreshCw size={15} className="text-purple-500 animate-spin shrink-0" />
                    ) : (
                      <AlertCircle size={15} className="text-amber-500 shrink-0" />
                    )}
                    <span>{statusMsg}</span>
                  </div>
                )}

                {isConverting && (
                  <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Converted Audio Result & Download */}
            {convertedUrl && (
              <div className={`p-5 rounded-2xl border space-y-4 animate-in fade-in duration-300 ${
                isLight ? "bg-emerald-50/80 border-emerald-300" : "bg-emerald-950/30 border-emerald-500/30"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle size={18} />
                    <h3 className="text-sm font-bold">Hasil Konversi Siap!</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    .{targetFormat.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <audio controls src={convertedUrl} className="h-9 w-full sm:w-80 accent-emerald-600" />
                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Download size={15} /> Unduh File ({convertedFileName})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
