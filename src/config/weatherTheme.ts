import React from "react";
import { Sun, Cloud, CloudSun, CloudRain, CloudLightning, Snowflake } from "lucide-react";

export interface WeatherThemePalette {
  name: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  cardLightGradient: string;
  cardDarkGradient: string;
  widgetLightGradient: string;
  widgetDarkGradient: string;
  iconColor: string;
}

export const getWeatherTheme = (code: number, temp?: number): WeatherThemePalette => {
  // Freezing / Snow
  if (code >= 71 || (temp !== undefined && temp <= 4)) {
    return {
      name: "snow",
      accentText: "text-cyan-700 dark:text-cyan-300",
      accentBg: "bg-cyan-500/20",
      accentBorder: "border-cyan-500/30",
      badgeBg: "bg-cyan-100/90 dark:bg-cyan-500/20",
      badgeText: "text-cyan-800 dark:text-cyan-300",
      cardLightGradient: "bg-linear-to-br from-cyan-500/20 via-sky-500/10 to-white border-cyan-200/80 shadow-cyan-500/5",
      cardDarkGradient: "bg-linear-to-br from-cyan-950/50 via-teal-950/30 to-zinc-900 border-cyan-500/20 shadow-cyan-500/5",
      widgetLightGradient: "from-cyan-500/15 via-white/50 to-white/70 border-cyan-300/40",
      widgetDarkGradient: "from-cyan-950/40 via-zinc-950/50 to-zinc-950/60 border-cyan-500/20",
      iconColor: "text-cyan-600 dark:text-cyan-400",
    };
  }

  // Thunderstorm
  if (code >= 95) {
    return {
      name: "thunderstorm",
      accentText: "text-purple-700 dark:text-purple-300",
      accentBg: "bg-purple-500/20",
      accentBorder: "border-purple-500/30",
      badgeBg: "bg-purple-100/90 dark:bg-purple-500/20",
      badgeText: "text-purple-800 dark:text-purple-300",
      cardLightGradient: "bg-linear-to-br from-purple-500/20 via-amber-500/10 to-white border-purple-200/80 shadow-purple-500/5",
      cardDarkGradient: "bg-linear-to-br from-purple-950/60 via-indigo-950/40 to-zinc-900 border-purple-500/20 shadow-purple-500/5",
      widgetLightGradient: "from-purple-500/15 via-white/50 to-white/70 border-purple-300/40",
      widgetDarkGradient: "from-purple-950/40 via-zinc-950/50 to-zinc-950/60 border-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    };
  }

  // Rain / Heavy Rain
  if (code >= 51 && code <= 82) {
    return {
      name: "rain",
      accentText: "text-blue-700 dark:text-blue-300",
      accentBg: "bg-blue-500/20",
      accentBorder: "border-blue-500/30",
      badgeBg: "bg-blue-100/90 dark:bg-blue-500/20",
      badgeText: "text-blue-800 dark:text-blue-300",
      cardLightGradient: "bg-linear-to-br from-blue-500/20 via-cyan-500/10 to-white border-blue-200/80 shadow-blue-500/5",
      cardDarkGradient: "bg-linear-to-br from-blue-950/60 via-indigo-950/40 to-zinc-900 border-blue-500/20 shadow-blue-500/5",
      widgetLightGradient: "from-blue-500/15 via-white/50 to-white/70 border-blue-300/40",
      widgetDarkGradient: "from-blue-950/40 via-zinc-950/50 to-zinc-950/60 border-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    };
  }

  // Overcast
  if (code === 3) {
    return {
      name: "overcast",
      accentText: "text-slate-700 dark:text-slate-300",
      accentBg: "bg-slate-500/20",
      accentBorder: "border-slate-500/30",
      badgeBg: "bg-slate-200/90 dark:bg-slate-800",
      badgeText: "text-slate-800 dark:text-slate-300",
      cardLightGradient: "bg-linear-to-br from-slate-400/20 via-zinc-300/15 to-white border-slate-300/80 shadow-slate-500/5",
      cardDarkGradient: "bg-linear-to-br from-slate-800/50 via-zinc-800/40 to-zinc-900 border-slate-700/50 shadow-black/20",
      widgetLightGradient: "from-slate-400/15 via-white/50 to-white/70 border-slate-300/40",
      widgetDarkGradient: "from-slate-900/50 via-zinc-950/50 to-zinc-950/60 border-slate-700/30",
      iconColor: "text-slate-600 dark:text-slate-400",
    };
  }

  // Sunny / Clear or Hot (temp >= 28°C)
  if (code === 0 || (temp !== undefined && temp >= 28)) {
    return {
      name: "sunny-hot",
      accentText: "text-amber-700 dark:text-amber-400",
      accentBg: "bg-amber-500/20",
      accentBorder: "border-amber-500/30",
      badgeBg: "bg-amber-100/90 dark:bg-amber-500/20",
      badgeText: "text-amber-800 dark:text-amber-300",
      cardLightGradient: "bg-linear-to-br from-amber-500/20 via-orange-500/10 to-white border-amber-200/80 shadow-amber-500/5",
      cardDarkGradient: "bg-linear-to-br from-amber-950/50 via-orange-950/30 to-zinc-900 border-amber-500/25 shadow-amber-500/5",
      widgetLightGradient: "from-amber-500/15 via-white/50 to-white/70 border-amber-300/40",
      widgetDarkGradient: "from-amber-950/40 via-zinc-950/50 to-zinc-950/60 border-amber-500/25",
      iconColor: "text-amber-600 dark:text-amber-400",
    };
  }

  // Partly Cloudy / Mild (code 1, 2)
  return {
    name: "partly-cloudy",
    accentText: "text-amber-700 dark:text-amber-400",
    accentBg: "bg-amber-500/20",
    accentBorder: "border-amber-500/30",
    badgeBg: "bg-amber-100/90 dark:bg-amber-500/20",
    badgeText: "text-amber-800 dark:text-amber-300",
    cardLightGradient: "bg-linear-to-br from-amber-500/15 via-sky-500/10 to-white border-amber-200/80 shadow-amber-500/5",
    cardDarkGradient: "bg-linear-to-br from-amber-950/40 via-sky-950/30 to-zinc-900 border-amber-500/20 shadow-amber-500/5",
    widgetLightGradient: "from-amber-500/15 via-white/50 to-white/70 border-amber-300/40",
    widgetDarkGradient: "from-amber-950/35 via-zinc-950/50 to-zinc-950/60 border-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  };
};

export const getWeatherDescription = (code: number, isEn: boolean): string => {
  if (code === 0) return isEn ? "Clear Sky" : "Cerah";
  if (code === 1 || code === 2) return isEn ? "Partly Cloudy" : "Cerah Berawan";
  if (code === 3) return isEn ? "Overcast" : "Berawan";
  if (code >= 51 && code <= 67) return isEn ? "Light Rain" : "Hujan Ringan";
  if (code >= 80 && code <= 82) return isEn ? "Heavy Rain" : "Hujan Lebat";
  if (code >= 95) return isEn ? "Thunderstorm" : "Badai Petir";
  if (code >= 71) return isEn ? "Snow" : "Salju";
  return isEn ? "Clear" : "Cerah";
};

export const renderWeatherIcon = (code: number, size: number = 24, isLight: boolean = false): React.ReactNode => {
  const amberClass = isLight ? "text-amber-600" : "text-amber-400";
  const blueClass = isLight ? "text-blue-600" : "text-blue-400";
  const cyanClass = isLight ? "text-cyan-600" : "text-cyan-400";
  const purpleClass = isLight ? "text-purple-600" : "text-purple-400";

  if (code === 0) return React.createElement(Sun, { size, className: amberClass });
  if (code === 1 || code === 2) return React.createElement(CloudSun, { size, className: amberClass });
  if (code === 3) return React.createElement(Cloud, { size, className: isLight ? "text-slate-600" : "text-slate-400" });
  if (code >= 51 && code <= 67) return React.createElement(CloudRain, { size, className: blueClass });
  if (code >= 80 && code <= 82) return React.createElement(CloudRain, { size, className: cyanClass });
  if (code >= 95) return React.createElement(CloudLightning, { size, className: purpleClass });
  if (code >= 71) return React.createElement(Snowflake, { size, className: isLight ? "text-cyan-600" : "text-cyan-300" });
  return React.createElement(Sun, { size, className: amberClass });
};
