import React from "react";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";

interface Lap {
  id: number;
  time: number;
  formatted: string;
}

interface StopwatchPanelProps {
  isLight: boolean;
  swTime: number;
  swRunning: boolean;
  laps: Lap[];
  formatStopwatch: (ms: number) => string;
  setSwRunning: (v: boolean) => void;
  handleLap: () => void;
  resetStopwatch: () => void;
}

export const StopwatchPanel: React.FC<StopwatchPanelProps> = ({
  isLight,
  swTime,
  swRunning,
  laps,
  formatStopwatch,
  setSwRunning,
  handleLap,
  resetStopwatch,
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-sm">
      <div className={`text-5xl sm:text-6xl font-mono font-bold tracking-tight py-2 ${
        isLight ? "text-slate-900" : "text-white"
      }`}>
        {formatStopwatch(swTime)}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setSwRunning(!swRunning)}
          className={`px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
            swRunning
              ? "bg-rose-600 hover:bg-rose-500 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {swRunning ? <Pause size={18} /> : <Play size={18} />}
          {swRunning ? "Jeda" : "Mulai"}
        </button>

        <button
          onClick={handleLap}
          disabled={!swRunning}
          className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            !swRunning
              ? "opacity-40 cursor-not-allowed border-slate-300"
              : isLight
              ? "bg-white border-slate-300 hover:bg-slate-100 text-slate-800 shadow-xs"
              : "bg-white/10 border-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <Flag size={16} /> Lap
        </button>

        <button
          onClick={resetStopwatch}
          className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
            isLight
              ? "bg-white border-slate-300 hover:bg-slate-100 text-slate-700 shadow-xs"
              : "bg-white/10 border-white/10 hover:bg-white/20 text-zinc-300"
          }`}
          title="Reset"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Laps list */}
      {laps.length > 0 && (
        <div className="w-full max-h-40 overflow-y-auto space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/10 text-xs no-scrollbar">
          {laps.map((lap) => (
            <div
              key={lap.id}
              className={`flex justify-between px-3.5 py-2 rounded-2xl border transition-colors ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/5 text-zinc-300"
              }`}
            >
              <span className="font-semibold">Lap {lap.id}</span>
              <span className="font-mono font-bold">{lap.formatted}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
