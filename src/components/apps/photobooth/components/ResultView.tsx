// src/components/apps/photobooth/components/ResultView.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Download, RefreshCw, Layers, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { usePhotoboothStore } from "@/store/photoboothStore";

export const ResultView: React.FC = () => {
  const {
    finalResultUrl,
    isComposing,
    getSelectedTheme,
    retakeCurrentSession,
    resetSession,
  } = usePhotoboothStore();

  const theme = getSelectedTheme();

  const handleDownload = () => {
    if (!finalResultUrl) return;
    const a = document.createElement("a");
    a.href = finalResultUrl;
    a.download = `sonos-photobooth-${theme.id}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-zinc-950 text-zinc-100 font-sans select-none overflow-hidden">
      {/* Top Status Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
            <Sparkles size={16} />
          </span>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white">Photobooth Strip Selesai</h2>
            <p className="text-[10px] text-zinc-400 font-mono">
              {theme.name} • {theme.shotCount} Shots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 size={13} />
          <span>HD 300DPI Ready</span>
        </div>
      </div>

      {/* Main Image Result Preview Canvas Container */}
      <div className="flex-1 min-h-0 relative w-full flex items-center justify-center my-3 sm:my-4 overflow-hidden">
        {isComposing || !finalResultUrl ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-zinc-900/60 border border-white/10">
            <Loader2 className="animate-spin text-purple-400" size={36} />
            <div className="text-center">
              <h3 className="text-sm font-bold text-white">Menggabungkan Frame & Layout...</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Menerapkan filter warna, unsharp mask, dan border {theme.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <div className="relative max-h-full max-w-full aspect-auto flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-white/10">
              <Image
                src={finalResultUrl}
                alt="Photobooth Result"
                width={1080}
                height={1920}
                unoptimized
                className="max-h-[calc(100dvh-220px)] sm:max-h-[calc(100vh-240px)] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Change Theme */}
          <button
            onClick={resetSession}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Layers size={15} />
            <span>Ganti Tema</span>
          </button>

          {/* Retake */}
          <button
            onClick={retakeCurrentSession}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw size={15} />
            <span>Foto Ulang</span>
          </button>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isComposing || !finalResultUrl}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Download size={16} />
          <span>Simpan Foto (PNG)</span>
        </button>
      </div>
    </div>
  );
};
