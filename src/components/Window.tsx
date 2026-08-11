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

export const WindowComponent: React.FC<WindowProps> = ({ window: windowState, children }) => {
  const { id, title, icon, accentColor, position, size, isMinimized, isMaximized, zIndex } = windowState;
  const { closeWindow, minimizeWindow, focusWindow, moveWindow, resizeWindow, toggleMaximizeWindow, activeWindowId } = useWindowStore();

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
  }, [isMaximized, isMobile, focusWindow, id, size, position]);

  useEffect(() => {
    if (!resizingEdge || !resizeRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const { startX, startY, startW, startH, startPosX, startPosY } = resizeRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newW = startW;
      let newH = startH;
      let newX = startPosX;
      let newY = startPosY;

      if (resizingEdge.includes("e")) newW = Math.max(MIN_W, startW + dx);
      if (resizingEdge.includes("w")) {
        newW = Math.max(MIN_W, startW - dx);
        newX = startPosX + (startW - newW);
      }
      if (resizingEdge.includes("s")) newH = Math.max(MIN_H, startH + dy);
      if (resizingEdge.includes("n")) {
        newH = Math.max(MIN_H, startH - dy);
        newY = startPosY + (startH - newH);
      }

      resizeWindow(id, { w: newW, h: newH });
      if (newX !== startPosX || newY !== startPosY) moveWindow(id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setResizingEdge(null);
      resizeRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingEdge, id, resizeWindow, moveWindow]);

  if (isMinimized) return null;

  const effectiveMaximized = isMaximized || isMobile;

  // Global cursor override during drag/resize
  const globalCursor = isDragging
    ? "cursor-grabbing"
    : resizingEdge
      ? ""
      : "";

  return (
    <>
      {/* Full-screen cursor overlay during resize so cursor doesn't flicker */}
      {resizingEdge && (
        <div
          className="fixed inset-0 z-9999"
          style={{ cursor: EDGE_CURSOR[resizingEdge] }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0.05 }}
        onMouseDown={() => focusWindow(id)}
        style={{
          position: "fixed",
          left: effectiveMaximized ? 0 : position.x,
          top: effectiveMaximized ? 0 : position.y,
          width: effectiveMaximized ? "100vw" : size.w,
          height: isMobile ? "calc(100vh - 60px)" : isMaximized ? "calc(100vh - 72px)" : size.h,
          zIndex: zIndex,
        }}
        className={`flex flex-col rounded-t-xl md:rounded-xl overflow-hidden shadow-2xl border transition-shadow duration-200 select-none ${isActive
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
          className={`h-11 px-3.5 flex items-center justify-between bg-zinc-900/70 border-b border-white/10 shrink-0 ${isDragging ? "cursor-grabbing" : effectiveMaximized ? "cursor-default" : "cursor-grab"}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-1.5 rounded-lg text-white ${accentColor || "bg-blue-600"} shadow-sm`}>
              <AppIcon name={icon} size={15} />
            </div>
            <span className="text-sm font-medium text-zinc-200 truncate">{title}</span>
          </div>

          {/* Window control buttons */}
          <div
            className="flex items-center gap-1 text-zinc-400"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => minimizeWindow(id)}
              title="Minimize"
              aria-label="Minimize Window"
              className="p-2 sm:p-1.5 rounded-lg hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden transition-colors min-w-9 min-h-9 flex items-center justify-center"
            >
              <Minus size={14} />
            </button>
            {!isMobile && (
              <button
                onClick={() => toggleMaximizeWindow(id)}
                title={isMaximized ? "Restore" : "Maximize"}
                aria-label={isMaximized ? "Restore Window" : "Maximize Window"}
                className="p-2 sm:p-1.5 rounded-lg hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden transition-colors min-w-9 min-h-9 flex items-center justify-center"
              >
                {isMaximized ? <Copy size={13} /> : <Square size={13} />}
              </button>
            )}
            <button
              onClick={() => closeWindow(id)}
              title="Close"
              aria-label="Close Window"
              className="p-2 sm:p-1.5 rounded-lg hover:bg-rose-500/80 hover:text-white focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-hidden transition-colors ml-0.5 min-w-9 min-h-9 flex items-center justify-center text-rose-300"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Window Body Content Area */}
        <div data-window-body className={`flex-1 overflow-auto text-zinc-100 font-sans select-text ${id === 'japanese-quiz' || id === 'lovely-ever' ? 'p-0 flex flex-col' : 'p-4 sm:p-6'
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
