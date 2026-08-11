"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Trash2, Clock, Sparkles } from "lucide-react";

interface CalendarEvent {
  id: string;
  dateKey: string; // YYYY-MM-DD
  title: string;
  time?: string;
}

interface PublicHoliday {
  date: string; // YYYY-MM-DD
  description: string;
  isCuti?: boolean;
  hijriInfo?: string;
}

// Data Hari Libur Nasional & Keagamaan Indonesia
const INDONESIAN_HOLIDAYS: Record<string, { description: string; isCuti?: boolean; hijriInfo?: string }> = {
  // --- TAHUN 2026 ---
  "2026-01-01": { description: "Tahun Baru 2026 Masehi 🎆" },
  "2026-01-16": { description: "Isra Mi'raj Nabi Muhammad SAW 🕌", hijriInfo: "27 Rajab 1447 H" },
  "2026-02-16": { description: "Cuti Bersama Tahun Baru Imlek 2577 Kongzili 🧧", isCuti: true },
  "2026-02-17": { description: "Tahun Baru Imlek 2577 Kongzili 🧧" },
  "2026-02-18": { description: "Awal Puasa Ramadan 1447 H 🌙", hijriInfo: "1 Ramadan 1447 H" },
  "2026-03-06": { description: "Nuzulul Qur'an 📖", hijriInfo: "17 Ramadan 1447 H" },
  "2026-03-18": { description: "Cuti Bersama Hari Suci Nyepi Saka 1948 🪷", isCuti: true },
  "2026-03-19": { description: "Hari Suci Nyepi Tahun Baru Saka 1948 🪷" },
  "2026-03-20": { description: "Hari Raya Idul Fitri 1447 H 🌙 (Cuti Bersama)", isCuti: true, hijriInfo: "1 Syawal 1447 H" },
  "2026-03-21": { description: "Hari Raya Idul Fitri 1447 H 🌙", hijriInfo: "2 Syawal 1447 H" },
  "2026-03-22": { description: "Hari Raya Idul Fitri 1447 H 🌙 (Cuti Bersama)", isCuti: true },
  "2026-03-23": { description: "Cuti Bersama Hari Raya Idul Fitri 1447 H 🌙", isCuti: true },
  "2026-03-24": { description: "Cuti Bersama Hari Raya Idul Fitri 1447 H 🌙", isCuti: true },
  "2026-04-03": { description: "Wafat Yesus Kristus / Jumat Agung ✝️" },
  "2026-04-05": { description: "Kebangkitan Yesus Kristus (Paskah) ✝️" },
  "2026-05-01": { description: "Hari Buruh Internasional 🛠️" },
  "2026-05-14": { description: "Kenaikan Yesus Kristus ✝️" },
  "2026-05-15": { description: "Cuti Bersama Kenaikan Yesus Kristus ✝️", isCuti: true },
  "2026-05-26": { description: "Hari Arafah 🕋", hijriInfo: "9 Zulhijah 1447 H" },
  "2026-05-27": { description: "Hari Raya Idul Adha 1447 H 🕋", hijriInfo: "10 Zulhijah 1447 H" },
  "2026-05-28": { description: "Cuti Bersama Hari Raya Idul Adha 1447 H 🕋", isCuti: true },
  "2026-05-31": { description: "Hari Raya Waisak 2570 BE 🪷" },
  "2026-06-01": { description: "Hari Lahir Pancasila 🇮🇩" },
  "2026-06-16": { description: "Tahun Baru Islam 1448 H 🕌", hijriInfo: "1 Muharam 1448 H" },
  "2026-06-24": { description: "Hari Tasua 🕌", hijriInfo: "9 Muharam 1448 H" },
  "2026-06-25": { description: "Hari Asyuro 🕌", hijriInfo: "10 Muharam 1448 H" },
  "2026-08-17": { description: "Hari Kemerdekaan Republik Indonesia 🇮🇩" },
  "2026-08-25": { description: "Maulid Nabi Muhammad SAW 🕌", hijriInfo: "12 Rabiulawal 1448 H" },
  "2026-12-24": { description: "Cuti Bersama Hari Raya Natal 🎄", isCuti: true },
  "2026-12-25": { description: "Hari Raya Natal 🎄" },

  // --- TAHUN 2025 ---
  "2025-01-01": { description: "Tahun Baru 2025 Masehi 🎆" },
  "2025-01-27": { description: "Isra Mi'raj Nabi Muhammad SAW 🕌", hijriInfo: "27 Rajab 1446 H" },
  "2025-01-28": { description: "Cuti Bersama Tahun Baru Imlek 2576 Kongzili 🧧", isCuti: true },
  "2025-01-29": { description: "Tahun Baru Imlek 2576 Kongzili 🧧" },
  "2025-03-01": { description: "Awal Puasa Ramadan 1446 H 🌙", hijriInfo: "1 Ramadan 1446 H" },
  "2025-03-17": { description: "Nuzulul Qur'an 📖", hijriInfo: "17 Ramadan 1446 H" },
  "2025-03-28": { description: "Cuti Bersama Hari Suci Nyepi Saka 1947 🪷", isCuti: true },
  "2025-03-29": { description: "Hari Suci Nyepi Tahun Baru Saka 1947 🪷" },
  "2025-03-30": { description: "Hari Raya Idul Fitri 1446 H 🌙", hijriInfo: "1 Syawal 1446 H" },
  "2025-03-31": { description: "Hari Raya Idul Fitri 1446 H 🌙", hijriInfo: "2 Syawal 1446 H" },
  "2025-04-01": { description: "Cuti Bersama Hari Raya Idul Fitri 1446 H 🌙", isCuti: true },
  "2025-04-02": { description: "Cuti Bersama Hari Raya Idul Fitri 1446 H 🌙", isCuti: true },
  "2025-04-03": { description: "Cuti Bersama Hari Raya Idul Fitri 1446 H 🌙", isCuti: true },
  "2025-04-04": { description: "Cuti Bersama Hari Raya Idul Fitri 1446 H 🌙", isCuti: true },
  "2025-04-18": { description: "Wafat Yesus Kristus / Jumat Agung ✝️" },
  "2025-04-20": { description: "Kebangkitan Yesus Kristus (Paskah) ✝️" },
  "2025-05-01": { description: "Hari Buruh Internasional 🛠️" },
  "2025-05-12": { description: "Hari Raya Waisak 2569 BE 🪷" },
  "2025-05-13": { description: "Cuti Bersama Hari Raya Waisak 2569 BE 🪷", isCuti: true },
  "2025-05-29": { description: "Kenaikan Yesus Kristus ✝️" },
  "2025-05-30": { description: "Cuti Bersama Kenaikan Yesus Kristus ✝️", isCuti: true },
  "2025-06-01": { description: "Hari Lahir Pancasila 🇮🇩" },
  "2025-06-05": { description: "Hari Arafah 🕋", hijriInfo: "9 Zulhijah 1446 H" },
  "2025-06-06": { description: "Hari Raya Idul Adha 1446 H 🕋", hijriInfo: "10 Zulhijah 1446 H" },
  "2025-06-09": { description: "Cuti Bersama Hari Raya Idul Adha 1446 H 🕋", isCuti: true },
  "2025-06-26": { description: "Tahun Baru Islam 1447 H 🕌", hijriInfo: "1 Muharam 1447 H" },
  "2025-08-17": { description: "Hari Kemerdekaan Republik Indonesia 🇮🇩" },
  "2025-08-18": { description: "Cuti Bersama Hari Kemerdekaan RI 🇮🇩", isCuti: true },
  "2025-09-04": { description: "Maulid Nabi Muhammad SAW 🕌", hijriInfo: "12 Rabiulawal 1447 H" },
  "2025-12-25": { description: "Hari Raya Natal 🎄" },
  "2025-12-26": { description: "Cuti Bersama Hari Raya Natal 🎄", isCuti: true },
};

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    dateKey: new Date().toISOString().split("T")[0],
    title: "Peluncuran Son-OS Web Desktop 🚀",
    time: "10:00 AM",
  },
  {
    id: "evt-2",
    dateKey: new Date().toISOString().split("T")[0],
    title: "Review Fitur Built-in Apps & Widgets 📱",
    time: "02:30 PM",
  },
];

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const CalendarApp: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("son-os-calendar-events-v1");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_EVENTS;
  });

  const [holidays] = useState<Record<string, PublicHoliday>>(() => {
    const initialMap: Record<string, PublicHoliday> = {};
    Object.entries(INDONESIAN_HOLIDAYS).forEach(([dKey, val]) => {
      initialMap[dKey] = {
        date: dKey,
        description: val.description,
        isCuti: val.isCuti,
        hijriInfo: val.hijriInfo,
      };
    });
    return initialMap;
  });

  const [newEventTitle, setNewEventTitle] = useState<string>("");
  const [newEventTime, setNewEventTime] = useState<string>("10:00");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Persist custom events
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("son-os-calendar-events-v1", JSON.stringify(events));
    }
  }, [events]);

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Adjust starting day index (0 = Mon, 6 = Sun)
  let startingDay = firstDayOfMonth.getDay() - 1;
  if (startingDay < 0) startingDay = 6;

  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateKey(today.toISOString().split("T")[0]);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      dateKey: selectedDateKey,
      title: newEventTitle.trim(),
      time: newEventTime,
    };

    setEvents((prev) => [...prev, newEvt]);
    setNewEventTitle("");
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const todayKey = new Date().toISOString().split("T")[0];
  const selectedEvents = events.filter((e) => e.dateKey === selectedDateKey);
  const selectedHoliday = holidays[selectedDateKey];

  // Build calendar matrix
  const daysGrid: Array<{ dayNum: number; isCurrentMonth: boolean; dateKey: string; isSunday: boolean }> = [];

  // Previous month padding
  for (let i = startingDay - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, prevMonthDays - i);
    daysGrid.push({
      dayNum: prevMonthDays - i,
      isCurrentMonth: false,
      dateKey: prevDate.toISOString().split("T")[0],
      isSunday: prevDate.getDay() === 0,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const currDate = new Date(year, month, i);
    const yyyy = currDate.getFullYear();
    const mm = String(currDate.getMonth() + 1).padStart(2, "0");
    const dd = String(i).padStart(2, "0");
    daysGrid.push({
      dayNum: i,
      isCurrentMonth: true,
      dateKey: `${yyyy}-${mm}-${dd}`,
      isSunday: currDate.getDay() === 0,
    });
  }

  // Next month padding to fill 42 cells (6 rows * 7 days)
  const remaining = 42 - daysGrid.length;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i);
    daysGrid.push({
      dayNum: i,
      isCurrentMonth: false,
      dateKey: nextDate.toISOString().split("T")[0],
      isSunday: nextDate.getDay() === 0,
    });
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-zinc-950 text-zinc-100 rounded-xl overflow-hidden border border-white/10 select-none">
      {/* Calendar Grid Area */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              {MONTHS[month]} {year}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToday}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-zinc-200 font-medium transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-9 min-w-9 flex items-center justify-center"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-9 min-w-9 flex items-center justify-center"
              title="Bulan Selanjutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAYS.map((d, idx) => (
            <span
              key={d}
              className={`text-xs font-semibold py-1 ${
                idx === 6 ? "text-rose-400 font-bold" : "text-zinc-400"
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {daysGrid.map((cell, idx) => {
            const isToday = cell.dateKey === todayKey;
            const isSelected = cell.dateKey === selectedDateKey;
            const hasEvents = events.some((e) => e.dateKey === cell.dateKey);
            const holiday = holidays[cell.dateKey];
            const isRedDate = cell.isSunday || !!holiday;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDateKey(cell.dateKey)}
                title={holiday ? holiday.description : undefined}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all min-h-10 border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-400 shadow-md scale-105 z-10"
                    : isToday
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    : holiday?.isCuti && cell.isCurrentMonth
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                    : isRedDate && cell.isCurrentMonth
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                    : cell.isCurrentMonth
                    ? "bg-white/5 text-zinc-200 border-white/5 hover:bg-white/10 hover:border-white/20"
                    : "bg-transparent text-zinc-600 border-transparent opacity-40"
                }`}
              >
                <span
                  className={
                    isSelected
                      ? ""
                      : holiday?.isCuti && cell.isCurrentMonth
                      ? "text-amber-400 font-bold"
                      : isRedDate && cell.isCurrentMonth
                      ? "text-rose-400 font-bold"
                      : ""
                  }
                >
                  {cell.dayNum}
                </span>

                {/* Indicators Container */}
                <div className="absolute bottom-1 flex items-center gap-1">
                  {holiday && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected
                          ? "bg-white"
                          : holiday.isCuti
                          ? "bg-amber-400 shadow-sm shadow-amber-400"
                          : "bg-rose-500 shadow-sm shadow-rose-500"
                      }`}
                    />
                  )}
                  {hasEvents && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-blue-400"
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events & Holiday Sidebar Panel */}
      <div className="w-full md:w-72 bg-zinc-900/90 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="border-b border-white/10 pb-3 mb-3">
            <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block">
              Detail Tanggal
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5">
              {new Date(selectedDateKey + "T00:00:00").toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>
          </div>

          {/* Indonesian Official National Public Holiday Card */}
          {selectedHoliday && (
            <div
              className={`p-3 rounded-xl border mb-3 space-y-1 text-xs ${
                selectedHoliday.isCuti
                  ? "bg-amber-500/15 border-amber-500/30"
                  : "bg-rose-500/15 border-rose-500/30"
              }`}
            >
              <div
                className={`flex items-center gap-1.5 font-bold ${
                  selectedHoliday.isCuti ? "text-amber-400" : "text-rose-400"
                }`}
              >
                <Sparkles size={14} />
                <span>
                  {selectedHoliday.isCuti
                    ? "Cuti Bersama Indonesia"
                    : "Hari Libur Nasional Indonesia"}
                </span>
              </div>
              <p className="text-white font-semibold leading-snug">{selectedHoliday.description}</p>
              {selectedHoliday.hijriInfo && (
                <span className="inline-block text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mt-1">
                  ☪️ {selectedHoliday.hijriInfo}
                </span>
              )}
            </div>
          )}

          {/* Custom Events List */}
          <div className="space-y-2 max-h-40 md:max-h-56 overflow-y-auto pr-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Acara Pribadi ({selectedEvents.length})
            </span>

            {selectedEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-2 text-xs"
              >
                <div>
                  <h4 className="font-semibold text-zinc-100">{evt.title}</h4>
                  {evt.time && (
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
                      <Clock size={10} /> {evt.time}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteEvent(evt.id)}
                  className="p-1 text-zinc-400 hover:text-rose-400 transition-colors"
                  title="Hapus Acara"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {selectedEvents.length === 0 && !selectedHoliday && (
              <p className="text-center text-xs text-zinc-500 py-4">
                Tidak ada acara pribadi untuk tanggal ini.
              </p>
            )}
          </div>
        </div>

        {/* Add Event Form */}
        <form onSubmit={handleAddEvent} className="pt-3 border-t border-white/10 space-y-2 mt-3">
          <input
            type="text"
            placeholder="Tambah nama acara..."
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden"
          />
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={newEventTime}
              onChange={(e) => setNewEventTime(e.target.value)}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden"
            />
            <button
              type="submit"
              className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1 shadow-md transition-colors min-h-9"
            >
              <Plus size={14} /> Tambah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
