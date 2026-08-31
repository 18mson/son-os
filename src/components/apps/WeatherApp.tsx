"use client";

import React, { useState, useEffect } from "react";
import { Wind, Droplets, MapPin, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useWindowStore } from "@/store/windowStore";
import { getWeatherTheme, getWeatherDescription, renderWeatherIcon } from "@/config/weatherTheme";

interface CityPreset {
  name: string;
  lat: number;
  lon: number;
  country: string;
}

const CITIES: CityPreset[] = [
  { name: "Jakarta", lat: -6.2088, lon: 106.8456, country: "Indonesia" },
  { name: "Surabaya", lat: -7.2575, lon: 112.7521, country: "Indonesia" },
  { name: "Bandung", lat: -6.9175, lon: 107.6191, country: "Indonesia" },
  { name: "Bali (Denpasar)", lat: -8.6705, lon: 115.2126, country: "Indonesia" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, country: "Japan" },
  { name: "London", lat: 51.5074, lon: -0.1278, country: "UK" },
  { name: "New York", lat: 40.7128, lon: -74.006, country: "USA" },
];

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  daily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    code: number;
  }>;
}

export const WeatherApp: React.FC = () => {
  const { language } = useTranslation();
  const { theme } = useWindowStore();
  const isLight = theme === "light";
  const isEn = language === "en";

  const [selectedCity, setSelectedCity] = useState<CityPreset>(CITIES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.current && json.daily) {
            const dailyArr = json.daily.time.slice(0, 5).map((t: string, idx: number) => ({
              date: t,
              maxTemp: Math.round(json.daily.temperature_2m_max[idx]),
              minTemp: Math.round(json.daily.temperature_2m_min[idx]),
              code: json.daily.weather_code[idx],
            }));

            setWeather({
              temp: Math.round(json.current.temperature_2m),
              feelsLike: Math.round(json.current.apparent_temperature),
              humidity: json.current.relative_humidity_2m,
              windSpeed: Math.round(json.current.wind_speed_10m),
              weatherCode: json.current.weather_code,
              daily: dailyArr,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch weather:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  const palette = getWeatherTheme(weather?.weatherCode ?? 1, weather?.temp);

  return (
    <div
      className={`flex flex-col h-full select-none p-4 sm:p-5 justify-between font-sans transition-colors rounded-lg ${
        isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
      }`}
    >
      {/* Header & City Selection Pill */}
      <div
        className={`flex items-center justify-between border-b pb-3 gap-2 shrink-0 ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}
      >
        <div className={`flex items-center gap-1.5 font-bold text-xs sm:text-sm ${palette.accentText}`}>
          <MapPin size={16} />
          <span>
            {selectedCity.name}, {selectedCity.country}
          </span>
        </div>

        {/* City Select Pill */}
        <select
          value={selectedCity.name}
          onChange={(e) => {
            const found = CITIES.find((c) => c.name === e.target.value);
            if (found) setSelectedCity(found);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden cursor-pointer transition-colors ${
            isLight
              ? "bg-white border border-slate-300 text-slate-800 shadow-xs"
              : "bg-white/10 border border-white/10 text-white"
          }`}
        >
          {CITIES.map((c) => (
            <option
              key={c.name}
              value={c.name}
              className={isLight ? "bg-white text-slate-900" : "bg-zinc-900 text-white"}
            >
              {c.name} ({c.country})
            </option>
          ))}
        </select>
      </div>

      {/* Main Weather Card */}
      {loading ? (
        <div
          className={`flex flex-col items-center justify-center flex-1 py-12 gap-2 ${
            isLight ? "text-slate-500" : "text-zinc-400"
          }`}
        >
          <Loader2 className={`animate-spin ${palette.accentText}`} size={32} />
          <span className="text-xs font-medium">{isEn ? "Loading Weather..." : "Memuat Cuaca..."}</span>
        </div>
      ) : weather ? (
        <div className="flex-1 flex flex-col justify-center my-3 space-y-4">
          <div
            className={`flex items-center justify-between p-5 sm:p-6 rounded-3xl border shadow-lg transition-all ${
              isLight ? palette.cardLightGradient : palette.cardDarkGradient
            }`}
          >
            <div>
              <div className="flex items-start">
                <span
                  className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {weather.temp}
                </span>
                <span className={`text-2xl font-bold ml-0.5 ${palette.accentText}`}>°C</span>
              </div>
              <p className={`text-xs font-bold mt-1 ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
                {getWeatherDescription(weather.weatherCode, isEn)}
              </p>
              <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                {isEn ? "Feels like" : "Terasa seperti"} {weather.feelsLike}°C
              </p>
            </div>

            <div className="flex flex-col items-center p-2">
              {renderWeatherIcon(weather.weatherCode, 52, isLight)}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                isLight ? "bg-white border-slate-200 shadow-xs" : "bg-white/5 border-white/10"
              }`}
            >
              <Droplets className="text-blue-500 shrink-0" size={20} />
              <div>
                <span
                  className={`text-[10px] uppercase font-mono block ${
                    isLight ? "text-slate-500 font-semibold" : "text-zinc-400"
                  }`}
                >
                  {isEn ? "Humidity" : "Kelembapan"}
                </span>
                <span
                  className={`text-sm font-bold font-mono ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {weather.humidity}%
                </span>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                isLight ? "bg-white border-slate-200 shadow-xs" : "bg-white/5 border-white/10"
              }`}
            >
              <Wind className="text-cyan-500 shrink-0" size={20} />
              <div>
                <span
                  className={`text-[10px] uppercase font-mono block ${
                    isLight ? "text-slate-500 font-semibold" : "text-zinc-400"
                  }`}
                >
                  {isEn ? "Wind" : "Angin"}
                </span>
                <span
                  className={`text-sm font-bold font-mono ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {weather.windSpeed} km/h
                </span>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Grid */}
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                isLight ? "text-slate-600" : "text-zinc-400"
              }`}
            >
              {isEn ? "5-Day Forecast" : "Prakiraan 5 Hari"}
            </span>
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {weather.daily.map((d, idx) => {
                const dateObj = new Date(d.date);
                const dayName =
                  idx === 0
                    ? isEn
                      ? "Today"
                      : "Hari Ini"
                    : dateObj.toLocaleDateString(isEn ? "en-US" : "id-ID", { weekday: "short" });
                return (
                  <div
                    key={d.date}
                    className={`flex flex-col items-center p-1.5 sm:p-2.5 rounded-2xl border text-center transition-colors ${
                      isLight
                        ? "bg-white border-slate-200 shadow-xs"
                        : "bg-white/5 border-white/5"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-semibold truncate w-full ${
                        isLight ? "text-slate-600" : "text-zinc-400"
                      }`}
                    >
                      {dayName}
                    </span>
                    <div className="my-1 sm:my-1.5">{renderWeatherIcon(d.code, 18, isLight)}</div>
                    <span
                      className={`text-xs font-bold font-mono ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {d.maxTemp}°
                    </span>
                    <span
                      className={`text-[9px] font-mono ${
                        isLight ? "text-slate-400" : "text-zinc-500"
                      }`}
                    >
                      {d.minTemp}°
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className={`text-center py-12 text-xs ${isLight ? "text-slate-500" : "text-zinc-500"}`}>
          {isEn ? "Failed to load weather data." : "Gagal memuat data cuaca."}
        </div>
      )}
    </div>
  );
};
