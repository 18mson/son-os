"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pin, PinOff, ExternalLink, Monitor, ChevronUp, ChevronDown } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";
import { AppIcon } from "./AppIcon";
import { closeAllContextMenus } from "@/hooks/useContextMenuClose";

// Number of apps shown in compact state
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
  } = useWindowStore();

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

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Imperative close: reset local state, then close launcher.
  const handleClose = useCallback(() => {
    setSearchQuery("");
    setIsExpanded(false);
    setAppContextMenu(null);
    closeLauncher();
  }, [closeLauncher]);

  // Auto-focus search input when launcher opens
  useEffect(() => {
    if (launcherOpen && !isMobile) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [launcherOpen, isMobile]);

  // Click-outside to close (bubble mode only — mobile uses backdrop click)
  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (!launcherOpen || isMobile) return;
    const target = e.target as HTMLElement;
    // Don't close if user clicked the launcher button itself (let button onClick toggle it)
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

  // Close context menu on sonos-close-context-menus global event
  useEffect(() => {
    const handler = () => setAppContextMenu(null);
    window.addEventListener("sonos-close-context-menus", handler);
    return () => window.removeEventListener("sonos-close-context-menus", handler);
  }, []);

  const filteredApps = APPS.filter(
    (app) =>
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // In compact mode, show only a slice unless searching
  const displayedApps = searchQuery
    ? filteredApps
    : isExpanded
      ? filteredApps
      : filteredApps.slice(0, COMPACT_APP_COUNT);

  const hasMoreApps = !searchQuery && filteredApps.length > COMPACT_APP_COUNT;

  const handleAppContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setAppContextMenu({ appId, x: e.clientX, y: e.clientY });
  };

  const handleOpenApp = (app: typeof APPS[0]) => {
    openWindow(app);
    setSearchQuery("");
    setAppContextMenu(null);
    // Don't close launcher — let user open multiple apps
  };

  // ── MOBILE: keep fullscreen overlay behavior ──────────────────────────────
  if (isMobile) {
    return (
      <AnimatePresence>
        {launcherOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-2xl flex flex-col items-center pt-16 px-4 overflow-y-auto select-none"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: -16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: -16 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.05 }}
              onClick={(e) => { e.stopPropagation(); setAppContextMenu(null); }}
              className="w-full max-w-lg flex flex-col items-center gap-6"
            >
              {/* Search */}
              <div className="w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari app..."
                  aria-label="Search apps"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 text-white placeholder-zinc-400 border border-white/15 outline-hidden focus:ring-2 focus:ring-blue-400/60 transition-all text-sm"
                />
              </div>
              {/* App grid */}
              <div className="w-full grid grid-cols-3 gap-3">
                {(searchQuery ? filteredApps : APPS).map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleOpenApp(app)}
                    onContextMenu={(e) => handleAppContextMenu(e, app.id)}
                    aria-label={`Open ${app.title}`}
                    className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/15 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${app.accentColor} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <AppIcon name={app.icon} size={22} />
                    </div>
                    <span className="text-[11px] font-medium text-zinc-200 text-center line-clamp-1">{app.title}</span>
                  </button>
                ))}
              </div>
              <div className="h-28 shrink-0 w-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ── DESKTOP: Compact Bubble anchored to launcher button ───────────────────
  return (
    <AnimatePresence>
      {launcherOpen && (
        <>
          {/* Bubble panel — anchored bottom-left above shelf */}
          <motion.div
            ref={bubbleRef}
            key="launcher-bubble"
            data-launcher-bubble
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 12 }}
            transition={{ type: "spring", duration: 0.28, bounce: 0.06 }}
            style={{ transformOrigin: "bottom left" }}
            className="fixed bottom-17 left-3 z-45 w-130 rounded-3xl bg-zinc-950/85 backdrop-blur-3xl border border-white/12 shadow-2xl shadow-black/70 select-none overflow-hidden"
          >
            {/* Inner content with padding */}
            <div className="flex flex-col gap-0">

              {/* ── Search bar ── */}
              <div className="px-4 pt-4 pb-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search apps, projects..."
                    aria-label="Search apps and projects"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/8 text-white placeholder-zinc-500 border border-white/10 outline-hidden focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/40 transition-all text-sm"
                  />
                </div>
              </div>

              {/* ── App grid / list ── */}
              <div
                className="overflow-y-auto px-3"
                style={{ maxHeight: isExpanded ? "380px" : "auto" }}
              >
                {filteredApps.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-sm">
                    Tidak ada app yang cocok dengan &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 pb-1">
                    {displayedApps.map((app) => {
                      const isPinned = pinnedApps.includes(app.id);
                      return (
                        <button
                          key={app.id}
                          onClick={() => handleOpenApp(app)}
                          onContextMenu={(e) => handleAppContextMenu(e, app.id)}
                          aria-label={`Open ${app.title}`}
                          className="group relative flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/10 border border-transparent hover:border-white/10 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden transition-all duration-150"
                        >
                          <div className={`w-11 h-11 rounded-2xl ${app.accentColor} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                            <AppIcon name={app.icon} size={20} />
                          </div>
                          {isPinned && (
                            <span className="absolute top-2 right-2 p-0.5 rounded-full bg-white/15" title="Pinned">
                              <Pin size={8} />
                            </span>
                          )}
                          <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white text-center line-clamp-1 leading-tight w-full">
                            {app.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Expand / Collapse toggle ── */}
              {hasMoreApps && !searchQuery && (
                <div className="px-4 pb-3 pt-1">
                  <button
                    onClick={() => setIsExpanded((v) => !v)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/8 text-xs font-medium transition-all"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronDown size={14} />
                        Tampilkan lebih sedikit
                      </>
                    ) : (
                      <>
                        <ChevronUp size={14} />
                        Tampilkan semua app ({filteredApps.length})
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ── Bottom divider spacer ── */}
              <div className="h-px bg-white/8 mx-4" />
              <div className="px-4 py-2.5 flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                <span>Son-OS Launcher</span>
                <span className="opacity-50">Klik kanan untuk opsi</span>
              </div>
            </div>
          </motion.div>

          {/* App Context Menu */}
          {appContextMenu && (
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                left: `${Math.min(appContextMenu.x, typeof window !== "undefined" ? window.innerWidth - 210 : 300)}px`,
                top: `${Math.max(8, Math.min(appContextMenu.y - 8, typeof window !== "undefined" ? window.innerHeight - 160 : 400))}px`,
              }}
              onClick={(e) => e.stopPropagation()}
              className="z-60 w-52 rounded-2xl bg-zinc-900/98 border border-white/15 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
              data-context-menu
            >
              {(() => {
                const targetApp = APPS.find((a) => a.id === appContextMenu.appId);
                const isPinned = pinnedApps.includes(appContextMenu.appId);
                if (!targetApp) return null;
                const existingShortcut = desktopShortcuts.find((s) => s.appId === targetApp.id);

                return (
                  <div className="flex flex-col gap-0.5 text-xs text-zinc-200">
                    <button
                      onClick={() => {
                        handleOpenApp(targetApp);
                        setAppContextMenu(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
                    >
                      <ExternalLink size={13} /> Buka {targetApp.title}
                    </button>

                    <button
                      onClick={() => {
                        togglePinApp(targetApp.id);
                        setAppContextMenu(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
                    >
                      {isPinned ? (
                        <><PinOff size={13} className="text-rose-400" /> Unpin dari Shelf</>
                      ) : (
                        <><Pin size={13} className="text-blue-400" /> Pin ke Shelf</>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (existingShortcut) {
                          removeDesktopShortcut(existingShortcut.id);
                          showNotification("Desktop Shortcut", `Shortcut ${targetApp.title} dihapus.`, "Desktop", "Monitor");
                        } else {
                          addDesktopShortcut(targetApp.id);
                          showNotification("Desktop Shortcut", `Shortcut ${targetApp.title} ditambahkan ke desktop.`, "Desktop", "Monitor");
                        }
                        setAppContextMenu(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
                    >
                      <Monitor size={13} className="text-emerald-400" />
                      {existingShortcut ? "Hapus dari Desktop" : "Tambah ke Desktop"}
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};
