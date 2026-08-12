"use client";

import React, { useState } from "react";
import {
  Palette,
  Volume2,
  Eye,
  Settings,
  Info,
  RotateCcw,
  Sparkles,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useSettingsStore } from "@/store/settingsStore";
import { AppearanceTab } from "./settings/AppearanceTab";
import { SoundTab } from "./settings/SoundTab";
import { AccessibilityTab } from "./settings/AccessibilityTab";
import { SystemTab } from "./settings/SystemTab";

const WALLPAPERS = [
  { id: "default", name: "SonOS Mesh", url: "bg-gradient-to-br from-indigo-900 via-slate-950 to-blue-950" },
  { id: "sunset", name: "Sunset Horizon", url: "bg-gradient-to-tr from-amber-600 via-rose-700 to-purple-900" },
  { id: "ocean", name: "Pacific Deep", url: "bg-gradient-to-b from-cyan-900 via-blue-950 to-slate-950" },
  { id: "cyberpunk", name: "Neon Matrix", url: "bg-gradient-to-r from-fuchsia-900 via-purple-950 to-slate-950" },
  { id: "abstract", name: "Minimal Glass", url: "bg-gradient-to-br from-slate-900 via-zinc-900 to-stone-950" },
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
    reducedMotion,
    toggleReducedMotion,
    textScale,
    setTextScale,
    highContrast,
    toggleHighContrast,
    clockFormat,
    setClockFormat,
  } = useWindowStore();

  const {
    volume,
    setVolume,
    resetToDefault: resetSettingsStore,
  } = useSettingsStore();

  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<"tampilan" | "suara" | "aksesibilitas" | "sistem" | "about">("tampilan");

  const handleResetSettings = () => {
    resetSettingsStore();
    showNotification("Pengaturan Direset", "Semua pengaturan sistem telah dikembalikan ke bawaan", "Settings");
  };

  return (
    <div className={`flex flex-col md:flex-row h-full w-full select-none font-sans overflow-hidden ${isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
      }`}>
      {/* Sidebar Nav */}
      <div className={`w-full md:w-56 border-r p-3 space-y-1 shrink-0 flex md:flex-col overflow-x-auto md:overflow-y-auto no-scrollbar ${isLight ? "bg-slate-200/80 border-slate-300" : "bg-zinc-900/60 border-white/10"
        }`}>
        <div className="hidden md:flex items-center gap-2.5 px-3 py-3 mb-2">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
            <Settings size={18} />
          </div>
          <div>
            <h1 className={`text-sm font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>Pengaturan</h1>
            <p className={`text-[10px] ${isLight ? "text-slate-600" : "text-zinc-400"}`}>SonOS System Control</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("tampilan")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "tampilan"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-700 hover:bg-slate-300/60" : "text-zinc-400 hover:bg-white/5"
            }`}
        >
          <Palette size={16} /> Tampilan & Tema
        </button>

        <button
          onClick={() => setActiveTab("suara")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "suara"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-700 hover:bg-slate-300/60" : "text-zinc-400 hover:bg-white/5"
            }`}
        >
          <Volume2 size={16} /> Suara & Audio
        </button>

        <button
          onClick={() => setActiveTab("aksesibilitas")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "aksesibilitas"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-700 hover:bg-slate-300/60" : "text-zinc-400 hover:bg-white/5"
            }`}
        >
          <Eye size={16} /> Aksesibilitas
        </button>

        <button
          onClick={() => setActiveTab("sistem")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "sistem"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-700 hover:bg-slate-300/60" : "text-zinc-400 hover:bg-white/5"
            }`}
        >
          <Settings size={16} /> Sistem & Waktu
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === "about"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-700 hover:bg-slate-300/60" : "text-zinc-400 hover:bg-white/5"
            }`}
        >
          <Info size={16} /> Tentang SonOS
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {activeTab === "tampilan" && (
          <AppearanceTab
            isLight={isLight}
            theme={theme}
            toggleTheme={toggleTheme}
            wallpaper={wallpaper}
            setWallpaper={setWallpaper}
            WALLPAPERS={WALLPAPERS}
          />
        )}

        {activeTab === "suara" && (
          <SoundTab
            isLight={isLight}
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
            volume={volume}
            setVolume={setVolume}
          />
        )}

        {activeTab === "aksesibilitas" && (
          <AccessibilityTab
            isLight={isLight}
            reducedMotion={reducedMotion}
            toggleReducedMotion={() => toggleReducedMotion()}
            highContrast={highContrast}
            toggleHighContrast={() => toggleHighContrast()}
            textScale={textScale}
            setTextScale={setTextScale}
          />
        )}

        {activeTab === "sistem" && (
          <SystemTab
            isLight={isLight}
            clockFormat={clockFormat}
            setClockFormat={setClockFormat}
            desktopWidgets={desktopWidgets}
            removeWidget={removeWidget}
            toggleWidgetGallery={() => toggleWidgetGallery()}
          />
        )}

        {activeTab === "about" && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Tentang SonOS
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                Informasi sistem operasi web desktop dan pengembang.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border space-y-4 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                  S
                </div>
                <div>
                  <h3 className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>SonOS Web Desktop v2.5</h3>
                  <p className="text-xs text-blue-500 font-semibold">Build 2026.08.12 (Next.js 15 + React 19)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5"
                  }`}>
                  <Sparkles size={16} className="text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] opacity-75 block">UI Engine</span>
                    <span className="text-xs font-bold">Framer Motion</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5"
                  }`}>
                  <Smartphone size={16} className="text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] opacity-75 block">Responsif</span>
                    <span className="text-xs font-bold">Mobile & Desktop</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5"
                  }`}>
                  <ShieldCheck size={16} className="text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[10px] opacity-75 block">Keamanan</span>
                    <span className="text-xs font-bold">Client Isolation</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleResetSettings}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCcw size={14} /> Reset Pengaturan ke Bawaan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
