"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Trash2, ExternalLink } from "lucide-react";
import { useWindowStore, DesktopShortcutItem } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";
import { AppIcon } from "./AppIcon";
import { useContextMenuClose, closeAllContextMenus } from "@/hooks/useContextMenuClose";
import { useTranslation, getAppTranslation } from "@/i18n";
import { gridToPixel, pixelToGrid } from "@/config/desktopGridConfig";

interface DesktopShortcutProps {
  shortcut: DesktopShortcutItem;
  isSelected?: boolean;
}

export const DesktopShortcut: React.FC<DesktopShortcutProps> = ({ shortcut, isSelected }) => {
  const { openWindow, removeDesktopShortcut, updateDesktopShortcutPos, desktopShortcuts, soundEnabled } = useWindowStore();
  const { language } = useTranslation();
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewPos, setDragPreviewPos] = useState<{ x: number; y: number; isOccupied: boolean } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useContextMenuClose(Boolean(menu), () => setMenu(null), menuRef);

  const app = APPS.find((a) => a.id === shortcut.appId);
  if (!app) return null;

  const appMeta = getAppTranslation(app.id, language);
  const translatedTitle = appMeta?.title || app.title;

  const handleDoubleClick = () => {
    openWindow({ ...app, title: translatedTitle });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // On mobile view (<768px), single tap opens the app directly
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      openWindow({ ...app, title: translatedTitle });
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  const isSlotOccupied = (targetCol: number, targetRow: number) => {
    return desktopShortcuts.some(
      (s) => s.id !== shortcut.id && s.col === targetCol && s.row === targetRow
    );
  };

  // Compute final pixel coordinates based on (col, row)
  const currentPixelPos = gridToPixel(shortcut.col, shortcut.row);

  return (
    <>
      {/* Ghost Snap Preview indicator while dragging */}
      {isDragging && dragPreviewPos && (
        <div
          style={{
            position: "absolute",
            left: dragPreviewPos.x,
            top: dragPreviewPos.y,
          }}
          className={`w-22 h-24 rounded-2xl border-2 border-dashed pointer-events-none z-5 transition-all duration-75 ${
            dragPreviewPos.isOccupied
              ? "border-rose-400/70 bg-rose-500/15"
              : "border-blue-400/70 bg-blue-500/15 shadow-md shadow-blue-500/10"
          }`}
        />
      )}

      {/* Main Drag-enabled Shortcut Item with Spring Grid Snapping */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.08}
        animate={{ x: currentPixelPos.x, y: currentPixelPos.y }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
        onDragStart={() => setIsDragging(true)}
        onDrag={(_event, info) => {
          const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
          const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
          const currentX = currentPixelPos.x + info.offset.x;
          const currentY = currentPixelPos.y + info.offset.y;

          const preview = pixelToGrid(currentX, currentY, screenW, screenH);
          const previewPixel = gridToPixel(preview.col, preview.row);
          const occupied = isSlotOccupied(preview.col, preview.row);

          setDragPreviewPos({
            x: previewPixel.x,
            y: previewPixel.y,
            isOccupied: occupied,
          });
        }}
        onDragEnd={(_event, info) => {
          setIsDragging(false);
          setDragPreviewPos(null);

          const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
          const screenH = typeof window !== "undefined" ? window.innerHeight : 800;
          const finalRawX = currentPixelPos.x + info.offset.x;
          const finalRawY = currentPixelPos.y + info.offset.y;

          const target = pixelToGrid(finalRawX, finalRawY, screenW, screenH);

          // Option A: Collision handling (reject drop if occupied, spring back to original)
          if (isSlotOccupied(target.col, target.row)) {
            // Target is occupied -> Do nothing, Framer Motion will spring back to current (shortcut.col, shortcut.row)
            return;
          }

          if (target.col !== shortcut.col || target.row !== shortcut.row) {
            if (soundEnabled) {
              import("@/utils/audio").then(({ playUiClickSound }) => playUiClickSound());
            }
            updateDesktopShortcutPos(shortcut.id, { col: target.col, row: target.row });
          }
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        style={{ position: "absolute", left: 0, top: 0 }}
        className={`group z-10 pointer-events-auto flex flex-col items-center gap-1.5 p-2 rounded-2xl cursor-grab active:cursor-grabbing w-22 select-none ${
          isSelected
            ? "bg-blue-500/30 border border-blue-400 ring-2 ring-blue-400/40 shadow-lg shadow-blue-500/20"
            : "hover:bg-white/10 border border-transparent hover:border-white/15"
        }`}
      >
        <div className={`w-13 h-13 rounded-2xl ${app.accentColor} flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform`}>
          <AppIcon name={app.icon} size={24} />
        </div>
        <span className="text-[11px] font-semibold text-white text-center line-clamp-2 drop-shadow-md leading-tight px-1">
          {translatedTitle}
        </span>
      </motion.div>

      {/* Context Menu for Desktop Shortcut */}
      {menu && (
        <div
          ref={menuRef}
          style={{ position: "fixed", left: menu.x, top: menu.y }}
          onClick={(e) => e.stopPropagation()}
          className="z-70 w-44 rounded-2xl bg-zinc-900/95 border border-white/15 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 select-none"
          data-context-menu
        >
          <div className="flex flex-col gap-0.5 text-xs text-zinc-200">
            <button
              type="button"
              onClick={() => {
                openWindow({ ...app, title: translatedTitle });
                setMenu(null);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
            >
              <ExternalLink size={14} /> {language === "en" ? `Open ${translatedTitle}` : `Buka ${translatedTitle}`}
            </button>

            <button
              type="button"
              onClick={() => {
                removeDesktopShortcut(shortcut.id);
                setMenu(null);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer w-full text-left font-medium"
            >
              <Trash2 size={14} /> {language === "en" ? "Remove Shortcut" : "Hapus Shortcut"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
