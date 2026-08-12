"use client";

import React, { useState } from "react";
import { Search, ShoppingBag, CheckCircle, ExternalLink, Trash2, ShieldCheck, Download } from "lucide-react";
import { APPS } from "@/data/apps";
import { AppDefinition, useWindowStore } from "@/store/windowStore";
import { useAppStoreStore } from "@/store/appStoreStore";
import { AppIcon } from "../AppIcon";

type CategoryFilter = "all" | "portfolio" | "utility" | "system" | "entertainment";

export const AppStoreApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const { openWindow, theme } = useWindowStore();
  const { installedApps, installApp, setPendingUninstallAppId } = useAppStoreStore();

  const isLight = theme === "light";

  const catalogApps = APPS.filter((app) => app.id !== "settings" && app.id !== "app-store");

  const filteredApps = catalogApps.filter((app) => {
    const matchesSearch =
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const appCategories = Array.isArray(app.category) ? app.category : app.category ? [app.category] : ["utility"];
    const matchesCategory =
      activeCategory === "all" || appCategories.includes(activeCategory);

    return matchesSearch && matchesCategory;
  });

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: "Semua App" },
    { id: "entertainment", label: "Hiburan" },
    { id: "portfolio", label: "Portfolio" },
    { id: "utility", label: "Utilitas" },
    { id: "system", label: "Sistem" },
  ];

  const installedCatalogCount = installedApps.filter((id) => id !== "settings" && id !== "app-store").length;

  return (
    <div className={`flex flex-col h-full w-full select-none overflow-hidden font-sans ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Header Banner */}
      <div className={`relative px-6 py-6 border-b shrink-0 ${
        isLight
          ? "border-slate-200 bg-linear-to-r from-indigo-100/90 via-purple-100/50 to-slate-100"
          : "border-white/10 bg-linear-to-r from-indigo-950/80 via-purple-950/40 to-zinc-950"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                Son-OS App Store
              </h1>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                Jelajahi, pasang, dan kelola aplikasi untuk desktop portfolio Anda.
              </p>
            </div>
          </div>

          <div className={`text-xs font-medium border px-3.5 py-1.5 rounded-full flex items-center gap-2 w-fit ${
            isLight ? "bg-white border-slate-300 text-slate-700 shadow-xs" : "bg-white/5 border-white/10 text-zinc-400"
          }`}>
            <CheckCircle size={14} className="text-emerald-500" />
            <span>Terinstall: {installedCatalogCount} / {catalogApps.length} Apps</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 max-w-5xl mx-auto w-full">
          {/* Category Tabs */}
          <div className={`flex items-center gap-1.5 p-1 border rounded-2xl overflow-x-auto no-scrollbar w-full sm:w-auto ${
            isLight ? "bg-slate-200/80 border-slate-300" : "bg-white/5 border-white/10"
          }`}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                    : isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-300/60" : "text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-zinc-400"}`} size={15} />
            <input
              type="text"
              placeholder="Cari aplikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-hidden focus:ring-2 focus:ring-indigo-400/50 transition-all ${
                isLight ? "bg-white text-slate-900 placeholder-slate-400 border-slate-300" : "bg-white/8 text-white placeholder-zinc-500 border-white/10"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full no-scrollbar">
        {filteredApps.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 text-center gap-3 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
            <ShoppingBag size={40} className={isLight ? "text-slate-400" : "text-zinc-600"} />
            <p className={`text-sm font-medium ${isLight ? "text-slate-800" : "text-zinc-300"}`}>Tidak ada aplikasi ditemukan</p>
            <p className="text-xs">Coba ubah kata kunci pencarian atau kategori filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app: AppDefinition) => {
              const isInstalled = installedApps.includes(app.id);
              const isSystem = Boolean(app.isSystemApp);

              return (
                <div
                  key={app.id}
                  className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 group ${
                    isLight
                      ? "bg-white border-slate-200/80 shadow-md shadow-slate-200/50 hover:border-indigo-400/50"
                      : "bg-zinc-900/60 border-white/10 hover:border-white/20 hover:bg-zinc-900/90"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${app.accentColor} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform`}>
                          <AppIcon name={app.icon} size={22} />
                        </div>
                        <div>
                          <h2 className={`text-sm font-semibold tracking-wide ${isLight ? "text-slate-900" : "text-white"}`}>{app.title}</h2>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(Array.isArray(app.category) ? app.category : [app.category || "utility"]).map((cat) => (
                              <span
                                key={cat}
                                className={`inline-block text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  isLight ? "bg-slate-100 text-slate-600" : "bg-white/10 text-zinc-300"
                                }`}
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {isSystem && (
                        <span title="Aplikasi Sistem bawaan" className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-500 border border-indigo-500/20">
                          <ShieldCheck size={14} />
                        </span>
                      )}
                    </div>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                      {app.description || "Aplikasi fungsional untuk ekosistem Son-OS."}
                    </p>
                  </div>

                  {/* Actions Footer */}
                  <div className={`pt-4 mt-2 border-t flex items-center gap-2 ${isLight ? "border-slate-100" : "border-white/5"}`}>
                    {isInstalled ? (
                      <>
                        <button
                          onClick={() => openWindow(app)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                        >
                          <ExternalLink size={13} />
                          <span>Buka App</span>
                        </button>

                        {!isSystem && (
                          <button
                            onClick={() => setPendingUninstallAppId(app.id)}
                            title="Uninstall Aplikasi"
                            className="flex items-center justify-center p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-500 border border-rose-500/20 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => installApp(app.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Install App</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
