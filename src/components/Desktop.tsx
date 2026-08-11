"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";
import { WindowComponent } from "./Window";
import { AppContent } from "./AppContent";
import { Shelf } from "./Shelf";
import { Launcher } from "./Launcher";
import { ContextMenu } from "./ContextMenu";
import { BootScreen } from "./BootScreen";

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

export const Desktop: React.FC = () => {
  const { windows, wallpaper, launcherOpen, closeLauncher, activeWindowId, closeWindow, toggleLauncher } = useWindowStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Keyboard Shortcuts: Esc to close window/launcher, Alt+Space or Meta to toggle launcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (launcherOpen) {
          closeLauncher();
        } else if (activeWindowId) {
          closeWindow(activeWindowId);
        }
      } else if ((e.altKey && e.code === "Space") || (e.ctrlKey && e.code === "Space")) {
        e.preventDefault();
        toggleLauncher();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [launcherOpen, activeWindowId, closeLauncher, closeWindow, toggleLauncher]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const activeConfig = WALLPAPER_CONFIGS[wallpaper] || WALLPAPER_CONFIGS.default;

  return (
    <div
      onContextMenu={handleContextMenu}
      className={`relative w-screen h-screen overflow-hidden select-none transition-all duration-700 ${activeConfig.bgClass}`}
    >
      {/* Boot Screen Startup Overlay */}
      <BootScreen />

      {/* Dynamic Ambient Glowing Orbs */}
      <div className={`absolute -top-32 -left-32 w-120 h-120 rounded-full blur-[100px] transition-all duration-700 pointer-events-none ${activeConfig.glowTopLeft}`} />
      <div className={`absolute -bottom-32 -right-32 w-120 h-120 rounded-full blur-[100px] transition-all duration-700 pointer-events-none ${activeConfig.glowBottomRight}`} />

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

      {/* Fullscreen Overlay Launcher */}
      <Launcher />
    </div>
  );
};
