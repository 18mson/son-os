// src/lib/camera/capturePhoto.ts
import { captureSharpestBurstFrame } from "./imageProcessing";

export type CaptureMethod = "image-capture" | "canvas-fallback";

export interface PhotoCapabilities {
  redEyeReduction?: "never" | "always" | "controllable";
  imageHeight?: { max: number; min: number; step: number };
  imageWidth?: { max: number; min: number; step: number };
  fillLightMode?: ("off" | "auto" | "flash")[];
}

export interface PhotoSettings {
  fillLightMode?: "off" | "auto" | "flash";
  imageHeight?: number;
  imageWidth?: number;
  redEyeReduction?: boolean;
}

export interface ImageCaptureInstance {
  track: MediaStreamTrack;
  getPhotoCapabilities(): Promise<PhotoCapabilities>;
  getPhotoSettings(): Promise<PhotoSettings>;
  takePhoto(photoSettings?: PhotoSettings): Promise<Blob>;
  grabFrame(): Promise<ImageBitmap>;
}

export interface CapturePhotoOptions {
  track?: MediaStreamTrack | null;
  videoElement?: HTMLVideoElement | null;
  facingMode?: "user" | "environment";
  burstCount?: number;
  fillLightMode?: "off" | "auto" | "flash";
  targetWidth?: number;
  targetHeight?: number;
  enableLogging?: boolean;
}

export interface CapturePhotoResult {
  blob: Blob;
  canvas: HTMLCanvasElement;
  method: CaptureMethod;
  width: number;
  height: number;
  durationMs: number;
  diagnosticsMessage: string;
}

/**
 * Mengubah Blob gambar menjadi HTMLCanvasElement (kompatibel lintas browser).
 */
export async function blobToCanvas(blob: Blob, facingMode?: "user" | "environment"): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");

  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(bitmap, 0, 0);
      }
      bitmap.close();
      return canvas;
    } catch {
      // Fallback ke Image element jika createImageBitmap gagal pada format tertentu
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(img, 0, 0);
      }
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal mengonversi Blob foto ke Canvas element."));
    };
    img.src = url;
  });
}

/**
 * Mengubah HTMLCanvasElement menjadi Blob.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob menghasilkan nilai null"));
      },
      type,
      quality
    );
  });
}

/**
 * Cek apakah browser & environment mendukung ImageCapture API.
 */
export function isImageCaptureSupported(): boolean {
  return typeof window !== "undefined" && typeof (window as unknown as { ImageCapture?: unknown }).ImageCapture === "function";
}

/**
 * 2-Tier Adaptive Photo Capture:
 * - Tier 1: ImageCapture.takePhoto() (Still image sensor resolution asli)
 * - Tier 2: Canvas Stream Grab (Multi-frame burst sharpness ranking)
 */
export async function capturePhoto(options: CapturePhotoOptions): Promise<CapturePhotoResult> {
  const {
    track,
    videoElement,
    facingMode = "environment",
    burstCount = 1,
    fillLightMode,
    targetWidth,
    targetHeight,
    enableLogging = true,
  } = options;

  const startTime = performance.now();

  // -------------------------------------------------------------
  // TIER 1: ImageCapture API (Preferred)
  // -------------------------------------------------------------
  if (isImageCaptureSupported() && track && track.readyState === "live") {
    try {
      if (enableLogging) {
        console.log("[SonOS Camera Capture] Mencoba Tier 1: ImageCapture.takePhoto()...");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ImageCaptureConstructor = (window as any).ImageCapture;
      const imageCapture: ImageCaptureInstance = new ImageCaptureConstructor(track);

      // Cek photo capabilities device (misal resolusi maksimum, flash mode)
      let photoSettings: PhotoSettings = {};
      try {
        const capabilities = await imageCapture.getPhotoCapabilities();
        if (enableLogging) {
          console.log("[SonOS Camera Capture] Photo capabilities terdeteksi:", capabilities);
        }

        if (capabilities.imageWidth && targetWidth) {
          photoSettings.imageWidth = Math.min(capabilities.imageWidth.max, Math.max(capabilities.imageWidth.min, targetWidth));
        }
        if (capabilities.imageHeight && targetHeight) {
          photoSettings.imageHeight = Math.min(capabilities.imageHeight.max, Math.max(capabilities.imageHeight.min, targetHeight));
        }
        if (fillLightMode && capabilities.fillLightMode?.includes(fillLightMode)) {
          photoSettings.fillLightMode = fillLightMode;
        }
      } catch (capErr) {
        if (enableLogging) {
          console.warn("[SonOS Camera Capture] getPhotoCapabilities tidak didukung/gagal, menggunakan default settings:", capErr);
        }
        photoSettings = {};
      }

      const blob = await imageCapture.takePhoto(Object.keys(photoSettings).length > 0 ? photoSettings : undefined);
      const canvas = await blobToCanvas(blob, facingMode);
      const durationMs = Math.round(performance.now() - startTime);
      const msg = `ImageCapture.takePhoto() sukses (${canvas.width}x${canvas.height}, ${durationMs}ms)`;

      if (enableLogging) {
        console.log(`%c[SonOS Camera Capture: Tier 1 SUCCESS] ${msg}`, "color: #10b981; font-weight: bold;");
      }

      return {
        blob,
        canvas,
        method: "image-capture",
        width: canvas.width,
        height: canvas.height,
        durationMs,
        diagnosticsMessage: msg,
      };
    } catch (tier1Err) {
      if (enableLogging) {
        console.warn(
          "%c[SonOS Camera Capture: Tier 1 FAILED -> Beralih ke Tier 2 Fallback]",
          "color: #f59e0b; font-weight: bold;",
          tier1Err
        );
      }
    }
  } else if (enableLogging) {
    console.log(
      "[SonOS Camera Capture] ImageCapture API tidak tersedia di browser/track ini. Menggunakan Tier 2 Canvas Fallback."
    );
  }

  // -------------------------------------------------------------
  // TIER 2: Canvas Video Frame Grab (Fallback)
  // -------------------------------------------------------------
  if (!videoElement) {
    throw new Error("Gagal mengambil foto: Video element tidak tersedia untuk canvas fallback.");
  }

  const canvas = await captureSharpestBurstFrame(videoElement, burstCount, facingMode);
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
  const durationMs = Math.round(performance.now() - startTime);
  const msg = `Canvas stream fallback sukses (${canvas.width}x${canvas.height}, Burst: ${burstCount}x, ${durationMs}ms)`;

  if (enableLogging) {
    console.log(`%c[SonOS Camera Capture: Tier 2 FALLBACK USED] ${msg}`, "color: #8b5cf6; font-weight: bold;");
  }

  return {
    blob,
    canvas,
    method: "canvas-fallback",
    width: canvas.width,
    height: canvas.height,
    durationMs,
    diagnosticsMessage: msg,
  };
}
