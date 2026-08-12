"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock as ClockIcon, Timer as TimerIcon, Watch } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useSettingsStore } from "@/store/settingsStore";
import { StopwatchPanel } from "./clock/StopwatchPanel";
import { TimerPanel } from "./clock/TimerPanel";

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

  // Clock State
  const [time, setTime] = useState<Date | null>(() => (typeof window !== "undefined" ? new Date() : null));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Stopwatch State
  const [swRunning, setSwRunning] = useState<boolean>(false);
  const [swTime, setSwTime] = useState<number>(0);
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
  }, [swRunning, swTime]);

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

  // Timer State
  const [timerInput, setTimerInput] = useState<{ m: number; s: number }>({ m: 1, s: 0 });
  const [timerLeft, setTimerLeft] = useState<number>(60);
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

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerDone(false);
    setTimerLeft(timerInput.m * 60 + timerInput.s);
  };

  const handleTimerInputChange = (newInput: { m: number; s: number }) => {
    setTimerInput(newInput);
    if (!timerRunning) {
      setTimerLeft(newInput.m * 60 + newInput.s);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex flex-col h-full w-full select-none font-sans overflow-hidden ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Top Tab Bar */}
      <div className={`px-4 py-2 border-b flex items-center justify-center gap-2 shrink-0 ${
        isLight ? "bg-slate-200/90 border-slate-300" : "bg-zinc-900/90 border-white/10"
      }`}>
        <button
          onClick={() => setActiveTab("clock")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "clock"
              ? "bg-blue-600 text-white shadow-sm"
              : isLight ? "hover:bg-slate-300 text-slate-700" : "hover:bg-white/10 text-zinc-300"
          }`}
        >
          <ClockIcon size={15} /> Jam Dunia
        </button>

        <button
          onClick={() => setActiveTab("stopwatch")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "stopwatch"
              ? "bg-blue-600 text-white shadow-sm"
              : isLight ? "hover:bg-slate-300 text-slate-700" : "hover:bg-white/10 text-zinc-300"
          }`}
        >
          <Watch size={15} /> Stopwatch
        </button>

        <button
          onClick={() => setActiveTab("timer")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "timer"
              ? "bg-blue-600 text-white shadow-sm"
              : isLight ? "hover:bg-slate-300 text-slate-700" : "hover:bg-white/10 text-zinc-300"
          }`}
        >
          <TimerIcon size={15} /> Timer
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        {activeTab === "clock" && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="text-6xl font-mono font-bold tracking-tight text-blue-500">
              {time ? (
                time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: clockFormat === "12h",
                })
              ) : (
                "00:00:00"
              )}
            </div>
            <p className={`text-sm font-medium ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
              {time ? (
                time.toLocaleDateString([], {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              ) : (
                ""
              )}
            </p>
            <div className="pt-4 flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Waktu Lokal (WIB / GMT+7)
            </div>
          </div>
        )}

        {activeTab === "stopwatch" && (
          <StopwatchPanel
            isLight={isLight}
            swTime={swTime}
            swRunning={swRunning}
            laps={laps}
            formatStopwatch={formatStopwatch}
            setSwRunning={setSwRunning}
            handleLap={handleLap}
            resetStopwatch={resetStopwatch}
          />
        )}

        {activeTab === "timer" && (
          <TimerPanel
            isLight={isLight}
            timerRunning={timerRunning}
            timerDone={timerDone}
            timerLeft={timerLeft}
            timerInput={timerInput}
            onTimerInputChange={handleTimerInputChange}
            setTimerRunning={setTimerRunning}
            resetTimer={resetTimer}
            formatTimer={formatTimer}
          />
        )}
      </div>
    </div>
  );
};
