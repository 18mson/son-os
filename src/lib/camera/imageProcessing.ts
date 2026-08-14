// src/lib/camera/imageProcessing.ts
import { ColorCorrectionConfig, PostProcessingConfig } from "./deviceProfiles";

export interface ProcessImageOptions {
  colorCorrection: ColorCorrectionConfig;
  postProcessing: PostProcessingConfig;
  isLowLight?: boolean;
}

/**
 * Menghitung skor ketajaman (sharpness / edge variance) dari sebuah frame canvas.
 * Semakin tinggi skor varians Laplacian / gradient, semakin tajam fotonya (kurang blur).
 */
export function calculateFrameSharpness(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): number {
  const sampleW = Math.min(240, width);
  const sampleH = Math.round((sampleW * height) / width);

  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = sampleW;
  thumbCanvas.height = sampleH;
  const tCtx = thumbCanvas.getContext("2d", { willReadFrequently: true });
  if (!tCtx) return 0;

  tCtx.drawImage(ctx.canvas, 0, 0, sampleW, sampleH);
  const imgData = tCtx.getImageData(0, 0, sampleW, sampleH);
  const data = imgData.data;

  let totalVariance = 0;
  let count = 0;

  // Horizontal gradient differencing on luminance
  for (let y = 0; y < sampleH; y++) {
    for (let x = 1; x < sampleW - 1; x++) {
      const idx = (y * sampleW + x) * 4;
      const prevIdx = (y * sampleW + (x - 1)) * 4;
      const nextIdx = (y * sampleW + (x + 1)) * 4;

      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const prevLum = 0.299 * data[prevIdx] + 0.587 * data[prevIdx + 1] + 0.114 * data[prevIdx + 2];
      const nextLum = 0.299 * data[nextIdx] + 0.587 * data[nextIdx + 1] + 0.114 * data[nextIdx + 2];

      const laplacian = Math.abs(2 * lum - prevLum - nextLum);
      totalVariance += laplacian;
      count++;
    }
  }

  return count > 0 ? totalVariance / count : 0;
}

/**
 * Fast 3x3 Edge-preserving box/chroma denoiser untuk meredam noise sensor low-light.
 */
export function applyFastNoiseReduction(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  // Salin alpha channel
  for (let i = 3; i < src.length; i += 4) {
    dst[i] = src[i];
  }

  const blend = Math.min(0.8, strength);

  // Sampling 3x3
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          rSum += src[nIdx];
          gSum += src[nIdx + 1];
          bSum += src[nIdx + 2];
        }
      }

      const rAvg = rSum / 9;
      const gAvg = gSum / 9;
      const bAvg = bSum / 9;

      dst[idx] = src[idx] * (1 - blend) + rAvg * blend;
      dst[idx + 1] = src[idx + 1] * (1 - blend) + gAvg * blend;
      dst[idx + 2] = src[idx + 2] * (1 - blend) + bAvg * blend;
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Fast Unsharp Mask Kernel untuk kompensasi ketajaman:
 * [  0, -s,  0 ]
 * [ -s, 1+4s, -s ]
 * [  0, -s,  0 ]
 */
export function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sharpness: number
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  const s = Math.min(1.0, sharpness);
  const centerWeight = 1 + 4 * s;

  for (let i = 3; i < src.length; i += 4) {
    dst[i] = src[i];
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const top = src[((y - 1) * width + x) * 4 + c];
        const bottom = src[((y + 1) * width + x) * 4 + c];
        const left = src[(y * width + (x - 1)) * 4 + c];
        const right = src[(y * width + (x + 1)) * 4 + c];
        const center = src[idx + c];

        const val = center * centerWeight - (top + bottom + left + right) * s;
        dst[idx + c] = Math.max(0, Math.min(255, val));
      }
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Memproses source canvas dengan color correction, denoise, dan unsharp mask.
 * Mengembalikan HTMLCanvasElement baru yang siap digunakan untuk compositing.
 */
export function processCapturedImageToCanvas(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  options: ProcessImageOptions
): HTMLCanvasElement {
  const { colorCorrection, postProcessing, isLowLight = false } = options;
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  // 1. Batasi resolusi processing di canvas agar memory dan chipset mid-range tetap ringan
  let targetWidth = width;
  let targetHeight = height;
  const maxDim = postProcessing.maxCanvasDimension || 2560;

  if (targetWidth > maxDim || targetHeight > maxDim) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
      targetWidth = maxDim;
    } else {
      targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
      targetHeight = maxDim;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  // Salin gambar awal ke canvas
  ctx.drawImage(sourceCanvas as HTMLCanvasElement, 0, 0, targetWidth, targetHeight);

  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;

  const sat = colorCorrection.saturation;
  const con = colorCorrection.contrast;
  const bri = colorCorrection.brightness;
  const warmth = colorCorrection.warmth;

  // 2. Pixel-level color grading
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    if (bri !== 1.0) {
      r *= bri;
      g *= bri;
      b *= bri;
    }

    // Contrast
    if (con !== 1.0) {
      r = (r - 128) * con + 128;
      g = (g - 128) * con + 128;
      b = (b - 128) * con + 128;
    }

    // Saturation
    if (sat !== 1.0) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lum + (r - lum) * sat;
      g = lum + (g - lum) * sat;
      b = lum + (b - lum) * sat;
    }

    // Warmth adjustment
    if (warmth !== 0) {
      r += warmth * 25;
      b -= warmth * 20;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // 3. Low-Light Noise Reduction
  if (postProcessing.enableLowLightDenoise && (isLowLight || postProcessing.denoiseStrength > 0.3)) {
    applyFastNoiseReduction(ctx, targetWidth, targetHeight, postProcessing.denoiseStrength);
  }

  // 4. Sharpening Unsharp Masking
  if (colorCorrection.sharpness > 0.05) {
    applyUnsharpMask(ctx, targetWidth, targetHeight, colorCorrection.sharpness);
  }

  return canvas;
}

/**
 * Memproses source canvas dan mengembalikan output berupa Data URL (JPEG / PNG).
 */
export function processCapturedImageData(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  options: ProcessImageOptions,
  format: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.92
): string {
  const processedCanvas = processCapturedImageToCanvas(sourceCanvas, options);
  return processedCanvas.toDataURL(format, quality);
}

/**
 * Mengambil burst frames kilat dari video element dan memilih frame paling tajam.
 * Menghindari motion blur akibat goyangan tangan pada perangkat non-OIS.
 */
export async function captureSharpestBurstFrame(
  video: HTMLVideoElement,
  burstCount: number = 3,
  facingMode: "user" | "environment" = "environment"
): Promise<HTMLCanvasElement> {
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;

  if (burstCount <= 1) {
    const singleCanvas = document.createElement("canvas");
    singleCanvas.width = width;
    singleCanvas.height = height;
    const ctx = singleCanvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      if (facingMode === "user") {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
    }
    return singleCanvas;
  }

  const capturedCanvases: Array<{ canvas: HTMLCanvasElement; sharpness: number }> = [];

  for (let i = 0; i < burstCount; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (ctx) {
      if (facingMode === "user") {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
      const score = calculateFrameSharpness(ctx, width, height);
      capturedCanvases.push({ canvas, sharpness: score });
    }

    if (i < burstCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  }

  // Pilih frame dengan skor ketajaman tertinggi
  capturedCanvases.sort((a, b) => b.sharpness - a.sharpness);
  return capturedCanvases[0]?.canvas || document.createElement("canvas");
}
