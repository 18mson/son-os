// src/components/apps/camera/CameraViewport.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { Moon, ShieldAlert, Sparkles } from "lucide-react";
import { DeviceProfile, ParsedCameraDevice } from "@/lib/camera";

interface CameraViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  facingMode: "user" | "environment";
  deviceProfile: DeviceProfile;
  activeLens?: ParsedCameraDevice | null;
  isLoading: boolean;
  showGrid: boolean;
  onLowLightChange?: (isLowLight: boolean) => void;
}

export const CameraViewport: React.FC<CameraViewportProps> = ({
  videoRef,
  facingMode,
  deviceProfile,
  activeLens,
  isLoading,
  showGrid,
  onLowLightChange,
}) => {
  const [isLowLight, setIsLowLight] = useState(false);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interval brightness analyzer (berjalan ringan setiap 600ms)
  useEffect(() => {
    const analyzeLuminance = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      if (!sampleCanvasRef.current) {
        sampleCanvasRef.current = document.createElement("canvas");
        sampleCanvasRef.current.width = 64;
        sampleCanvasRef.current.height = 36;
      }

      const canvas = sampleCanvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 64, 36);
      const imgData = ctx.getImageData(0, 0, 64, 36);
      const data = imgData.data;

      let totalLum = 0;
      const totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        totalLum += lum;
      }

      const avgBrightness = totalLum / totalPixels;
      const lowLightDetected = avgBrightness < 55; // Threshold low light

      setIsLowLight(lowLightDetected);
      onLowLightChange?.(lowLightDetected);
    };

    const intervalId = setInterval(analyzeLuminance, 600);
    return () => clearInterval(intervalId);
  }, [onLowLightChange, videoRef]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-transform duration-300 ${facingMode === "user" ? "-scale-x-100" : "scale-x-100"
          }`}
      />

      {/* Rule of Thirds Grid Overlay */}
      {showGrid && !isLoading && (
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
          <div className="border-r border-b border-white/15" />
          <div className="border-r border-b border-white/15" />
          <div className="border-b border-white/15" />
          <div className="border-r border-b border-white/15" />
          <div className="border-r border-b border-white/15" />
          <div className="border-b border-white/15" />
          <div className="border-r border-white/15" />
          <div className="border-r border-white/15" />
          <div className="" />
        </div>
      )}

      {/* Floating Status Badges Top Left */}
      <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-none z-10">
        {/* Low-Light Indicator */}
        {isLowLight && (
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] sm:text-[11px] font-medium backdrop-blur-md animate-pulse">
            <Moon size={11} className="sm:w-3 sm:h-3" />
            <span>Low Light</span>
          </div>
        )}

        {/* OIS / EIS Status */}
        {deviceProfile.hasOIS ? (
          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[9px] sm:text-[10px] font-medium backdrop-blur-md">
            <Sparkles size={10} className="sm:w-2.75 sm:h-2.75" />
            <span>OIS Ready</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[9px] sm:text-[10px] font-medium backdrop-blur-md">
            <ShieldAlert size={10} className="sm:w-2.75 sm:h-2.75" />
            <span>Software EIS</span>
          </div>
        )}

        {/* Active Lens Indicator */}
        {activeLens && (
          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/10 border border-white/20 text-zinc-200 text-[9px] sm:text-[10px] font-mono backdrop-blur-md">
            <span>{activeLens.displayName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

