"use client";

import React from "react";
import { Sun, Moon, Palette, Check, Type, Eye, Sparkles, Monitor } from "lucide-react";
import { useTranslation } from "@/i18n";
import { WALLPAPERS_LIST, WallpaperItem, getWallpaperDisplayName } from "@/config/wallpaperConfig";

interface AppearanceTabProps {
  isLight: boolean;
  theme: "light" | "dark";
  themeMode?: "light" | "dark" | "auto";
  setThemeMode?: (mode: "light" | "dark" | "auto") => void;
  toggleTheme: () => void;
  wallpaper: string;
  setWallpaper: (wp: string) => void;
  WALLPAPERS?: WallpaperItem[];
  highContrast: boolean;
  toggleHighContrast: () => void;
  textScale: "small" | "normal" | "large";
  setTextScale: (scale: "small" | "normal" | "large") => void;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({
  isLight,
  theme,
  themeMode = "auto",
  setThemeMode,
  toggleTheme,
  wallpaper,
  setWallpaper,
  WALLPAPERS = WALLPAPERS_LIST,
  highContrast,
  toggleHighContrast,
  textScale,
  setTextScale,
}) => {
  const { t, language } = useTranslation();

  const handleSelectThemeMode = (mode: "light" | "dark" | "auto") => {
    if (setThemeMode) {
      setThemeMode(mode);
    } else {
      toggleTheme();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          {t.settings.appearance.title}
        </h2>
        <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
          {t.settings.appearance.subtitle}
        </p>
      </div>

      {/* Mode Tema: Gelap, Terang, Otomatis (Sistem) */}
      <div
        className={`p-4 rounded-3xl border space-y-3 transition-all ${
          isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isLight ? "bg-blue-100 text-blue-600" : "bg-blue-500/20 text-blue-400"}`}>
              <Palette size={20} />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                {t.settings.appearance.themeMode}
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                {themeMode === "auto"
                  ? `${t.settings.appearance.themeAuto} • ${theme === "dark" ? t.settings.appearance.themeDark : t.settings.appearance.themeLight}`
                  : themeMode === "light"
                  ? t.settings.appearance.themeLight
                  : t.settings.appearance.themeDark}
              </p>
            </div>
          </div>
        </div>

        {/* 3-Way Segmented Theme Switcher */}
        <div className={`grid grid-cols-3 gap-2 p-1.5 rounded-2xl border ${
          isLight ? "bg-slate-100 border-slate-200/80" : "bg-zinc-950/60 border-white/10"
        }`}>
          <button
            type="button"
            onClick={() => handleSelectThemeMode("dark")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              themeMode === "dark"
                ? "bg-blue-600 text-white shadow-md"
                : isLight
                ? "text-slate-700 hover:bg-slate-200/70"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Moon size={15} />
            <span>{t.settings.appearance.themeDark}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectThemeMode("light")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              themeMode === "light"
                ? "bg-blue-600 text-white shadow-md"
                : isLight
                ? "text-slate-700 hover:bg-slate-200/70"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sun size={15} />
            <span>{t.settings.appearance.themeLight}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectThemeMode("auto")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              themeMode === "auto"
                ? "bg-blue-600 text-white shadow-md"
                : isLight
                ? "text-slate-700 hover:bg-slate-200/70"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title={t.settings.appearance.themeAutoDesc}
          >
            <Monitor size={15} />
            <span>{t.settings.appearance.themeAuto}</span>
          </button>
        </div>

        {themeMode === "auto" && (
          <div className={`flex items-center gap-2 text-[11px] font-medium px-3 py-1.5 rounded-xl border ${
            isLight ? "bg-blue-50/80 border-blue-200/60 text-blue-900" : "bg-blue-500/10 border-blue-500/20 text-blue-300"
          }`}>
            <Sparkles size={13} className="text-blue-500 shrink-0" />
            <span>{t.settings.appearance.themeAutoDesc}</span>
          </div>
        )}
      </div>

      {/* High Contrast Toggle */}
      <div
        className={`p-4 rounded-3xl border flex items-center justify-between gap-4 transition-all ${
          isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isLight ? "bg-blue-100 text-blue-600" : "bg-blue-500/20 text-blue-400"}`}>
            <Eye size={20} />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
              {t.settings.appearance.highContrast}
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
              {t.settings.appearance.highContrastDesc}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleHighContrast}
          className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${
            highContrast ? "bg-blue-600" : isLight ? "bg-slate-300" : "bg-zinc-700"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              highContrast ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Skala Ukuran Teks */}
      <div
        className={`p-4 rounded-3xl border space-y-3 transition-all ${
          isLight ? "bg-white border-slate-200/90 shadow-sm" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isLight ? "bg-indigo-100 text-indigo-600" : "bg-indigo-500/20 text-indigo-400"}`}>
            <Type size={20} />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
              {t.settings.appearance.textScale}
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
              {textScale === "small"
                ? t.settings.appearance.textSmall
                : textScale === "large"
                ? t.settings.appearance.textLarge
                : t.settings.appearance.textNormal}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {(["small", "normal", "large"] as const).map((scale) => (
            <button
              key={scale}
              type="button"
              onClick={() => setTextScale(scale)}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer capitalize ${
                textScale === scale
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : isLight
                  ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {scale === "small"
                ? t.settings.appearance.textSmall
                : scale === "large"
                ? t.settings.appearance.textLarge
                : t.settings.appearance.textNormal}
            </button>
          ))}
        </div>
      </div>

      {/* Wallpaper Desktop */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
            {t.settings.appearance.wallpaper}
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
            {WALLPAPERS.length} wallpaper tersedia • Pilih wallpaper favorit Anda
          </p>
        </div>

        {/* Wallpaper Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {WALLPAPERS.map((wp) => {
            const isSelected = wallpaper === wp.id;
            const displayName = getWallpaperDisplayName(wp.id, language);
            const isRealtime = wp.category === "realtime";
            const isFractal = wp.category === "fractal";

            return (
              <button
                key={wp.id}
                type="button"
                onClick={() => setWallpaper(wp.id)}
                className={`relative group rounded-2xl overflow-hidden border-2 text-left transition-all cursor-pointer flex flex-col ${
                  isSelected
                    ? "border-blue-500 ring-4 ring-blue-500/20 shadow-lg scale-[1.02]"
                    : isLight
                    ? "border-slate-200 hover:border-slate-300 shadow-xs"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Thumbnail Preview Area */}
                <div
                  className={`h-24 w-full relative transition-transform duration-300 group-hover:scale-105 ${
                    wp.previewGradient || wp.bgClass
                  }`}
                >
                  {/* Category Badge */}
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md shadow-xs ${
                      isRealtime
                        ? "bg-amber-500/85 text-white border border-amber-300/40"
                        : isFractal
                        ? "bg-purple-500/80 text-white border border-purple-300/40"
                        : "bg-blue-500/80 text-white border border-blue-300/40"
                    }`}
                  >
                    {isRealtime
                      ? "Real-Time"
                      : isFractal
                      ? t.settings.appearance.wallpaperFractalBadge
                      : t.settings.appearance.wallpaperClassicBadge}
                  </span>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-blue-600 text-white shadow-md">
                      <Check size={14} />
                    </div>
                  )}
                </div>

                {/* Info Area */}
                <div
                  className={`p-3 border-t ${
                    isLight ? "bg-white border-slate-200" : "bg-zinc-900/90 border-white/10"
                  }`}
                >
                  <p className={`text-xs font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                    {displayName}
                  </p>
                  <p className={`text-[10px] truncate mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    {language === "en" ? wp.descriptionEn : wp.descriptionId}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
