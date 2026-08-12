"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Trash2, ExternalLink } from "lucide-react";
import { useWindowStore, DesktopShortcutItem } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";
import { AppIcon } from "./AppIcon";
import { useContextMenuClose, closeAllContextMenus } from "@/hooks/useContextMenuClose";

interface DesktopShortcutProps {
  shortcut: DesktopShortcutItem;
  isSelected?: boolean;
}

export const DesktopShortcut: React.FC<DesktopShortcutProps> = ({ shortcut, isSelected }) => {
  const { openWindow, removeDesktopShortcut, updateDesktopShortcutPos, desktopShortcuts, soundEnabled } = useWindowStore();
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewPos, setDragPreviewPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useContextMenuClose(Boolean(menu), () => setMenu(null), menuRef);

  const app = APPS.find((a) => a.id === shortcut.appId);
  if (!app) return null;

  const handleDoubleClick = () => {
    openWindow(app);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // On mobile view (<768px), single tap opens the app directly
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      openWindow(app);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  const GRID_W = 96;
  const GRID_H = 110;
  const START_X = 28;
  const START_Y = 28;

  const getGridPosition = (rawX: number, rawY: number) => {
    const col = Math.max(0, Math.round((rawX - START_X) / GRID_W));
    const row = Math.max(0, Math.round((rawY - START_Y) / GRID_H));

    const screenW = typeof window !== "undefined" ? window.innerWidth : 1280;
    const screenH = typeof window !== "undefined" ? window.innerHeight : 800;

    const maxCol = Math.max(0, Math.floor((screenW - 120) / GRID_W));
    const maxRow = Math.max(0, Math.floor((screenH - 160) / GRID_H));

    const targetCol = Math.min(col, maxCol);
    const targetRow = Math.min(row, maxRow);

    return {
      x: START_X + targetCol * GRID_W,
      y: START_Y + targetRow * GRID_H,
      col: targetCol,
      row: targetRow,
      maxCol,
      maxRow,
    };
  };

  return (
    <>
      {/* Visual Grid Drop Target Highlight Box */}
      {isDragging && dragPreviewPos && (
        <div
          style={{
            position: "absolute",
            left: `${dragPreviewPos.x}px`,
            top: `${dragPreviewPos.y}px`,
          }}
          className="w-22 h-24 rounded-2xl border-2 border-dashed border-blue-400/80 bg-blue-500/20 shadow-lg shadow-blue-500/10 backdrop-blur-xs z-5 pointer-events-none transition-all duration-100 flex items-center justify-center"
        >
          <div className="w-10 h-10 rounded-xl border border-blue-400/50 bg-blue-400/10" />
        </div>
      )}

      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.05}
        animate={{ x: shortcut.x, y: shortcut.y }}
        transition={{ type: "spring", stiffness: 450, damping: 28 }}
        whileDrag={{ scale: 1.08, zIndex: 15, cursor: "grabbing" }}
        onDragStart={() => {
          setIsDragging(true);
          setDragPreviewPos({ x: shortcut.x, y: shortcut.y });
        }}
        onDrag={(_, info) => {
          const rawX = shortcut.x + info.offset.x;
          const rawY = shortcut.y + info.offset.y;
          const target = getGridPosition(rawX, rawY);
          setDragPreviewPos({ x: target.x, y: target.y });
        }}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          setDragPreviewPos(null);

          const rawX = shortcut.x + info.offset.x;
          const rawY = shortcut.y + info.offset.y;
          const target = getGridPosition(rawX, rawY);

          const otherShortcuts = desktopShortcuts.filter((s) => s.id !== shortcut.id);
          const isSlotOccupied = (x: number, y: number) => {
            return otherShortcuts.some((s) => Math.abs(s.x - x) < 30 && Math.abs(s.y - y) < 30);
          };

          let finalX = target.x;
          let finalY = target.y;

          // If target grid slot is occupied by another icon, find nearest empty grid slot
          if (isSlotOccupied(finalX, finalY)) {
            let found = false;
            for (let dist = 1; dist <= 12 && !found; dist++) {
              for (let dRow = -dist; dRow <= dist && !found; dRow++) {
                for (let dCol = -dist; dCol <= dist && !found; dCol++) {
                  const c = Math.max(0, Math.min(target.col + dCol, target.maxCol));
                  const r = Math.max(0, Math.min(target.row + dRow, target.maxRow));
                  const testX = START_X + c * GRID_W;
                  const testY = START_Y + r * GRID_H;
                  if (!isSlotOccupied(testX, testY)) {
                    finalX = testX;
                    finalY = testY;
                    found = true;
                  }
                }
              }
            }
          }

          if (soundEnabled) {
            import("@/utils/audio").then(({ playUiClickSound }) => playUiClickSound());
          }

          updateDesktopShortcutPos(shortcut.id, { x: finalX, y: finalY });
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
          {app.title}
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
              onClick={() => {
                openWindow(app);
                setMenu(null);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
            >
              <ExternalLink size={14} /> Buka {app.title}
            </button>

            <button
              onClick={() => {
                removeDesktopShortcut(shortcut.id);
                setMenu(null);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer w-full text-left font-medium"
            >
              <Trash2 size={14} /> Hapus Shortcut
            </button>
          </div>
        </div>
      )}
    </>
  );
};
