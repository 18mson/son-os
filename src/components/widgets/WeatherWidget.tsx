"use client";

import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";
import { useTranslation, getAppTranslation } from "@/i18n";
import { getWeatherTheme, getWeatherDescription, renderWeatherIcon } from "@/config/weatherTheme";

export const WeatherWidget: React.FC = () => {
  const { t, language } = useTranslation();
  const { openWindow, theme } = useWindowStore();
  const isLight = theme === "light";
  const isEn = language === "en";
  const [temp, setTemp] = useState<number>(32);
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

  const condition = getWeatherDescription(weatherCode, isEn);
  const palette = getWeatherTheme(weatherCode, temp);

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
      className={`group relative p-5 rounded-3xl overflow-hidden [clip-path:inset(0_round_1.5rem)] backdrop-blur-xl transition-all duration-300 cursor-pointer select-none flex flex-col justify-between w-64 h-36 bg-linear-to-br ${
        isLight
          ? `${palette.widgetLightGradient} hover:bg-white/60 text-slate-900 shadow-sm`
          : `${palette.widgetDarkGradient} hover:bg-zinc-950/65 text-zinc-100 shadow-lg`
      }`}
    >
      <div
        className={`flex items-center justify-between transition-colors ${
          isLight ? "text-slate-600 group-hover:text-slate-900" : "text-zinc-400 group-hover:text-white"
        }`}
      >
        <span
          className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${palette.accentText}`}
        >
          <MapPin size={13} /> Jakarta, ID
        </span>
        <div className={`p-1.5 rounded-xl transition-colors ${palette.badgeBg}`}>
          {renderWeatherIcon(weatherCode, 16, isLight)}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <div className="flex items-start">
            <span
              className={`text-4xl font-black tracking-tight leading-none transition-colors ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              {temp}
            </span>
            <span className={`text-xl font-bold ml-0.5 ${palette.accentText}`}>°C</span>
          </div>
          <span
            className={`text-xs font-semibold mt-1 block transition-colors ${
              isLight ? "text-slate-700" : "text-zinc-300"
            }`}
          >
            {condition}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {renderWeatherIcon(weatherCode, 26, isLight)}
        </div>
      </div>
    </div>
  );
};
