"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Camera, Download, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

export const CameraApp: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleRetry = useCallback(() => {
    setIsInitializing(true);
    setErrorMsg(null);
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const startCamera = async () => {
      // Yield to microtask queue so state updates are never synchronous within effect body
      await Promise.resolve();

      if (isCancelled) return;

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setErrorMsg("Kamera tidak didukung oleh browser Anda.");
        setIsInitializing(false);
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: false,
        });

        if (isCancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        console.error("Camera access error:", err);
        if (err instanceof Error) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setErrorMsg("Izin akses kamera ditolak. Silakan izinkan akses kamera di browser Anda.");
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            setErrorMsg("Tidak ada perangkat kamera yang ditemukan pada komputer ini.");
          } else {
            setErrorMsg(`Gagal mengakses kamera: ${err.message}`);
          }
        } else {
          setErrorMsg("Gagal mengaktifkan kamera.");
        }
      } finally {
        if (!isCancelled) {
          setIsInitializing(false);
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [retryKey]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Mirror image horizontally to match webcam preview feel
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      setCapturedImage(dataUrl);
    }
  };

  const handleDownload = () => {
    if (!capturedImage) return;
    const a = document.createElement("a");
    a.href = capturedImage;
    a.download = `sonos-photo-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-zinc-100 select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/10 bg-zinc-900/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 text-white shadow-md">
            <Camera size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">Son-OS Camera</h1>
            <p className="text-[10px] text-zinc-400">Webcam capture & photo exporter</p>
          </div>
        </div>

        {capturedImage && (
          <span className="text-[10px] font-medium text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20 flex items-center gap-1">
            <Sparkles size={12} /> Photo Mode
          </span>
        )}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-black p-4 overflow-hidden">
        {/* Hidden Canvas for Capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {errorMsg ? (
          <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm gap-3 bg-zinc-900/90 border border-white/10 rounded-2xl shadow-2xl">
            <AlertCircle size={36} className="text-rose-400" />
            <h2 className="text-sm font-semibold text-white">Akses Kamera Diperlukan</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">{errorMsg}</p>
            <button
              onClick={handleRetry}
              className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <RefreshCw size={14} /> Coba Lagi
            </button>
          </div>
        ) : capturedImage ? (
          /* Photo Preview View */
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
            <div className="relative w-full flex-1 max-h-[calc(100%-60px)]">
              <Image
                src={capturedImage}
                alt="Captured"
                fill
                unoptimized
                className="object-contain rounded-2xl border border-white/20 shadow-2xl"
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Download size={15} /> Unduh Foto
              </button>
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <RefreshCw size={15} /> Foto Ulang
              </button>
            </div>
          </div>
        ) : (
          /* Live Stream View */
          <div className="relative w-full h-full flex items-center justify-center">
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs gap-2">
                <RefreshCw className="animate-spin" size={18} /> Membuka webcam...
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-2xl transform -scale-x-100 border border-white/10"
            />

            {/* Floating Capture Button */}
            {!isInitializing && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button
                  onClick={handleCapture}
                  title="Ambil Foto"
                  className="w-14 h-14 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer border-4 border-purple-500/50"
                >
                  <Camera size={24} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
