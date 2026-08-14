// src/components/apps/camera/processing/multiFrameCapture.ts

/**
 * Menghitung skor ketajaman (sharpness / edge variance) dari sebuah frame canvas.
 * Semakin tinggi skor varians Laplacian / gradient, semakin tajam fotonya (kurang blur).
 */
export function calculateFrameSharpness(ctx: CanvasRenderingContext2D, width: number, height: number): number {
  // Sample thumbnail kecil untuk kalkulasi cepat (<5ms)
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
 * Mengambil burst frames kilat dari video element dan memilih frame paling tajam.
 * Ini berguna untuk device non-OIS (Motorola Moto G45) guna meredam hand jitter.
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

    // Delay kecil antar frame (40ms ~ 1 frame interval at 25fps)
    if (i < burstCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  }

  // Pilih frame dengan skor ketajaman tertinggi
  capturedCanvases.sort((a, b) => b.sharpness - a.sharpness);
  return capturedCanvases[0]?.canvas || document.createElement("canvas");
}
