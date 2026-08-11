"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";

export const CalendarWidget: React.FC = () => {
  const { openWindow } = useWindowStore();
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
      openWindow(calendarApp);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().getDate();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

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
      title="Buka Aplikasi Kalender"
      className="group relative p-4 rounded-3xl bg-zinc-950/40 border border-white/10 hover:border-white/25 hover:bg-zinc-950/60 backdrop-blur-xl shadow-2xl transition-all duration-300 cursor-pointer select-none flex flex-col justify-between w-64 h-52 hover:scale-102 hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex items-center justify-between text-zinc-400 group-hover:text-white transition-colors pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
          <CalendarIcon size={14} /> Kalender
        </span>
        <span className="text-xs font-bold text-white">
          {monthNames[month]} {year}
        </span>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 border-b border-white/10 pb-1">
        <span>Min</span>
        <span>Sen</span>
        <span>Sel</span>
        <span>Rab</span>
        <span>Kam</span>
        <span>Jum</span>
        <span>Sab</span>
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
              className={`h-5 flex items-center justify-center rounded-full text-[10px] ${isToday
                  ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30 scale-110"
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
