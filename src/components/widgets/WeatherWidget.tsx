"use client";

import React, { useState, useEffect } from "react";
import { Sun, CloudSun, MapPin } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";
import { useTranslation, getAppTranslation } from "@/i18n";

const getWeatherDesc = (code: number, isEn: boolean) => {
  if (code === 0) return isEn ? "Clear Sky" : "Cerah";
  if (code === 1 || code === 2) return isEn ? "Partly Cloudy" : "Cerah Berawan";
  if (code === 3) return isEn ? "Overcast" : "Berawan";
  if (code >= 51 && code <= 67) return isEn ? "Light Rain" : "Hujan Ringan";
  if (code >= 80 && code <= 82) return isEn ? "Heavy Rain" : "Hujan Lebat";
  if (code >= 95) return isEn ? "Thunderstorm" : "Badai Petir";
  if (code >= 71) return isEn ? "Snow" : "Salju";
  return isEn ? "Clear" : "Cerah";
};

export const WeatherWidget: React.FC = () => {
  const { t, language } = useTranslation();
  const { openWindow, theme } = useWindowStore();
  const isLight = theme === "light";
  const [temp, setTemp] = useState<number>(29);
  const [weatherCode, setWeatherCode] = useState<number>(1);

  useEffect(() => {
    // Fetch real weather from Open-Meteo or fallback
    fetch("https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&current_weather=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.current_weather?.temperature !== undefined) {
          setTemp(Math.round(data.current_weather.temperature));
        }
        if (data.current_weather?.weathercode !== undefined) {
          setWeatherCode(data.current_weather.weathercode);
        }
      })
      .catch(() => {
        // Fallback to default mockup data if offline
      });
  }, []);

  const condition = getWeatherDesc(weatherCode, language === "en");

  const handleClick = () => {
    const weatherApp = APPS.find((a) => a.id === "weather");
    if (weatherApp) {
      const appMeta = getAppTranslation("weather", language);
      openWindow({ ...weatherApp, title: appMeta?.title || weatherApp.title });
    }
  };

  return (
    <div
      data-widget
      onClick={handleClick}
      title={t.widgets.weather.openTooltip}
      className={`group relative p-5 rounded-3xl overflow-hidden [clip-path:inset(0_round_1.5rem)] backdrop-blur-xl transition-colors duration-300 cursor-pointer select-none flex flex-col justify-between w-64 h-36 shadow-none ${
        isLight
          ? "bg-white/45 hover:bg-white/55 border border-white/70 text-slate-900"
          : "bg-zinc-950/45 hover:bg-zinc-950/55 border border-white/15 text-zinc-100"
      }`}
    >
      <div className={`flex items-center justify-between transition-colors ${
        isLight ? "text-slate-600 group-hover:text-slate-900" : "text-zinc-400 group-hover:text-white"
      }`}>
        <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          isLight ? "text-amber-600" : "text-amber-400"
        }`}>
          <MapPin size={13} /> Jakarta, ID
        </span>
        <div className={`p-1 rounded-xl ${
          isLight ? "bg-amber-100 text-amber-600" : "bg-amber-500/20 text-amber-400"
        }`}>
          <Sun size={16} className="animate-spin-slow" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <div className="flex items-start">
            <span className={`text-4xl font-black tracking-tight leading-none transition-colors ${
              isLight ? "text-slate-900 group-hover:text-amber-700" : "text-white group-hover:text-amber-200"
            }`}>
              {temp}
            </span>
            <span className={`text-xl font-bold ml-0.5 ${isLight ? "text-amber-600" : "text-amber-400"}`}>°C</span>
          </div>
          <span className={`text-xs font-medium mt-1 block transition-colors ${
            isLight ? "text-slate-600 group-hover:text-slate-800" : "text-zinc-400 group-hover:text-zinc-300"
          }`}>
            {condition}
          </span>
        </div>

        <div className={`flex items-center gap-1 text-[11px] font-medium ${
          isLight ? "text-slate-600" : "text-zinc-400"
        }`}>
          <CloudSun size={18} className={isLight ? "text-amber-500" : "text-amber-300"} />
        </div>
      </div>
    </div>
  );
};
