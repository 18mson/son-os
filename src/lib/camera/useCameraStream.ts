// src/lib/camera/useCameraStream.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  DeviceProfile,
  detectDeviceProfile,
  GENERIC_DESKTOP_PROFILE,
  CameraConstraintLadder,
} from "./deviceProfiles";
import {
  capturePhoto as executeCapturePhoto,
  isImageCaptureSupported,
  CapturePhotoResult,
} from "./capturePhoto";

export interface CameraDiagnostics {
  deviceProfile: DeviceProfile;
  activeConstraints: MediaTrackConstraints | null;
  activeSettings: MediaTrackSettings | null;
  capabilities: MediaTrackCapabilities | null;
  trackLabel: string;
  streamResolution: { width: number; height: number };
  actualFps: number;
  availableCameras: MediaDeviceInfo[];
  isImageCaptureSupported: boolean;
  lastCaptureInfo: CapturePhotoResult | null;
  errorLog: string[];
}

export interface UseCameraStreamOptions {
  preferredFacingMode?: "user" | "environment";
  autoStart?: boolean;
}

export function useCameraStream(options: UseCameraStreamOptions = {}) {
  const { preferredFacingMode = "user", autoStart = true } = options;

  const [facingMode, setFacingMode] = useState<"user" | "environment">(preferredFacingMode);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfile>(GENERIC_DESKTOP_PROFILE);
  const [isLoading, setIsLoading] = useState(autoStart);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<CameraDiagnostics | null>(null);
  const [currentLadderIndex, setCurrentLadderIndex] = useState(0);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);

  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const isMountedRef = useRef(true);

  // Ambil daftar kamera fisik
  const getAvailableCameras = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return [];
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === "videoinput");
    } catch {
      return [];
    }
  }, []);

  // Tangga resolusi/constraints (Ladder Fallback)
  const attemptStreamWithLadder = useCallback(
    async (
      ladder: CameraConstraintLadder[],
      startIndex: number,
      availableCameras: MediaDeviceInfo[],
      profile: DeviceProfile,
      targetFacing: "user" | "environment"
    ): Promise<{ stream: MediaStream; track: MediaStreamTrack; usedLadderIndex: number } | null> => {
      let lastError: unknown = null;
      const errorsList: string[] = [];

      for (let i = startIndex; i < ladder.length; i++) {
        const step = ladder[i];
        const videoConstraints: MediaTrackConstraints = {
          width: { ideal: step.idealWidth },
          height: { ideal: step.idealHeight },
          frameRate: { ideal: step.idealFrameRate, max: step.maxFrameRate },
          facingMode: { ideal: targetFacing },
        };

        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false,
          });

          const videoTrack = mediaStream.getVideoTracks()[0];
          if (!videoTrack) throw new Error("Tidak ada video track yang ditemukan.");

          const capabilities = typeof videoTrack.getCapabilities === "function" ? videoTrack.getCapabilities() : null;
          const settings = videoTrack.getSettings();

          // Bias exposure compensation jika didukung (misal untuk G45 non-OIS)
          if (
            capabilities &&
            "exposureCompensation" in capabilities &&
            step.exposureCompensationBias !== undefined
          ) {
            try {
              const expMin =
                (capabilities as { exposureCompensation?: { min: number; max: number } }).exposureCompensation?.min ?? 0;
              const expMax =
                (capabilities as { exposureCompensation?: { max: number } }).exposureCompensation?.max ?? 0;
              const targetBias = Math.max(expMin, Math.min(expMax, step.exposureCompensationBias));

              await videoTrack.applyConstraints({
                advanced: [{ exposureCompensation: targetBias } as unknown as MediaTrackConstraintSet],
              });
            } catch (biasErr) {
              console.warn("Gagal menerapkan exposure compensation bias:", biasErr);
            }
          }

          setDiagnostics({
            deviceProfile: profile,
            activeConstraints: videoConstraints,
            activeSettings: settings,
            capabilities,
            trackLabel: videoTrack.label || "Kamera Aktif",
            streamResolution: {
              width: settings.width || step.idealWidth,
              height: settings.height || step.idealHeight,
            },
            actualFps: settings.frameRate || step.idealFrameRate,
            availableCameras,
            isImageCaptureSupported: isImageCaptureSupported(),
            lastCaptureInfo: null,
            errorLog: errorsList,
          });

          return { stream: mediaStream, track: videoTrack, usedLadderIndex: i };
        } catch (err: unknown) {
          lastError = err;
          const errMsg = `Ladder tier ${i} (${step.idealWidth}x${step.idealHeight}) gagal: ${err instanceof Error ? err.name : String(err)}`;
          errorsList.push(errMsg);
          console.warn(errMsg);
        }
      }

      throw lastError || new Error("Gagal mengaktifkan kamera pada semua constraint ladder.");
    },
    []
  );

  const initCamera = useCallback(
    async (targetFacing = facingMode) => {
      await Promise.resolve();
      if (!isMountedRef.current) return;
      setIsLoading(true);
      setError(null);
      setIsTorchOn(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (typeof window !== "undefined" && !window.isSecureContext) {
        setError(
          "Akses kamera memerlukan koneksi aman (HTTPS / Secure Context). Untuk testing via IP lokal HP, jalankan 'npm run dev:https' atau buka 'chrome://flags/#unsafely-treat-insecure-origin-as-secure' di browser HP."
        );
        setIsLoading(false);
        return;
      }

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setError("Webcam / getUserMedia tidak didukung pada browser ini.");
        setIsLoading(false);
        return;
      }

      try {
        const detected = await detectDeviceProfile();
        if (!isMountedRef.current) return;
        setDeviceProfile(detected);

        const cameras = await getAvailableCameras();

        const result = await attemptStreamWithLadder(
          detected.constraintsLadder,
          0,
          cameras,
          detected,
          targetFacing
        );

        if (!result || !isMountedRef.current) return;

        streamRef.current = result.stream;
        trackRef.current = result.track;
        setCurrentLadderIndex(result.usedLadderIndex);
        setStream(result.stream);
      } catch (err: unknown) {
        if (!isMountedRef.current) return;
        console.error("Camera initialization error:", err);
        if (err instanceof Error) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setError("Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda.");
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            setError("Perangkat kamera tidak ditemukan.");
          } else if (err.name === "NotReadableError") {
            setError("Kamera sedang digunakan oleh aplikasi lain.");
          } else {
            setError(`Gagal mengakses kamera: ${err.message}`);
          }
        } else {
          setError("Gagal mengaktifkan kamera.");
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [attemptStreamWithLadder, facingMode, getAvailableCameras]
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStream(null);
  }, []);

  const switchFacingMode = useCallback(() => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    initCamera(nextFacing);
  }, [facingMode, initCamera]);

  const toggleTorch = useCallback(async () => {
    if (!trackRef.current) return false;
    const track = trackRef.current;
    const capabilities = typeof track.getCapabilities === "function" ? track.getCapabilities() : null;

    if (capabilities && "torch" in capabilities) {
      try {
        const nextState = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as unknown as MediaTrackConstraintSet],
        });
        setIsTorchOn(nextState);
        return true;
      } catch (err) {
        console.warn("Torch toggle failed:", err);
        return false;
      }
    }
    return false;
  }, [isTorchOn]);

  const setZoom = useCallback(async (zoomValue: number) => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const capabilities = typeof track.getCapabilities === "function" ? track.getCapabilities() : null;

    if (capabilities && "zoom" in capabilities) {
      const zoomCap = (capabilities as { zoom?: { min: number; max: number } }).zoom;
      if (zoomCap) {
        const clampedZoom = Math.max(zoomCap.min, Math.min(zoomCap.max, zoomValue));
        try {
          await track.applyConstraints({
            advanced: [{ zoom: clampedZoom } as unknown as MediaTrackConstraintSet],
          });
          setCurrentZoom(clampedZoom);
        } catch (err) {
          console.warn("Apply zoom failed:", err);
        }
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;

    if (autoStart) {
      const start = async () => {
        await Promise.resolve();
        if (!isCancelled) {
          await initCamera(facingMode);
        }
      };
      start();
    }

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [autoStart, facingMode, initCamera]);

  const takePhoto = useCallback(
    async (captureOpts: {
      videoElement?: HTMLVideoElement | null;
      burstCount?: number;
      fillLightMode?: "off" | "auto" | "flash";
      targetWidth?: number;
      targetHeight?: number;
      enableLogging?: boolean;
    } = {}): Promise<CapturePhotoResult> => {
      const result = await executeCapturePhoto({
        track: trackRef.current,
        videoElement: captureOpts.videoElement,
        facingMode,
        burstCount: captureOpts.burstCount ?? deviceProfile.postProcessing.multiFrameBurstCount ?? 1,
        fillLightMode: captureOpts.fillLightMode,
        targetWidth: captureOpts.targetWidth,
        targetHeight: captureOpts.targetHeight,
        enableLogging: captureOpts.enableLogging ?? true,
      });

      setDiagnostics((prev) =>
        prev
          ? {
            ...prev,
            lastCaptureInfo: result,
          }
          : null
      );

      return result;
    },
    [deviceProfile.postProcessing.multiFrameBurstCount, facingMode]
  );

  return {
    stream,
    deviceProfile,
    facingMode,
    isLoading,
    error,
    diagnostics,
    currentLadderIndex,
    isTorchOn,
    currentZoom,
    isImageCaptureSupported: isImageCaptureSupported(),
    takePhoto,
    switchFacingMode,
    toggleTorch,
    setZoom,
    stopCamera,
    startCamera: initCamera,
    reinitialize: () => initCamera(facingMode),
  };
}
