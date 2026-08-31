"use client";

import { useState, useEffect } from "react";
import * as SunCalc from "suncalc";

export type MoonPhaseKey =
  | "newMoon"
  | "waxingCrescent"
  | "firstQuarter"
  | "waxingGibbous"
  | "fullMoon"
  | "waningGibbous"
  | "lastQuarter"
  | "waningCrescent";

export interface MoonPhaseInfo {
  phase: number; // 0 to 1
  fraction: number; // 0 to 1 (illumination fraction, 1 = 100% full)
  angle: number; // moon angle in radians
  phaseKey: MoonPhaseKey;
  phaseNameId: string;
  phaseNameEn: string;
  svgPath: string; // precomputed for radius 20, center (0,0)
  getMoonSvgPath: (radius: number, cx?: number, cy?: number) => string;
}

/**
 * Resolves phase value (0 - 1) to localized phase names & keys.
 */
export function getMoonPhaseName(phase: number): {
  key: MoonPhaseKey;
  nameId: string;
  nameEn: string;
} {
  const p = ((phase % 1) + 1) % 1; // Normalize to 0-1

  if (p < 0.03 || p >= 0.97) {
    return { key: "newMoon", nameId: "Bulan Baru", nameEn: "New Moon" };
  }
  if (p < 0.22) {
    return { key: "waxingCrescent", nameId: "Sabit Awal", nameEn: "Waxing Crescent" };
  }
  if (p < 0.28) {
    return { key: "firstQuarter", nameId: "Kuartal Pertama", nameEn: "First Quarter" };
  }
  if (p < 0.47) {
    return { key: "waxingGibbous", nameId: "Cembung Awal", nameEn: "Waxing Gibbous" };
  }
  if (p < 0.53) {
    return { key: "fullMoon", nameId: "Bulan Purnama", nameEn: "Full Moon" };
  }
  if (p < 0.72) {
    return { key: "waningGibbous", nameId: "Cembung Akhir", nameEn: "Waning Gibbous" };
  }
  if (p < 0.78) {
    return { key: "lastQuarter", nameId: "Kuartal Akhir", nameEn: "Last Quarter" };
  }
  return { key: "waningCrescent", nameId: "Sabit Akhir", nameEn: "Waning Crescent" };
}

/**
 * Calculates SVG path for illuminated moon portion given phase and radius.
 * Generates a clean, crisp astronomical elliptical terminator path.
 */
export function calculateMoonSvgPath(phase: number, r: number, cx: number = 0, cy: number = 0): string {
  const p = ((phase % 1) + 1) % 1;

  // New moon (completely unlit)
  if (p < 0.01 || p > 0.99) {
    return "";
  }
  // Full moon (full circle)
  if (Math.abs(p - 0.5) < 0.01) {
    return `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy} Z`;
  }

  const theta = p * 2 * Math.PI;
  const rx = r * Math.cos(theta);
  const absRx = Math.max(0.01, Math.abs(rx));

  if (p < 0.5) {
    // Waxing: illuminated on the right side
    const sweepTerm = rx > 0 ? 0 : 1;
    return `M ${cx},${cy - r} A ${r},${r} 0 0,1 ${cx},${cy + r} A ${absRx.toFixed(2)},${r} 0 0,${sweepTerm} ${cx},${cy - r} Z`;
  } else {
    // Waning: illuminated on the left side
    const sweepTerm = rx < 0 ? 0 : 1;
    return `M ${cx},${cy - r} A ${r},${r} 0 0,0 ${cx},${cy + r} A ${absRx.toFixed(2)},${r} 0 0,${sweepTerm} ${cx},${cy - r} Z`;
  }
}

export function computeMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  const illum = SunCalc.getMoonIllumination(date);
  const names = getMoonPhaseName(illum.phase);
  const defaultRadius = 20;

  return {
    phase: illum.phase,
    fraction: illum.fraction,
    angle: illum.angle,
    phaseKey: names.key,
    phaseNameId: names.nameId,
    phaseNameEn: names.nameEn,
    svgPath: calculateMoonSvgPath(illum.phase, defaultRadius, 0, 0),
    getMoonSvgPath: (r: number, cx: number = 0, cy: number = 0) =>
      calculateMoonSvgPath(illum.phase, r, cx, cy),
  };
}

export interface UseMoonPhaseOptions {
  date?: Date;
  updateIntervalMs?: number; // default: 3600000 (1 hour)
}

/**
 * Reusable hook for real-time moon phase tracking.
 * Updates on a 1-hour interval by default.
 */
export function useMoonPhase(options?: UseMoonPhaseOptions): MoonPhaseInfo {
  const customDate = options?.date;
  const intervalMs = options?.updateIntervalMs ?? 3600000; // 1 hour

  const [moonState, setMoonState] = useState<MoonPhaseInfo>(() =>
    computeMoonPhase(customDate ?? new Date())
  );

  useEffect(() => {
    if (customDate) return;

    const timer = setInterval(() => {
      setMoonState(computeMoonPhase(new Date()));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [customDate, intervalMs]);

  return customDate ? computeMoonPhase(customDate) : moonState;
}
