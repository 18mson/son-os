"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";
import { useTranslation, getAppTranslation } from "@/i18n";

export const ClockWidget: React.FC = () => {
  const { t, language } = useTranslation();
  const { openWindow, theme, clockFormat } = useWindowStore();
  const isLight = theme === "light";
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const is12h = clockFormat === "12h";
      const localeCode = language === "en" ? "en-US" : "id-ID";

      setTimeStr(
        now.toLocaleTimeString(localeCode, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: is12h,
        })
      );
      setDateStr(
        now.toLocaleDateString(localeCode, {
          weekday: "long",
          month: "short",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [clockFormat, language]);

  const handleClick = () => {
    const clockApp = APPS.find((a) => a.id === "clock");
    if (clockApp) {
      const appMeta = getAppTranslation("clock", language);
      openWindow({ ...clockApp, title: appMeta?.title || clockApp.title });
    }
  };

  return (
    <div
      data-widget
      onClick={handleClick}
      title={t.widgets.clock.openTooltip}
      className={`group relative p-5 rounded-3xl overflow-hidden [clip-path:inset(0_round_1.5rem)] backdrop-blur-xl transition-colors duration-300 cursor-pointer select-none flex flex-col justify-between w-64 h-36 shadow-none ${
        isLight
          ? "bg-white/45 hover:bg-white/55 border border-white/70 text-slate-900"
          : "bg-zinc-950/45 hover:bg-zinc-950/55 border border-white/15 text-zinc-100"
      }`}
    >
      <div className={`flex items-center justify-between transition-colors ${
        isLight ? "text-slate-500 group-hover:text-slate-900" : "text-zinc-400 group-hover:text-white"
      }`}>
        <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          isLight ? "text-blue-600" : "text-blue-400"
        }`}>
          <Clock size={14} /> {t.widgetGallery.clockTitle}
        </span>
        <span className={`text-[10px] transition-colors ${
          isLight ? "text-slate-400 group-hover:text-slate-600" : "text-zinc-500 group-hover:text-zinc-300"
        }`}>Son-OS</span>
      </div>

      <div>
        <h2 className={`text-3xl font-black tracking-tight leading-none transition-colors ${
          isLight ? "text-slate-900 group-hover:text-blue-700" : "text-white group-hover:text-blue-200"
        }`}>
          {timeStr || "10:30 AM"}
        </h2>
        <p className={`text-xs font-medium mt-1.5 transition-colors ${
          isLight ? "text-slate-600 group-hover:text-slate-800" : "text-zinc-400 group-hover:text-zinc-300"
        }`}>
          {dateStr || "Loading date..."}
        </p>
      </div>
    </div>
  );
};
