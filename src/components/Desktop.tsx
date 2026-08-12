"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { WindowComponent } from "./Window";
import { AppContent } from "./AppContent";
import { Shelf } from "./Shelf";
import { Launcher } from "./Launcher";
import { ContextMenu } from "./ContextMenu";
import { BootScreen } from "./BootScreen";
import { ScreenTransitionOverlay } from "./ScreenTransitionOverlay";
import { QuickSettingsPanel } from "./QuickSettingsPanel";
import { SystemNotificationToast } from "./SystemNotificationToast";
import { GlobalAudioManager } from "./GlobalAudioManager";
import { ClockWidget } from "./widgets/ClockWidget";
import { WeatherWidget } from "./widgets/WeatherWidget";
import { CalendarWidget } from "./widgets/CalendarWidget";
import { QuickNotesWidget } from "./widgets/QuickNotesWidget";
import { SystemMonitorWidget } from "./widgets/SystemMonitorWidget";
import { MiniCalcWidget } from "./widgets/MiniCalcWidget";
import { WidgetGalleryModal } from "./WidgetGalleryModal";
import { ScreenBrightnessOverlay } from "./ScreenBrightnessOverlay";
import { Minus } from "lucide-react";
import { DesktopShortcut } from "./DesktopShortcut";
import { closeAllContextMenus } from "@/hooks/useContextMenuClose";
import { APPS } from "@/config/appsConfig";

interface WallpaperConfig {
  bgClass: string;
  glowTopLeft: string;
  glowBottomRight: string;
}

const WALLPAPER_CONFIGS: Record<string, WallpaperConfig> = {
  default: {
    bgClass: "bg-linear-to-br from-slate-950 via-zinc-900 to-indigo-950",
    glowTopLeft: "bg-indigo-600/35",
    glowBottomRight: "bg-purple-600/35",
  },
  ocean: {
    bgClass: "bg-linear-to-br from-slate-950 via-cyan-950 to-blue-950",
    glowTopLeft: "bg-cyan-500/40",
    glowBottomRight: "bg-blue-600/40",
  },
  sunset: {
    bgClass: "bg-linear-to-br from-zinc-950 via-rose-950 to-amber-950",
    glowTopLeft: "bg-rose-500/40",
    glowBottomRight: "bg-amber-500/40",
  },
  emerald: {
    bgClass: "bg-linear-to-br from-zinc-950 via-teal-950 to-emerald-950",
    glowTopLeft: "bg-emerald-500/40",
    glowBottomRight: "bg-teal-500/40",
  },
};

const LIGHT_WALLPAPER_CONFIGS: Record<string, WallpaperConfig> = {
  default: {
    bgClass: "bg-linear-to-br from-indigo-100 via-sky-50 to-slate-200",
    glowTopLeft: "bg-indigo-400/30",
    glowBottomRight: "bg-purple-400/30",
  },
  ocean: {
    bgClass: "bg-linear-to-br from-cyan-100 via-sky-100 to-blue-200",
    glowTopLeft: "bg-cyan-400/30",
    glowBottomRight: "bg-blue-400/30",
  },
  sunset: {
    bgClass: "bg-linear-to-br from-amber-100 via-rose-100 to-orange-200",
    glowTopLeft: "bg-rose-400/30",
    glowBottomRight: "bg-amber-400/30",
  },
  emerald: {
    bgClass: "bg-linear-to-br from-emerald-100 via-teal-100 to-green-200",
    glowTopLeft: "bg-emerald-400/30",
    glowBottomRight: "bg-teal-400/30",
  },
};

export const Desktop: React.FC = () => {
  const {
    windows,
    wallpaper,
    theme,
    launcherOpen,
    closeLauncher,
    activeWindowId,
    closeWindow,
    focusWindow,
    toggleLauncher,
    toggleQuickSettings,
    desktopShortcuts,
    desktopWidgets,
    removeWidget,
  } = useWindowStore();

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [theme]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [selectedShortcutIds, setSelectedShortcutIds] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState("Beralih ke Desktop Mode...");
  // useSyncExternalStore: returns false on server, true on client (avoids hydration mismatch)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const wasMobileRef = useRef<boolean>(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      const isMobileNow = window.innerWidth < 768;
      // Detect transition in EITHER direction (Mobile <-> Desktop)
      if (wasMobileRef.current !== isMobileNow) {
        closeLauncher();
        toggleQuickSettings(false);
        setTransitionText(isMobileNow ? "Beralih ke Mobile Mode..." : "Beralih ke Desktop Mode...");
        setIsTransitioning(true);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1300);
      }
      wasMobileRef.current = isMobileNow;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [closeLauncher, toggleQuickSettings]);

  // Global Keyboard Shortcuts:
  // - Alt+Tab / Ctrl+Tab: Cycle focus between open non-minimized windows
  // - Ctrl+W / Cmd+W: Close active window
  // - Ctrl+Space / Alt+Space: Toggle app launcher
  // - Esc: Close launcher or close active window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === "input" || targetTag === "textarea" || (e.target as HTMLElement)?.isContentEditable;

      if (e.key === "Escape") {
        if (launcherOpen) {
          closeLauncher();
        } else if (activeWindowId) {
          closeWindow(activeWindowId);
        }
      } else if ((e.altKey && e.code === "Space") || (e.ctrlKey && e.code === "Space")) {
        e.preventDefault();
        toggleLauncher();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w" && !isInput) {
        if (activeWindowId) {
          e.preventDefault();
          closeWindow(activeWindowId);
        }
      } else if ((e.altKey || e.ctrlKey) && e.key === "Tab") {
        const activeWindows = windows.filter((w) => !w.isMinimized);
        if (activeWindows.length > 1) {
          e.preventDefault();
          const currentIndex = activeWindows.findIndex((w) => w.id === activeWindowId);
          const nextIndex = (currentIndex + 1) % activeWindows.length;
          focusWindow(activeWindows[nextIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [launcherOpen, activeWindowId, windows, closeLauncher, closeWindow, focusWindow, toggleLauncher]);

  // Dynamic Browser Tab Title based on active window
  useEffect(() => {
    if (activeWindowId) {
      const activeWin = windows.find((w) => w.id === activeWindowId && !w.isMinimized);
      const app = APPS.find((a) => a.id === activeWindowId);
      if (activeWin && app) {
        document.title = `${app.title} — Son-OS`;
        return;
      }
    }
    document.title = "Son-OS — ChromeOS-inspired Web Desktop";
  }, [activeWindowId, windows]);

  // Sync theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    closeAllContextMenus();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".no-desktop-select") || target.closest("button") || target.closest(".cursor-grab")) {
      return;
    }

    if (e.button === 0) {
      setSelectionBox({
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
      });
      setSelectedShortcutIds([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectionBox) return;

    const updatedBox = {
      ...selectionBox,
      currentX: e.clientX,
      currentY: e.clientY,
    };
    setSelectionBox(updatedBox);

    const minX = Math.min(updatedBox.startX, updatedBox.currentX);
    const maxX = Math.max(updatedBox.startX, updatedBox.currentX);
    const minY = Math.min(updatedBox.startY, updatedBox.currentY);
    const maxY = Math.max(updatedBox.startY, updatedBox.currentY);

    const selected = desktopShortcuts
      .filter((s) => {
        const sMinX = s.x;
        const sMaxX = s.x + 88;
        const sMinY = s.y;
        const sMaxY = s.y + 96;
        return sMinX < maxX && sMaxX > minX && sMinY < maxY && sMaxY > minY;
      })
      .map((s) => s.id);

    setSelectedShortcutIds(selected);
  };

  const handleMouseUp = () => {
    if (selectionBox) {
      setSelectionBox(null);
    }
  };

  const isCustomUrl = wallpaper.startsWith("http://") || wallpaper.startsWith("https://") || wallpaper.startsWith("/");
  // Use mounted guard: before hydration, always fall back to dark/default to match server render
  const isLight = mounted && theme === "light";
  const activeConfig = isLight
    ? LIGHT_WALLPAPER_CONFIGS[wallpaper] || LIGHT_WALLPAPER_CONFIGS.default
    : WALLPAPER_CONFIGS[wallpaper] || WALLPAPER_CONFIGS.default;

  return (
    <div
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-screen h-screen overflow-hidden select-none transition-all duration-700 ${isCustomUrl ? "bg-zinc-950" : activeConfig.bgClass
        }`}
    >
      {/* Boot Screen Startup Overlay */}
      <BootScreen />

      {/* Screen Transition Loading Overlay (Mobile <-> Desktop Switch) */}
      <ScreenTransitionOverlay isVisible={isTransitioning} modeText={transitionText} />

      {/* Custom Image Wallpaper Layer */}
      {isCustomUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 image-rendering-crisp"
            style={{
              backgroundImage: `url("${wallpaper.replace(/w=\d+/, "w=2560").replace(/q=\d+/, "q=95")}")`,
            }}
          />
          {/* Subtle Ambient Shadow Overlay for System Contrast */}
          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
        </>
      )}

      {/* Dynamic Ambient Glowing Orbs */}
      {!isCustomUrl && (
        <>
          <div className={`absolute -top-32 -left-32 w-120 h-120 rounded-full blur-[100px] transition-all duration-700 pointer-events-none ${activeConfig.glowTopLeft}`} />
          <div className={`absolute -bottom-32 -right-32 w-120 h-120 rounded-full blur-[100px] transition-all duration-700 pointer-events-none ${activeConfig.glowBottomRight}`} />
        </>
      )}

      {/* Selection Rectangle Box */}
      {selectionBox && (
        <div
          className="fixed border border-blue-400/80 bg-blue-500/20 rounded-lg pointer-events-none z-20 shadow-lg shadow-blue-500/10"
          style={{
            left: `${Math.min(selectionBox.startX, selectionBox.currentX)}px`,
            top: `${Math.min(selectionBox.startY, selectionBox.currentY)}px`,
            width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
            height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`,
          }}
        />
      )}

      {/* Dynamic Desktop Widgets (macOS Sonoma / Sequoia Style) */}
      <div className="absolute top-6 right-6 hidden md:flex flex-col gap-4 z-1 pointer-events-auto no-desktop-select max-h-[calc(100vh-100px)] overflow-y-auto pr-1 no-scrollbar">
        {desktopWidgets.map((w) => (
          <div key={w.id} className="relative group">
            {/* macOS Sonoma style Minus (-) Remove Button on hover */}
            <button
              onClick={() => removeWidget(w.id)}
              title="Hapus Widget dari Desktop"
              className="absolute -top-2 -left-2 z-20 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
            >
              <Minus size={13} strokeWidth={3} />
            </button>

            {w.type === "clock" && <ClockWidget />}
            {w.type === "weather" && <WeatherWidget />}
            {w.type === "calendar" && <CalendarWidget />}
            {w.type === "notes" && <QuickNotesWidget />}
            {w.type === "system" && <SystemMonitorWidget />}
            {w.type === "calculator" && <MiniCalcWidget />}
          </div>
        ))}
      </div>

      {/* Desktop Shortcuts Layer */}
      <div className="absolute inset-0 z-1 pointer-events-auto overflow-hidden">
        {desktopShortcuts.map((shortcut) => (
          <DesktopShortcut
            key={shortcut.id}
            shortcut={shortcut}
            isSelected={selectedShortcutIds.includes(shortcut.id)}
          />
        ))}
      </div>

      {/* Active Windows Layer */}
      <AnimatePresence>
        {windows.map((win) => (
          <WindowComponent key={win.id} window={win}>
            <AppContent appId={win.id} />
          </WindowComponent>
        ))}
      </AnimatePresence>

      {/* Right Click Desktop Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Floating Shelf */}
      <Shelf />

      {/* System Tray Overlays (Stacked dynamically: QuickSettingsPanel bottom, SystemNotificationToast above) */}
      <div className="fixed bottom-18 right-3 sm:right-4 z-50 flex flex-col-reverse items-end gap-3 pointer-events-none">
        <QuickSettingsPanel />
        <SystemNotificationToast />
      </div>

      {/* Fullscreen Overlay Launcher */}
      <Launcher />

      {/* macOS Sonoma Style Widget Gallery Modal */}
      <WidgetGalleryModal />

      {/* Screen Hardware Brightness Overlay (z-[999999], pointer-events: none) */}
      <ScreenBrightnessOverlay />

      {/* Global Background Audio Manager */}
      <GlobalAudioManager />
    </div>
  );
};
