// src/components/apps/photobooth/lib/compositor.ts
import { PhotoboothTheme } from "../themes/themes.config";

export interface ComposeOptions {
  theme: PhotoboothTheme;
  frames: (HTMLCanvasElement | string)[];
  customCaption?: string;
  customDate?: string;
}

/**
 * Memuat image dari URL atau string Data URL menjadi HTMLImageElement.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Gagal memuat image dari: ${src}`));
    img.src = src;
  });
}

/**
 * Menggambar foto (canvas atau image) ke dalam slot target dengan mode object-fit 'cover'.
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 12
) {
  ctx.save();

  // Buat rounded clipping path
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();

  const srcWidth = "videoWidth" in img ? (img as unknown as { videoWidth: number }).videoWidth : img.width;
  const srcHeight = "videoHeight" in img ? (img as unknown as { videoHeight: number }).videoHeight : img.height;

  const targetRatio = w / h;
  const srcRatio = srcWidth / srcHeight;

  let sx = 0;
  let sy = 0;
  let sWidth = srcWidth;
  let sHeight = srcHeight;

  if (srcRatio > targetRatio) {
    // Crop samping
    sWidth = srcHeight * targetRatio;
    sx = (srcWidth - sWidth) / 2;
  } else {
    // Crop atas/bawah
    sHeight = srcWidth / targetRatio;
    sy = (srcHeight - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  ctx.restore();
}

/**
 * Generic Photobooth Compositor.
 * Menyatukan array captured frames + theme layout + frame overlay menjadi satu gambar final.
 */
export async function composePhotoboothImage(options: ComposeOptions): Promise<string> {
  const { theme, frames, customCaption, customDate } = options;

  // Berikan jeda 1 tick agar UI thread dapat me-render loading spinner / transition
  await new Promise((resolve) => setTimeout(resolve, 16));

  // 1. Siapkan sumber frame
  const loadedSources: (HTMLImageElement | HTMLCanvasElement)[] = [];
  for (const frame of frames) {
    if (typeof frame === "string") {
      const img = await loadImage(frame);
      loadedSources.push(img);
    } else {
      loadedSources.push(frame);
    }
  }

  // 2. Setup Dimensi Canvas Final berdasarkan Layout Theme
  const outCanvas = document.createElement("canvas");
  const ctx = outCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Gagal menginisialisasi Canvas Context");

  const now = new Date();
  const dateStr =
    customDate ||
    now.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).toUpperCase();

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const footerText = customCaption || theme.subtext || "SON-OS PHOTOBOOTH";

  if (theme.layout === "single") {
    // -------------------------------------------------------------
    // POLAROID (SINGLE) LAYOUT
    // Output: 1080 x 1320 (Classic instant print)
    // -------------------------------------------------------------
    outCanvas.width = 1080;
    outCanvas.height = 1320;

    // Background Card
    ctx.fillStyle = theme.frameColor;
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    // Border halus
    ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, outCanvas.width - 2, outCanvas.height - 2);

    // Photo Box: 940 x 940 (square)
    const photoMargin = 70;
    const photoWidth = outCanvas.width - photoMargin * 2; // 940
    const photoHeight = photoWidth; // 1:1
    const photoY = 70;

    if (loadedSources[0]) {
      drawImageCover(ctx, loadedSources[0], photoMargin, photoY, photoWidth, photoHeight, 8);
    }

    // Photo inner subtle shadow border
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(photoMargin, photoY, photoWidth, photoHeight);

    // Footer Caption & Date
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.font = "bold 26px 'Courier New', Courier, monospace";
    ctx.fillText(footerText, outCanvas.width / 2, 1140);

    ctx.font = "500 18px 'Courier New', Courier, monospace";
    ctx.fillStyle = theme.textColor === "#ffffff" || theme.textColor === "#f4f4f5" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)";
    ctx.fillText(`${dateStr} • ${timeStr}`, outCanvas.width / 2, 1180);
  } else if (theme.layout === "strip") {
    // -------------------------------------------------------------
    // FILM STRIP (VERTICAL 4 SHOTS) LAYOUT
    // Output: 640 x 1920 (Classic 1:3 photobooth bookmark strip)
    // -------------------------------------------------------------
    outCanvas.width = 640;
    outCanvas.height = 1920;

    ctx.fillStyle = theme.frameColor;
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    // Film side perforations/dots aesthetic
    ctx.fillStyle = theme.textColor === "#f4f4f5" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)";
    for (let py = 30; py < outCanvas.height - 80; py += 45) {
      ctx.beginPath();
      ctx.arc(16, py, 4, 0, Math.PI * 2);
      ctx.arc(outCanvas.width - 16, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const paddingX = 40;
    const photoWidth = outCanvas.width - paddingX * 2; // 560
    const photoHeight = Math.round(photoWidth / theme.aspectRatio); // 420
    const gap = 24;
    const startY = 40;

    for (let i = 0; i < theme.shotCount; i++) {
      const currentY = startY + i * (photoHeight + gap);
      const frameSource = loadedSources[i];

      if (frameSource) {
        drawImageCover(ctx, frameSource, paddingX, currentY, photoWidth, photoHeight, 10);
      } else {
        // Placeholder empty slot
        ctx.fillStyle = "rgba(128, 128, 128, 0.1)";
        ctx.fillRect(paddingX, currentY, photoWidth, photoHeight);
      }

      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(paddingX, currentY, photoWidth, photoHeight);
    }

    // Footer
    const footerY = startY + theme.shotCount * (photoHeight + gap) + 30;
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText(`${theme.badgeEmoji ? theme.badgeEmoji + " " : ""}${footerText}`, outCanvas.width / 2, footerY);

    ctx.font = "14px monospace";
    ctx.fillStyle = theme.textColor === "#f4f4f5" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.4)";
    ctx.fillText(`${dateStr} • ${timeStr}`, outCanvas.width / 2, footerY + 28);
  } else if (theme.layout === "grid") {
    // -------------------------------------------------------------
    // GRID 2x2 (4 SHOTS) LAYOUT
    // Output: 1200 x 1400
    // -------------------------------------------------------------
    outCanvas.width = 1200;
    outCanvas.height = 1400;

    ctx.fillStyle = theme.frameColor;
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    const margin = 50;
    const gap = 24;
    const cols = 2;
    const photoWidth = (outCanvas.width - margin * 2 - gap * (cols - 1)) / cols; // 538
    const photoHeight = Math.round(photoWidth / theme.aspectRatio); // ~403
    const startY = 60;

    for (let i = 0; i < theme.shotCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = margin + col * (photoWidth + gap);
      const y = startY + row * (photoHeight + gap);

      const frameSource = loadedSources[i];
      if (frameSource) {
        drawImageCover(ctx, frameSource, x, y, photoWidth, photoHeight, 14);
      } else {
        ctx.fillStyle = "rgba(128, 128, 128, 0.1)";
        ctx.fillRect(x, y, photoWidth, photoHeight);
      }

      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, photoWidth, photoHeight);
    }

    // Grid Footer Brand
    const footerY = startY + 2 * photoHeight + gap + 70;
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(`${theme.badgeEmoji ? theme.badgeEmoji + " " : ""}${footerText}`, outCanvas.width / 2, footerY);

    ctx.font = "16px monospace";
    ctx.fillStyle = theme.textColor === "#27272a" ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.5)";
    ctx.fillText(`${dateStr} • ${timeStr}`, outCanvas.width / 2, footerY + 34);
  }

  // 3. Optional: Coba muat file overlay PNG transparan jika ada path eksternal
  if (theme.framePath && !theme.framePath.startsWith("/assets/photobooth/frames/")) {
    try {
      const overlayImg = await loadImage(theme.framePath);
      ctx.drawImage(overlayImg, 0, 0, outCanvas.width, outCanvas.height);
    } catch {
      // Abaikan jika custom frame asset belum diunggah
    }
  }

  // 4. Return Data URL (PNG)
  return outCanvas.toDataURL("image/png", 1.0);
}
