"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Minus, Square, Copy, X } from "lucide-react";
import { WindowState, useWindowStore } from "@/store/windowStore";
import { AppIcon } from "./AppIcon";

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

type ResizeEdge =
  | "n" | "s" | "e" | "w"
  | "ne" | "nw" | "se" | "sw";

const EDGE_CURSOR: Record<ResizeEdge, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
};

const MIN_W = 320;
const MIN_H = 200;

const FULL_BLEED_APPS = [
  "camera",
  "app-store",
  "gallery",
  "music",
  "snake",
  "japanese-quiz",
  "lovely-ever",
  "file-manager",
  "settings",
  "notes",
  "pdf",
  "contact",
  "calendar",
  "paint",
  "terminal",
  "audio-converter",
];

export const WindowComponent: React.FC<WindowProps> = ({ window: windowState, children }) => {
  const { id, title, icon, accentColor, position, size, isMinimized, isMaximized, zIndex } = windowState;
  const { closeWindow, minimizeWindow, focusWindow, moveWindow, resizeWindow, toggleMaximizeWindow, activeWindowId, theme } = useWindowStore();

  const isLight = theme === 'light';

  const [isDragging, setIsDragging] = useState(false);
  const [resizingEdge, setResizingEdge] = useState<ResizeEdge | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const resizeRef = useRef<{
    startX: number; startY: number;
    startW: number; startH: number;
    startPosX: number; startPosY: number;
  } | null>(null);

  const isActive = activeWindowId === id;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Title-bar drag
  const handleMouseDownTitleBar = (e: React.MouseEvent) => {
    if (isMaximized || isMobile) return;
    focusWindow(id);
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current || isMobile) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = Math.max(-size.w + 120, Math.min(window.innerWidth - 80, dragRef.current.posX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.posY + dy));
      moveWindow(id, { x: newX, y: newY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        if (e.clientY <= 10 && !isMaximized) toggleMaximizeWindow(id);
        dragRef.current = null;
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, id, moveWindow, size, isMaximized, toggleMaximizeWindow, isMobile]);

  // Edge / corner resize
  const handleMouseDownResize = useCallback((e: React.MouseEvent, edge: ResizeEdge) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMaximized || isMobile) return;

    focusWindow(id);
    setResizingEdge(edge);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.w,
      startH: size.h,
      startPosX: position.x,
      startPosY: position.y,
    };
  }, [focusWindow, id, isMaximized, isMobile, position.x, position.y, size.h, size.w]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingEdge || !resizeRef.current || isMobile) return;

      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      const { startW, startH, startPosX, startPosY } = resizeRef.current;

      let newW = startW;
      let newH = startH;
      let newX = startPosX;
      let newY = startPosY;

      if (resizingEdge.includes("e")) newW = Math.max(MIN_W, startW + dx);
      if (resizingEdge.includes("s")) newH = Math.max(MIN_H, startH + dy);

      if (resizingEdge.includes("w")) {
        const possibleW = startW - dx;
        if (possibleW >= MIN_W) {
          newW = possibleW;
          newX = startPosX + dx;
        }
      }

      if (resizingEdge.includes("n")) {
        const possibleH = startH - dy;
        if (possibleH >= MIN_H) {
          newH = possibleH;
          newY = Math.max(0, startPosY + dy);
        }
      }

      resizeWindow(id, { w: newW, h: newH });
      if (newX !== startPosX || newY !== startPosY) {
        moveWindow(id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (resizingEdge) {
        setResizingEdge(null);
        resizeRef.current = null;
      }
    };

    if (resizingEdge) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingEdge, isMobile, resizeWindow, moveWindow, id]);

  if (isMinimized) return null;

  const effectiveMaximized = isMaximized || isMobile;
  const globalCursor = resizingEdge ? EDGE_CURSOR[resizingEdge] : "";

  return (
    <>
      <motion.div
        key={id}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0.05 }}
        onMouseDown={() => focusWindow(id)}
        style={{
          position: "fixed",
          left: effectiveMaximized ? 0 : position.x,
          top: effectiveMaximized ? 0 : position.y,
          width: effectiveMaximized ? "100vw" : size.w,
          height: isMobile ? "calc(100vh - 56px)" : isMaximized ? "calc(100vh - 72px)" : size.h,
          zIndex: zIndex,
        }}
        className={`flex flex-col rounded-t-xl md:rounded-xl overflow-hidden shadow-2xl border transition-colors duration-200 select-none ${
          isLight
            ? isActive
              ? "border-slate-300/80 shadow-slate-900/25 bg-slate-100/95 backdrop-blur-2xl ring-1 ring-black/5"
              : "border-slate-300/60 shadow-slate-900/15 bg-slate-100/85 backdrop-blur-xl opacity-95"
            : isActive
              ? "border-white/20 shadow-black/70 bg-zinc-950/90 backdrop-blur-2xl ring-1 ring-white/10"
              : "border-white/10 shadow-black/40 bg-zinc-950/75 backdrop-blur-xl opacity-95"
        } ${globalCursor}`}
        data-window-chrome
      >
        {/* Title bar */}
        <div
          data-window-titlebar
          onMouseDown={handleMouseDownTitleBar}
          onDoubleClick={() => !isMobile && toggleMaximizeWindow(id)}
          className={`h-11 px-3.5 flex items-center justify-between border-b shrink-0 ${
            isLight
              ? "bg-slate-200/80 border-slate-300/70 text-slate-800"
              : "bg-zinc-900/70 border-white/10 text-zinc-200"
          } ${isDragging ? "cursor-grabbing" : effectiveMaximized ? "cursor-default" : "cursor-grab"}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-1.5 rounded-lg text-white ${accentColor || "bg-blue-600"} shadow-sm`}>
              <AppIcon name={icon} size={15} />
            </div>
            <span className={`text-sm font-medium truncate ${isLight ? "text-slate-900" : "text-zinc-200"}`}>{title}</span>
          </div>

          {/* Window control buttons */}
          <div
            className={`flex items-center gap-1 ${isLight ? "text-slate-600" : "text-zinc-400"}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => minimizeWindow(id)}
              title="Minimize"
              aria-label="Minimize Window"
              className={`p-2 sm:p-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden transition-colors min-w-9 min-h-9 flex items-center justify-center ${
                isLight ? "hover:bg-slate-300/60 hover:text-slate-900" : "hover:bg-white/10 hover:text-white"
              }`}
            >
              <Minus size={14} />
            </button>
            {!isMobile && (
              <button
                onClick={() => toggleMaximizeWindow(id)}
                title={isMaximized ? "Restore" : "Maximize"}
                aria-label={isMaximized ? "Restore Window" : "Maximize Window"}
                className={`p-2 sm:p-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden transition-colors min-w-9 min-h-9 flex items-center justify-center ${
                  isLight ? "hover:bg-slate-300/60 hover:text-slate-900" : "hover:bg-white/10 hover:text-white"
                }`}
              >
                {isMaximized ? <Copy size={13} /> : <Square size={13} />}
              </button>
            )}
            <button
              onClick={() => closeWindow(id)}
              title="Close"
              aria-label="Close Window"
              className="p-2 sm:p-1.5 rounded-lg hover:bg-rose-500/80 hover:text-white focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-hidden transition-colors ml-0.5 min-w-9 min-h-9 flex items-center justify-center text-rose-500"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Window Body Content Area */}
        <div data-window-body className={`flex-1 overflow-auto font-sans select-text ${
          isLight ? "text-slate-900 bg-white/40" : "text-zinc-100 bg-transparent"
        } ${FULL_BLEED_APPS.includes(id) ? "p-0 flex flex-col h-full" : "p-3 sm:p-6"
          }`}>
          {children}
        </div>

        {/* Resize handles — 8 edges/corners, only visible when not maximized */}
        {!effectiveMaximized && (
          <>
            {/* Corners */}
            <div onMouseDown={(e) => handleMouseDownResize(e, "nw")} style={{ cursor: "nwse-resize" }} className="absolute top-0 left-0 w-4 h-4 z-20" />
            <div onMouseDown={(e) => handleMouseDownResize(e, "ne")} style={{ cursor: "nesw-resize" }} className="absolute top-0 right-0 w-4 h-4 z-20" />
            <div onMouseDown={(e) => handleMouseDownResize(e, "sw")} style={{ cursor: "nesw-resize" }} className="absolute bottom-0 left-0 w-4 h-4 z-20" />
            <div onMouseDown={(e) => handleMouseDownResize(e, "se")} style={{ cursor: "nwse-resize" }} className="absolute bottom-0 right-0 w-4 h-4 z-20" />
            {/* Edges */}
            <div onMouseDown={(e) => handleMouseDownResize(e, "n")} style={{ cursor: "ns-resize" }} className="absolute top-0 left-4 right-4 h-1 z-20" />
            <div onMouseDown={(e) => handleMouseDownResize(e, "s")} style={{ cursor: "ns-resize" }} className="absolute bottom-0 left-4 right-4 h-1 z-20" />
            <div onMouseDown={(e) => handleMouseDownResize(e, "w")} style={{ cursor: "ew-resize" }} className="absolute top-4 bottom-4 left-0 w-1 z-20" />
            <div onMouseDown={(e) => handleMouseDownResize(e, "e")} style={{ cursor: "ew-resize" }} className="absolute top-4 bottom-4 right-0 w-1 z-20" />
          </>
        )}
      </motion.div>
    </>
  );
};
