import React from "react";
import { Sparkles, Clock, Trash2, Plus } from "lucide-react";
import { CalendarEvent } from "./indonesianHolidays";
import { useTranslation } from "@/i18n";

interface CalendarEventPanelProps {
  isLight: boolean;
  selectedDate: Date;
  selectedHoliday?: { description: string; isCuti?: boolean; hijriInfo?: string };
  selectedEvents: CalendarEvent[];
  handleDeleteEvent: (id: string) => void;
  handleAddEvent: (e: React.FormEvent) => void;
  newEventTitle: string;
  setNewEventTitle: (v: string) => void;
  newEventTime: string;
  setNewEventTime: (v: string) => void;
}

export const CalendarEventPanel: React.FC<CalendarEventPanelProps> = ({
  isLight,
  selectedDate,
  selectedHoliday,
  selectedEvents,
  handleDeleteEvent,
  handleAddEvent,
  newEventTitle,
  setNewEventTitle,
  newEventTime,
  setNewEventTime,
}) => {
  const { language } = useTranslation();
  const isEn = language === "en";

  return (
    <div
      className={`w-full md:w-80 p-4 border-t md:border-t-0 md:border-l flex flex-col justify-between ${
        isLight ? "bg-slate-100/90 border-slate-300" : "bg-zinc-900/50 border-white/10"
      }`}
    >
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-400"}`}>
            {selectedDate.toLocaleDateString(isEn ? "en-US" : "id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
        </div>

        {/* Holiday Banner */}
        {selectedHoliday && (
          <div
            className={`p-3 rounded-xl border mb-3 space-y-1 text-xs ${
              selectedHoliday.isCuti ? "bg-amber-500/15 border-amber-500/30" : "bg-rose-500/15 border-rose-500/30"
            }`}
          >
            <div className={`flex items-center gap-1.5 font-bold ${selectedHoliday.isCuti ? "text-amber-400" : "text-rose-400"}`}>
              <Sparkles size={14} />
              <span>
                {selectedHoliday.isCuti
                  ? isEn
                    ? "Indonesian Collective Leave"
                    : "Cuti Bersama Indonesia"
                  : isEn
                  ? "Indonesian National Holiday"
                  : "Hari Libur Nasional Indonesia"}
              </span>
            </div>
            <p className={`font-semibold leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
              {selectedHoliday.description}
            </p>
            {selectedHoliday.hijriInfo && (
              <span className="inline-block text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mt-1">
                ☪️ {selectedHoliday.hijriInfo}
              </span>
            )}
          </div>
        )}

        {/* Custom Events List */}
        <div className="space-y-2 max-h-40 md:max-h-56 overflow-y-auto pr-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
            {isEn ? `Personal Events (${selectedEvents.length})` : `Acara Pribadi (${selectedEvents.length})`}
          </span>

          {selectedEvents.map((evt) => (
            <div
              key={evt.id}
              className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 text-xs ${
                isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/10"
              }`}
            >
              <div>
                <h4 className={`font-semibold ${isLight ? "text-slate-900" : "text-zinc-100"}`}>{evt.title}</h4>
                {evt.time && (
                  <span className={`text-[10px] flex items-center gap-1 mt-0.5 font-mono ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    <Clock size={10} /> {evt.time}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteEvent(evt.id)}
                className="p-1 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                title={isEn ? "Delete Event" : "Hapus Acara"}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {selectedEvents.length === 0 && !selectedHoliday && (
            <p className="text-center text-xs opacity-60 py-4">
              {isEn ? "No personal events for this date." : "Tidak ada acara pribadi untuk tanggal ini."}
            </p>
          )}
        </div>
      </div>

      {/* Add Event Form */}
      <form onSubmit={handleAddEvent} className="pt-3 border-t border-white/10 space-y-2 mt-3">
        <input
          type="text"
          placeholder={isEn ? "Add event title..." : "Tambah nama acara..."}
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
          className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-hidden focus:border-blue-500 ${
            isLight ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-white/5 border-white/10 text-white placeholder-zinc-500"
          }`}
        />
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={newEventTime}
            onChange={(e) => setNewEventTime(e.target.value)}
            className={`px-2 py-1 rounded-lg border text-xs outline-hidden focus:border-blue-500 ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
            }`}
          />
          <button
            type="submit"
            className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1 shadow-md transition-colors cursor-pointer min-h-9"
          >
            <Plus size={14} /> {isEn ? "Add" : "Tambah"}
          </button>
        </div>
      </form>
    </div>
  );
};
