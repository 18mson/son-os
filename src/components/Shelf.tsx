"use client";

import React, { useState, useEffect } from "react";
import { LayoutGrid, Wifi, Battery } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { AppIcon } from "./AppIcon";

export const Shelf: React.FC = () => {
  const { windows, launcherOpen, activeWindowId, toggleLauncher, toggleMinimizeWindow } = useWindowStore();
  const [time, setTime] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

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

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-3 md:left-1/2 md:-translate-x-1/2 md:right-auto z-50 flex items-center justify-between md:justify-start gap-2 px-3 py-2 rounded-t-2xl md:rounded-full bg-zinc-950/90 backdrop-blur-2xl border-t border-white/15 md:border shadow-2xl shadow-black/80 w-full md:w-auto md:max-w-[95vw]">
      {/* Launcher Button */}
      <button
        onClick={() => toggleLauncher()}
        title="Launcher"
        aria-label="Toggle App Launcher"
        className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 group relative focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden ${
          launcherOpen
            ? "bg-white text-zinc-950 shadow-lg scale-105"
            : "text-zinc-300 hover:bg-white/15 hover:text-white"
        }`}
      >
        <LayoutGrid size={19} className="transition-transform group-hover:scale-110" />
      </button>

      {/* Separator */}
      {windows.length > 0 && <div className="h-6 w-px bg-white/15 hidden sm:block" />}

      {/* Open Apps List */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[55vw] md:max-w-none">
        {windows.map((win) => {
          const isActive = activeWindowId === win.id && !win.isMinimized;
          return (
            <button
              key={win.id}
              onClick={() => toggleMinimizeWindow(win.id)}
              title={win.title}
              aria-label={`Open App ${win.title}`}
              className={`relative group p-2 min-w-[44px] min-h-[44px] rounded-2xl transition-all duration-200 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden ${
                isActive
                  ? "bg-white/20 text-white shadow-inner"
                  : win.isMinimized
                  ? "text-zinc-400 hover:bg-white/10 hover:text-zinc-200 opacity-70"
                  : "text-zinc-200 hover:bg-white/15 hover:text-white"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${win.accentColor || "bg-blue-600"} text-white shadow-sm`}>
                <AppIcon name={win.icon} size={16} />
              </div>
              
              {/* ChromeOS active indicator bar */}
              <span
                className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full transition-all duration-200 ${
                  isActive
                    ? "w-4 h-1 bg-blue-400 shadow-sm shadow-blue-400"
                    : win.isMinimized
                    ? "w-1.5 h-1 bg-zinc-500"
                    : "w-1.5 h-1 bg-zinc-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-white/15 hidden sm:block" />

      {/* System Tray (Clock & Status) */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 min-h-[44px] rounded-full bg-white/10 text-zinc-200 hover:bg-white/15 transition-colors cursor-default text-xs font-medium select-none">
        <div className="hidden sm:flex items-center gap-2 text-zinc-400">
          <Wifi size={13} />
          <Battery size={14} />
        </div>
        <div className="flex flex-col items-end leading-tight">
          <span className="font-semibold text-zinc-100">{time || "10:30 AM"}</span>
          <span className="text-[10px] text-zinc-400 hidden sm:inline">{dateStr}</span>
        </div>
      </div>
    </div>
  );
};
