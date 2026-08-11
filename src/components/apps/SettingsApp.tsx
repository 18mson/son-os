/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Monitor, Volume2, VolumeX, Info, Check, Code2, RotateCcw, LayoutGrid, Plus, Trash2 } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";

const WALLPAPER_PRESETS = [
  {
    id: "default",
    name: "Default Dark Indigo",
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
  const { wallpaper, setWallpaper, showNotification, soundEnabled, toggleSound, theme, toggleTheme, toggleWidgetGallery, desktopWidgets, removeWidget } = useWindowStore();
  const [activeTab, setActiveTab] = useState<"wallpaper" | "widgets" | "audio" | "about">("wallpaper");

  const handleSelectWallpaper = (wpId: string, name: string) => {
    setWallpaper(wpId);
    showNotification("Pengaturan Wallpaper", `Wallpaper desktop diubah ke "${name}".`, "Pengaturan", "Monitor");
  };

  return (
    <div className="flex flex-col sm:flex-row h-full bg-zinc-950 text-zinc-100 select-none overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-full sm:w-48 bg-zinc-900/60 border-b sm:border-b-0 sm:border-r border-white/10 p-3 flex sm:flex-col gap-1 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab("wallpaper")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all w-full text-left shrink-0 ${activeTab === "wallpaper" ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <Monitor size={16} /> Wallpaper &amp; Tema
        </button>

        <button
          onClick={() => setActiveTab("widgets")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all w-full text-left shrink-0 ${activeTab === "widgets" ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <LayoutGrid size={16} /> Widget Desktop
        </button>

        <button
          onClick={() => setActiveTab("audio")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all w-full text-left shrink-0 ${activeTab === "audio" ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} Suara & Efek
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all w-full text-left shrink-0 ${activeTab === "about" ? "bg-blue-600 text-white shadow-md" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
        >
          <Info size={16} /> Tentang Son-OS
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {activeTab === "wallpaper" && (
          <div className="space-y-6">
            {/* Theme Mode Selector Card */}
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-bold text-white">Mode Tema Tampilan</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Pilih skema warna antarmuka sistem (Mode Terang atau Gelap).</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (theme !== "dark") toggleTheme();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer text-left ${theme === "dark"
                    ? "bg-blue-600/20 border-blue-500/60 ring-2 ring-blue-500/30 text-white"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block text-white">Mode Gelap (Dark)</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Tampilan gelap ala ChromeOS</span>
                  </div>
                  {theme === "dark" && <Check size={14} className="text-blue-400 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (theme !== "light") toggleTheme();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer text-left ${theme === "light"
                    ? "bg-amber-500/20 border-amber-500/60 ring-2 ring-amber-500/30 text-white"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block text-white">Mode Terang (Light)</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Tampilan terang bersih &amp; kontras</span>
                  </div>
                  {theme === "light" && <Check size={14} className="text-amber-400 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Desktop Wallpaper Section */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Wallpaper Desktop</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Pilih gambar atau gradasi latar belakang desktop.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {WALLPAPER_PRESETS.map((preset) => {
                  const isActive = wallpaper === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectWallpaper(preset.id, preset.name)}
                      className={`group relative rounded-2xl overflow-hidden border aspect-video cursor-pointer transition-all ${isActive ? "border-blue-500 ring-2 ring-blue-500/50 scale-102" : "border-white/10 hover:border-white/25"
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

        {activeTab === "widgets" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <LayoutGrid size={18} className="text-amber-400" /> Pengelolaan Widget Desktop
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Atur widget yang ditampilkan di desktop Anda (ala macOS Sonoma).
                </p>
              </div>

              <button
                onClick={() => toggleWidgetGallery(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={15} /> Buka Galeri Widget
              </button>
            </div>

            {/* Active Widgets Summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Widget Aktif ({desktopWidgets.length})
              </h4>

              {desktopWidgets.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-zinc-400 text-xs">
                  Belum ada widget aktif di desktop. Klik &quot;Buka Galeri Widget&quot; untuk menambahkannya.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {desktopWidgets.map((w) => (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-white/10 text-amber-400 font-bold uppercase text-[10px]">
                          {w.type}
                        </span>
                        <div>
                          <span className="font-bold text-white block capitalize">Widget {w.type}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{w.id}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeWidget(w.id)}
                        title="Hapus Widget"
                        className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "audio" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Pengaturan Suara & Audio</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Kelola efek suara sistem dan audio background.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white">Efek Suara Sistem</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Mainkan suara saat membuka/menutup window dan notifikasi.</p>
              </div>

              <button
                type="button"
                onClick={() => toggleSound()}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${soundEnabled ? "bg-blue-600" : "bg-zinc-700"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${soundEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Tentang Son-OS</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Sistem Operasi Desktop Berbasis Web Modern (Inspired by ChromeOS).</p>
            </div>

            <div className="p-5 rounded-2xl bg-linear-to-br from-blue-900/30 via-zinc-900 to-zinc-950 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  S
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Son-OS Web Edition</h4>
                  <p className="text-xs text-zinc-400">Versi 1.0.0 (Build 2026.08)</p>
                </div>
              </div>

              <div className="text-xs text-zinc-300 space-y-1.5 pt-2 border-t border-white/10">
                <p>• <strong>Dikembangkan Oleh:</strong> Sony (Fullstack Software Engineer)</p>
                <p>• <strong>Tech Stack:</strong> Next.js App Router, TypeScript, Tailwind CSS v4, Zustand, Framer Motion</p>
                <p>• <strong>Fitur Utama:</strong> Multi-window manager, Floating Shelf, App Launcher, Toast System, Built-in Apps (Clock, Calculator, Notes, Calendar, Music, Weather, Gallery, Terminal, Paint, Snake Game, Settings).</p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href="https://github.com/18mson/son-os.git"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                >
                  <Code2 size={16} /> Lihat Repository GitHub
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.clear();
                      showNotification("Pengaturan Sistem", "Semua preferensi dan cache telah di-reset ke default. Memuat ulang OS...", "Pengaturan", "RotateCcw");
                      setTimeout(() => {
                        window.location.reload();
                      }, 1200);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw size={15} /> Reset Semua Preferensi OS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
