"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";
import { useTranslation, getAppTranslation } from "@/i18n";

export const CalendarWidget: React.FC = () => {
  const { t, language } = useTranslation();
  const { openWindow, theme } = useWindowStore();
  const isLight = theme === "light";
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    const calendarApp = APPS.find((a) => a.id === "calendar");
    if (calendarApp) {
      const appMeta = getAppTranslation("calendar", language);
      openWindow({ ...calendarApp, title: appMeta?.title || calendarApp.title });
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().getDate();

  const monthNamesId = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthNames = language === "en" ? monthNamesEn : monthNamesId;

  const daysHeader = language === "en"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Days in month
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div
      data-widget
      onClick={handleClick}
      title={t.widgets.calendar.openTooltip}
      className={`group relative p-4 rounded-3xl overflow-hidden [clip-path:inset(0_round_1.5rem)] backdrop-blur-xl transition-colors duration-300 cursor-pointer select-none flex flex-col justify-between w-64 h-52 shadow-none ${
        isLight
          ? "bg-white/45 hover:bg-white/55 border border-white/70 text-slate-900"
          : "bg-zinc-950/45 hover:bg-zinc-950/55 border border-white/15 text-zinc-100"
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between transition-colors pb-1 ${
        isLight ? "text-slate-600 group-hover:text-slate-900" : "text-zinc-400 group-hover:text-white"
      }`}>
        <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          isLight ? "text-rose-600" : "text-rose-400"
        }`}>
          <CalendarIcon size={14} /> {t.widgetGallery.calendarTitle}
        </span>
        <span className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
          {monthNames[month]} {year}
        </span>
      </div>

      {/* Days of week header */}
      <div className={`grid grid-cols-7 gap-1 text-center text-[10px] font-bold border-b pb-1 ${
        isLight ? "text-slate-500 border-slate-300/60" : "text-zinc-400 border-white/10"
      }`}>
        {daysHeader.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium flex-1 pt-1">
        {days.slice(0, 28).map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }
          const isToday = day === today;
          return (
            <div
              key={day}
              className={`h-5 flex items-center justify-center rounded-full text-[10px] ${
                isToday
                  ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30 scale-110"
                  : isLight
                    ? "text-slate-700 hover:bg-slate-200"
                    : "text-zinc-300 hover:bg-white/10"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};
