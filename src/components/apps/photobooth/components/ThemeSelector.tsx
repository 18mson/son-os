// src/components/apps/photobooth/components/ThemeSelector.tsx
"use client";

import React from "react";
import {
  Sparkles,
  ArrowRight,
  Check,
  Camera,
} from "lucide-react";
import {
  PHOTOBOOTH_THEMES,
  PhotoboothTheme,
  PhotoboothLayout,
} from "../themes/themes.config";
import { usePhotoboothStore } from "@/store/photoboothStore";
import { ThemeVisualPreview } from "./ThemeVisualPreview";

interface ThemeSelectorProps {
  onStartSession: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onStartSession }) => {
  const {
    selectedThemeId,
    customCaption,
    setTheme,
    setLayout,
    setShotCount,
    setCustomCaption,
    getSelectedTheme,
    getActiveLayout,
    getActiveShotCount,
  } = usePhotoboothStore();

  const currentTheme = getSelectedTheme();
  const currentLayout = getActiveLayout();
  const currentShotCount = getActiveShotCount();

  const layoutOptions: { id: PhotoboothLayout; label: string }[] = [
    { id: "strip-1col", label: "1 Kolom" },
    { id: "grid-2col", label: "2 Kolom" },
    { id: "single", label: "Polaroid" },
    { id: "strip-1row", label: "1 Baris" },
  ];

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between p-3 sm:p-4 overflow-hidden font-sans select-none bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="w-full shrink-0 flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Camera size={14} />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>SonOS Photobooth</span>
              <Sparkles size={12} className="text-pink-400" />
            </h1>
            <p className="text-[10px] text-zinc-400">
              Pilih tema frame dari list untuk melihat preview
            </p>
          </div>
        </div>

        {/* Selected Theme Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs">
          <span className="text-purple-400 font-bold">{currentTheme.badgeEmoji}</span>
          <span className="text-zinc-200 font-medium">{currentTheme.name}</span>
        </div>
      </div>

      {/* Main Split Body: Sidebar List on Left + Big Live Preview on Right */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 my-2 overflow-hidden">
        {/* Sidebar: 1-Line Theme List (Narrower) */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 h-full flex flex-col bg-zinc-900/60 border border-white/10 rounded-2xl p-2 overflow-hidden">
          <div className="px-2 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
            Daftar Tema
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
            {PHOTOBOOTH_THEMES.map((theme: PhotoboothTheme) => {
              const isSelected = selectedThemeId === theme.id;

              return (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${isSelected
                      ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30 scale-[1.01]"
                      : "bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 border border-white/5"
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{theme.badgeEmoji}</span>
                    <span className="text-xs truncate">{theme.name}</span>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Check size={11} strokeWidth={3} className="text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content: Big Live Visual Preview (Spacious) */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-black/40 border border-white/10 rounded-2xl p-4 overflow-hidden relative">
          <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
            <ThemeVisualPreview
              theme={currentTheme}
              layout={currentLayout}
              shotCount={currentShotCount}
            />
          </div>

          {/* Theme Meta Info under preview */}
          <div className="pt-2 shrink-0 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-300 font-medium">
              <span>{currentTheme.badgeEmoji} {currentTheme.name}</span>
              <span className="text-zinc-600">•</span>
              <span className="capitalize">{currentLayout.replace("-", " ")}</span>
              <span className="text-zinc-600">•</span>
              <span>{currentShotCount} Shots</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Settings & Start Button Area */}
      <div className="w-full shrink-0 pt-2.5 border-t border-white/10 bg-zinc-950 flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Settings: Layout, Shots, Caption */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 w-full lg:w-auto">
          {/* Layout Pills */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-zinc-400 px-1.5 hidden sm:inline">Layout:</span>
            {layoutOptions.map((opt) => {
              const isSupported = currentTheme.allowedLayouts.includes(opt.id);
              const isSelected = currentLayout === opt.id;

              return (
                <button
                  key={opt.id}
                  disabled={!isSupported}
                  onClick={() => setLayout(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${!isSupported
                      ? "opacity-30 cursor-not-allowed text-zinc-600"
                      : isSelected
                        ? "bg-purple-600 text-white shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Shot Count Pills */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-zinc-400 px-1.5 hidden sm:inline">Shot:</span>
            {[1, 2, 3, 4, 6].map((count) => {
              const isSupported = currentTheme.allowedShotCounts.includes(count);
              const isSelected = currentShotCount === count;

              return (
                <button
                  key={count}
                  disabled={!isSupported}
                  onClick={() => setShotCount(count)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${!isSupported
                      ? "opacity-30 cursor-not-allowed text-zinc-600"
                      : isSelected
                        ? "bg-purple-600 text-white shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                >
                  {count}x
                </button>
              );
            })}
          </div>

          {/* Custom Caption Input */}
          <div className="flex items-center flex-1 min-w-35 max-w-xs">
            <input
              type="text"
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              placeholder={currentTheme.subtext || "Teks footer (opsional)..."}
              className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              maxLength={40}
            />
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartSession}
          className="w-full lg:w-auto py-2.5 px-6 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <span>Mulai Photobooth ({currentShotCount}x Foto)</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
