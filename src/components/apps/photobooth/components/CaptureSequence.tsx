// src/components/apps/photobooth/components/CaptureSequence.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { RotateCw, RefreshCw, X, Play, Camera, AlertCircle } from "lucide-react";
import {
  useCameraStream,
  processCapturedImageToCanvas,
} from "@/lib/camera";
import { usePhotoboothStore } from "@/store/photoboothStore";
import { CountdownOverlay } from "./CountdownOverlay";
import { composePhotoboothImage } from "../lib/compositor";

export const CaptureSequence: React.FC = () => {
  const {
    currentStep,
    countdown,
    currentShotIndex,
    capturedPreviewUrls,
    capturedFrames,
    getSelectedTheme,
    setStep,
    setCountdown,
    addCapturedFrame,
    setComposing,
    setFinalResult,
    setError,
    resetSession,
    retakeCurrentSession,
  } = usePhotoboothStore();

  const theme = getSelectedTheme();
  const totalShots = theme.shotCount;

  const {
    stream,
    deviceProfile,
    facingMode,
    isLoading: isStreamLoading,
    error: streamError,
    takePhoto,
    switchFacingMode,
    reinitialize,
  } = useCameraStream({
    preferredFacingMode: "user",
    autoStart: true,
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const [isLowLight, setIsLowLight] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Attach camera stream to video tag
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Brightness / Low light detection
  useEffect(() => {
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 64;
    sampleCanvas.height = 36;

    const checkBrightness = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      const ctx = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 64, 36);
      const data = ctx.getImageData(0, 0, 64, 36).data;
      let totalLum = 0;
      for (let i = 0; i < data.length; i += 4) {
        totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      setIsLowLight(totalLum / (data.length / 4) < 55);
    };

    const interval = setInterval(checkBrightness, 800);
    return () => clearInterval(interval);
  }, []);

  // Single Shot Capture Logic
  const takeSingleShot = useCallback(async () => {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);

    try {
      // 1. Ambil frame via 2-Tier Capture Engine (Tier 1: ImageCapture sensor asli, Tier 2: Canvas grab)
      const captureResult = await takePhoto({
        videoElement: videoRef.current,
      });

      // 2. Terapkan color correction & denoise
      const processedCanvas = processCapturedImageToCanvas(captureResult.canvas, {
        colorCorrection: theme.id === "polaroid" 
          ? { ...deviceProfile.colorCorrection, saturation: deviceProfile.colorCorrection.saturation * 1.05, contrast: 1.08 }
          : deviceProfile.colorCorrection,
        postProcessing: deviceProfile.postProcessing,
        isLowLight,
      });

      const previewUrl = processedCanvas.toDataURL("image/jpeg", 0.9);
      addCapturedFrame(processedCanvas, previewUrl);

      // Cek apakah semua shot sudah selesai diambil
      const nextIndex = currentShotIndex + 1;
      if (nextIndex >= totalShots) {
        // Mulai proses compositing
        setStep("composing");
        setComposing(true);

        const allFrames = [...capturedFrames, processedCanvas];
        const finalUrl = await composePhotoboothImage({
          theme,
          frames: allFrames,
        });

        setFinalResult(finalUrl);
      } else {
        // Lanjut ke shot berikutnya setelah jeda singkat
        setTimeout(() => {
          setStep("counting");
          setCountdown(theme.countdownSeconds);
        }, 1000);
      }
    } catch (err) {
      console.error("Gagal mengambil foto photobooth:", err);
      setError("Gagal memproses frame foto. Silakan coba lagi.");
    } finally {
      setIsCapturing(false);
    }
  }, [
    addCapturedFrame,
    capturedFrames,
    currentShotIndex,
    deviceProfile,
    isCapturing,
    isLowLight,
    setComposing,
    setCountdown,
    setError,
    setFinalResult,
    setStep,
    takePhoto,
    theme,
    totalShots,
  ]);

  // Automated Countdown sequence
  useEffect(() => {
    if (currentStep !== "counting") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    if (countdown <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStep("capturing");
      takeSingleShot();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [countdown, currentStep, setCountdown, setStep, takeSingleShot]);

  const handleStartCaptureSequence = () => {
    setStep("counting");
    setCountdown(theme.countdownSeconds);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black text-white font-sans select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={resetSession}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors cursor-pointer"
            title="Ganti Tema"
          >
            <X size={16} />
          </button>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{theme.badgeEmoji}</span>
              <span>{theme.name}</span>
            </h2>
            <span className="text-[10px] text-zinc-400 font-mono">
              {totalShots} {totalShots === 1 ? "Shot" : "Shots"} • {theme.layout}
            </span>
          </div>
        </div>

        {/* Thumbnail Strip Status */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalShots }).map((_, idx) => {
            const isTaken = idx < capturedPreviewUrls.length;
            const isCurrent = idx === currentShotIndex && currentStep !== "ready";

            return (
              <div
                key={idx}
                className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 overflow-hidden flex items-center justify-center transition-all ${
                  isTaken
                    ? "border-emerald-500 bg-zinc-800"
                    : isCurrent
                    ? "border-purple-500 bg-purple-500/20 animate-pulse"
                    : "border-white/20 bg-zinc-900"
                }`}
              >
                {isTaken && capturedPreviewUrls[idx] ? (
                  <Image
                    src={capturedPreviewUrls[idx]}
                    alt={`Shot ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-mono text-zinc-400">{idx + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Camera Viewport */}
      <div className="flex-1 min-h-0 relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
        {streamError ? (
          <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm gap-3 bg-zinc-900/90 border border-white/10 rounded-2xl shadow-2xl z-30 m-4">
            <AlertCircle size={36} className="text-rose-400" />
            <h2 className="text-sm font-semibold text-white">Gagal Mengakses Kamera</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">{streamError}</p>
            <button
              onClick={reinitialize}
              className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <RefreshCw size={14} /> Coba Lagi
            </button>
          </div>
        ) : (
          <>
            {/* Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-transform duration-300 ${
                facingMode === "user" ? "-scale-x-100" : "scale-x-100"
              }`}
            />

            {/* Loading Indicator */}
            {isStreamLoading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-xs text-zinc-300 text-xs gap-2">
                <RefreshCw className="animate-spin text-purple-400" size={22} />
                Menghubungkan kamera...
              </div>
            )}

            {/* Countdown and Flash Overlay */}
            <CountdownOverlay
              countdown={countdown}
              isCapturing={isCapturing}
              shotIndex={currentShotIndex}
              totalShots={totalShots}
            />
          </>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="px-4 sm:px-8 py-3 sm:py-5 bg-zinc-950/95 border-t border-white/10 flex items-center justify-between shrink-0 relative z-20 backdrop-blur-md">
        {/* Switch Camera */}
        <button
          onClick={switchFacingMode}
          title="Ganti Kamera Depan / Belakang"
          aria-label="Ganti Kamera"
          className="w-12 h-12 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-zinc-300 active:scale-95 transition-all cursor-pointer"
        >
          <RotateCw size={20} />
        </button>

        {/* Center Action Button */}
        {currentStep === "ready" ? (
          <button
            onClick={handleStartCaptureSequence}
            className="px-6 py-3.5 rounded-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-600/40 flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play size={18} fill="currentColor" />
            <span>Mulai Foto ({totalShots} Shot)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-4 py-2.5 rounded-full">
            <Camera size={16} className="animate-pulse text-pink-400" />
            <span>Sesi Sedang Berjalan...</span>
          </div>
        )}

        {/* Reset / Retake Button */}
        <button
          onClick={retakeCurrentSession}
          title="Ulangi Sesi dari Awal"
          aria-label="Ulangi Sesi"
          className="w-12 h-12 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-zinc-300 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
};
