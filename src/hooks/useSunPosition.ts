"use client";

import { useState, useEffect } from "react";
import * as SunCalc from "suncalc";

export interface SunPositionState {
  coords: { lat: number; lng: number; isManualOrFallback: boolean };
  sun: {
    altitude: number; // in radians
    azimuth: number; // in radians
    altitudeDeg: number;
    azimuthDeg: number;
    x: number; // 0-100%
    y: number; // 0-100%
    visible: boolean;
  };
  moon: {
    altitude: number;
    azimuth: number;
    altitudeDeg: number;
    azimuthDeg: number;
    x: number;
    y: number;
    visible: boolean;
    opacity: number;
    fraction: number;
  };
  phase: "night" | "sunrise" | "day" | "goldenHour" | "sunset" | "dusk";
  blendWeights: {
    day: number;
    sunset: number;
    night: number;
  };
  shadow: {
    lengthFactor: number;
    skewAngleDeg: number;
    opacity: number;
    scaleX: number;
    scaleY: number;
  };
}

const DEFAULT_COORDS = { lat: -6.2088, lng: 106.8456 }; // Jakarta, Indonesia

/**
 * Calculates 2D screen coordinate (0-100%) for Sun:
 * - Originates high at the TOP-LEFT corner (above cliff & palm tree).
 * - Appears in the sky frame around ~08:30 - 09:00 AM (wallpaper is bright daylight before that).
 * - Traverses diagonally across the sky towards the ocean horizon on the RIGHT at sunset (~18:15).
 */
function calculateSun2D(timeHour: number): {
  x: number;
  y: number;
  progress: number;
  visible: boolean;
} {
  // Full daytime cycle runs from 05:45 (5.75h) to 18:15 (18.25h)
  const dayStart = 5.75;
  const dayEnd = 18.25;
  const dayDuration = dayEnd - dayStart;
  const dayProgress = Math.max(0, Math.min(1, (timeHour - dayStart) / dayDuration));

  // Trajectory: High Top-Left (-5%, 8%) -> Midday (40%, 36%) -> Sunset Ocean Right (85%, 76%)
  const x = -5 + dayProgress * 90;
  const y = 8 + (dayProgress * dayProgress * 0.35 + dayProgress * 0.65) * 68;

  // Sun disc appears in frame around ~08:30 AM (x > 8%) and sets at ~18:15 (18.25h)
  const visible = timeHour >= 8.5 && timeHour <= 18.25 && x >= 8;

  return {
    x: Math.max(8, Math.min(92, x)),
    y: Math.max(8, Math.min(78, y)),
    progress: dayProgress,
    visible,
  };
}

function calculateMoon2D(timeHour: number): {
  x: number;
  y: number;
  progress: number;
  visible: boolean;
} {
  // Nighttime cycle runs from 18:15 (18.25h) to 05:45 (5.75h)
  const nightHour = timeHour >= 18.25 ? timeHour - 18.25 : timeHour + 5.75;
  const nightProgress = Math.max(0, Math.min(1, nightHour / 11.5));

  // Moon Trajectory: High Top-Left (-5%, 8%) -> Midnight (40%, 36%) -> Dawn Ocean Right (85%, 76%)
  const x = -5 + nightProgress * 90;
  const y = 8 + (nightProgress * nightProgress * 0.35 + nightProgress * 0.65) * 68;

  // Moon appears in frame after ~20:30 (x > 8%) and sets at dawn ~05:45
  const isNight = timeHour >= 18.25 || timeHour < 5.75;
  const visible = isNight && (timeHour >= 20.5 || timeHour <= 5.75) && x >= 8;

  return {
    x: Math.max(8, Math.min(92, x)),
    y: Math.max(8, Math.min(78, y)),
    progress: nightProgress,
    visible,
  };
}

export function computeSunState(
  now: Date,
  lat: number,
  lng: number,
  isManualOrFallback: boolean
): SunPositionState {
  const sunPos = SunCalc.getPosition(now, lat, lng);
  const moonPos = SunCalc.getMoonPosition(now, lat, lng);
  const moonIllum = SunCalc.getMoonIllumination(now);

  // In Suncalc, altitude and azimuth from getPosition are in degrees
  const sunAltDeg = sunPos.altitude;
  const sunAzDeg = sunPos.azimuth;
  const moonAltDeg = moonPos.altitude;
  const moonAzDeg = moonPos.azimuth;

  const timeHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const isDaytime = timeHour >= 5.75 && timeHour <= 18.25;

  const sun2D = calculateSun2D(timeHour);
  const moon2D = calculateMoon2D(timeHour);

  let dayWeight = 0;
  let sunsetWeight = 0;
  let nightWeight = 0;
  let phase: SunPositionState["phase"] = "day";

  if (sunAltDeg > 12) {
    // Full Day
    dayWeight = 1;
    sunsetWeight = 0;
    nightWeight = 0;
    phase = "day";
  } else if (sunAltDeg > 0) {
    // Golden Hour / Sunset / Sunrise transition
    const progress = (12 - sunAltDeg) / 12;
    dayWeight = Math.max(0, 1 - progress);
    sunsetWeight = progress;
    nightWeight = 0;
    phase = timeHour >= 12 ? "sunset" : "sunrise";
  } else if (sunAltDeg > -8) {
    // Civil / Nautical Twilight (Dusk / Dawn)
    const progress = (-sunAltDeg) / 8;
    dayWeight = 0;
    sunsetWeight = Math.max(0, 1 - progress);
    nightWeight = progress;
    phase = "dusk";
  } else {
    // Deep Night
    dayWeight = 0;
    sunsetWeight = 0;
    nightWeight = 1;
    phase = "night";
  }

  // Moon opacity fades gracefully during subuh/dawn (04:00 - 05:45) and evening (20:00 - 21:30)
  let moonOpacity = 1;
  if (timeHour >= 4.0 && timeHour <= 5.75) {
    const dawnProgress = (5.75 - timeHour) / (5.75 - 4.0);
    moonOpacity = Math.max(0, Math.min(1, dawnProgress));
  } else if (timeHour >= 20.0 && timeHour <= 21.5) {
    const eveningProgress = (timeHour - 20.0) / (21.5 - 20.0);
    moonOpacity = Math.max(0, Math.min(1, eveningProgress));
  } else if (timeHour > 5.75 && timeHour < 20.0) {
    moonOpacity = 0;
  }

  // Realistic subtle palm tree shadow adapting to sun angle
  const clampedSunAlt = Math.max(0.1, Math.sin(Math.max(0, (sunAltDeg * Math.PI) / 180)));
  const lengthFactor = Math.min(1.8, Math.max(0.3, 0.45 / clampedSunAlt));
  // Morning (sun top-left): shadow casts right (+). Afternoon (sun right): shadow casts left (-)
  const skewAngleDeg = (0.5 - sun2D.progress) * 28;
  const shadowOpacity = isDaytime && sun2D.visible ? Math.max(0, Math.min(0.45, (sunAltDeg / 15) * 0.45)) : 0;

  return {
    coords: { lat, lng, isManualOrFallback },
    sun: {
      altitude: (sunAltDeg * Math.PI) / 180,
      azimuth: (sunAzDeg * Math.PI) / 180,
      altitudeDeg: sunAltDeg,
      azimuthDeg: sunAzDeg,
      x: sun2D.x,
      y: sun2D.y,
      visible: sun2D.visible,
    },
    moon: {
      altitude: (moonAltDeg * Math.PI) / 180,
      azimuth: (moonAzDeg * Math.PI) / 180,
      altitudeDeg: moonAltDeg,
      azimuthDeg: moonAzDeg,
      x: moon2D.x,
      y: moon2D.y,
      visible: moon2D.visible && moonOpacity > 0.01,
      opacity: moonOpacity,
      fraction: moonIllum.fraction,
    },
    phase,
    blendWeights: {
      day: dayWeight,
      sunset: sunsetWeight,
      night: nightWeight,
    },
    shadow: {
      lengthFactor,
      skewAngleDeg,
      opacity: shadowOpacity,
      scaleX: 1 + Math.abs(0.5 - sun2D.progress) * 0.4,
      scaleY: lengthFactor,
    },
  };
}

export interface UseSunPositionOptions {
  latitude?: number;
  longitude?: number;
  updateIntervalMs?: number;
  customDate?: Date;
}

export function useSunPosition(options?: UseSunPositionOptions): SunPositionState {
  const lat = options?.latitude ?? DEFAULT_COORDS.lat;
  const lng = options?.longitude ?? DEFAULT_COORDS.lng;
  const customDate = options?.customDate;
  const intervalMs = options?.updateIntervalMs ?? 30000;

  const [state, setState] = useState<SunPositionState>(() =>
    computeSunState(customDate ?? new Date(), lat, lng, true)
  );

  useEffect(() => {
    if (customDate) return;

    const timer = setInterval(() => {
      setState(computeSunState(new Date(), lat, lng, true));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [lat, lng, customDate, intervalMs]);

  if (customDate) {
    return computeSunState(customDate, lat, lng, true);
  }

  return state;
}
