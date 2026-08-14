// src/components/apps/photobooth/components/ThemeSelector.tsx
"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Check,
  Camera,
} from "lucide-react";
import {
  PHOTOBOOTH_THEMES,
  PhotoboothTheme,
  ThemeCategory,
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

  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>("all");

  const currentTheme = getSelectedTheme();
  const currentLayout = getActiveLayout();
  const currentShotCount = getActiveShotCount();

  const filteredThemes =
    selectedCategory === "all"
      ? PHOTOBOOTH_THEMES
      : PHOTOBOOTH_THEMES.filter((t) => t.category === selectedCategory);

  const categoryList: { id: ThemeCategory; label: string }[] = [
    { id: "all", label: "Semua Tema" },
    { id: "minimal", label: "Minimalis" },
    { id: "ornament", label: "Hiasan & Doodle" },
    { id: "retro", label: "Retro Film" },
    { id: "aesthetic", label: "Aesthetic" },
  ];

  const layoutOptions: { id: PhotoboothLayout; label: string }[] = [
    { id: "strip-1col", label: "1 Kolom Strip" },
    { id: "grid-2col", label: "2 Kolom Grid" },
    { id: "single", label: "Polaroid Single" },
    { id: "strip-1row", label: "1 Baris Horizontal" },
  ];

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between p-3 sm:p-5 overflow-hidden font-sans select-none bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="w-full shrink-0 flex items-center justify-between gap-3 mb-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Camera size={16} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Pilih Tema Photobooth</span>
              <Sparkles size={14} className="text-pink-400" />
            </h1>
            <p className="text-[11px] text-zinc-400">
              Pilih gaya frame & hiasan foto sebelum memulai pemotretan
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full">
          {categoryList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-white text-zinc-950 font-bold shadow-md"
                  : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-850"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Content: Gallery on Left / Active Spotlight on Right */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 my-1 overflow-hidden">
        {/* Left: Theme Cards Grid with Visual Previews */}
        <div className="lg:col-span-8 xl:col-span-8 h-full overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {filteredThemes.map((theme: PhotoboothTheme) => {
              const isSelected = selectedThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`group relative rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? "border-purple-500 bg-zinc-900 shadow-xl shadow-purple-500/20 ring-2 ring-purple-500/30 scale-[1.01]"
                      : "border-white/10 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900/90"
                  }`}
                >
                  {/* Theme Visual Preview Mockup */}
                  <div className="w-full flex items-center justify-center py-2 sm:py-3 bg-black/40 rounded-xl mb-2.5 relative">
                    <ThemeVisualPreview theme={theme} compact />

                    {/* Active Selected Badge */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  {/* Theme Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {theme.badgeEmoji} {theme.name}
                      </h3>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {theme.description}
                    </p>
                  </div>

                  {/* Footer metadata */}
                  <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span className="capitalize">{theme.layout.replace("-", " ")}</span>
                    <span>{theme.shotCount} shots</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Theme Details & Quick Setup */}
        <div className="lg:col-span-4 xl:col-span-4 h-full flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-md overflow-y-auto">
          <div className="space-y-3.5">
            {/* Active Theme Preview Spotlight */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-black/50 border border-white/5 relative">
              <span className="text-[10px] font-mono text-zinc-400 mb-2 uppercase tracking-wider">
                Preview Frame Terpilih
              </span>
              <ThemeVisualPreview
                theme={currentTheme}
                layout={currentLayout}
                shotCount={currentShotCount}
              />
              <div className="mt-2 text-center">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  <span>{currentTheme.badgeEmoji}</span>
                  <span>{currentTheme.name}</span>
                </h3>
              </div>
            </div>

            {/* Layout Options */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                Bentuk Layout
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {layoutOptions.map((opt) => {
                  const isSupported = currentTheme.allowedLayouts.includes(opt.id);
                  const isSelected = currentLayout === opt.id;

                  return (
                    <button
                      key={opt.id}
                      disabled={!isSupported}
                      onClick={() => setLayout(opt.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer truncate ${
                        !isSupported
                          ? "opacity-30 cursor-not-allowed border-white/5 bg-zinc-900/50 text-zinc-600"
                          : isSelected
                          ? "border-purple-500 bg-purple-600 text-white shadow"
                          : "border-white/10 bg-zinc-800 text-zinc-300 hover:bg-zinc-750"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shot Count Options */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                Jumlah Foto
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 6].map((count) => {
                  const isSupported = currentTheme.allowedShotCounts.includes(count);
                  const isSelected = currentShotCount === count;

                  return (
                    <button
                      key={count}
                      disabled={!isSupported}
                      onClick={() => setShotCount(count)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        !isSupported
                          ? "opacity-30 cursor-not-allowed border-white/5 bg-zinc-900/50 text-zinc-600"
                          : isSelected
                          ? "border-purple-500 bg-purple-600 text-white shadow"
                          : "border-white/10 bg-zinc-800 text-zinc-300 hover:bg-zinc-750"
                      }`}
                    >
                      {count}x
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Caption Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                Teks Footer (Opsional)
              </label>
              <input
                type="text"
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                placeholder={currentTheme.subtext || "Contoh: SON-OS PHOTOBOOTH"}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                maxLength={40}
              />
            </div>
          </div>

          {/* Primary Start CTA Button */}
          <button
            onClick={onStartSession}
            className="mt-4 w-full py-3 px-4 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>Mulai Photobooth ({currentShotCount}x Foto)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
