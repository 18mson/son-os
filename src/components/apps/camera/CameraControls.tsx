// src/components/apps/camera/CameraControls.tsx
"use client";

import React from "react";
import {
  Camera,
  RotateCw,
  Zap,
  ZapOff,
  Grid,
  Bug,
  Loader2,
} from "lucide-react";
import { CameraDiagnostics } from "@/lib/camera";

interface CameraControlsProps {
  onCapture: () => void;
  onSwitchCamera: () => void;
  onToggleTorch: () => void;
  onToggleGrid: () => void;
  onToggleDebug: () => void;
  isCapturing: boolean;
  isTorchOn: boolean;
  showGrid: boolean;
  showDebug: boolean;
  diagnostics: CameraDiagnostics | null;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onCapture,
  onSwitchCamera,
  onToggleTorch,
  onToggleGrid,
  onToggleDebug,
  isCapturing,
  isTorchOn,
  showGrid,
  showDebug,
  diagnostics,
}) => {
  const isTorchSupported = diagnostics?.capabilities && "torch" in diagnostics.capabilities;

  return (
    <div className="px-4 sm:px-8 py-3 sm:py-5 bg-zinc-950/95 border-t border-white/10 flex items-center justify-between shrink-0 relative z-20 backdrop-blur-md">
      {/* Left Aux Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle Grid */}
        <button
          onClick={onToggleGrid}
          title="Toggle Grid (Rule of Thirds)"
          aria-label="Toggle Grid"
          className={`w-11 h-11 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            showGrid
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "bg-white/10 hover:bg-white/20 text-zinc-300 active:scale-95"
          }`}
        >
          <Grid size={19} />
        </button>

        {/* Toggle Torch if supported */}
        {isTorchSupported && (
          <button
            onClick={onToggleTorch}
            title={isTorchOn ? "Matikan Flash / Torch" : "Nyalakan Flash / Torch"}
            aria-label={isTorchOn ? "Matikan Flash" : "Nyalakan Flash"}
            className={`w-11 h-11 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isTorchOn
                ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/40"
                : "bg-white/10 hover:bg-white/20 text-zinc-300 active:scale-95"
            }`}
          >
            {isTorchOn ? <Zap size={19} /> : <ZapOff size={19} />}
          </button>
        )}
      </div>

      {/* Center Shutter Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={onCapture}
          disabled={isCapturing}
          title="Ambil Foto"
          aria-label="Ambil Foto"
          className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-purple-500/60 disabled:opacity-50"
        >
          {isCapturing ? (
            <Loader2 className="animate-spin text-purple-600" size={28} />
          ) : (
            <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-white border-2 border-zinc-950/20 flex items-center justify-center">
              <Camera size={24} className="text-zinc-900" />
            </div>
          )}
        </button>
      </div>

      {/* Right Aux Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Switch Camera Facing */}
        <button
          onClick={onSwitchCamera}
          title="Ganti Kamera Depan / Belakang"
          aria-label="Ganti Kamera"
          className="w-11 h-11 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-zinc-300 active:scale-95 transition-all cursor-pointer"
        >
          <RotateCw size={19} />
        </button>

        {/* Debug Panel Toggle */}
        <button
          onClick={onToggleDebug}
          title="Buka Diagnostic Panel (Testing HP)"
          aria-label="Buka Diagnostic Panel"
          className={`w-11 h-11 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            showDebug
              ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
              : "bg-white/10 hover:bg-white/20 text-zinc-300 active:scale-95"
          }`}
        >
          <Bug size={19} />
        </button>
      </div>
    </div>
  );
};
