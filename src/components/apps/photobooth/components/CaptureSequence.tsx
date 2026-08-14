// src/components/apps/photobooth/components/CaptureSequence.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { RefreshCw, X, Play, AlertCircle, SwitchCamera } from "lucide-react";
import {
  useCameraStream,
  processCapturedImageToCanvas,
} from "@/lib/camera";
import { usePhotoboothStore } from "@/store/photoboothStore";
import { CountdownOverlay } from "./CountdownOverlay";
import { composePhotoboothImage } from "../lib/compositor";
import { LensSelector } from "@/components/apps/camera/LensSelector";

export const CaptureSequence: React.FC = () => {
  const {
    currentStep,
    countdown,
    currentShotIndex,
    capturedPreviewUrls,
    capturedFrames,
    customCaption,
    showTimestamp,
    showStickers,
    getSelectedTheme,
    getSelectedFilter,
    getActiveLayout,
    getActiveShotCount,
    setStep,
    setCountdown,
    addCapturedFrame,
    setComposing,
    setFinalResult,
    setError,
    resetSession,
  } = usePhotoboothStore();

  const theme = getSelectedTheme();
  const filter = getSelectedFilter();
  const layout = getActiveLayout();
  const totalShots = getActiveShotCount();

  const {
    stream,
    deviceProfile,
    facingMode,
    selectedCameraId,
    availableLenses,
    activeLens,
    isLoading: isStreamLoading,
    error: streamError,
    currentZoom,
    zoomRange,
    takePhoto,
    switchFacingMode,
    selectCamera,
    selectLensType,
    setZoom,
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
        colorCorrection: {
          ...deviceProfile.colorCorrection,
          saturation: deviceProfile.colorCorrection.saturation * filter.colorCorrection.saturation,
          contrast: deviceProfile.colorCorrection.contrast * filter.colorCorrection.contrast,
          brightness: deviceProfile.colorCorrection.brightness * filter.colorCorrection.brightness,
          warmth: deviceProfile.colorCorrection.warmth + filter.colorCorrection.warmth,
        },
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
          filter,
          layout,
          shotCount: totalShots,
          frames: allFrames,
          customCaption,
          showTimestamp,
          showStickers,
        });

        setFinalResult(finalUrl);
      } else {
        // Lanjut ke shot berikutnya setelah jeda singkat
        setTimeout(() => {
          setStep("counting");
          setCountdown(theme.countdownSeconds);
        }, 900);
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
    customCaption,
    deviceProfile,
    filter,
    isCapturing,
    isLowLight,
    layout,
    setComposing,
    setCountdown,
    setError,
    setFinalResult,
    setStep,
    showStickers,
    showTimestamp,
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
      <div className="px-3 sm:px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={resetSession}
            disabled={currentStep === "counting" || currentStep === "capturing"}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
              {totalShots} {totalShots === 1 ? "Shot" : "Shots"} • {layout.replace("-", " ")}
            </span>
          </div>
        </div>

        {/* Right side: Camera switch & Thumbnail progress */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switch Camera Button (Front / Rear) */}
          {currentStep === "ready" && (
            <button
              onClick={switchFacingMode}
              disabled={isStreamLoading}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              title="Ganti Kamera Depan / Belakang"
            >
              <SwitchCamera size={14} className="text-purple-400" />
              <span className="hidden sm:inline">
                {facingMode === "user" ? "Kamera Belakang" : "Kamera Depan"}
              </span>
            </button>
          )}

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
                      ? "border-emerald-500 bg-zinc-800 shadow"
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
        ) : isStreamLoading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Mengaktifkan Sensor Kamera...</p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Live Camera Viewfinder with FacingMode Mirroring */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ filter: filter.cssFilter }}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                facingMode === "user" ? "-scale-x-100" : "scale-x-100"
              }`}
            />

            {/* Quick Floating Switch Camera Button (on top right of viewfinder) */}
            {currentStep === "ready" && (
              <button
                onClick={switchFacingMode}
                className="sm:hidden absolute top-3 right-3 p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-lg z-10 active:scale-95 transition-transform"
                title="Ganti Kamera"
              >
                <SwitchCamera size={18} />
              </button>
            )}

            {/* Quick Floating Lens Selector (bottom center of viewfinder) */}
            {currentStep === "ready" && !isStreamLoading && (
              <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center pointer-events-auto">
                <LensSelector
                  availableLenses={availableLenses}
                  activeLens={activeLens}
                  selectedCameraId={selectedCameraId}
                  facingMode={facingMode}
                  currentZoom={currentZoom}
                  zoomRange={zoomRange}
                  onSelectLensType={selectLensType}
                  onSelectCamera={selectCamera}
                  onSetZoom={setZoom}
                />
              </div>
            )}

            {/* Flash Effect on capture */}
            {isCapturing && (
              <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-300 pointer-events-none" />
            )}

            {/* Countdown Overlay */}
            {currentStep === "counting" && (
              <CountdownOverlay
                countdown={countdown}
                isCapturing={isCapturing}
                shotIndex={currentShotIndex}
                totalShots={totalShots}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="px-4 py-3 bg-zinc-900/90 border-t border-white/10 flex items-center justify-center shrink-0 z-20 backdrop-blur-md">
        {currentStep === "ready" && (
          <button
            onClick={handleStartCaptureSequence}
            disabled={!stream || isStreamLoading}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-bold shadow-xl shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Play size={17} fill="currentColor" />
            <span>Mulai Jepret ({totalShots}x)</span>
          </button>
        )}

        {(currentStep === "counting" || currentStep === "capturing") && (
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 py-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>
              Mengambil Shot {currentShotIndex + 1} dari {totalShots}...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
