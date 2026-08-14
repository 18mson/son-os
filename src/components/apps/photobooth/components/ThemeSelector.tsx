// src/components/apps/photobooth/components/ThemeSelector.tsx
"use client";

import React, { useState } from "react";
import {
  Sparkles,
  LayoutGrid,
  Palette,
  Sliders,
  ArrowRight,
  Check,
  Smile,
  Clock,
  Type,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  PHOTOBOOTH_THEMES,
  PhotoboothTheme,
  ThemeCategory,
  PhotoboothLayout,
} from "../themes/themes.config";
import {
  PHOTOBOOTH_FILTERS,
  PhotoboothFilter,
} from "../filters/filters.config";
import { usePhotoboothStore } from "@/store/photoboothStore";

interface ThemeSelectorProps {
  onStartSession: () => void;
}

type TabType = "themes" | "layout" | "filters" | "customize";

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onStartSession }) => {
  const {
    selectedThemeId,
    selectedFilterId,
    customCaption,
    showTimestamp,
    showStickers,
    setTheme,
    setFilter,
    setLayout,
    setShotCount,
    setCustomCaption,
    setShowTimestamp,
    setShowStickers,
    getSelectedTheme,
    getSelectedFilter,
    getActiveLayout,
    getActiveShotCount,
  } = usePhotoboothStore();

  const [activeTab, setActiveTab] = useState<TabType>("themes");
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>("all");

  const currentTheme = getSelectedTheme();
  const currentFilter = getSelectedFilter();
  const currentLayout = getActiveLayout();
  const currentShotCount = getActiveShotCount();

  const filteredThemes =
    selectedCategory === "all"
      ? PHOTOBOOTH_THEMES
      : PHOTOBOOTH_THEMES.filter((t) => t.category === selectedCategory);

  return (
    <div className="flex-1 w-full h-full flex flex-col justify-between p-3.5 sm:p-5 overflow-hidden font-sans select-none bg-zinc-950 text-zinc-100">
      {/* Top Header & Segmented Tabs */}
      <div className="max-w-4xl mx-auto w-full shrink-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold mb-1">
              <Sparkles size={12} />
              <span>SonOS Photobooth Pro</span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-white tracking-tight">
              Kustomisasi Photobooth
            </h1>
          </div>

          {/* Quick Active Badge Summary */}
          <div className="hidden sm:flex items-center gap-2 text-xs bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-purple-400 font-bold">{currentTheme.name}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300 font-mono">{currentShotCount} Shots</span>
            <span className="text-zinc-600">•</span>
            <span className="text-pink-400">{currentFilter.name}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab("themes")}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "themes"
                ? "bg-purple-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <Palette size={13} />
            <span>1. Tema & Frame</span>
          </button>

          <button
            onClick={() => setActiveTab("layout")}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "layout"
                ? "bg-purple-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <LayoutGrid size={13} />
            <span>2. Grid & Baris</span>
          </button>

          <button
            onClick={() => setActiveTab("filters")}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "filters"
                ? "bg-purple-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <Sparkles size={13} />
            <span>3. Filter Foto</span>
          </button>

          <button
            onClick={() => setActiveTab("customize")}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "customize"
                ? "bg-purple-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <Sliders size={13} />
            <span>4. Teks & Detail</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto max-w-4xl mx-auto w-full my-3 pr-1">
        {/* ========================================================= */}
        {/* TAB 1: THEMES SELECTION */}
        {/* ========================================================= */}
        {activeTab === "themes" && (
          <div className="space-y-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {(
                [
                  { id: "all", label: "✨ Semua Tema" },
                  { id: "minimal", label: "🥛 Minimalist Clean" },
                  { id: "ornament", label: "🎀 Banyak Hiasan & Doodles" },
                  { id: "retro", label: "🎞️ Retro & Film" },
                  { id: "aesthetic", label: "🌸 Aesthetic & Editorial" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer ${selectedCategory === cat.id
                      ? "bg-white text-zinc-950 font-bold shadow"
                      : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Themes Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredThemes.map((theme: PhotoboothTheme) => {
                const isSelected = selectedThemeId === theme.id;

                return (
                  <div
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`group relative rounded-2xl p-3.5 flex flex-col justify-between border-2 transition-all duration-200 cursor-pointer overflow-hidden ${isSelected
                        ? "border-purple-500 bg-zinc-900 shadow-xl shadow-purple-500/15 scale-[1.01]"
                        : "border-white/10 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900/80"
                      }`}
                  >
                    {/* Top Row Emoji & Check */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-9 h-9 rounded-xl ${theme.accentColor} text-white shadow-md flex items-center justify-center text-lg`}>
                        {theme.badgeEmoji}
                      </div>

                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                          <Check size={14} />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5 uppercase">
                          {theme.category}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {theme.name}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>

                    {/* Footer Frame Preview & Default layout */}
                    <div className="pt-2.5 mt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20 inline-block"
                          style={{ backgroundColor: theme.frameColor }}
                        />
                        <span className="capitalize">{theme.layout.replace("-", " ")}</span>
                      </div>
                      <span>{theme.shotCount} shots</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LAYOUT & GRID SELECTION */}
        {/* ========================================================= */}
        {activeTab === "layout" && (
          <div className="space-y-4">
            {/* Grid Arrangement (1 Baris, 2 Kolom, Strip Vertikal, Single) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Bentuk Layout & Tata Letak
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  {
                    id: "strip-1col" as PhotoboothLayout,
                    name: "1 Kolom Strip",
                    desc: "Strip vertikal klasik memanjang ke bawah",
                    icon: "📜",
                  },
                  {
                    id: "grid-2col" as PhotoboothLayout,
                    name: "2 Kolom Grid",
                    desc: "Tata letak 2 baris / 2 kolom modern",
                    icon: "🔲",
                  },
                  {
                    id: "strip-1row" as PhotoboothLayout,
                    name: "1 Baris Horizontal",
                    desc: "Foto sejajar mendatar / wide banner",
                    icon: "↔️",
                  },
                  {
                    id: "single" as PhotoboothLayout,
                    name: "Single Polaroid",
                    desc: "1 shot instant portrait besar",
                    icon: "📷",
                  },
                ].map((item) => {
                  const isSupported = currentTheme.allowedLayouts.includes(item.id);
                  const isSelected = currentLayout === item.id;

                  return (
                    <button
                      key={item.id}
                      disabled={!isSupported}
                      onClick={() => setLayout(item.id)}
                      className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${!isSupported
                          ? "opacity-35 cursor-not-allowed border-white/5 bg-zinc-900/30"
                          : isSelected
                            ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                            : "border-white/10 bg-zinc-900 hover:border-white/20"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{item.icon}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.name}</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shot Count Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Jumlah Shot Foto
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 6].map((count) => {
                  const isSupported = currentTheme.allowedShotCounts.includes(count);
                  const isSelected = currentShotCount === count;

                  return (
                    <button
                      key={count}
                      disabled={!isSupported}
                      onClick={() => setShotCount(count)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${!isSupported
                          ? "opacity-30 cursor-not-allowed border-white/5 bg-zinc-900"
                          : isSelected
                            ? "border-purple-500 bg-purple-600 text-white shadow-md"
                            : "border-white/10 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                        }`}
                    >
                      {count} {count === 1 ? "Shot" : "Shots"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FILTERS SELECTION */}
        {/* ========================================================= */}
        {activeTab === "filters" && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-400 mb-1">
              Pilih grading warna & tone foto. Filter ini langsung diterapkan pada preview kamera dan canvas final.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {PHOTOBOOTH_FILTERS.map((f: PhotoboothFilter) => {
                const isSelected = selectedFilterId === f.id;

                return (
                  <div
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected
                        ? "border-purple-500 bg-purple-500/10 shadow-md"
                        : "border-white/10 bg-zinc-900 hover:border-white/20 hover:bg-zinc-850"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${f.previewColor} flex items-center justify-center text-sm shadow-inner shrink-0`}>
                        {f.badgeEmoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{f.name}</h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-1">{f.description}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CUSTOMIZE (TEXT, STAMP, STICKERS) */}
        {/* ========================================================= */}
        {activeTab === "customize" && (
          <div className="space-y-4 max-w-lg">
            {/* Custom Caption */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Type size={14} className="text-purple-400" />
                <span>Teks Footer / Judul Photobooth</span>
              </label>
              <input
                type="text"
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                placeholder={currentTheme.subtext || "Contoh: SON-OS PHOTOBOOTH"}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                maxLength={40}
              />
              <p className="text-[10px] text-zinc-500">
                Kosongkan jika ingin memakai teks bawaan tema.
              </p>
            </div>

            {/* Toggle Toggles */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              {/* Show Timestamp */}
              <div
                onClick={() => setShowTimestamp(!showTimestamp)}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/10 cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-purple-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Stempel Tanggal & Waktu</h4>
                    <p className="text-[10px] text-zinc-400">Tampilkan tanggal capture di bagian bawah strip</p>
                  </div>
                </div>
                {showTimestamp ? (
                  <ToggleRight size={26} className="text-purple-400" />
                ) : (
                  <ToggleLeft size={26} className="text-zinc-600" />
                )}
              </div>

              {/* Show Ornaments / Stickers */}
              <div
                onClick={() => setShowStickers(!showStickers)}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/10 cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Smile size={16} className="text-pink-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Ornamen & Sticker Tema</h4>
                    <p className="text-[10px] text-zinc-400">Gambar doodle, bintang, pita, atau perforasi film</p>
                  </div>
                </div>
                {showStickers ? (
                  <ToggleRight size={26} className="text-purple-400" />
                ) : (
                  <ToggleLeft size={26} className="text-zinc-600" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Start Action Bar */}
      <div className="max-w-4xl mx-auto w-full pt-2 border-t border-white/10 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <span>{currentTheme.badgeEmoji} {currentTheme.name}</span>
          <span>•</span>
          <span className="capitalize">{currentLayout.replace("-", " ")}</span>
          <span>•</span>
          <span>{currentShotCount} shots</span>
          <span>•</span>
          <span className="text-purple-300 font-semibold">{currentFilter.name}</span>
        </div>

        <button
          onClick={onStartSession}
          className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Mulai Sesi Photobooth</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
