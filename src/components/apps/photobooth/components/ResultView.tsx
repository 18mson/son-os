// src/components/apps/photobooth/components/ResultView.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Download,
  RefreshCw,
  Layers,
  Sparkles,
  CheckCircle2,
  Loader2,
  Palette,
} from "lucide-react";
import { usePhotoboothStore } from "@/store/photoboothStore";
import { composePhotoboothImage } from "../lib/compositor";
import { PHOTOBOOTH_THEMES, PhotoboothTheme } from "../themes/themes.config";
import { PHOTOBOOTH_FILTERS, PhotoboothFilter } from "../filters/filters.config";

export const ResultView: React.FC = () => {
  const {
    finalResultUrl,
    isComposing,
    capturedFrames,
    selectedThemeId,
    selectedFilterId,
    customCaption,
    showTimestamp,
    showStickers,
    getSelectedTheme,
    getSelectedFilter,
    getActiveLayout,
    getActiveShotCount,
    setTheme,
    setFilter,
    setComposing,
    setFinalResult,
    retakeCurrentSession,
    resetSession,
  } = usePhotoboothStore();

  const [activeEditorTab, setActiveEditorTab] = useState<"none" | "theme" | "filter">("none");

  const theme = getSelectedTheme();
  const filter = getSelectedFilter();
  const layout = getActiveLayout();
  const totalShots = getActiveShotCount();

  // Instant re-compositing helper when theme or filter changes in result view
  const recompileResult = async (newThemeId?: string, newFilterId?: string) => {
    if (capturedFrames.length === 0) return;

    const targetTheme = newThemeId
      ? PHOTOBOOTH_THEMES.find((t) => t.id === newThemeId) || theme
      : theme;
    const targetFilter = newFilterId
      ? PHOTOBOOTH_FILTERS.find((f) => f.id === newFilterId) || filter
      : filter;

    setComposing(true);
    try {
      const newUrl = await composePhotoboothImage({
        theme: targetTheme,
        filter: targetFilter,
        layout: targetTheme.allowedLayouts.includes(layout) ? layout : targetTheme.layout,
        shotCount: totalShots,
        frames: capturedFrames,
        customCaption,
        showTimestamp,
        showStickers,
      });
      setFinalResult(newUrl);
    } catch (err) {
      console.error("Gagal melakukan re-compositing:", err);
    } finally {
      setComposing(false);
    }
  };

  const handleSelectThemeInResult = (themeId: string) => {
    setTheme(themeId);
    recompileResult(themeId, undefined);
  };

  const handleSelectFilterInResult = (filterId: string) => {
    setFilter(filterId);
    recompileResult(undefined, filterId);
  };

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
    <div className="flex-1 w-full h-full flex flex-col justify-between p-3.5 sm:p-5 bg-zinc-950 text-zinc-100 font-sans select-none overflow-hidden">
      {/* Top Status Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
            <Sparkles size={16} />
          </span>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white">Photobooth Strip Selesai</h2>
            <p className="text-[10px] text-zinc-400 font-mono">
              {theme.name} • {totalShots} Shots • {filter.name} Filter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 size={13} />
          <span>HD 300DPI</span>
        </div>
      </div>

      {/* Quick Theme & Filter Switcher Strip in Result */}
      <div className="flex items-center gap-2 pt-2 shrink-0">
        <button
          onClick={() => setActiveEditorTab(activeEditorTab === "theme" ? "none" : "theme")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
            activeEditorTab === "theme"
              ? "bg-purple-600 border-purple-500 text-white shadow"
              : "bg-zinc-900 border-white/10 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          <Palette size={13} />
          <span>Ganti Frame ({theme.badgeEmoji})</span>
        </button>

        <button
          onClick={() => setActiveEditorTab(activeEditorTab === "filter" ? "none" : "filter")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
            activeEditorTab === "filter"
              ? "bg-purple-600 border-purple-500 text-white shadow"
              : "bg-zinc-900 border-white/10 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          <Sparkles size={13} />
          <span>Ganti Filter ({filter.badgeEmoji} {filter.name})</span>
        </button>
      </div>

      {/* Floating Theme / Filter Quick Drawer */}
      {activeEditorTab === "theme" && (
        <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 my-1 bg-zinc-900/90 border border-white/10 rounded-2xl shrink-0">
          {PHOTOBOOTH_THEMES.map((t: PhotoboothTheme) => (
            <button
              key={t.id}
              onClick={() => handleSelectThemeInResult(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                selectedThemeId === t.id
                  ? "bg-purple-600 border-purple-500 text-white font-bold"
                  : "bg-zinc-800/80 border-white/5 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              <span>{t.badgeEmoji}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      )}

      {activeEditorTab === "filter" && (
        <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 my-1 bg-zinc-900/90 border border-white/10 rounded-2xl shrink-0">
          {PHOTOBOOTH_FILTERS.map((f: PhotoboothFilter) => (
            <button
              key={f.id}
              onClick={() => handleSelectFilterInResult(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                selectedFilterId === f.id
                  ? "bg-purple-600 border-purple-500 text-white font-bold"
                  : "bg-zinc-800/80 border-white/5 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              <span>{f.badgeEmoji}</span>
              <span>{f.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Image Result Preview Canvas Container */}
      <div className="flex-1 min-h-0 relative w-full flex items-center justify-center my-2 overflow-hidden">
        {isComposing || !finalResultUrl ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-zinc-900/60 border border-white/10">
            <Loader2 className="animate-spin text-purple-400" size={36} />
            <div className="text-center">
              <h3 className="text-sm font-bold text-white">Menggabungkan Frame & Layout...</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Menerapkan ornamen tema {theme.name} dan filter {filter.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center p-1">
            <div className="relative max-h-full max-w-full aspect-auto flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
              <Image
                src={finalResultUrl}
                alt="Photobooth Result"
                width={1200}
                height={1600}
                unoptimized
                className="max-h-[calc(100dvh-230px)] sm:max-h-[calc(100vh-250px)] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Change Setup */}
          <button
            onClick={resetSession}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Layers size={14} />
            <span>Setup Ulang</span>
          </button>

          {/* Retake */}
          <button
            onClick={retakeCurrentSession}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Foto Ulang</span>
          </button>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isComposing || !finalResultUrl}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Download size={16} />
          <span>Simpan Foto (PNG)</span>
        </button>
      </div>
    </div>
  );
};
