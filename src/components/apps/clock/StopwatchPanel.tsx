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
      <div className="text-5xl font-mono font-bold tracking-tight py-4">
        {formatStopwatch(swTime)}
      </div>

      <div className="flex items-center gap-4">
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
              ? "opacity-40 cursor-not-allowed border-zinc-700"
              : isLight
              ? "bg-white border-slate-300 hover:bg-slate-100"
              : "bg-white/10 border-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <Flag size={16} /> Lap
        </button>

        <button
          onClick={resetStopwatch}
          className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
            isLight
              ? "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"
              : "bg-white/10 border-white/10 hover:bg-white/20 text-zinc-300"
          }`}
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Laps list */}
      {laps.length > 0 && (
        <div className="w-full max-h-40 overflow-y-auto space-y-1.5 pt-2 border-t border-white/10 text-xs">
          {laps.map((lap) => (
            <div
              key={lap.id}
              className={`flex justify-between px-3 py-1.5 rounded-xl ${
                isLight ? "bg-slate-200/60 text-slate-800" : "bg-white/5 text-zinc-300"
              }`}
            >
              <span className="font-semibold">Lap {lap.id}</span>
              <span className="font-mono">{lap.formatted}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
