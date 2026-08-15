// src/components/apps/camera/LensSelector.tsx
"use client";

import React from "react";
import { ParsedCameraDevice, LensType } from "@/lib/camera";

interface LensSelectorProps {
  availableLenses: ParsedCameraDevice[];
  activeLens: ParsedCameraDevice | null;
  selectedCameraId: string | null;
  facingMode: "user" | "environment";
  currentZoom: number;
  zoomRange: { min: number; max: number; step?: number } | null;
  onSelectLensType?: (lensType: LensType) => void;
  onSelectCamera: (deviceId: string) => void;
  onSetZoom: (zoom: number) => void;
}

export const LensSelector: React.FC<LensSelectorProps> = ({
  availableLenses,
  activeLens,
  selectedCameraId,
  facingMode,
  currentZoom,
  zoomRange,
  onSelectCamera,
  onSetZoom,
}) => {
  // Filter lensa belakang jika sedang di mode environment, atau tampilkan semua lensa unik
  const backLenses = availableLenses.filter((l) => l.facing === "environment");
  const hasMultipleBackLenses = backLenses.length > 1;
  const isMobileMultiCam = availableLenses.length > 2 || hasMultipleBackLenses;

  // Jika HP punya multi-kamera belakang (seperti Samsung A54 dengan 1x Main dan 0.5x Ultra Wide)
  if (isMobileMultiCam && facingMode === "environment") {
    return (
      <div className="flex items-center justify-center gap-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg select-none">
        {backLenses.map((lens) => {
          const isActive =
            selectedCameraId === lens.deviceId ||
            activeLens?.deviceId === lens.deviceId ||
            (activeLens?.lensType === lens.lensType && !selectedCameraId);

          return (
            <button
              key={lens.deviceId || lens.index}
              onClick={() => onSelectCamera(lens.deviceId)}
              title={lens.displayName}
              className={`min-w-8 h-8 px-2 rounded-full text-[11px] font-bold tracking-tight transition-all duration-200 cursor-pointer flex items-center justify-center ${isActive
                  ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/30 scale-105 font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20 active:scale-95"
                }`}
            >
              {lens.shortLabel}
            </button>
          );
        })}
      </div>
    );
  }

  // Jika mendukung hardware zoom (optical/digital)
  if (zoomRange && zoomRange.max > 1) {
    const zoomSteps = [1];
    if (zoomRange.min < 1) zoomSteps.unshift(Number(zoomRange.min.toFixed(1)));
    if (zoomRange.max >= 2) zoomSteps.push(2);
    if (zoomRange.max >= 3) zoomSteps.push(3);

    return (
      <div className="flex items-center justify-center gap-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg select-none">
        {zoomSteps.map((step) => {
          const isCurrentStep = Math.abs(currentZoom - step) < 0.15;
          return (
            <button
              key={step}
              onClick={() => onSetZoom(step)}
              className={`w-8 h-8 rounded-full text-[11px] font-bold tracking-tight transition-all duration-200 cursor-pointer flex items-center justify-center ${isCurrentStep
                  ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/30 scale-105 font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20 active:scale-95"
                }`}
            >
              {step}x
            </button>
          );
        })}
      </div>
    );
  }

  // Fallback: Jika ada lebih dari 1 kamera secara total
  if (availableLenses.length > 1) {
    return (
      <div className="flex items-center justify-center gap-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg select-none">
        {availableLenses.map((lens) => {
          const isActive =
            selectedCameraId === lens.deviceId ||
            activeLens?.deviceId === lens.deviceId ||
            (activeLens?.lensType === lens.lensType && !selectedCameraId);

          return (
            <button
              key={lens.deviceId || lens.index}
              onClick={() => onSelectCamera(lens.deviceId)}
              title={lens.displayName}
              className={`min-w-8 h-8 px-2 rounded-full text-[10px] sm:text-[11px] font-bold tracking-tight transition-all duration-200 cursor-pointer flex items-center justify-center ${isActive
                  ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/30 scale-105 font-extrabold"
                  : "bg-white/10 text-white/80 hover:bg-white/20 active:scale-95"
                }`}
            >
              {lens.shortLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
};
