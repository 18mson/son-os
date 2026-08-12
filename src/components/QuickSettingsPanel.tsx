/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Settings as SettingsIcon,
  ChevronRight,
  Sun,
  Moon,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Disc,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useSettingsStore } from "@/store/settingsStore";
import { APPS } from "@/config/appsConfig";
import { PLAYLIST } from "@/config/musicConfig";

export const QuickSettingsPanel: React.FC = () => {
  const {
    quickSettingsOpen,
    toggleQuickSettings,
    toggleSound,
    toggleTheme,
    wallpaper,
    cycleWallpaper,
    openWindow,
    showNotification,
    mediaTrackIndex,
    mediaIsPlaying,
    toggleMediaPlay,
    playNextTrack,
    playPrevTrack,
    setMediaVolume,
  } = useWindowStore();

  const {
    theme: settingsTheme,
    toggleTheme: toggleSettingsTheme,
    soundEnabled: settingsSoundEnabled,
    toggleSound: toggleSettingsSound,
    brightness,
    setBrightness,
    volume,
    setVolume,
  } = useSettingsStore();

  const currentTrack = PLAYLIST[mediaTrackIndex] || PLAYLIST[0];

  const [time, setTime] = useState<string>("");
  const [fullDate, setFullDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setFullDate(
        now.toLocaleDateString([], {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!quickSettingsOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      // Ignore click on status tray button itself (let button onClick toggle it)
      if (target && target.closest("[data-status-tray]")) return;
      if (panelRef.current && !panelRef.current.contains(target)) {
        toggleQuickSettings(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleQuickSettings(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [quickSettingsOpen, toggleQuickSettings]);

  const handleOpenSettings = () => {
    const settingsApp = APPS.find((a) => a.id === "settings");
    if (settingsApp) {
      openWindow(settingsApp);
    }
    toggleQuickSettings(false);
  };

  const handleOpenMusicPlayer = () => {
    const musicApp = APPS.find((a) => a.id === "music");
    if (musicApp) {
      openWindow(musicApp);
    }
  };

  const handleCycleWallpaper = () => {
    cycleWallpaper();
    showNotification("Quick Settings", "Wallpaper desktop berhasil berganti.", "System Tray", "Monitor");
  };

  return (
    <AnimatePresence>
      {quickSettingsOpen && (
        <>
          {/* Backdrop Click Listener */}
          <div
            onClick={() => toggleQuickSettings(false)}
            className="fixed inset-0 z-45 bg-transparent"
          />

          {/* Quick Settings Panel Overlay */}
          <motion.div
            ref={panelRef}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.25, bounce: 0.05 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[calc(100vw-24px)] w-80 sm:w-96 rounded-3xl bg-zinc-950/90 border border-white/15 p-4 sm:p-5 shadow-2xl shadow-black/90 backdrop-blur-2xl text-zinc-100 select-none flex flex-col gap-4 pointer-events-auto shrink-0"
            data-quick-settings
          >
            {/* Header: DateTime Info & Quick Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white tracking-tight">{time || "10:30:00 AM"}</span>
                <span className="text-xs text-zinc-400 font-medium">{fullDate || "Loading date..."}</span>
              </div>

              <button
                onClick={handleOpenSettings}
                title="Buka Pengaturan Sistem"
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden"
              >
                <SettingsIcon size={18} />
              </button>
            </div>

            {/* Global Music Control Card (macOS & ChromeOS Media Hub) */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
              <div
                onClick={handleOpenMusicPlayer}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                title="Buka Pemutar Musik"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 relative bg-zinc-900 flex items-center justify-center">
                  {/* eslint-disable-next-html-element-suppression */}
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${mediaIsPlaying ? "scale-105" : ""}`}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Disc size={20} className={`text-white ${mediaIsPlaying ? "animate-spin" : ""}`} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block truncate">
                    Musik {mediaIsPlaying ? "• Playing" : "• Paused"}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate leading-snug group-hover:text-purple-300 transition-colors">
                    {currentTrack.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>

              {/* Media Control Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={playPrevTrack}
                  title="Lagu Sebelumnya"
                  className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <SkipBack size={15} />
                </button>
                <button
                  onClick={() => toggleMediaPlay()}
                  title={mediaIsPlaying ? "Jeda Musik" : "Putar Musik"}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  {mediaIsPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                </button>
                <button
                  onClick={playNextTrack}
                  title="Lagu Berikutnya"
                  className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <SkipForward size={15} />
                </button>
              </div>
            </div>

            {/* Main Toggle Grid */}
            <div className="flex flex-col gap-2.5">
              {/* Top 2 Tiles: Sound Toggle & Theme Toggle */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Sound Toggle */}
                <button
                  onClick={() => {
                    toggleSettingsSound();
                    toggleSound();
                  }}
                  className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 text-left cursor-pointer group ${settingsSoundEnabled
                    ? "bg-blue-600/30 border-blue-500/50 text-white"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2 rounded-xl transition-colors ${settingsSoundEnabled ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "bg-zinc-800 text-zinc-400"
                        }`}
                    >
                      {settingsSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200">
                      {settingsSoundEnabled ? "ON" : "OFF"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">Suara Sistem</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {settingsSoundEnabled ? "Efek audio aktif" : "Audio dibisukan"}
                    </span>
                  </div>
                </button>

                {/* Dark / Light Theme Toggle */}
                <button
                  onClick={() => {
                    toggleSettingsTheme();
                    toggleTheme();
                  }}
                  className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 text-left cursor-pointer group ${settingsTheme === 'light'
                    ? "bg-amber-500/20 border-amber-500/40 text-white"
                    : "bg-indigo-600/20 border-indigo-500/40 text-white"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl transition-colors ${settingsTheme === 'light'
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                      : "bg-indigo-700 text-white shadow-md shadow-indigo-500/30"
                      }`}>
                      {settingsTheme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200">
                      {settingsTheme === 'light' ? 'LIGHT' : 'DARK'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">Tema Tampilan</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {settingsTheme === 'light' ? 'Mode Terang aktif' : 'Mode Gelap aktif'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Master Volume Slider Card */}
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        toggleSettingsSound();
                        toggleSound();
                      }}
                      title={settingsSoundEnabled ? "Bisukan Suara" : "Aktifkan Suara"}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${settingsSoundEnabled
                        ? "bg-blue-600/30 text-blue-400 border-blue-500/30"
                        : "bg-zinc-800 text-zinc-400 border-white/10"
                        }`}
                    >
                      {settingsSoundEnabled && volume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    <span className="text-xs font-bold text-white">Volume Master</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {settingsSoundEnabled ? `${volume}%` : "Muted"}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settingsSoundEnabled ? volume : 0}
                  onChange={(e) => {
                    const newVal = Number(e.target.value);
                    setVolume(newVal);
                    setMediaVolume(newVal / 100);
                    if (!settingsSoundEnabled && newVal > 0) {
                      toggleSettingsSound();
                      toggleSound();
                    }
                  }}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Brightness Slider Card */}
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Sun size={18} />
                    </div>
                    <span className="text-xs font-bold text-white">Kecerahan Layar</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Wallpaper Cycle Toggle */}
              <button
                onClick={handleCycleWallpaper}
                className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30">
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">Ganti Wallpaper</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5 capitalize truncate">
                      Tema: {wallpaper}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
