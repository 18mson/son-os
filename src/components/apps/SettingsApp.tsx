/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import {
  Monitor,
  Volume2,
  VolumeX,
  Info,
  Check,
  Code2,
  RotateCcw,
  Plus,
  Trash2,
  Sun,
  Moon,
  Eye,
  Clock,
  Sliders,
  Type,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useSettingsStore, TextScale, ClockFormat } from "@/store/settingsStore";

const WALLPAPER_PRESETS = [
  {
    id: "default",
    name: "Default Indigo",
    preview: "bg-linear-to-br from-slate-950 via-zinc-900 to-indigo-950",
    type: "preset",
  },
  {
    id: "ocean",
    name: "Deep Ocean Cyan",
    preview: "bg-linear-to-br from-slate-950 via-cyan-950 to-blue-950",
    type: "preset",
  },
  {
    id: "sunset",
    name: "Sunset Crimson",
    preview: "bg-linear-to-br from-zinc-950 via-rose-950 to-amber-950",
    type: "preset",
  },
  {
    id: "emerald",
    name: "Emerald Teal",
    preview: "bg-linear-to-br from-zinc-950 via-teal-950 to-emerald-950",
    type: "preset",
  },
  {
    id: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=3840&q=95",
    name: "Son-OS Minimalist 4K",
    previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    type: "custom",
  },
  {
    id: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=3840&q=95",
    name: "Cyberpunk Neon 4K",
    previewUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    type: "custom",
  },
  {
    id: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=3840&q=95",
    name: "Mountain Dawn 4K",
    previewUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    type: "custom",
  },
  {
    id: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=2560&q=95",
    name: "Dark Code Syntax 4K",
    previewUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    type: "custom",
  },
];

export const SettingsApp: React.FC = () => {
  const {
    wallpaper,
    setWallpaper,
    showNotification,
    soundEnabled,
    toggleSound,
    theme,
    toggleTheme,
    toggleWidgetGallery,
    desktopWidgets,
    removeWidget,
  } = useWindowStore();

  const {
    theme: settingsTheme,
    setTheme: setSettingsTheme,
    soundEnabled: settingsSoundEnabled,
    setSoundEnabled: setSettingsSoundEnabled,
    volume,
    setVolume,
    reducedMotion,
    toggleReducedMotion,
    clockFormat,
    setClockFormat,
    textScale,
    setTextScale,
    brightness,
    setBrightness,
    resetToDefault: resetSettingsStore,
  } = useSettingsStore();

  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<"tampilan" | "suara" | "aksesibilitas" | "sistem" | "about">("tampilan");

  const handleSelectWallpaper = (wpId: string, name: string) => {
    setWallpaper(wpId);
    showNotification("Pengaturan Wallpaper", `Wallpaper desktop diubah ke "${name}".`, "Pengaturan", "Monitor");
  };

  const handleResetSystem = () => {
    if (typeof window !== "undefined") {
      resetSettingsStore();
      localStorage.clear();
      showNotification("Pengaturan Sistem", "Semua preferensi dan cache telah di-reset ke default. Memuat ulang OS...", "Pengaturan", "RotateCcw");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row h-full select-none overflow-hidden font-sans ${isLight ? "bg-slate-50 text-slate-900" : "bg-zinc-950 text-zinc-100"
      }`}>
      {/* Sidebar Navigation */}
      <div className={`w-full sm:w-52 p-3 flex sm:flex-col gap-1 shrink-0 overflow-x-auto border-b sm:border-b-0 sm:border-r ${isLight ? "bg-slate-100/90 border-slate-300" : "bg-zinc-900/60 border-white/10"
        }`}>
        <button
          onClick={() => setActiveTab("tampilan")}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all w-full text-left shrink-0 cursor-pointer ${activeTab === "tampilan"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : isLight ? "text-slate-700 hover:bg-slate-200 hover:text-slate-900" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <Monitor size={16} /> Tampilan & Wallpaper
        </button>

        <button
          onClick={() => setActiveTab("suara")}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all w-full text-left shrink-0 cursor-pointer ${activeTab === "suara"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : isLight ? "text-slate-700 hover:bg-slate-200 hover:text-slate-900" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          {settingsSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} Suara & Audios
        </button>

        <button
          onClick={() => setActiveTab("aksesibilitas")}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all w-full text-left shrink-0 cursor-pointer ${activeTab === "aksesibilitas"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : isLight ? "text-slate-700 hover:bg-slate-200 hover:text-slate-900" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <Eye size={16} /> Aksesibilitas
        </button>

        <button
          onClick={() => setActiveTab("sistem")}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all w-full text-left shrink-0 cursor-pointer ${activeTab === "sistem"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : isLight ? "text-slate-700 hover:bg-slate-200 hover:text-slate-900" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <Sliders size={16} /> Sistem & Jam
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all w-full text-left shrink-0 cursor-pointer ${activeTab === "about"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : isLight ? "text-slate-700 hover:bg-slate-200 hover:text-slate-900" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <Info size={16} /> Tentang Son-OS
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 no-scrollbar">
        {/* TAB 1: TAMPILAN & WALLPAPER */}
        {activeTab === "tampilan" && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Tampilan & Personalisasi
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                Atur skema warna antarmuka, tingkat kecerahan layar, dan gambar latar belakang desktop.
              </p>
            </div>

            {/* Theme Mode Card */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                Mode Tema Tampilan
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTheme("dark");
                    if (theme !== "dark") toggleTheme();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer text-left ${settingsTheme === "dark"
                      ? "bg-indigo-600/20 border-indigo-500/60 ring-2 ring-indigo-500/30 text-white"
                      : isLight ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
                      <Moon size={16} />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isLight ? "text-slate-900" : "text-white"}`}>Mode Gelap (Dark)</span>
                      <span className="text-[10px] opacity-75 block">Tampilan gelap ala ChromeOS</span>
                    </div>
                  </div>
                  {settingsTheme === "dark" && <Check size={16} className="text-indigo-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSettingsTheme("light");
                    if (theme !== "light") toggleTheme();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer text-left ${settingsTheme === "light"
                      ? "bg-amber-500/20 border-amber-500/60 ring-2 ring-amber-500/30 text-white"
                      : isLight ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md">
                      <Sun size={16} />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isLight ? "text-slate-900" : "text-white"}`}>Mode Terang (Light)</span>
                      <span className="text-[10px] opacity-75 block">Tampilan terang bersih & kontras</span>
                    </div>
                  </div>
                  {settingsTheme === "light" && <Check size={16} className="text-amber-500" />}
                </button>
              </div>
            </div>

            {/* Brightness Slider Card */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                  Kecerahan Layar ({brightness}%)
                </h3>
                <Sun size={16} className="text-amber-500" />
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Desktop Wallpapers */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                Wallpaper Desktop
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {WALLPAPER_PRESETS.map((preset) => {
                  const isActive = wallpaper === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectWallpaper(preset.id, preset.name)}
                      className={`group relative rounded-2xl overflow-hidden border aspect-video cursor-pointer transition-all ${isActive ? "border-blue-500 ring-2 ring-blue-500/50 scale-102" : "border-slate-300 dark:border-white/10 hover:border-blue-400"
                        }`}
                    >
                      {preset.type === "preset" ? (
                        <div className={`w-full h-full ${preset.preview}`} />
                      ) : (
                        <img src={preset.previewUrl} alt={preset.name} className="w-full h-full object-cover" />
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-between">
                        {isActive && (
                          <div className="flex justify-end">
                            <span className="p-1 rounded-full bg-blue-600 text-white shadow-md">
                              <Check size={12} />
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] font-semibold text-white truncate mt-auto">{preset.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUARA & AUDIO */}
        {activeTab === "suara" && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Pengaturan Suara & Audio
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                Atur efek suara sistem, volume utama, dan preferensi audio.
              </p>
            </div>

            {/* Sound Toggle */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
              <div>
                <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Efek Suara Sistem</h3>
                <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  Aktifkan efek suara klik UI dan notifikasi sistem.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSettingsSoundEnabled(!settingsSoundEnabled);
                  if (soundEnabled !== !settingsSoundEnabled) toggleSound();
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${settingsSoundEnabled ? "bg-blue-600" : "bg-zinc-700"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${settingsSoundEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {/* Master Volume Slider */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                  Master System Volume ({volume}%)
                </h3>
                {volume === 0 ? <VolumeX size={16} className="text-rose-500" /> : <Volume2 size={16} className="text-blue-500" />}
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}

        {/* TAB 3: AKSESIBILITAS */}
        {activeTab === "aksesibilitas" && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Aksesibilitas & Pengalaman Pengguna
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                Sesuaikan animasi dan ukuran teks agar lebih nyaman digunakan.
              </p>
            </div>

            {/* Reduced Motion Toggle */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
              <div>
                <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Kurangi Gerakan (Reduced Motion)</h3>
                <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  Kurangi transisi dan animasi berat untuk performa lebih cepat.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleReducedMotion}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${reducedMotion ? "bg-blue-600" : "bg-zinc-700"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${reducedMotion ? "translate-x-6" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {/* Text Scale Selector */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
              <div className="flex items-center gap-2">
                <Type size={16} className="text-purple-500" />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                  Ukuran Teks Sistem
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(["small", "normal", "large"] as TextScale[]).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => setTextScale(scale)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer border ${textScale === scale
                        ? "bg-purple-600 text-white border-purple-500 shadow-md"
                        : isLight ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                      }`}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SISTEM & JAM */}
        {activeTab === "sistem" && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Pengaturan Sistem & Waktu
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                Atur format waktu jam dan pengelolaan widget desktop.
              </p>
            </div>

            {/* Clock Format Card */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                  Format Jam
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(["12h", "24h"] as ClockFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setClockFormat(fmt)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${clockFormat === fmt
                        ? "bg-blue-600 text-white border-blue-500 shadow-md"
                        : isLight ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200" : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                      }`}
                  >
                    {fmt === "12h" ? "12 Jam (AM/PM)" : "24 Jam"}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Widget Manager */}
            <div className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                    Widget Desktop ({desktopWidgets.length})
                  </h3>
                  <p className="text-xs opacity-75 mt-0.5">Atur widget aktif di layar desktop Anda.</p>
                </div>

                <button
                  onClick={() => toggleWidgetGallery(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md cursor-pointer flex items-center gap-1"
                >
                  <Plus size={14} /> Galeri Widget
                </button>
              </div>

              {desktopWidgets.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {desktopWidgets.map((w) => (
                    <div
                      key={w.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10"
                        }`}
                    >
                      <span className="font-bold capitalize">Widget {w.type}</span>
                      <button
                        onClick={() => removeWidget(w.id)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                        title="Hapus Widget"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reset All System Settings Button */}
            <div className={`p-4 rounded-2xl border border-rose-500/30 space-y-3 ${isLight ? "bg-rose-50/50" : "bg-rose-950/20"
              }`}>
              <div>
                <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider">Reset Preferensi OS</h3>
                <p className="text-xs opacity-75 mt-0.5">Hapus cache dan kembalikan semua pengaturan ke standar awal bawaan.</p>
              </div>

              <button
                type="button"
                onClick={handleResetSystem}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw size={14} /> Reset Semua Preferensi Sistem
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: TENTANG SON-OS */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Tentang Son-OS
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                Sistem Operasi Desktop Berbasis Web Modern (Inspired by ChromeOS & macOS Sonoma).
              </p>
            </div>

            <div className={`p-5 rounded-2xl border space-y-4 ${isLight
                ? "bg-linear-to-br from-indigo-50 via-white to-slate-100 border-slate-300 shadow-md"
                : "bg-linear-to-br from-blue-950/30 via-zinc-900 to-zinc-950 border-white/10"
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white font-black text-xl shadow-lg flex items-center justify-center">
                  S
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Son-OS Web Edition</h3>
                  <p className="text-xs opacity-75">Versi 1.2.0 (Build 2026.08)</p>
                </div>
              </div>

              <div className="text-xs space-y-2 pt-2 border-t border-slate-200 dark:border-white/10 leading-relaxed">
                <p>• <strong>Pengembang:</strong> Sony (Fullstack Software Engineer)</p>
                <p>• <strong>Teknologi Utama:</strong> Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Zustand, Framer Motion, FFmpeg WASM, pdf-lib, pdfjs-dist</p>
                <p>• <strong>Fitur OS:</strong> Window Manager, Floating Dock, App Launcher, PWA Support, Session Restore, Quick Settings, Global Sound & Brightness, App Store Ecosystem</p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href="https://github.com/18mson/son-os.git"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <Code2 size={15} /> Repository GitHub
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
