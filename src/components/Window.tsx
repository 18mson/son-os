"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Minus, Square, Copy, X } from "lucide-react";
import { WindowState, useWindowStore } from "@/store/windowStore";
import { AppIcon } from "./AppIcon";

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export const WindowComponent: React.FC<WindowProps> = ({ window: windowState, children }) => {
  const { id, title, icon, accentColor, position, size, isMinimized, isMaximized, zIndex } = windowState;
  const { closeWindow, minimizeWindow, focusWindow, moveWindow, toggleMaximizeWindow, activeWindowId } = useWindowStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

  const isActive = activeWindowId === id;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        // Snap to top edge maximize
        if (e.clientY <= 10 && !isMaximized) {
          toggleMaximizeWindow(id);
        }
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

  if (isMinimized) return null;

  const effectiveMaximized = isMaximized || isMobile;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 15 }}
      transition={{ type: "spring", duration: 0.35, bounce: 0.08 }}
      onMouseDown={() => focusWindow(id)}
      style={{
        position: "fixed",
        left: effectiveMaximized ? 0 : position.x,
        top: effectiveMaximized ? 0 : position.y,
        width: effectiveMaximized ? "100vw" : size.w,
        height: isMobile ? "calc(100vh - 60px)" : isMaximized ? "calc(100vh - 72px)" : size.h,
        zIndex: zIndex,
      }}
      className={`flex flex-col rounded-t-xl md:rounded-xl overflow-hidden shadow-2xl border transition-shadow duration-200 select-none ${
        isActive
          ? "border-white/20 shadow-black/70 bg-zinc-950/90 backdrop-blur-2xl ring-1 ring-white/10"
          : "border-white/10 shadow-black/40 bg-zinc-950/75 backdrop-blur-xl opacity-95"
      }`}
    >
      {/* Title bar (ChromeOS-like minimalist header) */}
      <div
        onMouseDown={handleMouseDownTitleBar}
        onDoubleClick={() => !isMobile && toggleMaximizeWindow(id)}
        className="h-11 px-3.5 flex items-center justify-between bg-zinc-900/70 border-b border-white/10 cursor-grab active:cursor-grabbing shrink-0"
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
            className="p-2 sm:p-1.5 rounded-lg hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <Minus size={14} />
          </button>
          {!isMobile && (
            <button
              onClick={() => toggleMaximizeWindow(id)}
              title={isMaximized ? "Restore" : "Maximize"}
              aria-label={isMaximized ? "Restore Window" : "Maximize Window"}
              className="p-2 sm:p-1.5 rounded-lg hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              {isMaximized ? <Copy size={13} /> : <Square size={13} />}
            </button>
          )}
          <button
            onClick={() => closeWindow(id)}
            title="Close"
            aria-label="Close Window"
            className="p-2 sm:p-1.5 rounded-lg hover:bg-rose-500/80 hover:text-white focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-hidden transition-colors ml-0.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-rose-300 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Window Body Content Area */}
      <div className={`flex-1 overflow-auto text-zinc-100 font-sans select-text ${
        id === 'japanese-quiz' || id === 'lovely-ever' ? 'p-0 flex flex-col' : 'p-4 sm:p-6'
      }`}>
        {children}
      </div>
    </motion.div>
  );
};
