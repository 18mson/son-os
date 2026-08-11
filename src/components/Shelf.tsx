"use client";

import React, { useState, useEffect, useRef } from "react";
import { LayoutGrid, Wifi, Battery, Pin, PinOff, X, ExternalLink } from "lucide-react";
import { useWindowStore, AppDefinition } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";
import { AppIcon } from "./AppIcon";
import { useContextMenuClose, closeAllContextMenus } from "@/hooks/useContextMenuClose";

export const Shelf: React.FC = () => {
  const {
    windows,
    launcherOpen,
    quickSettingsOpen,
    theme,
    activeWindowId,
    pinnedApps,
    toggleLauncher,
    closeLauncher,
    toggleMinimizeWindow,
    openWindow,
    closeWindow,
    togglePinApp,
    reorderPinnedApps,
    toggleQuickSettings,
  } = useWindowStore();

  const [time, setTime] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [shelfContextMenu, setShelfContextMenu] = useState<{
    app: AppDefinition;
    x: number;
    y: number;
  } | null>(null);
  const shelfMenuRef = useRef<HTMLDivElement>(null);

  useContextMenuClose(Boolean(shelfContextMenu), () => setShelfContextMenu(null), shelfMenuRef);

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData("text/plain", appId);
    setDraggedAppId(appId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetAppId: string) => {
    e.preventDefault();
    const sourceAppId = e.dataTransfer.getData("text/plain") || draggedAppId;
    if (!sourceAppId || sourceAppId === targetAppId) {
      setDraggedAppId(null);
      return;
    }

    const currentIndex = pinnedApps.indexOf(sourceAppId);
    const targetIndex = pinnedApps.indexOf(targetAppId);
    if (currentIndex !== -1 && targetIndex !== -1) {
      const updated = [...pinnedApps];
      updated.splice(currentIndex, 1);
      updated.splice(targetIndex, 0, sourceAppId);
      reorderPinnedApps(updated);
    }
    setDraggedAppId(null);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1. Pinned Apps (resolved from APPS config)
  const pinnedAppDefs = pinnedApps
    .map((id) => APPS.find((a) => a.id === id))
    .filter((a): a is AppDefinition => a !== undefined);

  // 2. Open Windows that are NOT pinned
  const unpinnedOpenWindows = windows.filter((w) => !pinnedApps.includes(w.id));
  const unpinnedAppDefs = unpinnedOpenWindows
    .map((w) => APPS.find((a) => a.id === w.id))
    .filter((a): a is AppDefinition => a !== undefined);

  const handleAppClick = (app: AppDefinition, e: React.MouseEvent) => {
    e.stopPropagation();
    closeLauncher();
    const openWin = windows.find((w) => w.id === app.id);
    if (openWin) {
      toggleMinimizeWindow(app.id);
    } else {
      openWindow(app);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, app: AppDefinition) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setShelfContextMenu({
      app,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const totalShelfItemsCount = pinnedAppDefs.length + unpinnedAppDefs.length;

  // Helper to render shelf app icons
  const renderAppIcons = () => (
    <>
      {/* Pinned Apps */}
      {pinnedAppDefs.map((app) => {
        const openWin = windows.find((w) => w.id === app.id);
        const isOpen = Boolean(openWin);
        const isActive = activeWindowId === app.id && openWin && !openWin.isMinimized;
        const isMinimized = openWin?.isMinimized;
        const isBeingDragged = draggedAppId === app.id;

        return (
          <button
            key={app.id}
            draggable
            onDragStart={(e) => handleDragStart(e, app.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, app.id)}
            onClick={(e) => handleAppClick(app, e)}
            onContextMenu={(e) => handleContextMenu(e, app)}
            title={`${app.title} ${isOpen ? "(Running)" : "(Pinned)"}`}
            aria-label={`Open App ${app.title}`}
            className={`relative group p-1.5 sm:p-2 min-w-10 sm:min-w-11 min-h-10 sm:min-h-11 rounded-2xl transition-all duration-200 flex items-center justify-center cursor-grab active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden shrink-0 ${isBeingDragged ? "opacity-30 scale-90" : ""
              } ${isActive
                ? "bg-white/20 text-white shadow-inner"
                : isMinimized
                  ? "text-zinc-400 hover:bg-white/10 hover:text-zinc-200 opacity-70"
                  : isOpen
                    ? "text-zinc-200 hover:bg-white/15 hover:text-white"
                    : "text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
          >
            <div className={`p-1.5 rounded-lg ${app.accentColor || "bg-blue-600"} text-white shadow-sm transition-transform group-hover:scale-105 pointer-events-none`}>
              <AppIcon name={app.icon} size={16} />
            </div>

            {/* ChromeOS active running indicator bar */}
            {isOpen && (
              <span
                className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full transition-all duration-200 ${isActive
                  ? "w-4 h-1 bg-blue-400 shadow-sm shadow-blue-400"
                  : isMinimized
                    ? "w-1.5 h-1 bg-zinc-500"
                    : "w-1.5 h-1 bg-zinc-300"
                  }`}
              />
            )}
          </button>
        );
      })}

      {/* Unpinned Separator if both pinned and unpinned exist */}
      {pinnedAppDefs.length > 0 && unpinnedAppDefs.length > 0 && (
        <div className="h-5 w-px bg-white/10 mx-0.5 shrink-0" />
      )}

      {/* Unpinned Open Windows */}
      {unpinnedAppDefs.map((app) => {
        const openWin = windows.find((w) => w.id === app.id);
        if (!openWin) return null;
        const isActive = activeWindowId === app.id && !openWin.isMinimized;
        const isMinimized = openWin.isMinimized;

        return (
          <button
            key={app.id}
            onClick={(e) => handleAppClick(app, e)}
            onContextMenu={(e) => handleContextMenu(e, app)}
            title={app.title}
            aria-label={`Open App ${app.title}`}
            className={`relative group p-1.5 sm:p-2 min-w-10 sm:min-w-11 min-h-10 sm:min-h-11 rounded-2xl transition-all duration-200 flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden shrink-0 ${isActive
              ? "bg-white/20 text-white shadow-inner"
              : isMinimized
                ? "text-zinc-400 hover:bg-white/10 hover:text-zinc-200 opacity-70"
                : "text-zinc-200 hover:bg-white/15 hover:text-white"
              }`}
          >
            <div className={`p-1.5 rounded-lg ${app.accentColor || "bg-blue-600"} text-white shadow-sm transition-transform group-hover:scale-105`}>
              <AppIcon name={app.icon} size={16} />
            </div>

            <span
              className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full transition-all duration-200 ${isActive
                ? "w-4 h-1 bg-blue-400 shadow-sm shadow-blue-400"
                : isMinimized
                  ? "w-1.5 h-1 bg-zinc-500"
                  : "w-1.5 h-1 bg-zinc-300"
                }`}
            />
          </button>
        );
      })}
    </>
  );

  return (
    <>
      {/* ── DESKTOP VIEW (md and up): 3 Independent Floating Clusters ── */}
      <div className="hidden md:block">
        {/* 1. Launcher Button (fixed bottom-left) */}
        <button
          data-launcher-button
          onClick={(e) => {
            e.stopPropagation();
            toggleLauncher();
          }}
          title="Launcher"
          aria-label="Toggle App Launcher"
          className={`fixed bottom-3 left-3 z-50 p-2.5 min-w-11 min-h-11 flex items-center justify-center rounded-full backdrop-blur-2xl transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden hover:scale-105 active:scale-95 ${theme === "light"
            ? launcherOpen
              ? "bg-zinc-950 text-white border border-zinc-800 shadow-xl scale-105"
              : "bg-white/90 text-zinc-800 border border-black/10 hover:bg-white shadow-md shadow-black/10"
            : launcherOpen
              ? "bg-white text-zinc-950 border border-white/40 shadow-xl scale-105"
              : "bg-zinc-950/90 text-zinc-300 border border-white/15 hover:bg-zinc-900 hover:text-white shadow-2xl shadow-black/80"
            }`}
        >
          <LayoutGrid size={19} className="transition-transform group-hover:scale-110" />
        </button>

        {/* 2. App Dock (fixed bottom-center) */}
        {totalShelfItemsCount > 0 && (
          <div data-shelf-dock className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full bg-zinc-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80 max-w-[80vw] md:max-w-none overflow-x-auto no-scrollbar">
            {renderAppIcons()}
          </div>
        )}

        {/* 3. Status Tray (fixed bottom-right) */}
        <button
          data-status-tray
          onClick={(e) => {
            e.stopPropagation();
            toggleQuickSettings();
          }}
          title="Buka Panel Quick Settings"
          aria-label="Open Quick Settings Panel"
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-3 py-1.5 min-h-11 rounded-full text-xs font-medium select-none cursor-pointer transition-all duration-200 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden ${quickSettingsOpen
            ? "bg-blue-600 text-white shadow-blue-500/30 scale-102"
            : "bg-zinc-950/90 text-zinc-200 hover:bg-zinc-900 hover:text-white"
            }`}
        >
          <div className="flex items-center gap-2 text-inherit opacity-80">
            <Wifi size={13} />
            <Battery size={14} />
          </div>
          <div className="flex flex-col items-end leading-tight">
            <span className="font-semibold">{time || "10:30 AM"}</span>
            <span className="text-[10px] opacity-75">{dateStr}</span>
          </div>
        </button>
      </div>

      {/* ── MOBILE VIEW (< md): 1 Single Unified Deck Bar (ChromeOS Mobile Style) ── */}
      <div
        data-shelf-dock
        className="flex md:hidden fixed bottom-2 left-2 right-2 z-50 items-center justify-between px-2 py-1.5 rounded-full bg-zinc-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/90 text-zinc-100 select-none max-w-[calc(100vw-16px)]"
      >
        {/* Mobile Launcher Button */}
        <button
          data-launcher-button
          onClick={(e) => {
            e.stopPropagation();
            toggleLauncher();
          }}
          title="Launcher"
          aria-label="Toggle App Launcher"
          className={`p-2 min-w-9 min-h-9 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 ${theme === "light"
            ? launcherOpen
              ? "bg-zinc-950 text-white"
              : "bg-white/90 text-zinc-800"
            : launcherOpen
              ? "bg-white text-zinc-950"
              : "bg-white/10 text-zinc-200"
            }`}
        >
          <LayoutGrid size={17} />
        </button>

        {totalShelfItemsCount > 0 && <div className="h-5 w-px bg-white/15 mx-1 shrink-0" />}

        {/* Scrollable App Icons in Center */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 justify-center px-1">
          {renderAppIcons()}
        </div>

        <div className="h-5 w-px bg-white/15 mx-1 shrink-0" />

        {/* Mobile Status Button */}
        <button
          data-status-tray
          onClick={(e) => {
            e.stopPropagation();
            toggleQuickSettings();
          }}
          title="Quick Settings"
          aria-label="Open Quick Settings"
          className={`px-2.5 py-1 min-h-9 rounded-full text-xs font-semibold shrink-0 transition-colors ${quickSettingsOpen ? "bg-blue-600 text-white" : "text-zinc-200 hover:bg-white/10"
            }`}
        >
          <span>{time || "10:30 AM"}</span>
        </button>
      </div>

      {/* Shelf App Context Menu */}
      {shelfContextMenu && (
        <div
          ref={shelfMenuRef}
          style={{
            position: "fixed",
            left: `${Math.min(shelfContextMenu.x, typeof window !== "undefined" ? window.innerWidth - 200 : 300)}px`,
            bottom: "64px",
          }}
          onClick={(e) => e.stopPropagation()}
          className="z-50 w-48 rounded-2xl bg-zinc-900/95 border border-white/15 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          data-context-menu
        >
          {(() => {
            const { app } = shelfContextMenu;
            const isPinned = pinnedApps.includes(app.id);
            const isOpen = Boolean(windows.find((w) => w.id === app.id));

            return (
              <div className="flex flex-col gap-0.5 text-xs text-zinc-200">
                <button
                  onClick={() => {
                    closeLauncher();
                    openWindow(app);
                    setShelfContextMenu(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
                >
                  <ExternalLink size={14} /> {isOpen ? "Bawa ke Depan" : "Buka App"}
                </button>

                <button
                  onClick={() => {
                    togglePinApp(app.id);
                    setShelfContextMenu(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
                >
                  {isPinned ? (
                    <>
                      <PinOff size={14} className="text-rose-400" /> Unpin dari Shelf
                    </>
                  ) : (
                    <>
                      <Pin size={14} className="text-blue-400" /> Pin ke Shelf
                    </>
                  )}
                </button>

                {isOpen && (
                  <button
                    onClick={() => {
                      closeWindow(app.id);
                      setShelfContextMenu(null);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer w-full text-left font-medium"
                  >
                    <X size={14} /> Tutup Window
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
};
