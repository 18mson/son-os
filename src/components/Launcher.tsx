"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useWindowStore, AppDefinition } from "@/store/windowStore";
import { useAppStoreStore } from "@/store/appStoreStore";
import { APPS } from "@/config/appsConfig";
import { AppIcon } from "./AppIcon";
import { closeAllContextMenus } from "@/hooks/useContextMenuClose";
import { LauncherContextMenu } from "./launcher/LauncherContextMenu";
import { LauncherMobileGrid } from "./launcher/LauncherMobileGrid";
import { useTranslation, getAppTranslation } from "@/i18n";

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

  const { isInstalled } = useAppStoreStore();
  const isLight = theme === "light";

  const [searchQuery, setSearchQuery] = useState("");
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

  const installedAppsList = APPS.filter((a) => {
    if (a.isPreinstalled || a.isSystemApp) return true;
    return isInstalled(a.id);
  });

  const filteredApps = installedAppsList.filter((a) => {
    const appMeta = getAppTranslation(a.id, language);
    const title = appMeta?.title || a.title;
    const description = appMeta?.description || a.description;
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (description && description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const displayedApps = searchQuery ? filteredApps : installedAppsList;

  if (isMobile) {
    return (
      <>
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
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", duration: 0.28, bounce: 0.05 }}
            style={{ transformOrigin: "bottom left" }}
            className={`fixed bottom-17 left-3 z-45 w-130 max-h-[calc(100vh-100px)] h-135 rounded-3xl backdrop-blur-3xl border shadow-2xl select-none overflow-hidden flex flex-col ${
              isLight
                ? "bg-white/90 border-black/10 shadow-slate-400/30 text-slate-900"
                : "bg-zinc-950/88 border-white/12 shadow-black/80 text-zinc-100"
            }`}
          >
            {/* Search Bar */}
            <div className="p-4 pb-2 shrink-0">
              <div className="relative">
                <Search
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                    isLight ? "text-slate-400" : "text-zinc-400"
                  }`}
                  size={17}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t.launcher.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border outline-hidden focus:ring-2 focus:ring-blue-400/50 transition-all text-sm font-medium ${
                    isLight
                      ? "bg-slate-100 text-slate-900 placeholder-slate-400 border-slate-300"
                      : "bg-white/8 text-white placeholder-zinc-500 border-white/10"
                  }`}
                />
              </div>
            </div>

            {/* App Grid Container - Full Height Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
              {displayedApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                  <p className="text-sm font-medium">{t.launcher.noResults}</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 py-1 pb-4">
                  {displayedApps.map((app) => {
                    const appMeta = getAppTranslation(app.id, language);
                    const translatedTitle = appMeta?.title || app.title;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleOpenApp(app)}
                        onContextMenu={(e) => handleAppContextMenu(e, app.id)}
                        className={`group flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all cursor-pointer border ${
                          isLight
                            ? "hover:bg-slate-200/80 border-transparent hover:border-slate-300/80"
                            : "hover:bg-white/10 border-transparent hover:border-white/12 active:bg-white/15"
                        }`}
                      >
                        <div
                          className={`w-13 h-13 rounded-2xl ${app.accentColor} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}
                        >
                          <AppIcon name={app.icon} size={24} />
                        </div>
                        <span
                          className={`text-xs font-semibold text-center line-clamp-1 w-full tracking-tight ${
                            isLight ? "text-slate-800" : "text-zinc-200"
                          }`}
                        >
                          {translatedTitle}
                        </span>
                      </button>
                    );
                  })}
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
