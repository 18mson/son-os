"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useTranslation } from "@/i18n";
import { CalendarEvent, INDONESIAN_HOLIDAYS, DEFAULT_EVENTS } from "./calendar/indonesianHolidays";
import { CalendarEventPanel } from "./calendar/CalendarEventPanel";
import { CalendarYearView } from "./calendar/CalendarYearView";

export const CalendarApp: React.FC = () => {
  const { theme } = useWindowStore();
  const { language } = useTranslation();
  const isLight = theme === "light";
  const isEn = language === "en";

  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sonos_calendar_events");
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {
        // fallback to default
      }
    }
    return DEFAULT_EVENTS;
  });
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");

  const saveEvents = (updated: CalendarEvent[]) => {
    setEvents(updated);
    try {
      localStorage.setItem("sonos_calendar_events", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const prevPeriod = () => {
    if (viewMode === "year") {
      setCurrentDate(new Date(currentYear - 1, currentMonth, 1));
    } else {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    }
  };

  const nextPeriod = () => {
    if (viewMode === "year") {
      setCurrentDate(new Date(currentYear + 1, currentMonth, 1));
    } else {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const selectedDateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  const selectedHoliday = INDONESIAN_HOLIDAYS[selectedDateKey];
  const selectedEvents = events.filter((e) => e.dateKey === selectedDateKey);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      dateKey: selectedDateKey,
      title: newEventTitle.trim(),
      time: newEventTime || undefined,
    };

    saveEvents([...events, newEvt]);
    setNewEventTitle("");
    setNewEventTime("");
  };

  const handleDeleteEvent = (id: string) => {
    saveEvents(events.filter((e) => e.id !== id));
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = isEn
    ? [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
    : [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
  const dayNames = isEn
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className={`flex flex-col h-full w-full select-none font-sans overflow-hidden transition-colors ${
      isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Top Bar */}
      <div className={`px-4 py-2.5 border-b flex items-center justify-between gap-3 shrink-0 backdrop-blur-md transition-colors ${
        isLight ? "bg-white/80 border-slate-200" : "bg-zinc-900/90 border-white/10"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h1 className={`text-sm font-bold tracking-wide ${isLight ? "text-slate-900" : "text-white"}`}>
              {viewMode === "year" ? `${isEn ? "Year" : "Tahun"} ${currentYear}` : `${monthNames[currentMonth]} ${currentYear}`}
            </h1>
            <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              {isEn ? "Calendar & Events" : "Kalender & Agenda Indonesia"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Month vs Year */}
          <div className={`flex items-center rounded-xl border p-0.5 ${
            isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10"
          }`}>
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === "month"
                  ? "bg-blue-600 text-white shadow-xs"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {isEn ? "Month" : "Bulan"}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("year")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === "year"
                  ? "bg-blue-600 text-white shadow-xs"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {isEn ? "Year" : "Tahun"}
            </button>
          </div>

          <button
            type="button"
            onClick={goToToday}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              isLight ? "bg-white text-slate-800 border border-slate-200 hover:bg-slate-100 shadow-xs" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {isEn ? "Today" : "Hari Ini"}
          </button>
          <div className={`flex items-center rounded-xl border p-0.5 ${
            isLight ? "bg-white border-slate-200 shadow-xs" : "bg-white/5 border-white/10"
          }`}>
            <button
              type="button"
              onClick={prevPeriod}
              className="p-1 rounded-md hover:bg-black/10 cursor-pointer"
              title={viewMode === "year" ? (isEn ? "Previous Year" : "Tahun Sebelumnya") : (isEn ? "Previous Month" : "Bulan Sebelumnya")}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={nextPeriod}
              className="p-1 rounded-md hover:bg-black/10 cursor-pointer"
              title={viewMode === "year" ? (isEn ? "Next Year" : "Tahun Selanjutnya") : (isEn ? "Next Month" : "Bulan Selanjutnya")}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid & Side Panel */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {viewMode === "year" ? (
          <CalendarYearView
            currentYear={currentYear}
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
            onSelectMonth={(monthIdx) => {
              setCurrentDate(new Date(currentYear, monthIdx, 1));
              setViewMode("month");
            }}
            events={events}
            isLight={isLight}
            isEn={isEn}
            monthNames={monthNames}
          />
        ) : (
          /* Calendar Days Grid */
          <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Header Hari */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {dayNames.map((day, idx) => (
                  <div
                    key={day}
                    className={`text-[11px] font-bold uppercase py-1 ${
                      idx === 0 ? "text-rose-500" : isLight ? "text-slate-600" : "text-zinc-400"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid Tanggal */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10 sm:h-12" />
                ))}

                {daysArray.map((day) => {
                  const dateObj = new Date(currentYear, currentMonth, day);
                  const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const holiday = INDONESIAN_HOLIDAYS[dateKey];
                  const dayEvts = events.filter((e) => e.dateKey === dateKey);

                  const isToday =
                    new Date().toDateString() === dateObj.toDateString();
                  const isSelected =
                    selectedDate.toDateString() === dateObj.toDateString();
                  const isSunday = dateObj.getDay() === 0;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateObj)}
                      className={`h-10 sm:h-12 p-1 rounded-xl flex flex-col justify-between transition-all cursor-pointer border relative text-left ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-500/40 bg-blue-500/15"
                          : isToday
                          ? "border-blue-400 bg-blue-500/10 font-bold"
                          : isLight
                          ? "bg-white border-slate-200 hover:bg-slate-100"
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-bold ${
                            holiday || isSunday
                              ? "text-rose-500"
                              : isLight
                              ? "text-slate-900"
                              : "text-zinc-100"
                          }`}
                        >
                          {day}
                        </span>
                        {holiday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 overflow-hidden">
                        {dayEvts.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        )}
                        {holiday && holiday.isCuti && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Side Event Panel */}
        <CalendarEventPanel
          isLight={isLight}
          selectedDate={selectedDate}
          selectedHoliday={selectedHoliday}
          selectedEvents={selectedEvents}
          handleDeleteEvent={handleDeleteEvent}
          handleAddEvent={handleAddEvent}
          newEventTitle={newEventTitle}
          setNewEventTitle={setNewEventTitle}
          newEventTime={newEventTime}
          setNewEventTime={setNewEventTime}
        />
      </div>
    </div>
  );
};
