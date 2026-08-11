"use client";

import React, { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Wind, Droplets, MapPin, Loader2 } from "lucide-react";

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

  const getWeatherIcon = (code: number, size: number = 24) => {
    if (code === 0 || code === 1) return <Sun size={size} className="text-amber-400" />;
    if (code === 2 || code === 3) return <Cloud size={size} className="text-zinc-300" />;
    if (code >= 51 && code <= 67) return <CloudRain size={size} className="text-blue-400" />;
    if (code >= 80 && code <= 82) return <CloudRain size={size} className="text-cyan-400" />;
    if (code >= 95) return <CloudLightning size={size} className="text-yellow-400" />;
    if (code >= 71) return <Snowflake size={size} className="text-cyan-200" />;
    return <Sun size={size} className="text-amber-400" />;
  };

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

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none p-4 sm:p-5 justify-between">
      {/* Header & City Selection Pill */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs sm:text-sm">
          <MapPin size={16} />
          <span>{selectedCity.name}, {selectedCity.country}</span>
        </div>

        {/* City Select Pill */}
        <select
          value={selectedCity.name}
          onChange={(e) => {
            const found = CITIES.find((c) => c.name === e.target.value);
            if (found) setSelectedCity(found);
          }}
          className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs text-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden cursor-pointer font-medium"
        >
          {CITIES.map((c) => (
            <option key={c.name} value={c.name} className="bg-zinc-900 text-white">
              {c.name} ({c.country})
            </option>
          ))}
        </select>
      </div>

      {/* Main Weather Card */}
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-zinc-400 gap-2">
          <Loader2 className="animate-spin text-blue-400" size={32} />
          <span className="text-xs font-medium">Memuat Cuaca...</span>
        </div>
      ) : weather ? (
        <div className="flex-1 flex flex-col justify-center my-3 space-y-4">
          <div className="flex items-center justify-between bg-linear-to-br from-blue-900/40 via-indigo-900/30 to-zinc-900 p-5 sm:p-6 rounded-2xl border border-white/10 shadow-lg">
            <div>
              <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-white">
                {weather.temp}°C
              </span>
              <p className="text-xs font-medium text-zinc-300 mt-1">
                {getWeatherDesc(weather.weatherCode)}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Terasa seperti {weather.feelsLike}°C
              </p>
            </div>

            <div className="flex flex-col items-center p-2">
              {getWeatherIcon(weather.weatherCode, 52)}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Droplets className="text-blue-400 shrink-0" size={20} />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Kelembapan</span>
                <span className="text-sm font-bold text-white font-mono">{weather.humidity}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Wind className="text-cyan-400 shrink-0" size={20} />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Angin</span>
                <span className="text-sm font-bold text-white font-mono">{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Grid */}
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Prakiraan 5 Hari
            </span>
            <div className="grid grid-cols-5 gap-2">
              {weather.daily.map((d, idx) => {
                const dateObj = new Date(d.date);
                const dayName = idx === 0 ? "Hari Ini" : dateObj.toLocaleDateString("id-ID", { weekday: "short" });
                return (
                  <div
                    key={d.date}
                    className="flex flex-col items-center p-2 rounded-2xl bg-white/5 border border-white/5 text-center"
                  >
                    <span className="text-[10px] text-zinc-400 font-medium">{dayName}</span>
                    <div className="my-1.5">{getWeatherIcon(d.code, 18)}</div>
                    <span className="text-xs font-bold text-white font-mono">{d.maxTemp}°</span>
                    <span className="text-[9px] text-zinc-500 font-mono">{d.minTemp}°</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500 text-xs">Gagal memuat data cuaca.</div>
      )}
    </div>
  );
};
