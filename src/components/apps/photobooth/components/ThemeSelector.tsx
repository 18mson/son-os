// src/components/apps/photobooth/components/ThemeSelector.tsx
"use client";

import React from "react";
import { Sparkles, Layers, ArrowRight, Camera, Check } from "lucide-react";
import { PHOTOBOOTH_THEMES, PhotoboothTheme } from "../themes/themes.config";
import { usePhotoboothStore } from "@/store/photoboothStore";

interface ThemeSelectorProps {
  onStartSession: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onStartSession }) => {
  const { selectedThemeId, setTheme } = usePhotoboothStore();

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between p-4 sm:p-6 overflow-y-auto font-sans select-none bg-zinc-950 text-zinc-100">
      {/* Top Header */}
      <div className="text-center max-w-md mx-auto pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
          <Sparkles size={13} />
          <span>SonOS Instant Photobooth</span>
        </div>
        <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
          Pilih Frame & Tema Foto
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Setiap tema memiliki tata letak strip, jumlah shot, dan sentuhan warna khas.
        </p>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 max-w-4xl mx-auto w-full my-4 sm:my-6">
        {PHOTOBOOTH_THEMES.map((theme: PhotoboothTheme) => {
          const isSelected = selectedThemeId === theme.id;

          return (
            <div
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`group relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                isSelected
                  ? "border-purple-500 bg-zinc-900 shadow-xl shadow-purple-500/10 scale-[1.02]"
                  : "border-white/10 bg-zinc-900/50 hover:border-white/25 hover:bg-zinc-900/80"
              }`}
            >
              {/* Top Accent Icon & Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${theme.accentColor} text-white shadow-lg text-lg`}>
                  {theme.badgeEmoji || <Camera size={20} />}
                </div>
                {isSelected ? (
                  <span className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                    <Check size={16} />
                  </span>
                ) : (
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                    {theme.shotCount} {theme.shotCount === 1 ? "Shot" : "Shots"}
                  </span>
                )}
              </div>

              {/* Theme Info */}
              <div className="space-y-1.5">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {theme.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {theme.description}
                </p>
              </div>

              {/* Layout Preview Pills */}
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Layers size={12} className="text-purple-400" />
                  <span className="capitalize">{theme.layout} Layout</span>
                </div>
                <span>{theme.countdownSeconds}s Countdown</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start CTA Button */}
      <div className="max-w-md mx-auto w-full pb-2 sm:pb-4 flex flex-col items-center">
        <button
          onClick={onStartSession}
          className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-bold shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span>Mulai Sesi Photobooth</span>
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
};
