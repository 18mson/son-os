"use client";

import React, { useState, useEffect } from "react";
import { Sun, CloudSun, MapPin } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";

const getWeatherDesc = (code: number) => {
  if (code === 0) return "Cerah";
  if (code === 1 || code === 2) return "Cerah Berawan";
  if (code === 3) return "Berawan";
  if (code >= 51 && code <= 67) return "Hujan Ringan";
  if (code >= 80 && code <= 82) return "Hujan Lebat";
  if (code >= 95) return "Badai Petir";
  if (code >= 71) return "Salju";
  return "Cerah";
};

export const WeatherWidget: React.FC = () => {
  const { openWindow } = useWindowStore();
  const [temp, setTemp] = useState<number>(29);
  const [condition, setCondition] = useState<string>("Cerah Berawan");

  useEffect(() => {
    // Fetch real weather from Open-Meteo or fallback
    fetch("https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&current_weather=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.current_weather?.temperature !== undefined) {
          setTemp(Math.round(data.current_weather.temperature));
        }
        if (data.current_weather?.weathercode !== undefined) {
          setCondition(getWeatherDesc(data.current_weather.weathercode));
        }
      })
      .catch(() => {
        // Fallback to default mockup data if offline
      });
  }, []);

  const handleClick = () => {
    const weatherApp = APPS.find((a) => a.id === "weather");
    if (weatherApp) {
      openWindow(weatherApp);
    }
  };

  return (
    <div
      data-widget
      onClick={handleClick}
      title="Buka Aplikasi Cuaca"
      className="group relative p-5 rounded-3xl bg-zinc-950/40 border border-white/10 hover:border-white/25 hover:bg-zinc-950/60 backdrop-blur-xl shadow-2xl transition-all duration-300 cursor-pointer select-none flex flex-col justify-between w-64 h-36 hover:scale-102 hover:-translate-y-1"
    >
      <div className="flex items-center justify-between text-zinc-400 group-hover:text-white transition-colors">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <MapPin size={13} /> Jakarta, ID
        </span>
        <div className="p-1 rounded-xl bg-amber-500/20 text-amber-400">
          <Sun size={16} className="animate-spin-slow" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <div className="flex items-start">
            <span className="text-4xl font-black text-white tracking-tight leading-none group-hover:text-amber-200 transition-colors">
              {temp}
            </span>
            <span className="text-xl font-bold text-amber-400 ml-0.5">°C</span>
          </div>
          <span className="text-xs text-zinc-400 font-medium mt-1 block group-hover:text-zinc-300">
            {condition}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
          <CloudSun size={18} className="text-amber-300" />
        </div>
      </div>
    </div>
  );
};
