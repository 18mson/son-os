"use client";

import React, { useState, useEffect, useRef } from "react";
import { useWindowStore, AppDefinition } from "@/store/windowStore";
import { useAppStoreStore } from "@/store/appStoreStore";
import { APPS } from "@/config/appsConfig";
import { AppIcon } from "./AppIcon";
import { useContextMenuClose, closeAllContextMenus } from "@/hooks/useContextMenuClose";
import { ShelfContextMenu } from "./shelf/ShelfContextMenu";
import { ShelfMobileDeck } from "./shelf/ShelfMobileDeck";
import { ShelfDesktopStatusTray } from "./shelf/ShelfDesktopStatusTray";
import { ShelfDesktopLauncherButton } from "./shelf/ShelfDesktopLauncherButton";

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

  const { isInstalled } = useAppStoreStore();

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

  const pinnedAppDefs = pinnedApps
    .map((id) => APPS.find((a) => a.id === id))
    .filter((a): a is AppDefinition => a !== undefined && Boolean(a.isPreinstalled || a.isSystemApp || isInstalled(a.id)));

  const unpinnedOpenWindows = windows.filter((w) => !pinnedApps.includes(w.id));
  const unpinnedOpenDefs = unpinnedOpenWindows
    .map((w) => APPS.find((a) => a.id === w.id))
    .filter((a): a is AppDefinition => Boolean(a));

  const totalShelfItemsCount = pinnedAppDefs.length + unpinnedOpenDefs.length;

  const renderAppIcons = () => (
    <>
      {pinnedAppDefs.map((app) => {
        const win = windows.find((w) => w.id === app.id);
        const isOpen = Boolean(win);
        const isActive = activeWindowId === app.id && win && !win.isMinimized;

        return (
          <div
            key={app.id}
            draggable
            onDragStart={(e) => handleDragStart(e, app.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, app.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeAllContextMenus();
              setShelfContextMenu({ app, x: e.clientX, y: e.clientY });
            }}
            className="relative flex flex-col items-center justify-center shrink-0 cursor-grab active:cursor-grabbing px-1 h-11"
          >
            <button
              onClick={() => {
                if (isOpen) {
                  toggleMinimizeWindow(app.id);
                } else {
                  openWindow(app);
                }
              }}
              title={app.title}
              className={`p-2 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center ${app.accentColor} text-white shadow-md hover:scale-110 active:scale-95 ${isActive ? "ring-2 ring-blue-400" : ""
                }`}
            >
              <AppIcon name={app.icon} size={20} />
            </button>
            <div className="h-2 flex items-center justify-center mt-0.5">
              {isOpen && (
                <span className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${isActive ? "bg-blue-400" : "bg-white/60"
                  }`} />
              )}
            </div>
          </div>
        );
      })}

      {unpinnedOpenDefs.length > 0 && pinnedAppDefs.length > 0 && (
        <div className="h-6 w-px bg-white/15 mx-1 shrink-0" />
      )}

      {unpinnedOpenDefs.map((app) => {
        const win = windows.find((w) => w.id === app.id);
        const isOpen = Boolean(win);
        const isActive = activeWindowId === app.id && win && !win.isMinimized;

        return (
          <div
            key={`unpinned-${app.id}`}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeAllContextMenus();
              setShelfContextMenu({ app, x: e.clientX, y: e.clientY });
            }}
            className="relative flex flex-col items-center justify-center shrink-0 px-1 h-11"
          >
            <button
              onClick={() => toggleMinimizeWindow(app.id)}
              title={app.title}
              className={`p-2 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-center ${app.accentColor} text-white shadow-md hover:scale-110 active:scale-95 ${isActive ? "ring-2 ring-blue-400" : ""
                }`}
            >
              <AppIcon name={app.icon} size={20} />
            </button>
            <div className="h-2 flex items-center justify-center mt-0.5">
              {isOpen && (
                <span className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${isActive ? "bg-blue-400" : "bg-white/60"
                  }`} />
              )}
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <>
      {/* DESKTOP VIEW (md and up) */}
      <div className="hidden md:block">
        <ShelfDesktopLauncherButton
          theme={theme}
          launcherOpen={launcherOpen}
          toggleLauncher={toggleLauncher}
        />

        {totalShelfItemsCount > 0 && (
          <div data-shelf-dock className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-50 h-14 flex items-center gap-1.5 px-3 pt-1.5 rounded-full backdrop-blur-2xl border max-w-[80vw] md:max-w-none overflow-x-auto no-scrollbar transition-all duration-300 ${theme === "light"
            ? "bg-white/80 border-slate-300/80 shadow-xl shadow-slate-400/20 text-slate-800"
            : "bg-zinc-950/90 border-white/15 shadow-2xl shadow-black/80 text-zinc-100"
            }`}>
            {renderAppIcons()}
          </div>
        )}

        <ShelfDesktopStatusTray
          theme={theme}
          quickSettingsOpen={quickSettingsOpen}
          toggleQuickSettings={toggleQuickSettings}
          time={time}
          dateStr={dateStr}
        />
      </div>

      {/* MOBILE VIEW (< md) */}
      <ShelfMobileDeck
        theme={theme}
        launcherOpen={launcherOpen}
        quickSettingsOpen={quickSettingsOpen}
        toggleLauncher={toggleLauncher}
        toggleQuickSettings={toggleQuickSettings}
        renderAppIcons={renderAppIcons}
        totalShelfItemsCount={totalShelfItemsCount}
        time={time}
      />

      {/* Shelf App Context Menu */}
      <ShelfContextMenu
        menuRef={shelfMenuRef}
        contextMenu={shelfContextMenu}
        pinnedApps={pinnedApps}
        isOpen={Boolean(shelfContextMenu && windows.find((w) => w.id === shelfContextMenu.app.id))}
        onOpenWindow={(app) => {
          closeLauncher();
          openWindow(app);
        }}
        onTogglePin={(appId) => togglePinApp(appId)}
        onCloseWindow={(appId) => closeWindow(appId)}
        onCloseMenu={() => setShelfContextMenu(null)}
      />
    </>
  );
};
