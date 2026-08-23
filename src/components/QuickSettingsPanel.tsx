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
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useSettingsStore } from "@/store/settingsStore";
import { APPS } from "@/config/appsConfig";
import { PLAYLIST } from "@/config/musicConfig";
import { QuickSettingsMediaWidget } from "./quickSettings/QuickSettingsMediaWidget";
import { useTranslation, getAppTranslation } from "@/i18n";

export const QuickSettingsPanel: React.FC = () => {
  const { t, language } = useTranslation();
  const {
    quickSettingsOpen,
    toggleQuickSettings,
    theme,
    setTheme,
    wallpaper,
    cycleWallpaper,
    openWindow,
    mediaTrackIndex,
    mediaIsPlaying,
    toggleMediaPlay,
    playNextTrack,
    playPrevTrack,
    setMediaVolume,
    clockFormat,
  } = useWindowStore();

  const {
    setTheme: setSettingsTheme,
    soundEnabled: settingsSoundEnabled,
    setSoundEnabled: setSettingsSoundEnabled,
    brightness,
    setBrightness,
    volume,
    setVolume,
  } = useSettingsStore();

  // Track previous volume to restore when unmuting
  const prevVolumeRef = React.useRef<number>(volume > 0 ? volume : 70);

  const currentTrack = PLAYLIST[mediaTrackIndex] || PLAYLIST[0];

  const [time, setTime] = useState<string>("");
  const [fullDate, setFullDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const is12h = clockFormat === "12h";
      const localeCode = language === "en" ? "en-US" : "id-ID";

      setTime(
        now.toLocaleTimeString(localeCode, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: is12h,
        })
      );
      setFullDate(
        now.toLocaleDateString(localeCode, {
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
  }, [clockFormat, language]);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!quickSettingsOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest("[data-status-tray]")) return;
      if (panelRef.current && !panelRef.current.contains(target)) {
        toggleQuickSettings(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [quickSettingsOpen, toggleQuickSettings]);

  const isLight = theme === "light";

  const handleOpenSettings = () => {
    const settingsApp = APPS.find((a) => a.id === "settings");
    if (settingsApp) {
      const appMeta = getAppTranslation("settings", language);
      openWindow({ ...settingsApp, title: appMeta?.title || settingsApp.title });
    }
    toggleQuickSettings(false);
  };

  return (
    <AnimatePresence>
      {quickSettingsOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.25, bounce: 0.05 }}
          className={`w-84 sm:w-96 rounded-3xl p-5 backdrop-blur-3xl border shadow-2xl select-none z-80 pointer-events-auto ${
            isLight
              ? "bg-white/90 border-black/10 shadow-slate-400/30 text-slate-900"
              : "bg-zinc-950/85 border-white/12 shadow-black/80 text-zinc-100"
          }`}


        >
          {/* Header Clock & Date */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {time}
              </h2>
              <p className={`text-xs font-medium capitalize ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                {fullDate}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenSettings}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                  : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
              }`}
              title={t.quickSettings.openSettings}
            >
              <SettingsIcon size={18} />
            </button>
          </div>

          {/* Quick Actions Toggles Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextTheme = theme === "dark" ? "light" : "dark";
                setTheme(nextTheme);
                setSettingsTheme(nextTheme);
              }}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                isLight
                  ? "bg-blue-50 border-blue-200 text-blue-900 shadow-sm"
                  : "bg-white/10 border-white/15 text-white hover:bg-white/20"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isLight ? <Sun className="text-amber-500" size={18} /> : <Moon className="text-blue-400" size={18} />}
                <div className="text-left">
                  <p className="text-xs font-bold">{isLight ? t.settings.appearance.themeLight : t.settings.appearance.themeDark}</p>
                  <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>{t.common.enabled}</p>
                </div>
              </div>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                if (settingsSoundEnabled) {
                  if (volume > 0) prevVolumeRef.current = volume;
                  setVolume(0);
                  setMediaVolume(0);
                  setSettingsSoundEnabled(false);
                } else {
                  const restored = prevVolumeRef.current > 0 ? prevVolumeRef.current : 70;
                  setVolume(restored);
                  setMediaVolume(restored);
                  setSettingsSoundEnabled(true);
                }
              }}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                settingsSoundEnabled && volume > 0
                  ? "bg-blue-600 border-blue-500 text-white shadow-md"
                  : isLight
                  ? "bg-slate-100 border-slate-300 text-slate-600"
                  : "bg-white/5 border-white/10 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {settingsSoundEnabled && volume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <div className="text-left">
                  <p className="text-xs font-bold">{t.quickSettings.sound}</p>
                  <p className="text-[10px] opacity-80">{settingsSoundEnabled && volume > 0 ? t.common.enabled : t.common.disabled}</p>
                </div>
              </div>
            </button>

            {/* Wallpaper Cycle */}
            <button
              type="button"
              onClick={cycleWallpaper}
              className={`col-span-2 p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                  : "bg-white/8 hover:bg-white/15 border-white/10 text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="text-purple-400" size={18} />
                <div className="text-left">
                  <p className="text-xs font-bold">{t.settings.appearance.wallpaper}</p>
                  <p className={`text-[10px] capitalize ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    {wallpaper}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className={isLight ? "text-slate-400" : "text-zinc-500"} />
            </button>
          </div>

          {/* Sliders: Brightness & Volume */}
          <div className={`p-4 rounded-2xl border space-y-3 mb-4 ${
            isLight ? "bg-slate-100/90 border-slate-300" : "bg-white/5 border-white/10"
          }`}>
            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className={`flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                  <Sun size={14} /> {t.quickSettings.brightness}
                </span>
                <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{brightness}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-lg bg-zinc-700/50"
              />
            </div>

            {/* Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className={`flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                  {volume > 0 && settingsSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} {t.quickSettings.volume}
                </span>
                <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  setMediaVolume(val);
                  if (val > 0 && !settingsSoundEnabled) {
                    setSettingsSoundEnabled(true);
                  } else if (val === 0 && settingsSoundEnabled) {
                    setSettingsSoundEnabled(false);
                  }
                }}
                className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-lg bg-zinc-700/50"
              />
            </div>
          </div>

          {/* Media Player Quick Widget */}
          <QuickSettingsMediaWidget
            isLight={isLight}
            currentTrack={currentTrack}
            mediaIsPlaying={mediaIsPlaying}
            toggleMediaPlay={toggleMediaPlay}
            playNextTrack={playNextTrack}
            playPrevTrack={playPrevTrack}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
