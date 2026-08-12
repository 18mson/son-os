"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { WidgetGalleryModal } from "./WidgetGalleryModal";
import { ScreenBrightnessOverlay } from "./ScreenBrightnessOverlay";
import { Trash2, Plus } from "lucide-react";
import { DesktopShortcut } from "./DesktopShortcut";
import { DesktopWidgetsLayer } from "./desktop/DesktopWidgetsLayer";
import { useContextMenuClose, closeAllContextMenus } from "@/hooks/useContextMenuClose";
import { useDesktopGlobalHandlers } from "@/hooks/useDesktopGlobalHandlers";
import { WALLPAPER_CONFIGS, LIGHT_WALLPAPER_CONFIGS } from "@/config/wallpaperConfig";

export const Desktop: React.FC = () => {
  const {
    windows,
    wallpaper,
    theme,
    desktopShortcuts,
    toggleWidgetGallery,
    desktopWidgets,
    removeWidget,
    reorderWidgets,
    reducedMotion,
    textScale,
    highContrast,
  } = useWindowStore();

  const { mounted, isTransitioning, transitionText } = useDesktopGlobalHandlers();

  const [widgetMenu, setWidgetMenu] = useState<{ id: string; type: string; x: number; y: number } | null>(null);
  const widgetMenuRef = useRef<HTMLDivElement>(null);
  useContextMenuClose(Boolean(widgetMenu), () => setWidgetMenu(null), widgetMenuRef);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }

    if (reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }

    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    root.setAttribute("data-text-scale", textScale);
  }, [theme, reducedMotion, highContrast, textScale]);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [selectedShortcutIds, setSelectedShortcutIds] = useState<string[]>([]);

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
      className={`relative w-screen h-screen overflow-hidden select-none transition-all duration-700 ${
        isCustomUrl ? "bg-zinc-950" : activeConfig.bgClass
      }`}
    >
      {/* Boot Screen Startup Overlay */}
      <BootScreen />

      {/* Screen Transition Loading Overlay */}
      <ScreenTransitionOverlay isVisible={isTransitioning} modeText={transitionText} />

      {/* Custom Image Wallpaper */}
      {isCustomUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${wallpaper})` }}
        />
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

      {/* Dynamic Desktop Widgets */}
      <DesktopWidgetsLayer
        desktopWidgets={desktopWidgets}
        reorderWidgets={reorderWidgets}
        setWidgetMenu={setWidgetMenu}
      />

      {/* Desktop Shortcuts Layer */}
      <div className="absolute inset-0 z-3 pointer-events-none overflow-hidden">
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

      {/* Right Click Widget Context Menu */}
      {widgetMenu && (
        <div
          ref={widgetMenuRef}
          style={{ position: "fixed", left: widgetMenu.x, top: widgetMenu.y }}
          onClick={(e) => e.stopPropagation()}
          className="z-50 w-52 rounded-2xl bg-zinc-900/95 border border-white/15 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 select-none"
          data-context-menu
        >
          <div className="flex flex-col gap-0.5 text-xs text-zinc-200 font-medium">
            <button
              onClick={() => {
                toggleWidgetGallery(true);
                setWidgetMenu(null);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer w-full text-left"
            >
              <Plus size={14} /> Kelola Galeri Widget
            </button>
            <button
              onClick={() => {
                removeWidget(widgetMenu.id);
                setWidgetMenu(null);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer w-full text-left"
            >
              <Trash2 size={14} /> Hapus Widget Ini
            </button>
          </div>
        </div>
      )}

      {/* Floating Shelf */}
      <Shelf />

      {/* System Tray Overlays */}
      <div className="fixed bottom-18 right-3 sm:right-4 z-50 flex flex-col-reverse items-end gap-3 pointer-events-none">
        <QuickSettingsPanel />
        <SystemNotificationToast />
      </div>

      {/* Fullscreen Overlay Launcher */}
      <Launcher />

      {/* Widget Gallery Modal */}
      <WidgetGalleryModal />

      {/* Screen Hardware Brightness Overlay */}
      <ScreenBrightnessOverlay />

      {/* Global Background Audio Manager */}
      <GlobalAudioManager />
    </div>
  );
};
