"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { useWindowStore, AppDefinition } from "@/store/windowStore";
import { useAppStoreStore } from "@/store/appStoreStore";
import { APPS } from "@/config/appsConfig";
import { AppIcon } from "./AppIcon";
import { closeAllContextMenus } from "@/hooks/useContextMenuClose";
import { LauncherContextMenu } from "./launcher/LauncherContextMenu";
import { LauncherMobileGrid } from "./launcher/LauncherMobileGrid";

const COMPACT_APP_COUNT = 8;

export const Launcher: React.FC = () => {
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

  const { isInstalled } = useAppStoreStore();
  const isLight = theme === "light";

  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
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
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setIsExpanded(false);
    setAppContextMenu(null);
    closeLauncher();
  }, [closeLauncher]);

  useEffect(() => {
    if (launcherOpen && !isMobile) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
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
    openWindow(app);
    handleClose();
  };

  const handleAppContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setAppContextMenu({ appId, x: e.clientX, y: e.clientY });
  };

  const installedAppsList = APPS.filter((a) => {
    if (a.isPreinstalled || a.isSystemApp) return true;
    return isInstalled(a.id);
  });

  const filteredApps = installedAppsList.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedApps = searchQuery
    ? filteredApps
    : isExpanded
    ? installedAppsList
    : installedAppsList.slice(0, COMPACT_APP_COUNT);

  if (isMobile) {
    return (
      <LauncherMobileGrid
        launcherOpen={launcherOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredApps={filteredApps}
        installedAppsList={installedAppsList}
        handleOpenApp={handleOpenApp}
        handleAppContextMenu={handleAppContextMenu}
        openWindow={openWindow}
        handleClose={handleClose}
        APPS={APPS}
      />
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
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 12 }}
            transition={{ type: "spring", duration: 0.28, bounce: 0.06 }}
            style={{ transformOrigin: "bottom left" }}
            className={`fixed bottom-17 left-3 z-45 w-130 rounded-3xl backdrop-blur-3xl border shadow-2xl select-none overflow-hidden ${
              isLight
                ? "bg-white/90 border-black/10 shadow-slate-400/30 text-slate-900"
                : "bg-zinc-950/85 border-white/12 shadow-black/70 text-zinc-100"
            }`}
          >
            <div className="flex flex-col gap-0">
              {/* Search Bar */}
              <div className="px-4 pt-4 pb-3">
                <div className="relative">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-zinc-400"}`} size={16} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search apps, projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-hidden focus:ring-2 focus:ring-blue-400/50 transition-all text-sm ${
                      isLight
                        ? "bg-slate-100 text-slate-900 placeholder-slate-400 border-slate-300"
                        : "bg-white/8 text-white placeholder-zinc-500 border-white/10"
                    }`}
                  />
                </div>
              </div>

              {/* App Grid */}
              <div className="overflow-y-auto px-3" style={{ maxHeight: isExpanded ? "380px" : "auto" }}>
                {displayedApps.length === 0 ? (
                  <p className="text-center text-xs py-8 text-zinc-500">Tidak ada aplikasi yang cocok</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 py-1">
                    {displayedApps.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => handleOpenApp(app)}
                        onContextMenu={(e) => handleAppContextMenu(e, app.id)}
                        className={`group flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all cursor-pointer border ${
                          isLight
                            ? "hover:bg-slate-200/70 border-transparent hover:border-slate-300/80"
                            : "hover:bg-white/10 border-transparent hover:border-white/12"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl ${app.accentColor} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                          <AppIcon name={app.icon} size={22} />
                        </div>
                        <span className={`text-[11px] font-medium text-center line-clamp-1 w-full ${
                          isLight ? "text-slate-800" : "text-zinc-200"
                        }`}>
                          {app.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Expand Toggle Button */}
              {!searchQuery && installedAppsList.length > COMPACT_APP_COUNT && (
                <div className="px-3 py-2 flex justify-center">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isLight ? "hover:bg-slate-200 text-slate-700" : "hover:bg-white/10 text-zinc-300"
                    }`}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronDown size={14} /> Sembunyikan sebagian
                      </>
                    ) : (
                      <>
                        <ChevronUp size={14} /> Tampilkan semua app ({installedAppsList.length})
                      </>
                    )}
                  </button>
                </div>
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
