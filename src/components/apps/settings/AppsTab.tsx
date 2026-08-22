"use client";

import React, { useState } from "react";
import {
  Search,
  Globe,
  Cpu,
  Trash2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { APPS } from "@/data/apps";
import { AppDefinition, useWindowStore } from "@/store/windowStore";
import { useAppStoreStore } from "@/store/appStoreStore";
import { useTranslation, getAppTranslation } from "@/i18n";
import { AppIcon } from "../../AppIcon";

interface AppsTabProps {
  isLight: boolean;
}

type AppFilterType = "all" | "entertainment" | "native" | "iframe" | "installed" | "system";

export const AppsTab: React.FC<AppsTabProps> = ({ isLight }) => {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<AppFilterType>("all");

  const { openWindow, customTracks, showNotification } = useWindowStore();
  const { installedApps, setPendingUninstallAppId } = useAppStoreStore();

  // Helper to detect stored data per app
  const getAppStoredDataInfo = (appId: string): { hasData: boolean; label: string; key?: string } => {
    if (typeof window === "undefined") return { hasData: false, label: language === "en" ? "No Data" : "Tidak Ada Data" };

    try {
      if (appId === "notes") {
        const saved = localStorage.getItem("sonos_notes");
        if (saved) {
          const notes = JSON.parse(saved);
          return {
            hasData: Array.isArray(notes) && notes.length > 0,
            label: `${Array.isArray(notes) ? notes.length : 0} ${language === "en" ? "Notes" : "Catatan"}`,
            key: "sonos_notes",
          };
        }
      } else if (appId === "music") {
        if (customTracks.length > 0) {
          return {
            hasData: true,
            label: `${customTracks.length} ${language === "en" ? "Custom Tracks" : "Lagu Custom"}`,
            key: "sonos_custom_tracks",
          };
        }
      } else if (appId === "terminal") {
        const saved = localStorage.getItem("sonos_terminal_history");
        if (saved) {
          const history = JSON.parse(saved);
          return {
            hasData: Array.isArray(history) && history.length > 0,
            label: `${Array.isArray(history) ? history.length : 0} ${language === "en" ? "Commands" : "Perintah"}`,
            key: "sonos_terminal_history",
          };
        }
      } else if (appId === "settings") {
        const saved = localStorage.getItem("sonos_settings");
        return {
          hasData: Boolean(saved),
          label: saved ? (language === "en" ? "System Preferences" : "Preferensi Sistem") : "Default Config",
          key: "sonos_settings",
        };
      } else if (appId === "app-store") {
        return {
          hasData: installedApps.length > 0,
          label: `${installedApps.length} ${language === "en" ? "Apps Installed" : "App Terpasang"}`,
          key: "sonos_installed_apps",
        };
      }
    } catch { }

    return { hasData: false, label: language === "en" ? "No data" : "Tidak ada data" };
  };

  const handleClearAppData = (appTitle: string, key?: string) => {
    if (!key || typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
      showNotification(
        language === "en" ? "App Data Cleared" : "Data Aplikasi Dihapus",
        language === "en" ? `Stored data for ${appTitle} has been cleared.` : `Data tersimpan untuk ${appTitle} telah dibersihkan.`,
        "Settings"
      );
    } catch (e) {
      console.error(e);
    }
  };

  const filteredApps = APPS.filter((app) => {
    const appMeta = getAppTranslation(app.id, language);
    const title = appMeta?.title || app.title;
    const description = appMeta?.description || app.description;

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (description && description.toLowerCase().includes(searchQuery.toLowerCase()));

    const appCategories = Array.isArray(app.category) ? app.category : app.category ? [app.category] : ["utility"];

    let matchesFilter = true;
    if (filterType === "entertainment") matchesFilter = appCategories.includes("entertainment");
    else if (filterType === "native") matchesFilter = app.type !== "iframe";
    else if (filterType === "iframe") matchesFilter = app.type === "iframe";
    else if (filterType === "installed") matchesFilter = installedApps.includes(app.id);
    else if (filterType === "system") matchesFilter = Boolean(app.isSystemApp);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div>
        <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          {t.settings.apps.title}
        </h2>
        <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
          {t.settings.apps.subtitle}
        </p>
      </div>

      {/* Controls Bar: Search & Filter Pills */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-zinc-500"}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "en" ? "Search app name or version..." : "Cari nama aplikasi atau versi..."}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-hidden transition-all ${
              isLight
                ? "bg-white border-slate-200 text-slate-800 focus:border-blue-500"
                : "bg-zinc-900 border-white/10 text-white placeholder-zinc-500 focus:border-blue-500"
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: "all", label: `${t.common.all} (${APPS.length})` },
            { id: "entertainment", label: t.launcher.entertainment },
            { id: "installed", label: `${t.common.installed} (${installedApps.length})` },
            { id: "iframe", label: "Iframe App" },
            { id: "native", label: "Native" },
            { id: "system", label: t.launcher.system },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id as AppFilterType)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                filterType === f.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : isLight
                  ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* App Table List */}
      <div className="space-y-2">
        {filteredApps.map((app: AppDefinition) => {
          const isInstalled = installedApps.includes(app.id);
          const isIframe = app.type === "iframe";
          const dataInfo = getAppStoredDataInfo(app.id);
          const appMeta = getAppTranslation(app.id, language);
          const translatedTitle = appMeta?.title || app.title;

          return (
            <div
              key={app.id}
              className={`p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                isLight
                  ? "bg-white border-slate-200/80 shadow-xs hover:border-slate-300"
                  : "bg-zinc-900/80 border-white/10 hover:border-white/20 hover:bg-zinc-900"
              }`}
            >
              {/* Left: Icon, Name, Version, Type & Data Badge */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${
                    app.accentColor || "bg-blue-600"
                  } flex items-center justify-center text-white shadow-md shrink-0`}
                >
                  <AppIcon name={app.icon} size={18} />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className={`text-xs sm:text-sm font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                      {translatedTitle}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-md bg-white/10 border border-white/10 text-[10px] font-mono text-zinc-400 shrink-0">
                      {app.version || "v1.0.0"}
                    </span>
                    {app.isSystemApp && (
                      <span title={language === "en" ? "Core System App" : "Aplikasi Sistem Utama"} className="text-indigo-400 shrink-0">
                        <ShieldCheck size={12} />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    {isIframe ? (
                      <span className="text-cyan-400 font-semibold flex items-center gap-0.5 shrink-0">
                        <Globe size={10} /> Iframe
                      </span>
                    ) : (
                      <span className="text-purple-400 font-semibold flex items-center gap-0.5 shrink-0">
                        <Cpu size={10} /> Native
                      </span>
                    )}
                    <span className="text-zinc-600">•</span>
                    <span className={`truncate ${dataInfo.hasData ? "text-amber-400 font-medium" : "text-zinc-500"}`}>
                      {dataInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {dataInfo.hasData && dataInfo.key && (
                  <button
                    type="button"
                    onClick={() => handleClearAppData(translatedTitle, dataInfo.key)}
                    title={language === "en" ? "Clear Data" : "Bersihkan Data"}
                    className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/25 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw size={11} /> <span className="hidden sm:inline">{language === "en" ? "Clear" : "Bersihkan"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openWindow({ ...app, title: translatedTitle })}
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <ExternalLink size={12} /> {t.common.open}
                </button>

                {!app.isSystemApp && isInstalled && (
                  <button
                    type="button"
                    onClick={() => setPendingUninstallAppId(app.id)}
                    title={t.common.uninstall}
                    className="p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/25 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 size={12} /> <span className="hidden sm:inline">{t.common.uninstall}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
