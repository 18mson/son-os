import React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerPanelProps {
  isLight: boolean;
  timerRunning: boolean;
  timerDone: boolean;
  timerLeft: number;
  timerInput: { m: number; s: number };
  onTimerInputChange: (input: { m: number; s: number }) => void;
  setTimerRunning: (v: boolean) => void;
  resetTimer: () => void;
  formatTimer: (seconds: number) => string;
}

export const TimerPanel: React.FC<TimerPanelProps> = ({
  isLight,
  timerRunning,
  timerDone,
  timerLeft,
  timerInput,
  onTimerInputChange,
  setTimerRunning,
  resetTimer,
  formatTimer,
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-sm">
      {timerDone ? (
        <div className="text-center space-y-2 animate-bounce">
          <div className="text-4xl sm:text-5xl font-black text-amber-500">Waktu Habis!</div>
          <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>Timer telah selesai.</p>
        </div>
      ) : (
        <div className={`text-5xl sm:text-6xl font-mono font-bold tracking-tight py-2 ${
          isLight ? "text-slate-900" : "text-white"
        }`}>
          {formatTimer(timerLeft)}
        </div>
      )}

      {!timerRunning && !timerDone && (
        <div className={`flex items-center gap-3 text-xs font-semibold p-3.5 rounded-2xl border transition-all ${
          isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
        }`}>
          <div className="flex flex-col items-center gap-1">
            <span className={isLight ? "text-slate-500 font-bold" : "text-zinc-400"}>Menit</span>
            <input
              type="number"
              min={0}
              max={59}
              value={timerInput.m}
              onChange={(e) =>
                onTimerInputChange({
                  ...timerInput,
                  m: Math.max(0, parseInt(e.target.value) || 0),
                })
              }
              className={`w-16 p-2 rounded-xl text-center font-bold text-base border outline-hidden transition-colors ${
                isLight ? "bg-white border-slate-300 text-slate-900 shadow-xs" : "bg-white/10 border-white/15 text-white"
              }`}
            />
          </div>
          <span className="text-2xl pt-4 text-slate-400 font-bold">:</span>
          <div className="flex flex-col items-center gap-1">
            <span className={isLight ? "text-slate-500 font-bold" : "text-zinc-400"}>Detik</span>
            <input
              type="number"
              min={0}
              max={59}
              value={timerInput.s}
              onChange={(e) =>
                onTimerInputChange({
                  ...timerInput,
                  s: Math.max(0, parseInt(e.target.value) || 0),
                })
              }
              className={`w-16 p-2 rounded-xl text-center font-bold text-base border outline-hidden transition-colors ${
                isLight ? "bg-white border-slate-300 text-slate-900 shadow-xs" : "bg-white/10 border-white/15 text-white"
              }`}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => setTimerRunning(!timerRunning)}
          disabled={timerLeft <= 0}
          className={`px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
            timerRunning
              ? "bg-rose-600 hover:bg-rose-500 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {timerRunning ? <Pause size={18} /> : <Play size={18} />}
          {timerRunning ? "Jeda" : "Mulai"}
        </button>

        <button
          onClick={resetTimer}
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
    </div>
  );
};
