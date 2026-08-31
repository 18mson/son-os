"use client";

import React, { useState } from "react";
import {
  Palette,
  Volume2,
  Settings,
  Info,
  Package,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTranslation } from "@/i18n";
import { WALLPAPERS_LIST } from "@/config/wallpaperConfig";
import { AppearanceTab } from "./settings/AppearanceTab";
import { SoundTab } from "./settings/SoundTab";
import { SystemTab } from "./settings/SystemTab";
import { AppsTab } from "./settings/AppsTab";
import { AboutTab } from "./settings/AboutTab";

export const SettingsApp: React.FC = () => {
  const { t } = useTranslation();
  const {
    wallpaper,
    setWallpaper,
    showNotification,
    toggleSound,
    theme,
    themeMode,
    setThemeMode,
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
    setMediaVolume,
  } = useWindowStore();

  const {
    volume,
    setVolume,
    soundEnabled: settingsSoundEnabled,
    toggleSound: toggleSettingsSound,
    resetToDefault: resetSettingsStore,
  } = useSettingsStore();

  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<"tampilan" | "suara" | "sistem" | "aplikasi" | "about">("tampilan");

  const handleResetSettings = () => {
    resetSettingsStore();
    showNotification(t.settings.about.resetConfirmTitle, t.settings.about.resetConfirmDesc, "Settings");
  };

  return (
    <div className={`flex flex-col md:flex-row h-full w-full select-none font-sans overflow-hidden ${
      isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Sidebar Nav */}
      <div className={`w-full md:w-56 border-r p-3 space-y-1 shrink-0 flex md:flex-col overflow-x-auto md:overflow-y-auto no-scrollbar ${
        isLight ? "bg-slate-200/80 border-slate-300" : "bg-zinc-900/60 border-white/10"
      }`}>
        <div className="hidden md:flex items-center gap-2.5 px-3 py-3 mb-2">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
            <Settings size={18} />
          </div>
          <div>
            <h1 className={`text-sm font-bold leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              {t.settings.appTitle}
            </h1>
            <p className={`text-[10px] ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
              {t.settings.appSubtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("tampilan")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "tampilan"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-700 hover:bg-slate-300/60" : "text-zinc-400 hover:bg-white/5"
          }`}
        >
          <Palette size={16} /> {t.settings.tabAppearance}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("suara")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "suara"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-700 hover:bg-slate-300/60" : "text-zinc-400 hover:bg-white/5"
          }`}
        >
          <Volume2 size={16} /> {t.settings.tabSound}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sistem")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "sistem"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-700 hover:bg-slate-300/60" : "text-zinc-400 hover:bg-white/5"
          }`}
        >
          <Settings size={16} /> {t.settings.tabSystem}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("aplikasi")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "aplikasi"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-700 hover:bg-slate-300/60" : "text-zinc-400 hover:bg-white/5"
          }`}
        >
          <Package size={16} /> {t.settings.tabApps}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "about"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-700 hover:bg-slate-300/60" : "text-zinc-400 hover:bg-white/5"
          }`}
        >
          <Info size={16} /> {t.settings.tabAbout}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {activeTab === "tampilan" && (
          <AppearanceTab
            isLight={isLight}
            theme={theme}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            toggleTheme={toggleTheme}
            wallpaper={wallpaper}
            setWallpaper={setWallpaper}
            WALLPAPERS={WALLPAPERS_LIST}
            highContrast={highContrast}
            toggleHighContrast={() => toggleHighContrast()}
            textScale={textScale}
            setTextScale={setTextScale}
          />
        )}

        {activeTab === "suara" && (
          <SoundTab
            isLight={isLight}
            soundEnabled={settingsSoundEnabled}
            toggleSound={() => {
              toggleSettingsSound();
              toggleSound();
            }}
            volume={volume}
            setVolume={(v) => {
              setVolume(v);
              setMediaVolume(v);
            }}
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
            reducedMotion={reducedMotion}
            toggleReducedMotion={() => toggleReducedMotion()}
          />
        )}

        {activeTab === "aplikasi" && (
          <AppsTab isLight={isLight} />
        )}

        {activeTab === "about" && (
          <AboutTab isLight={isLight} onResetSettings={handleResetSettings} />
        )}
      </div>
    </div>
  );
};
