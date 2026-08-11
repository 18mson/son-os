"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";

export const ClockWidget: React.FC = () => {
  const { openWindow } = useWindowStore();
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString([], {
          weekday: "long",
          month: "short",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    const clockApp = APPS.find((a) => a.id === "clock");
    if (clockApp) {
      openWindow(clockApp);
    }
  };

  return (
    <div
      data-widget
      onClick={handleClick}
      title="Buka Aplikasi Jam"
      className="group relative p-5 rounded-3xl bg-zinc-950/40 border border-white/10 hover:border-white/25 hover:bg-zinc-950/60 backdrop-blur-xl shadow-2xl transition-all duration-300 cursor-pointer select-none flex flex-col justify-between w-64 h-36 hover:scale-102 hover:-translate-y-1"
    >
      <div className="flex items-center justify-between text-zinc-400 group-hover:text-white transition-colors">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
          <Clock size={14} /> Jam Sistem
        </span>
        <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">Son-OS</span>
      </div>

      <div>
        <h2 className="text-3xl font-black text-white tracking-tight leading-none group-hover:text-blue-200 transition-colors">
          {timeStr || "10:30 AM"}
        </h2>
        <p className="text-xs text-zinc-400 font-medium mt-1.5 group-hover:text-zinc-300">
          {dateStr || "Loading date..."}
        </p>
      </div>
    </div>
  );
};
