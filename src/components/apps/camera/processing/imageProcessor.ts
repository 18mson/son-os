// src/components/apps/camera/processing/imageProcessor.ts
import { ColorCorrectionConfig, PostProcessingConfig } from "@/config/deviceProfiles";

export interface ProcessImageOptions {
  colorCorrection: ColorCorrectionConfig;
  postProcessing: PostProcessingConfig;
  isLowLight?: boolean;
}

/**
 * Menerapkan pipeline color correction, unsharp mask sharpening, dan noise reduction
 * secara native tanpa dependensi eksternal berat.
 */
export function processCapturedImageData(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  options: ProcessImageOptions
): string {
  const { colorCorrection, postProcessing, isLowLight = false } = options;
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  // 1. Setup processing canvas dengan pembatasan dimensi maksimum
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
  if (!ctx) return "";

  // Draw source image to processing canvas
  ctx.drawImage(sourceCanvas as HTMLCanvasElement, 0, 0, targetWidth, targetHeight);

  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;

  // Parameter color correction
  const sat = colorCorrection.saturation;
  const con = colorCorrection.contrast;
  const bri = colorCorrection.brightness;
  const warmth = colorCorrection.warmth; // >0 red bias, <0 blue bias

  // 2. Pixel-level color transformation
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // A. Brightness
    if (bri !== 1.0) {
      r *= bri;
      g *= bri;
      b *= bri;
    }

    // B. Contrast: (x - 128) * con + 128
    if (con !== 1.0) {
      r = (r - 128) * con + 128;
      g = (g - 128) * con + 128;
      b = (b - 128) * con + 128;
    }

    // C. Saturation (luminance preserve)
    if (sat !== 1.0) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lum + (r - lum) * sat;
      g = lum + (g - lum) * sat;
      b = lum + (b - lum) * sat;
    }

    // D. Warmth adjustment
    if (warmth !== 0) {
      r += warmth * 25;
      b -= warmth * 20;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // 3. Low-Light Noise Reduction (jika diaktifkan & kondisi terdeteksi low light)
  if (postProcessing.enableLowLightDenoise && (isLowLight || postProcessing.denoiseStrength > 0.3)) {
    applyFastNoiseReduction(ctx, targetWidth, targetHeight, postProcessing.denoiseStrength);
  }

  // 4. Unsharp Masking / Sharpening (terutama untuk sensor non-OIS seperti G45)
  if (colorCorrection.sharpness > 0.05) {
    applyUnsharpMask(ctx, targetWidth, targetHeight, colorCorrection.sharpness);
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Fast 3x3 Edge-preserving box/chroma denoiser
 */
function applyFastNoiseReduction(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  // Salin alfa
  for (let i = 3; i < src.length; i += 4) {
    dst[i] = src[i];
  }

  const blend = Math.min(0.8, strength);

  // Sampling 3x3 sederhana
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
 * Fast Unsharp Mask Kernel:
 * [  0, -s,  0 ]
 * [ -s, 1+4s, -s ]
 * [  0, -s,  0 ]
 */
function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sharpness: number
) {
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
