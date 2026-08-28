"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Pin,
  FolderKanban,
  Wrench,
  Gamepad2,
  Sliders,
  Layers,
  X,
} from "lucide-react";
import { useWindowStore, AppDefinition, AppCategory } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";
import { AppIcon } from "./AppIcon";
import { closeAllContextMenus } from "@/hooks/useContextMenuClose";
import { LauncherContextMenu } from "./launcher/LauncherContextMenu";
import { LauncherMobileGrid } from "./launcher/LauncherMobileGrid";
import { useTranslation, getAppTranslation } from "@/i18n";

type CategoryFilter = "all" | "pinned" | "portfolio" | "utility" | "entertainment" | "system";

export const Launcher: React.FC = () => {
  const { t, language } = useTranslation();
  const {
    launcherOpen,
    closeLauncher,
    openWindow,
    pinnedApps,
    togglePinApp,
    desktopShortcuts,
    addDesktopShortcut,
    removeDesktopShortcut,
    showNotification,
    theme,
  } = useWindowStore();

  const isLight = theme === "light";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [isMobile, setIsMobile] = useState(false);
  const [appContextMenu, setAppContextMenu] = useState<{
    appId: string;
    x: number;
    y: number;
  } | null>(null);

  const bubbleRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = () =>
      setIsMobile(
        window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setActiveCategory("all");
    setAppContextMenu(null);
    closeLauncher();
  }, [closeLauncher]);

  useEffect(() => {
    if (launcherOpen && !isMobile) {
      const tTimer = setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => clearTimeout(tTimer);
    }
  }, [launcherOpen, isMobile]);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (!launcherOpen || isMobile) return;
    const target = e.target as HTMLElement;
    if (target && target.closest("[data-launcher-button]")) return;
    if (bubbleRef.current && !bubbleRef.current.contains(target)) {
      if (menuRef.current && menuRef.current.contains(target)) return;
      handleClose();
    }
  }, [launcherOpen, isMobile, handleClose]);

  useEffect(() => {
    if (launcherOpen && !isMobile) {
      document.addEventListener("pointerdown", handlePointerDown);
    }
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [launcherOpen, isMobile, handlePointerDown]);

  useEffect(() => {
    const handleCloseEvent = () => setAppContextMenu(null);
    window.addEventListener("sonos-close-context-menus", handleCloseEvent);
    return () => window.removeEventListener("sonos-close-context-menus", handleCloseEvent);
  }, []);

  const handleOpenApp = (app: AppDefinition) => {
    const appMeta = getAppTranslation(app.id, language);
    openWindow({ ...app, title: appMeta?.title || app.title });
    handleClose();
  };

  const handleAppContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setAppContextMenu({ appId, x: e.clientX, y: e.clientY });
  };

  const pinnedAppDefs = useMemo(() => {
    return pinnedApps
      .map((id) => APPS.find((a) => a.id === id))
      .filter((a): a is AppDefinition => a !== undefined);
  }, [pinnedApps]);

  const categoryConfigs: {
    id: CategoryFilter;
    label: string;
    icon: React.ReactNode;
    categories?: AppCategory[];
  }[] = useMemo(() => [
    { id: "all", label: t.launcher.allCategories, icon: <Layers size={13} /> },
    { id: "pinned", label: `${t.launcher.pinnedApps} (${pinnedApps.length})`, icon: <Pin size={13} /> },
    { id: "portfolio", label: t.launcher.portfolio, icon: <FolderKanban size={13} />, categories: ["portfolio"] },
    { id: "utility", label: t.launcher.utility, icon: <Wrench size={13} />, categories: ["utility"] },
    { id: "entertainment", label: t.launcher.entertainment, icon: <Gamepad2 size={13} />, categories: ["entertainment"] },
    { id: "system", label: t.launcher.system, icon: <Sliders size={13} />, categories: ["system"] },
  ], [t, pinnedApps.length]);

  const searchFilteredApps = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return APPS.filter((a) => {
      const appMeta = getAppTranslation(a.id, language);
      const title = appMeta?.title || a.title;
      const description = appMeta?.description || a.description;
      return (
        title.toLowerCase().includes(q) ||
        (description && description.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, language]);

  const getAppsByCategory = (cat: AppCategory) => {
    return APPS.filter((app) => {
      const appCategories = Array.isArray(app.category) ? app.category : [app.category || "utility"];
      return appCategories.includes(cat);
    });
  };

  const renderAppTile = (app: AppDefinition, showCategoryBadge = false) => {
    const appMeta = getAppTranslation(app.id, language);
    const translatedTitle = appMeta?.title || app.title;
    const isPinned = pinnedApps.includes(app.id);

    return (
      <div
        key={app.id}
        className={`group relative flex flex-col items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border select-none ${isLight
            ? "hover:bg-slate-200/80 border-transparent hover:border-slate-300/80"
            : "hover:bg-white/10 border-transparent hover:border-white/12 active:bg-white/15"
          }`}
        onClick={() => handleOpenApp(app)}
        onContextMenu={(e) => handleAppContextMenu(e, app.id)}
      >
        {/* Pin Affordance Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePinApp(app.id);
          }}
          title={isPinned ? t.launcher.unpinFromShelf : t.launcher.pinToShelf}
          aria-label={isPinned ? t.launcher.unpinFromShelf : t.launcher.pinToShelf}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all cursor-pointer ${isPinned
              ? "bg-blue-600/90 text-white shadow-xs opacity-100 hover:bg-rose-600 hover:scale-110"
              : isLight
                ? "opacity-0 group-hover:opacity-100 bg-white/90 text-slate-600 hover:text-blue-600 hover:bg-white shadow-xs"
                : "opacity-0 group-hover:opacity-100 bg-zinc-800/90 text-zinc-300 hover:text-blue-400 hover:bg-zinc-700 shadow-xs"
            }`}
        >
          {isPinned ? <Pin size={11} className="fill-current" /> : <Pin size={11} />}
        </button>

        {/* App Icon */}
        <div
          className={`w-12 h-12 rounded-2xl ${app.accentColor} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0 mt-1`}
        >
          <AppIcon name={app.icon} size={22} />
        </div>

        {/* Title and Badge */}
        <div className="w-full text-center mt-2 flex flex-col items-center">
          <span
            className={`text-xs font-semibold line-clamp-1 w-full tracking-tight ${isLight ? "text-slate-800" : "text-zinc-200"
              }`}
          >
            {translatedTitle}
          </span>
          {showCategoryBadge && app.category && (
            <span className="text-[10px] text-zinc-500 line-clamp-1 capitalize mt-0.5">
              {Array.isArray(app.category) ? app.category[0] : app.category}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <>
        <LauncherMobileGrid
          launcherOpen={launcherOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          pinnedApps={pinnedApps}
          pinnedAppDefs={pinnedAppDefs}
          APPS={APPS}
          handleOpenApp={handleOpenApp}
          handleAppContextMenu={handleAppContextMenu}
          togglePinApp={togglePinApp}
          handleClose={handleClose}
        />
        <LauncherContextMenu
          menuRef={menuRef}
          appContextMenu={appContextMenu}
          pinnedApps={pinnedApps}
          desktopShortcuts={desktopShortcuts}
          onOpenApp={handleOpenApp}
          onTogglePinApp={togglePinApp}
          onAddDesktopShortcut={addDesktopShortcut}
          onRemoveDesktopShortcut={removeDesktopShortcut}
          showNotification={showNotification}
          onCloseMenu={() => setAppContextMenu(null)}
        />
      </>
    );
  }

  return (
    <AnimatePresence>
      {launcherOpen && (
        <>
          <motion.div
            ref={bubbleRef}
            key="launcher-bubble"
            data-launcher-bubble
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", duration: 0.28, bounce: 0.05 }}
            style={{ transformOrigin: "bottom left" }}
            className={`fixed bottom-17 left-3 z-75 w-140 max-h-[calc(100vh-100px)] h-148 rounded-3xl backdrop-blur-3xl border shadow-2xl select-none overflow-hidden flex flex-col ${isLight
                ? "bg-white/95 border-black/10 shadow-slate-400/30 text-slate-900"
                : "bg-zinc-950/92 border-white/12 shadow-black/80 text-zinc-100"
              }`}
          >
            {/* Search Bar & Header */}
            <div className="p-4 pb-2 shrink-0 space-y-3">
              <div className="relative">
                <Search
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-zinc-400"
                    }`}
                  size={17}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t.launcher.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-11 pr-9 py-2.5 rounded-2xl border outline-hidden focus:ring-2 focus:ring-blue-400/50 transition-all text-xs font-medium ${isLight
                      ? "bg-slate-100 text-slate-900 placeholder-slate-400 border-slate-300"
                      : "bg-white/8 text-white placeholder-zinc-500 border-white/10"
                    }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Filter Tabs */}
              {!searchQuery && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {categoryConfigs.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${activeCategory === cat.id
                          ? "bg-blue-600 text-white shadow-xs"
                          : isLight
                            ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                            : "text-zinc-400 hover:text-white hover:bg-white/10"
                        }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 no-scrollbar">
              {/* If Searching */}
              {searchQuery ? (
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                    <span className="text-xs font-semibold text-zinc-400">
                      {searchFilteredApps.length} {searchFilteredApps.length === 1 ? "app found" : "apps found"}
                    </span>
                  </div>
                  {searchFilteredApps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                      <p className="text-sm font-medium">{t.launcher.noResults}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2.5 pb-4">
                      {searchFilteredApps.map((app) => renderAppTile(app, true))}
                    </div>
                  )}
                </div>
              ) : (
                /* Browsing Categorized App Drawer */
                <>
                  {/* Category: ALL -> Pinned Section + Flat All Apps Grid */}
                  {activeCategory === "all" && (
                    <>
                      {/* Pinned Apps Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-blue-400">
                            <Pin size={13} className="fill-current" />
                            <span>{t.launcher.pinnedApps}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 font-mono">
                              {pinnedAppDefs.length}
                            </span>
                          </div>
                        </div>

                        {pinnedAppDefs.length === 0 ? (
                          <div className={`p-4 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center gap-1.5 ${isLight ? "border-slate-300 text-slate-500 bg-slate-50/50" : "border-white/10 text-zinc-400 bg-white/2"
                            }`}>
                            <Pin size={16} className="text-zinc-500" />
                            <p className="text-xs font-medium">
                              {language === "en" ? "No pinned apps yet" : "Belum ada aplikasi yang disematkan"}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {language === "en" ? "Hover over any app below and click the pin icon to pin it here" : "Arahkan kursor ke aplikasi di bawah dan klik ikon pin"}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2.5">
                            {pinnedAppDefs.map((app) => renderAppTile(app))}
                          </div>
                        )}
                      </div>

                      {/* All Apps Grid */}
                      <div className="space-y-2 pb-3">
                        <div className="flex items-center justify-between px-1 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-zinc-400">
                            <Layers size={13} />
                            <span>{t.launcher.allApps}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
                              {APPS.length}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2.5">
                          {APPS.map((app) => renderAppTile(app))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Category: PINNED ONLY */}
                  {activeCategory === "pinned" && (
                    <div className="space-y-2 pb-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-blue-400">
                          <Pin size={13} className="fill-current" />
                          <span>{t.launcher.pinnedApps}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 font-mono">
                            {pinnedAppDefs.length}
                          </span>
                        </div>
                      </div>

                      {pinnedAppDefs.length === 0 ? (
                        <div className={`p-8 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center gap-2 ${isLight ? "border-slate-300 text-slate-500 bg-slate-50/50" : "border-white/10 text-zinc-400 bg-white/2"
                          }`}>
                          <Pin size={24} className="text-zinc-500" />
                          <p className="text-sm font-semibold">
                            {language === "en" ? "No pinned apps" : "Tidak ada aplikasi yang disematkan"}
                          </p>
                          <p className="text-xs text-zinc-500 max-w-xs">
                            {language === "en" ? "Pin your favorite apps by clicking the pin icon on any app card" : "Sematkan aplikasi favorit dengan mengeklik ikon pin pada kartu aplikasi"}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2.5">
                          {pinnedAppDefs.map((app) => renderAppTile(app))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category: PORTFOLIO */}
                  {activeCategory === "portfolio" && (
                    <div className="space-y-2 pb-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-emerald-400">
                          <FolderKanban size={13} />
                          <span>{t.launcher.portfolio}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 font-mono">
                            {getAppsByCategory("portfolio").length}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2.5">
                        {getAppsByCategory("portfolio").map((app) => renderAppTile(app))}
                      </div>
                    </div>
                  )}

                  {/* Category: UTILITY */}
                  {activeCategory === "utility" && (
                    <div className="space-y-2 pb-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-amber-400">
                          <Wrench size={13} />
                          <span>{t.launcher.utility}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 font-mono">
                            {getAppsByCategory("utility").length}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2.5">
                        {getAppsByCategory("utility").map((app) => renderAppTile(app))}
                      </div>
                    </div>
                  )}

                  {/* Category: ENTERTAINMENT / GAMES */}
                  {activeCategory === "entertainment" && (
                    <div className="space-y-2 pb-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-purple-400">
                          <Gamepad2 size={13} />
                          <span>{t.launcher.entertainment}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 font-mono">
                            {getAppsByCategory("entertainment").length}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2.5">
                        {getAppsByCategory("entertainment").map((app) => renderAppTile(app))}
                      </div>
                    </div>
                  )}

                  {/* Category: SYSTEM */}
                  {activeCategory === "system" && (
                    <div className="space-y-2 pb-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-indigo-400">
                          <Sliders size={13} />
                          <span>{t.launcher.system}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 font-mono">
                            {getAppsByCategory("system").length}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2.5">
                        {getAppsByCategory("system").map((app) => renderAppTile(app))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* App Context Menu */}
          <LauncherContextMenu
            menuRef={menuRef}
            appContextMenu={appContextMenu}
            pinnedApps={pinnedApps}
            desktopShortcuts={desktopShortcuts}
            onOpenApp={handleOpenApp}
            onTogglePinApp={togglePinApp}
            onAddDesktopShortcut={addDesktopShortcut}
            onRemoveDesktopShortcut={removeDesktopShortcut}
            showNotification={showNotification}
            onCloseMenu={() => setAppContextMenu(null)}
          />
        </>
      )}
    </AnimatePresence>
  );
};
