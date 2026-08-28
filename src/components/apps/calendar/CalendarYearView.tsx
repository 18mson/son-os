import React from "react";
import { CalendarEvent, INDONESIAN_HOLIDAYS } from "./indonesianHolidays";

interface CalendarYearViewProps {
  currentYear: number;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onSelectMonth: (monthIndex: number) => void;
  events: CalendarEvent[];
  isLight: boolean;
  isEn: boolean;
  monthNames: string[];
}

export const CalendarYearView: React.FC<CalendarYearViewProps> = ({
  currentYear,
  selectedDate,
  onSelectDate,
  onSelectMonth,
  events,
  isLight,
  isEn,
  monthNames,
}) => {
  const miniDayHeaders = isEn ? ["S", "M", "T", "W", "T", "F", "S"] : ["M", "S", "S", "R", "K", "J", "S"];
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  return (
    <div className="flex-1 p-3 sm:p-5 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {monthNames.map((monthName, monthIndex) => {
          const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
          const firstDay = new Date(currentYear, monthIndex, 1).getDay();
          const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

          return (
            <div
              key={monthName}
              className={`p-3 rounded-2xl border transition-all ${
                isLight ? "bg-white/90 border-slate-200 shadow-xs" : "bg-white/5 border-white/10 shadow-md"
              }`}
            >
              {/* Month Header (Clickable to switch to month view) */}
              <button
                type="button"
                onClick={() => onSelectMonth(monthIndex)}
                className={`w-full text-left font-bold text-xs sm:text-sm mb-2 flex items-center justify-between pb-1.5 border-b cursor-pointer transition-colors group ${
                  isLight
                    ? "text-slate-900 hover:text-blue-600 border-slate-200"
                    : "text-white hover:text-blue-400 border-white/10"
                }`}
                title={isEn ? `Open ${monthName} in month view` : `Buka ${monthName} di tampilan bulan`}
              >
                <span>{monthName}</span>
                <span className="text-[10px] font-normal opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  →
                </span>
              </button>

              {/* Mini Day Headers */}
              <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                {miniDayHeaders.map((dh, idx) => (
                  <span
                    key={`${monthIndex}-${idx}`}
                    className={`text-[9px] font-bold ${
                      idx === 0 ? "text-rose-500" : isLight ? "text-slate-400" : "text-zinc-500"
                    }`}
                  >
                    {dh}
                  </span>
                ))}
              </div>

              {/* Mini Days Grid */}
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${monthIndex}-${i}`} className="h-6 w-full" />
                ))}

                {daysArray.map((day) => {
                  const dateObj = new Date(currentYear, monthIndex, day);
                  const dateKey = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const holiday = INDONESIAN_HOLIDAYS[dateKey];
                  const hasEvents = events.some((e) => e.dateKey === dateKey);

                  const isToday =
                    todayYear === currentYear && todayMonth === monthIndex && todayDate === day;
                  const isSelected =
                    selectedDate.getFullYear() === currentYear &&
                    selectedDate.getMonth() === monthIndex &&
                    selectedDate.getDate() === day;
                  const isSunday = dateObj.getDay() === 0;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => onSelectDate(dateObj)}
                      className={`h-6 w-full rounded-md text-[10px] font-medium flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white font-bold shadow-xs"
                          : isToday
                          ? "bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40"
                          : isLight
                          ? "hover:bg-slate-100 text-slate-700"
                          : "hover:bg-white/10 text-zinc-300"
                      } ${holiday || isSunday ? (isSelected ? "text-white" : "text-rose-500 font-semibold") : ""}`}
                      title={holiday ? `${day} ${monthName}: ${holiday.description}` : `${day} ${monthName} ${currentYear}`}
                    >
                      <span className="leading-none">{day}</span>
                      {hasEvents && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-blue-400 absolute bottom-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
