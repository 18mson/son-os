"use client";

import React, { memo, useState } from "react";
import Image from "next/image";
import { useSunPosition } from "@/hooks/useSunPosition";
import { useMoonPhase } from "@/hooks/useMoonPhase";
import { RealtimeWallpaperDevControl } from "./RealtimeWallpaperDevControl";

interface RealtimeWallpaperProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

// Fixed deterministic star positions for starry night sky
const NIGHT_STARS: Array<{ x: number; y: number; r: number; opacity: number; pulseDelay?: string }> = [
  // Upper sky
  { x: 120, y: 80, r: 1.2, opacity: 0.75, pulseDelay: "0s" },
  { x: 210, y: 140, r: 0.9, opacity: 0.5 },
  { x: 320, y: 65, r: 1.4, opacity: 0.85, pulseDelay: "1.2s" },
  { x: 440, y: 110, r: 0.8, opacity: 0.45 },
  { x: 530, y: 75, r: 1.5, opacity: 0.9, pulseDelay: "2.1s" },
  { x: 650, y: 160, r: 1.0, opacity: 0.6 },
  { x: 740, y: 90, r: 1.3, opacity: 0.8, pulseDelay: "0.7s" },
  { x: 820, y: 190, r: 0.8, opacity: 0.5 },
  { x: 910, y: 120, r: 1.6, opacity: 0.95, pulseDelay: "1.8s" },
  { x: 1040, y: 70, r: 1.1, opacity: 0.7 },
  { x: 1150, y: 150, r: 1.3, opacity: 0.85, pulseDelay: "2.7s" },
  { x: 1260, y: 95, r: 0.9, opacity: 0.55 },
  { x: 1380, y: 175, r: 1.5, opacity: 0.9, pulseDelay: "1.0s" },
  { x: 1470, y: 85, r: 1.0, opacity: 0.65 },
  { x: 1580, y: 130, r: 1.4, opacity: 0.8, pulseDelay: "2.4s" },
  { x: 1690, y: 180, r: 0.8, opacity: 0.5 },
  { x: 1780, y: 100, r: 1.3, opacity: 0.85, pulseDelay: "0.4s" },
  { x: 1850, y: 160, r: 1.1, opacity: 0.7 },

  // Mid sky
  { x: 180, y: 220, r: 1.0, opacity: 0.6 },
  { x: 290, y: 280, r: 1.4, opacity: 0.8, pulseDelay: "1.5s" },
  { x: 380, y: 210, r: 0.9, opacity: 0.5 },
  { x: 490, y: 260, r: 1.2, opacity: 0.75, pulseDelay: "0.9s" },
  { x: 580, y: 310, r: 0.8, opacity: 0.45 },
  { x: 690, y: 240, r: 1.5, opacity: 0.9, pulseDelay: "2.3s" },
  { x: 780, y: 330, r: 1.0, opacity: 0.6 },
  { x: 890, y: 270, r: 1.3, opacity: 0.85, pulseDelay: "1.7s" },
  { x: 990, y: 350, r: 0.8, opacity: 0.5 },
  { x: 1100, y: 260, r: 1.4, opacity: 0.8, pulseDelay: "0.3s" },
  { x: 1210, y: 320, r: 1.1, opacity: 0.7 },
  { x: 1320, y: 250, r: 1.5, opacity: 0.95, pulseDelay: "2.0s" },
  { x: 1430, y: 340, r: 0.9, opacity: 0.55 },
  { x: 1540, y: 270, r: 1.2, opacity: 0.75, pulseDelay: "1.1s" },
  { x: 1650, y: 350, r: 1.0, opacity: 0.6 },
  { x: 1750, y: 290, r: 1.4, opacity: 0.85, pulseDelay: "2.8s" },
  { x: 1860, y: 360, r: 0.9, opacity: 0.5 },

  // Lower sky
  { x: 460, y: 420, r: 0.9, opacity: 0.55 },
  { x: 570, y: 480, r: 1.2, opacity: 0.7, pulseDelay: "1.4s" },
  { x: 680, y: 430, r: 0.8, opacity: 0.45 },
  { x: 790, y: 500, r: 1.3, opacity: 0.8, pulseDelay: "0.6s" },
  { x: 920, y: 450, r: 1.0, opacity: 0.65 },
  { x: 1050, y: 520, r: 1.4, opacity: 0.85, pulseDelay: "2.2s" },
  { x: 1180, y: 460, r: 0.9, opacity: 0.5 },
  { x: 1290, y: 540, r: 1.2, opacity: 0.75, pulseDelay: "1.9s" },
  { x: 1420, y: 470, r: 1.0, opacity: 0.6 },
  { x: 1530, y: 530, r: 1.3, opacity: 0.8, pulseDelay: "0.8s" },
  { x: 1670, y: 490, r: 0.8, opacity: 0.5 },
  { x: 1790, y: 550, r: 1.1, opacity: 0.7, pulseDelay: "2.5s" },
  { x: 1870, y: 510, r: 0.9, opacity: 0.55 },

  // Horizon edge (above sea)
  { x: 720, y: 620, r: 0.8, opacity: 0.45 },
  { x: 860, y: 660, r: 1.1, opacity: 0.65, pulseDelay: "1.3s" },
  { x: 1010, y: 630, r: 0.9, opacity: 0.5 },
  { x: 1160, y: 680, r: 1.2, opacity: 0.7, pulseDelay: "2.6s" },
  { x: 1340, y: 640, r: 0.8, opacity: 0.45 },
  { x: 1490, y: 690, r: 1.0, opacity: 0.6, pulseDelay: "0.5s" },
  { x: 1630, y: 650, r: 0.9, opacity: 0.5 },
  { x: 1770, y: 680, r: 1.1, opacity: 0.65, pulseDelay: "1.7s" },
];

export const RealtimeWallpaper: React.FC<RealtimeWallpaperProps> = memo(({
  latitude,
  longitude,
  className = "",
}) => {
  const [overrideDate, setOverrideDate] = useState<Date | null>(null);

  const { sun, moon, phase, blendWeights, shadow } = useSunPosition({
    latitude,
    longitude,
    customDate: overrideDate ?? undefined,
    updateIntervalMs: 30000,
  });

  const moonPhase = useMoonPhase({
    date: overrideDate ?? undefined,
    updateIntervalMs: 3600000, // Update moon phase once per hour
  });

  const isSunset = blendWeights.sunset > 0.15;
  const moonPath = moonPhase.getMoonSvgPath(20, 0, 0);

  return (
    <div
      className={`fixed inset-0 w-full h-full pointer-events-none overflow-hidden select-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* LAYER 1: Background Crossfade Images */}
      <div className="absolute inset-0 w-full h-full">
        {/* Night Layer (Base) */}
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
          style={{ opacity: blendWeights.night }}
        >
          <Image
            src="/wallpapers/coastal/night.png"
            alt="Coastal Night Wallpaper"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center w-full h-full"
          />
        </div>

        {/* Sunset / Dusk Layer */}
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
          style={{ opacity: blendWeights.sunset }}
        >
          <Image
            src="/wallpapers/coastal/sunset.png"
            alt="Coastal Sunset Wallpaper"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center w-full h-full"
          />
        </div>

        {/* Day Layer */}
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
          style={{ opacity: blendWeights.day }}
        >
          <Image
            src="/wallpapers/coastal/day.png"
            alt="Coastal Day Wallpaper"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center w-full h-full"
          />
        </div>
      </div>

      {/* LAYER 2: Celestial Sun, Stars & Moon */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Sky Region Clipping Mask */}
          <clipPath id="sky-region-clip">
            <polygon points="0,0 1920,0 1920,850 640,850 500,720 380,620 260,500 140,410 0,360" />
          </clipPath>

          {/* Smooth Gaussian Blur Filters for Daytime Sun Only */}
          <filter id="smooth-sun-core-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>

          <filter id="smooth-sun-haze-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="30" />
          </filter>

          {/* Seamless Daytime Sun Radial Gradients */}
          <radialGradient id="day-sun-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#fffdf0" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#fff6d1" stopOpacity="0.45" />
            <stop offset="85%" stopColor="#ffefab" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffe680" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="day-sun-haze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#fff9de" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#ffea9f" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffd875" stopOpacity="0" />
          </radialGradient>

          {/* Seamless Sunset Sun Radial Gradients */}
          <radialGradient id="sunset-sun-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="#fff8db" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffdd7a" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#ff9d47" stopOpacity="0.35" />
            <stop offset="90%" stopColor="#ff6a3d" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#e83a54" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="sunset-sun-haze" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe899" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#ffa94d" stopOpacity="0.25" />
            <stop offset="75%" stopColor="#ff6f43" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#e83a54" stopOpacity="0" />
          </radialGradient>

          {/* Shadow Filter */}
          <filter id="shadow-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
          </filter>
        </defs>

        {/* MASKED SKY REGION */}
        <g clipPath="url(#sky-region-clip)">
          {/* STARS: Tiny Crisp Vector Dots during Night */}
          {blendWeights.night > 0.05 && (
            <g
              className="transition-opacity duration-1000 ease-out"
              style={{ opacity: blendWeights.night }}
            >
              {NIGHT_STARS.map((star, idx) => (
                <circle
                  key={idx}
                  cx={star.x}
                  cy={star.y}
                  r={star.r}
                  fill="#f4f6fc"
                  opacity={star.opacity}
                  className={star.pulseDelay ? "animate-pulse" : ""}
                  style={star.pulseDelay ? { animationDelay: star.pulseDelay, animationDuration: "3s" } : undefined}
                />
              ))}
            </g>
          )}

          {/* SUN: Rendered during daytime */}
          {sun.visible && (
            <g
              className="transition-transform duration-1000 ease-out"
              transform={`translate(${(sun.x / 100) * 1920}, ${(sun.y / 100) * 1080})`}
              style={{ mixBlendMode: "screen" }}
            >
              {/* 1. Large Soft Atmosphere Light Glow */}
              <circle
                r={140 + Math.max(0, 1 - sun.y / 100) * 30}
                fill={isSunset ? "url(#sunset-sun-haze)" : "url(#day-sun-haze)"}
                filter="url(#smooth-sun-haze-blur)"
              />

              {/* 2. Seamless Radiant Sun Core */}
              <circle
                r={55}
                fill={isSunset ? "url(#sunset-sun-gradient)" : "url(#day-sun-gradient)"}
                filter="url(#smooth-sun-core-blur)"
              />
            </g>
          )}

          {/* MOON: SOLID FLAT VECTOR (Fades out gracefully during subuh/dawn) */}
          {moon.visible && (
            <g
              className="transition-transform duration-1000 ease-out"
              transform={`translate(${(moon.x / 100) * 1920}, ${(moon.y / 100) * 1080})`}
              opacity={moon.opacity}
              style={{ transition: "opacity 1s ease-out, transform 1s ease-out" }}
            >
              {/* 1. Moon Dark Unlit Disc Base (Solid Flat Night Sky Tone with 1px Crisp Outline) */}
              <circle
                r={20}
                fill="#151b2d"
                stroke="#2d3756"
                strokeWidth={1}
              />

              {/* 2. Real-Time Illuminated Terminator Flat Vector Shape (Solid #f4f1e8) */}
              {moonPhase.phaseKey === "fullMoon" ? (
                <circle
                  r={20}
                  fill="#f4f1e8"
                />
              ) : moonPath ? (
                <path
                  d={moonPath}
                  fill="#f4f1e8"
                />
              ) : null}
            </g>
          )}
        </g>

        {/* LAYER 3: Subtle Natural Tree Crown Shadow */}
        {shadow.opacity > 0.02 && (
          <g
            transform={`translate(95, 385)`}
            className="transition-all duration-1000 ease-out pointer-events-none"
            opacity={shadow.opacity}
            filter="url(#shadow-blur)"
          >
            <g
              transform={`scale(${shadow.scaleX}, ${shadow.scaleY}) skewX(${shadow.skewAngleDeg})`}
            >
              <ellipse
                cx="0"
                cy="0"
                rx="20"
                ry="8"
                fill="#16120c"
                opacity={0.35}
              />
              <g transform="translate(12, 16)">
                <ellipse cx="0" cy="0" rx="14" ry="6" fill="#16120c" opacity={0.25} transform="rotate(-15)" />
                <ellipse cx="-6" cy="-3" rx="12" ry="4" fill="#16120c" opacity={0.2} transform="rotate(-35)" />
                <ellipse cx="8" cy="-2" rx="11" ry="4" fill="#16120c" opacity={0.2} transform="rotate(30)" />
              </g>
            </g>
          </g>
        )}
      </svg>

      {/* DEV ONLY: Time Scrubber & Phase Simulator Control */}
      <RealtimeWallpaperDevControl
        currentDate={overrideDate ?? new Date()}
        onOverrideChange={setOverrideDate}
        phase={phase}
        moonPhaseName={moonPhase.phaseNameId}
        isOverrideActive={overrideDate !== null}
      />
    </div>
  );
});

RealtimeWallpaper.displayName = "RealtimeWallpaper";
