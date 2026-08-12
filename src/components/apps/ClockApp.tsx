"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock as ClockIcon, Timer as TimerIcon, Watch, Play, Pause, RotateCcw, Flag } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useSettingsStore } from "@/store/settingsStore";

type ClockTab = "clock" | "stopwatch" | "timer";

interface Lap {
  id: number;
  time: number;
  formatted: string;
}

export const ClockApp: React.FC = () => {
  const { theme } = useWindowStore();
  const clockFormat = useSettingsStore((s) => s.clockFormat);
  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<ClockTab>("clock");

  // --- 1. Clock State ---
  const [time, setTime] = useState<Date | null>(() => (typeof window !== "undefined" ? new Date() : null));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. Stopwatch State ---
  const [swRunning, setSwRunning] = useState<boolean>(false);
  const [swTime, setSwTime] = useState<number>(0); // in ms
  const [laps, setLaps] = useState<Lap[]>([]);
  const swRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (swRunning) {
      const startTime = Date.now() - swTime;
      swRef.current = setInterval(() => {
        setSwTime(Date.now() - startTime);
      }, 10);
    } else if (swRef.current) {
      clearInterval(swRef.current);
    }
    return () => {
      if (swRef.current) clearInterval(swRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swRunning]);

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${hundredths.toString().padStart(2, "0")}`;
  };

  const handleLap = () => {
    if (!swRunning) return;
    setLaps((prev) => [
      { id: prev.length + 1, time: swTime, formatted: formatStopwatch(swTime) },
      ...prev,
    ]);
  };

  const resetStopwatch = () => {
    setSwRunning(false);
    setSwTime(0);
    setLaps([]);
  };

  // --- 3. Timer State ---
  const [timerInput, setTimerInput] = useState<{ m: number; s: number }>({ m: 1, s: 0 });
  const [timerLeft, setTimerLeft] = useState<number>(60); // in seconds
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerDone, setTimerDone] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRunning && timerLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimerLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            setTimerDone(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerLeft]);

  const startTimer = () => {
    if (timerLeft <= 0) {
      const total = timerInput.m * 60 + timerInput.s;
      if (total <= 0) return;
      setTimerLeft(total);
    }
    setTimerDone(false);
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerDone(false);
    const total = timerInput.m * 60 + timerInput.s;
    setTimerLeft(total);
  };

  const addPresetTime = (sec: number) => {
    setTimerRunning(false);
    setTimerDone(false);
    const newTotal = (timerLeft > 0 ? timerLeft : 0) + sec;
    setTimerLeft(newTotal);
    setTimerInput({ m: Math.floor(newTotal / 60), s: newTotal % 60 });
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Analog Clock Math
  const secondsDeg = time ? time.getSeconds() * 6 : 0;
  const minutesDeg = time ? time.getMinutes() * 6 + secondsDeg / 60 : 0;
  const hoursDeg = time ? (time.getHours() % 12) * 30 + minutesDeg / 12 : 0;

  return (
    <div className={`flex flex-col h-full select-none ${isLight ? "bg-slate-50 text-slate-900" : "bg-zinc-950 text-zinc-100"}`}>
      {/* Navigation Tabs */}
      <div className={`flex items-center justify-center gap-2 p-1.5 border rounded-xl mb-4 shrink-0 ${
        isLight ? "bg-slate-200/80 border-slate-300" : "bg-zinc-900/80 border-white/10"
      }`}>
        <button
          onClick={() => setActiveTab("clock")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-9 ${
            activeTab === "clock"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-300/60" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          }`}
        >
          <ClockIcon size={14} /> Jam
        </button>
        <button
          onClick={() => setActiveTab("stopwatch")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-9 ${
            activeTab === "stopwatch"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-300/60" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          }`}
        >
          <Watch size={14} /> Stopwatch
        </button>
        <button
          onClick={() => setActiveTab("timer")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-9 ${
            activeTab === "timer"
              ? "bg-blue-600 text-white shadow-md"
              : isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-300/60" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          }`}
        >
          <TimerIcon size={14} /> Timer
        </button>
      </div>

      {/* TAB 1: CLOCK */}
      {activeTab === "clock" && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
          {/* Analog Clock Display */}
          <div className={`relative w-44 h-44 rounded-full border-4 shadow-2xl flex items-center justify-center ${
            isLight ? "border-slate-300 bg-white" : "border-zinc-800 bg-zinc-900"
          }`}>
            {/* Hour markers */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                style={{ transform: `rotate(${deg}deg)` }}
                className="absolute inset-2 flex justify-center"
              >
                <div className={`w-1 h-2.5 rounded-full ${isLight ? "bg-slate-400" : "bg-zinc-600"}`} />
              </div>
            ))}
            {/* Hour hand */}
            <div
              style={{ transform: `rotate(${hoursDeg}deg)` }}
              className={`absolute w-1.5 h-12 rounded-full origin-bottom top-10 shadow-md ${isLight ? "bg-slate-800" : "bg-zinc-100"}`}
            />
            {/* Minute hand */}
            <div
              style={{ transform: `rotate(${minutesDeg}deg)` }}
              className="absolute w-1 h-16 bg-blue-500 rounded-full origin-bottom top-6 shadow-md"
            />
            {/* Second hand */}
            <div
              style={{ transform: `rotate(${secondsDeg}deg)` }}
              className="absolute w-0.5 h-18 bg-rose-500 rounded-full origin-bottom top-4 transition-transform duration-100"
            />
            {/* Center dot */}
            <div className="w-3 h-3 rounded-full bg-white border-2 border-rose-500 z-10" />
          </div>

          {/* Digital Clock Display */}
          <div className="text-center space-y-1">
            <h2 className={`text-4xl font-extrabold tracking-tight font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              {time ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: clockFormat === "12h" }) : "--:--:--"}
            </h2>
            <p className={`text-sm font-medium ${isLight ? "text-blue-600" : "text-blue-400"}`}>
              {time ? time.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : ""}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: STOPWATCH */}
      {activeTab === "stopwatch" && (
        <div className="flex-1 flex flex-col items-center justify-between p-4 space-y-4">
          <div className="my-auto text-center space-y-2">
            <span className={`text-5xl font-black font-mono tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              {formatStopwatch(swTime)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3 w-full max-w-xs">
            <button
              onClick={() => setSwRunning(!swRunning)}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all min-h-11 ${
                swRunning
                  ? "bg-amber-500/20 text-amber-600 border border-amber-500/30 hover:bg-amber-500/30"
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30"
              }`}
            >
              {swRunning ? <Pause size={18} /> : <Play size={18} />}
              {swRunning ? "Pause" : "Start"}
            </button>

            <button
              onClick={handleLap}
              disabled={!swRunning}
              className={`p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-11 min-w-11 ${
                isLight ? "bg-slate-200 text-slate-800 hover:bg-slate-300" : "bg-white/10 text-zinc-200 hover:bg-white/15"
              }`}
              title="Lap"
            >
              <Flag size={18} />
            </button>

            <button
              onClick={resetStopwatch}
              disabled={swTime === 0}
              className="p-3 rounded-xl bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 border border-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-11 min-w-11"
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Laps List */}
          {laps.length > 0 && (
            <div className={`w-full max-w-md h-32 overflow-y-auto rounded-xl p-2 space-y-1 border ${
              isLight ? "bg-white border-slate-200" : "bg-zinc-900/90 border-white/10"
            }`}>
              {laps.map((lap) => (
                <div
                  key={lap.id}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono border ${
                    isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/5"
                  }`}
                >
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Lap {lap.id}</span>
                  <span className={`font-semibold ${isLight ? "text-slate-900" : "text-zinc-100"}`}>{lap.formatted}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TIMER */}
      {activeTab === "timer" && (
        <div className="flex-1 flex flex-col items-center justify-between p-4 space-y-4">
          <div className="my-auto text-center space-y-3">
            <span className={`text-5xl font-black font-mono tracking-tight ${
              timerDone ? "text-rose-500 animate-pulse" : isLight ? "text-slate-900" : "text-white"
            }`}>
              {formatSeconds(timerLeft)}
            </span>
            {timerDone && (
              <p className="text-xs font-bold text-rose-500 uppercase tracking-widest animate-bounce">
                ⏰ Waktu Habis!
              </p>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => addPresetTime(60)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                isLight ? "bg-slate-200 hover:bg-slate-300 text-slate-800" : "bg-white/10 hover:bg-white/15 text-zinc-200"
              }`}
            >
              +1m
            </button>
            <button
              onClick={() => addPresetTime(300)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                isLight ? "bg-slate-200 hover:bg-slate-300 text-slate-800" : "bg-white/10 hover:bg-white/15 text-zinc-200"
              }`}
            >
              +5m
            </button>
            <button
              onClick={() => addPresetTime(600)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                isLight ? "bg-slate-200 hover:bg-slate-300 text-slate-800" : "bg-white/10 hover:bg-white/15 text-zinc-200"
              }`}
            >
              +10m
            </button>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3 w-full max-w-xs">
            {timerRunning ? (
              <button
                onClick={pauseTimer}
                className="flex-1 py-3 rounded-xl bg-amber-500/20 text-amber-600 border border-amber-500/30 hover:bg-amber-500/30 font-semibold text-sm flex items-center justify-center gap-2 transition-all min-h-11"
              >
                <Pause size={18} /> Pause
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all min-h-11"
              >
                <Play size={18} /> Start
              </button>
            )}

            <button
              onClick={resetTimer}
              className={`p-3 rounded-xl transition-all min-h-11 min-w-11 ${
                isLight ? "bg-slate-200 text-slate-800 hover:bg-slate-300" : "bg-white/10 text-zinc-200 hover:bg-white/15"
              }`}
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
