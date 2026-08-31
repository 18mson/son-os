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
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const updateTime = () => {
      const current = new Date();
      setNow(current);
      const is12h = clockFormat === "12h";
      const localeCode = language === "en" ? "en-US" : "id-ID";

      setTimeStr(
        current.toLocaleTimeString(localeCode, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: is12h,
        })
      );
      setDateStr(
        current.toLocaleDateString(localeCode, {
          weekday: "short",
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

  // Compute analog clock hand rotation angles
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  const secDeg = seconds * 6;
  const minDeg = minutes * 6;
  const hourDeg = hours * 30;

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
        <span className={`text-[10px] font-medium transition-colors ${
          isLight ? "text-slate-400 group-hover:text-slate-600" : "text-zinc-500 group-hover:text-zinc-300"
        }`}>Son-OS</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Digital Time & Date */}
        <div>
          <h2 className={`text-3xl font-black tracking-tight leading-none transition-colors ${
            isLight ? "text-slate-900 group-hover:text-blue-700" : "text-white group-hover:text-blue-200"
          }`}>
            {timeStr || "10:30"}
          </h2>
          <p className={`text-xs font-semibold mt-1.5 transition-colors ${
            isLight ? "text-slate-600 group-hover:text-slate-800" : "text-zinc-400 group-hover:text-zinc-300"
          }`}>
            {dateStr || "Loading date..."}
          </p>
        </div>

        {/* Minimalist Analog Clock Dial */}
        <div className={`relative w-12 h-12 rounded-full border flex items-center justify-center shrink-0 shadow-xs transition-colors ${
          isLight
            ? "border-slate-300/80 bg-white/70 shadow-slate-200/50"
            : "border-white/15 bg-zinc-900/60 shadow-black/20"
        }`}>
          {/* 12, 3, 6, 9 Hour Ticks */}
          <span className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-slate-400/80 dark:bg-zinc-500 rounded-full" />
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-slate-400/80 dark:bg-zinc-500 rounded-full" />
          <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-0.5 bg-slate-400/80 dark:bg-zinc-500 rounded-full" />
          <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-0.5 bg-slate-400/80 dark:bg-zinc-500 rounded-full" />

          {/* Hour Hand */}
          <div
            className={`absolute w-0.75 h-3 rounded-full origin-bottom transition-transform duration-300 ${
              isLight ? "bg-slate-800" : "bg-white"
            }`}
            style={{
              bottom: "50%",
              transform: `rotate(${hourDeg}deg)`,
            }}
          />

          {/* Minute Hand */}
          <div
            className="absolute w-0.5 h-4 bg-blue-600 dark:bg-blue-400 rounded-full origin-bottom transition-transform duration-300"
            style={{
              bottom: "50%",
              transform: `rotate(${minDeg}deg)`,
            }}
          />

          {/* Second Hand */}
          <div
            className="absolute w-0.5 h-4.5 bg-amber-500 rounded-full origin-bottom"
            style={{
              bottom: "50%",
              transform: `rotate(${secDeg}deg)`,
            }}
          />

          {/* Center Pin */}
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 z-10 shadow-xs" />
        </div>
      </div>
    </div>
  );
};
