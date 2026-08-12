import React from "react";
import { Scissors } from "lucide-react";

interface AudioTrimPanelProps {
  isLight: boolean;
  enableTrim: boolean;
  setEnableTrim: (v: boolean) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  duration: number;
}

export const AudioTrimPanel: React.FC<AudioTrimPanelProps> = ({
  isLight,
  enableTrim,
  setEnableTrim,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  duration,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border ${
        isLight ? "bg-slate-100/90 border-slate-300" : "bg-zinc-900/60 border-white/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enableTrim}
            onChange={(e) => setEnableTrim(e.target.checked)}
            className="w-4 h-4 rounded-md text-blue-600 accent-blue-600 cursor-pointer"
          />
          <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
            <Scissors size={14} className="text-amber-500" /> Potong Audio (Trim)
          </span>
        </label>
        {duration > 0 && (
          <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
            Total Durasi: {Math.floor(duration)} dtk
          </span>
        )}
      </div>

      {enableTrim && (
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10">
          <div>
            <label className={`text-[11px] font-semibold block mb-1 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
              Waktu Mulai (detik)
            </label>
            <input
              type="number"
              min={0}
              max={duration}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-xl text-xs font-mono border outline-hidden ${
                isLight ? "bg-white border-slate-300 text-slate-900" : "bg-white/10 border-white/15 text-white"
              }`}
            />
          </div>
          <div>
            <label className={`text-[11px] font-semibold block mb-1 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
              Waktu Selesai (detik)
            </label>
            <input
              type="number"
              min={0}
              max={duration}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-xl text-xs font-mono border outline-hidden ${
                isLight ? "bg-white border-slate-300 text-slate-900" : "bg-white/10 border-white/15 text-white"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
