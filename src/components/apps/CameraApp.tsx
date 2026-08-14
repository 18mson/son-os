// src/components/apps/CameraApp.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Camera,
  Download,
  RefreshCw,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { useCameraStream } from "@/hooks/useCameraStream";
import { CameraViewport } from "./camera/CameraViewport";
import { CameraControls } from "./camera/CameraControls";
import { CameraDebugPanel } from "./camera/CameraDebugPanel";
import { captureSharpestBurstFrame } from "./camera/processing/multiFrameCapture";
import { processCapturedImageData } from "./camera/processing/imageProcessor";

export const CameraApp: React.FC = () => {
  const {
    stream,
    deviceProfile,
    facingMode,
    isLoading,
    error,
    diagnostics,
    currentLadderIndex,
    isTorchOn,
    switchFacingMode,
    toggleTorch,
    reinitialize,
  } = useCameraStream();

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLowLight, setIsLowLight] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [lastProcessingDetails, setLastProcessingDetails] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach MediaStream ke video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Handle Capture dengan Multi-frame Burst (EIS) & Post-processing
  const handleCapture = useCallback(async () => {
    if (!videoRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const burstCount = deviceProfile.postProcessing.multiFrameBurstCount || 1;

      // 1. Ambil frame terbaik via burst sharpness ranking
      const rawCanvas = await captureSharpestBurstFrame(
        videoRef.current,
        burstCount,
        facingMode
      );

      // 2. Terapkan post-processing native (Color correction + Denoise + Sharpening)
      const processedDataUrl = processCapturedImageData(rawCanvas, {
        colorCorrection: deviceProfile.colorCorrection,
        postProcessing: deviceProfile.postProcessing,
        isLowLight,
      });

      setCapturedImage(processedDataUrl);
      setLastProcessingDetails(
        `${deviceProfile.modelName} • ${rawCanvas.width}x${rawCanvas.height} • Burst ${burstCount}x • Ladder #${currentLadderIndex + 1}`
      );
    } catch (err) {
      console.error("Capture processing error:", err);
    } finally {
      setIsCapturing(false);
    }
  }, [currentLadderIndex, deviceProfile, facingMode, isCapturing, isLowLight]);

  const handleDownload = () => {
    if (!capturedImage) return;
    const a = document.createElement("a");
    a.href = capturedImage;
    a.download = `sonos-${deviceProfile.brand}-photo-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-zinc-100 select-none overflow-hidden font-sans relative">
      {/* Top Bar Header */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-white/10 bg-zinc-900/90 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 text-white shadow-md shrink-0">
            <Camera size={16} className="sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs font-bold text-white tracking-wide truncate">SonOS Camera</h1>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-white/10 text-purple-300 border border-purple-500/20 truncate max-w-27.5 sm:max-w-none">
                {deviceProfile.modelName.split("(")[0].trim()}
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate">
              {deviceProfile.hasOIS ? "Hardware OIS Stabilized" : "Software Multi-frame EIS Active"}
            </p>
          </div>
        </div>

        {capturedImage ? (
          <span className="text-[10px] font-medium text-pink-400 bg-pink-500/10 px-2 sm:px-2.5 py-1 rounded-full border border-pink-500/20 flex items-center gap-1 shrink-0">
            <Sparkles size={12} /> Captured
          </span>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] text-zinc-400 shrink-0">
            <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-zinc-800 border border-white/5">
              <Cpu size={11} className="text-purple-400" />
              <span className="hidden xs:inline">{deviceProfile.chipsetTier}</span>
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center bg-black overflow-hidden">
        {error ? (
          /* Error Fallback View */
          <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm gap-3 bg-zinc-900/90 border border-white/10 rounded-2xl shadow-2xl z-30 m-4">
            <AlertCircle size={36} className="text-rose-400" />
            <h2 className="text-sm font-semibold text-white">Gagal Mengakses Kamera</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
            <button
              onClick={reinitialize}
              className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <RefreshCw size={14} /> Coba Lagi
            </button>
          </div>
        ) : capturedImage ? (
          /* Photo Preview View */
          <div className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-4 bg-zinc-950 overflow-hidden">
            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
              <Image
                src={capturedImage}
                alt="Captured"
                fill
                unoptimized
                className="object-contain rounded-2xl border border-white/20 shadow-2xl"
              />
            </div>

            {/* Post-Capture Info Footer */}
            <div className="w-full flex flex-col items-center gap-2 sm:gap-3 shrink-0 pt-2 z-20">
              {lastProcessingDetails && (
                <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1 rounded-full border border-white/5 truncate max-w-full">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{lastProcessingDetails}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Download size={15} /> Simpan Foto
                </button>
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <RefreshCw size={15} /> Ambil Ulang
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Live Camera View */
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-xs text-zinc-300 text-xs gap-2">
                <RefreshCw className="animate-spin text-purple-400" size={20} />
                Menyiapkan stream kamera...
              </div>
            )}

            <div className="flex-1 min-h-0 relative w-full h-full overflow-hidden">
              <CameraViewport
                videoRef={videoRef}
                facingMode={facingMode}
                deviceProfile={deviceProfile}
                isLoading={isLoading}
                showGrid={showGrid}
                onLowLightChange={setIsLowLight}
              />
            </div>

            <CameraControls
              onCapture={handleCapture}
              onSwitchCamera={switchFacingMode}
              onToggleTorch={toggleTorch}
              onToggleGrid={() => setShowGrid((g) => !g)}
              onToggleDebug={() => setShowDebug((d) => !d)}
              isCapturing={isCapturing}
              isTorchOn={isTorchOn}
              showGrid={showGrid}
              showDebug={showDebug}
              diagnostics={diagnostics}
            />
          </div>
        )}
      </div>

      {/* Floating Diagnostics / Debug Modal */}
      <CameraDebugPanel
        diagnostics={diagnostics}
        isOpen={showDebug}
        onClose={() => setShowDebug(false)}
      />
    </div>
  );
};
