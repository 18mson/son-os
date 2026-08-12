import React from "react";
import { Clock, LayoutGrid } from "lucide-react";
import { DesktopWidgetConfig } from "@/store/windowStore";

interface SystemTabProps {
  isLight: boolean;
  clockFormat: '12h' | '24h';
  setClockFormat: (fmt: '12h' | '24h') => void;
  desktopWidgets: DesktopWidgetConfig[];
  removeWidget: (id: string) => void;
  toggleWidgetGallery: () => void;
}

export const SystemTab: React.FC<SystemTabProps> = ({
  isLight,
  clockFormat,
  setClockFormat,
  desktopWidgets,
  removeWidget,
  toggleWidgetGallery,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          Pengaturan Sistem & Waktu
        </h2>
        <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
          Atur format waktu jam dan pengelolaan widget desktop.
        </p>
      </div>

      {/* Format Jam */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
          }`}
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-500" />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
            Format Jam Sistem
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setClockFormat("12h")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${clockFormat === "12h"
                ? "bg-blue-600 text-white border-blue-500 shadow-md"
                : isLight
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
              }`}
          >
            12-Jam (AM/PM)
          </button>
          <button
            onClick={() => setClockFormat("24h")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${clockFormat === "24h"
                ? "bg-blue-600 text-white border-blue-500 shadow-md"
                : isLight
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
              }`}
          >
            24-Jam (Standar)
          </button>
        </div>
      </div>

      {/* Pengelolaan Widget */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} className="text-emerald-500" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
              Widget Desktop Aktif ({desktopWidgets.length})
            </h3>
          </div>
          <button
            onClick={toggleWidgetGallery}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 cursor-pointer"
          >
            + Galeri Widget
          </button>
        </div>

        <div className="space-y-2">
          {desktopWidgets.length === 0 ? (
            <p className="text-xs opacity-75">Tidak ada widget aktif di desktop.</p>
          ) : (
            desktopWidgets.map((w) => (
              <div
                key={w.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                  }`}
              >
                <span className="font-semibold capitalize">{w.type} Widget</span>
                <button
                  onClick={() => removeWidget(w.id)}
                  className="text-rose-500 hover:text-rose-400 font-medium cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
