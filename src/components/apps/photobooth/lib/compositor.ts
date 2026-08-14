// src/components/apps/photobooth/lib/compositor.ts
import { PhotoboothTheme, PhotoboothLayout } from "../themes/themes.config";
import { PhotoboothFilter } from "../filters/filters.config";
import { renderCanvasPattern, renderThemeOrnaments } from "./canvasDecorators";

export interface ComposeOptions {
  theme: PhotoboothTheme;
  filter?: PhotoboothFilter;
  layout?: PhotoboothLayout;
  shotCount?: number;
  frames: (HTMLCanvasElement | string)[];
  customCaption?: string;
  customDate?: string;
  showTimestamp?: boolean;
  showStickers?: boolean;
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
 * Menggambar foto (canvas atau image) ke dalam slot target dengan mode object-fit 'cover' dan filter warna.
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 12,
  canvasFilter?: string
) {
  ctx.save();

  // Terapkan filter jika ada
  if (canvasFilter && canvasFilter !== "none") {
    ctx.filter = canvasFilter;
  }

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
    sWidth = srcHeight * targetRatio;
    sx = (srcWidth - sWidth) / 2;
  } else {
    sHeight = srcWidth / targetRatio;
    sy = (srcHeight - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  ctx.restore();
}

/**
 * Advanced Photobooth Compositor.
 * Menyatukan frames + layout (1 kolom, 2 kolom, 1 baris, polaroid) + tema + ornamen + filter.
 */
export async function composePhotoboothImage(options: ComposeOptions): Promise<string> {
  const {
    theme,
    filter,
    layout: inputLayout,
    shotCount: inputShotCount,
    frames,
    customCaption,
    customDate,
    showTimestamp = true,
    showStickers = true,
  } = options;

  const layout = inputLayout || theme.layout;
  const shotCount = inputShotCount || theme.shotCount;

  // Berikan jeda 1 tick agar UI thread dapat me-render transition
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

  // 2. Setup Dimensi Canvas Final berdasarkan Layout
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

  const footerText = (customCaption && customCaption.trim()) || theme.subtext || "SON-OS PHOTOBOOTH";
  const slotBoxes: { x: number; y: number; w: number; h: number }[] = [];

  const canvasFilter = filter?.canvasFilter || "none";

  // -------------------------------------------------------------
  // LAYOUT 1: SINGLE POLAROID (1:1 / Single Shot)
  // -------------------------------------------------------------
  if (layout === "single") {
    outCanvas.width = 1080;
    outCanvas.height = 1360;

    // Background Card
    ctx.fillStyle = theme.frameColor;
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
    renderCanvasPattern(ctx, outCanvas.width, outCanvas.height, theme);

    // Border halus
    ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, outCanvas.width - 2, outCanvas.height - 2);

    // Photo Box: 940 x 940 (square)
    const photoMargin = 70;
    const photoWidth = outCanvas.width - photoMargin * 2; // 940
    const photoHeight = photoWidth; // 1:1
    const photoY = 75;

    slotBoxes.push({ x: photoMargin, y: photoY, w: photoWidth, h: photoHeight });

    if (loadedSources[0]) {
      drawImageCover(ctx, loadedSources[0], photoMargin, photoY, photoWidth, photoHeight, 8, canvasFilter);
    }

    // Photo inner subtle shadow border
    ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(photoMargin, photoY, photoWidth, photoHeight);

    if (showStickers) {
      renderThemeOrnaments(ctx, outCanvas.width, outCanvas.height, theme, slotBoxes);
    }

    // Footer Caption & Date
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.font = "bold 26px 'Courier New', Courier, monospace";
    ctx.fillText(footerText, outCanvas.width / 2, 1160);

    if (showTimestamp) {
      ctx.font = "500 18px 'Courier New', Courier, monospace";
      ctx.fillStyle = theme.textColor === "#ffffff" || theme.textColor === "#f4f4f5" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)";
      ctx.fillText(`${dateStr} • ${timeStr}`, outCanvas.width / 2, 1205);
    }
  }

  // -------------------------------------------------------------
  // LAYOUT 2: STRIP 1-KOLOM (Vertical Strip 1x2, 1x3, 1x4, 1x6)
  // -------------------------------------------------------------
  else if (layout === "strip-1col") {
    const photoWidth = 560;
    const photoHeight = Math.round(photoWidth / theme.aspectRatio); // 420 (for 4:3)
    const paddingX = 45;
    const gap = 24;
    const startY = 48;
    const footerHeight = 150;

    outCanvas.width = photoWidth + paddingX * 2; // 650
    outCanvas.height = startY + shotCount * (photoHeight + gap) - gap + footerHeight;

    ctx.fillStyle = theme.frameColor;
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
    renderCanvasPattern(ctx, outCanvas.width, outCanvas.height, theme);

    for (let i = 0; i < shotCount; i++) {
      const currentY = startY + i * (photoHeight + gap);
      const box = { x: paddingX, y: currentY, w: photoWidth, h: photoHeight };
      slotBoxes.push(box);

      const frameSource = loadedSources[i];
      if (frameSource) {
        drawImageCover(ctx, frameSource, paddingX, currentY, photoWidth, photoHeight, 10, canvasFilter);
      } else {
        ctx.fillStyle = "rgba(128, 128, 128, 0.1)";
        ctx.fillRect(paddingX, currentY, photoWidth, photoHeight);
      }

      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(paddingX, currentY, photoWidth, photoHeight);
    }

    if (showStickers) {
      renderThemeOrnaments(ctx, outCanvas.width, outCanvas.height, theme, slotBoxes);
    }

    // Footer
    const footerY = startY + shotCount * (photoHeight + gap) + 36;
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(`${theme.badgeEmoji ? theme.badgeEmoji + " " : ""}${footerText}`, outCanvas.width / 2, footerY);

    if (showTimestamp) {
      ctx.font = "14px monospace";
      ctx.fillStyle = theme.textColor === "#f4f4f5" || theme.textColor === "#ffffff" ? "rgba(255, 255, 255, 0.55)" : "rgba(0, 0, 0, 0.45)";
      ctx.fillText(`${dateStr} • ${timeStr}`, outCanvas.width / 2, footerY + 28);
    }
  }

  // -------------------------------------------------------------
  // LAYOUT 3: GRID 2-KOLOM (2x1, 2x2, 2x3)
  // -------------------------------------------------------------
  else if (layout === "grid-2col") {
    const cols = 2;
    const rows = Math.ceil(shotCount / cols);
    const margin = 50;
    const gap = 24;
    const totalWidth = 1200;
    const photoWidth = (totalWidth - margin * 2 - gap * (cols - 1)) / cols; // 538
    const photoHeight = Math.round(photoWidth / theme.aspectRatio); // ~403
    const startY = 60;
    const footerHeight = 160;

    outCanvas.width = totalWidth;
    outCanvas.height = startY + rows * (photoHeight + gap) - gap + footerHeight;

    ctx.fillStyle = theme.frameColor;
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
    renderCanvasPattern(ctx, outCanvas.width, outCanvas.height, theme);

    for (let i = 0; i < shotCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = margin + col * (photoWidth + gap);
      const y = startY + row * (photoHeight + gap);
      const box = { x, y, w: photoWidth, h: photoHeight };
      slotBoxes.push(box);

      const frameSource = loadedSources[i];
      if (frameSource) {
        drawImageCover(ctx, frameSource, x, y, photoWidth, photoHeight, 14, canvasFilter);
      } else {
        ctx.fillStyle = "rgba(128, 128, 128, 0.1)";
        ctx.fillRect(x, y, photoWidth, photoHeight);
      }

      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, photoWidth, photoHeight);
    }

    if (showStickers) {
      renderThemeOrnaments(ctx, outCanvas.width, outCanvas.height, theme, slotBoxes);
    }

    // Grid Footer
    const footerY = startY + rows * (photoHeight + gap) + 40;
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(`${theme.badgeEmoji ? theme.badgeEmoji + " " : ""}${footerText}`, outCanvas.width / 2, footerY);

    if (showTimestamp) {
      ctx.font = "16px monospace";
      ctx.fillStyle = theme.textColor === "#1c1917" || theme.textColor === "#0f172a" ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.55)";
      ctx.fillText(`${dateStr} • ${timeStr}`, outCanvas.width / 2, footerY + 32);
    }
  }

  // -------------------------------------------------------------
  // LAYOUT 4: STRIP 1-BARIS (Horizontal 1x2, 1x3, 1x4)
  // -------------------------------------------------------------
  else if (layout === "strip-1row") {
    const photoHeight = 440;
    const photoWidth = Math.round(photoHeight * theme.aspectRatio); // ~586
    const margin = 45;
    const gap = 20;
    const startX = margin;
    const startY = 45;
    const footerHeight = 110;

    outCanvas.width = margin * 2 + shotCount * photoWidth + (shotCount - 1) * gap;
    outCanvas.height = startY + photoHeight + footerHeight;

    ctx.fillStyle = theme.frameColor;
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
    renderCanvasPattern(ctx, outCanvas.width, outCanvas.height, theme);

    for (let i = 0; i < shotCount; i++) {
      const x = startX + i * (photoWidth + gap);
      const y = startY;
      const box = { x, y, w: photoWidth, h: photoHeight };
      slotBoxes.push(box);

      const frameSource = loadedSources[i];
      if (frameSource) {
        drawImageCover(ctx, frameSource, x, y, photoWidth, photoHeight, 12, canvasFilter);
      } else {
        ctx.fillStyle = "rgba(128, 128, 128, 0.1)";
        ctx.fillRect(x, y, photoWidth, photoHeight);
      }

      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, photoWidth, photoHeight);
    }

    if (showStickers) {
      renderThemeOrnaments(ctx, outCanvas.width, outCanvas.height, theme, slotBoxes);
    }

    // Horizontal Strip Footer
    const footerY = startY + photoHeight + 45;
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(`${theme.badgeEmoji ? theme.badgeEmoji + " " : ""}${footerText}`, outCanvas.width / 2, footerY);

    if (showTimestamp) {
      ctx.font = "15px monospace";
      ctx.fillStyle = theme.textColor === "#1c1917" || theme.textColor === "#0f172a" ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.55)";
      ctx.fillText(`${dateStr} • ${timeStr}`, outCanvas.width / 2, footerY + 28);
    }
  }

  // 3. Return Data URL (PNG)
  return outCanvas.toDataURL("image/png", 1.0);
}
