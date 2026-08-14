// src/components/apps/photobooth/lib/canvasDecorators.ts
import { OrnamentType, PhotoboothTheme } from "../themes/themes.config";

/**
 * Menggambar 4-point sparkle star (Y2K / Aesthetic)
 */
export function drawSparkleStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  glow = true
) {
  ctx.save();
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 0.8;
  }
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx, cy, cx + size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + size);
  ctx.quadraticCurveTo(cx, cy, cx - size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - size);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Menggambar doodle hati imut
 */
export function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fillColor: string,
  strokeColor?: string
) {
  ctx.save();
  ctx.fillStyle = fillColor;
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
  }

  const d = size;
  ctx.beginPath();
  ctx.moveTo(cx, cy + d * 0.7);
  ctx.bezierCurveTo(cx - d * 0.8, cy + d * 0.2, cx - d, cy - d * 0.5, cx - d * 0.4, cy - d * 0.7);
  ctx.bezierCurveTo(cx - d * 0.1, cy - d * 0.8, cx, cy - d * 0.4, cx, cy - d * 0.3);
  ctx.bezierCurveTo(cx, cy - d * 0.4, cx + d * 0.1, cy - d * 0.8, cx + d * 0.4, cy - d * 0.7);
  ctx.bezierCurveTo(cx + d, cy - d * 0.5, cx + d * 0.8, cy + d * 0.2, cx, cy + d * 0.7);
  ctx.closePath();
  ctx.fill();
  if (strokeColor) ctx.stroke();
  ctx.restore();
}

/**
 * Menggambar pita imut (Kawaii Bow)
 */
export function drawKawaiiBow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color = "#f43f5e"
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;

  // Sayap kiri pita
  ctx.beginPath();
  ctx.ellipse(cx - size * 0.7, cy, size * 0.7, size * 0.45, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sayap kanan pita
  ctx.beginPath();
  ctx.ellipse(cx + size * 0.7, cy, size * 0.7, size * 0.45, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pita juntaian bawah
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy);
  ctx.lineTo(cx - size * 0.6, cy + size * 0.9);
  ctx.lineTo(cx - size * 0.3, cy + size * 0.7);
  ctx.lineTo(cx, cy + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + 3, cy);
  ctx.lineTo(cx + size * 0.6, cy + size * 0.9);
  ctx.lineTo(cx + size * 0.3, cy + size * 0.7);
  ctx.lineTo(cx, cy + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Simpul tengah
  ctx.fillStyle = "#ffe4e6";
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Menggambar tapak kucing (Cat paw doodle)
 */
export function drawCatPaw(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color = "#fda4af"
) {
  ctx.save();
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.2, size * 0.5, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  const toes = [
    { dx: -size * 0.45, dy: -size * 0.25, r: size * 0.18 },
    { dx: -size * 0.18, dy: -size * 0.45, r: size * 0.2 },
    { dx: size * 0.18, dy: -size * 0.45, r: size * 0.2 },
    { dx: size * 0.45, dy: -size * 0.25, r: size * 0.18 },
  ];

  toes.forEach((t) => {
    ctx.beginPath();
    ctx.arc(cx + t.dx, cy + t.dy, t.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Menggambar Bunga Sakura Jepang 5 Kelopak (Sakura Blossom)
 */
export function drawSakuraFlower(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  petalColor = "#f472b6",
  centerColor = "#f43f5e"
) {
  ctx.save();
  ctx.translate(cx, cy);

  // 5 kelopak sakura mekar
  const numPetals = 5;
  for (let i = 0; i < numPetals; i++) {
    const angle = (i * 2 * Math.PI) / numPetals;
    ctx.save();
    ctx.rotate(angle);

    ctx.fillStyle = petalColor;
    ctx.beginPath();
    // Bentuk lekukan kelopak sakura berlekuk di ujung
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 0.35, -size * 0.4, -size * 0.45, -size * 0.85, -size * 0.15, -size);
    ctx.lineTo(0, -size * 0.88); // celah kecil khas sakura
    ctx.lineTo(size * 0.15, -size);
    ctx.bezierCurveTo(size * 0.45, -size * 0.85, size * 0.35, -size * 0.4, 0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Putik tengah sakura
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Serbuk sari putih
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Menggambar Kelopak Sakura yang Berguguran
 */
export function drawSakuraPetal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  angle: number,
  color = "#f9a8d4"
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.4, -size * 0.4, -size * 0.4, -size * 0.9, -size * 0.1, -size);
  ctx.lineTo(0, -size * 0.85);
  ctx.lineTo(size * 0.1, -size);
  ctx.bezierCurveTo(size * 0.4, -size * 0.9, size * 0.4, -size * 0.4, 0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Menggambar Ranting Bunga Sakura dengan Tunas Daun
 */
export function drawSakuraBranch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  length: number,
  angle: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Ranting cokelat kayu elegan
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.4, length * 0.15, length, 0);
  ctx.stroke();

  // Bunga-bunga sakura mekar di ranting
  drawSakuraFlower(ctx, length * 0.3, length * 0.08, 14, "#fbcfe8", "#f43f5e");
  drawSakuraFlower(ctx, length * 0.7, length * 0.05, 17, "#f472b6", "#e11d48");
  drawSakuraFlower(ctx, length, 0, 12, "#fda4af", "#f43f5e");

  // Kelopak jatuh di dekat ranting
  drawSakuraPetal(ctx, length * 0.5, length * 0.3, 8, 0.6, "#f9a8d4");
  drawSakuraPetal(ctx, length * 0.9, length * 0.25, 7, -0.4, "#f472b6");

  ctx.restore();
}

/**
 * Menggambar Daun & Sulur Emas (Botanical Romance)
 */
export function drawGoldLeafBranch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  length: number,
  angle: number,
  color = "#d97706"
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.5, -length * 0.15, length, 0);
  ctx.stroke();

  for (let i = 0.2; i <= 0.9; i += 0.2) {
    const x = length * i;
    const y = -length * 0.15 * Math.sin(i * Math.PI);

    ctx.beginPath();
    ctx.ellipse(x, y - 8, 9, 4.5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(x + 4, y + 8, 9, 4.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Menggambar Barcode analog / Editorial
 */
export function drawBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color = "#000000"
) {
  ctx.save();
  ctx.fillStyle = color;
  const barCount = Math.floor(w / 4);
  let curX = x;

  for (let i = 0; i < barCount; i++) {
    const barWidth = i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2;
    if (i % 2 === 0) {
      ctx.fillRect(curX, y, barWidth, h);
    }
    curX += barWidth + 1.5;
    if (curX >= x + w) break;
  }
  ctx.restore();
}

/**
 * Menggambar Pattern Background Canvas
 */
export function renderCanvasPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: PhotoboothTheme
) {
  if (!theme.patternType || theme.patternType === "none") return;

  ctx.save();

  if (theme.patternType === "dots") {
    ctx.fillStyle = theme.textColor === "#e11d48" ? "rgba(244, 63, 94, 0.08)" : "rgba(255, 255, 255, 0.06)";
    const gap = 32;
    for (let x = gap / 2; x < width; x += gap) {
      for (let y = gap / 2; y < height; y += gap) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (theme.patternType === "grid") {
    ctx.strokeStyle = "rgba(34, 211, 238, 0.08)";
    ctx.lineWidth = 1;
    const size = 36;
    for (let x = 0; x < width; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (theme.patternType === "stars") {
    const starCount = 30;
    for (let i = 0; i < starCount; i++) {
      const sx = ((i * 137.5) % (width - 40)) + 20;
      const sy = ((i * 224.3) % (height - 40)) + 20;
      const sz = 3 + (i % 5) * 1.5;
      drawSparkleStar(ctx, sx, sy, sz, "rgba(232, 121, 249, 0.35)", false);
    }
  } else if (theme.patternType === "petals") {
    // Taburan kelopak sakura halus berguguran di background
    const petalCount = 28;
    for (let i = 0; i < petalCount; i++) {
      const px = (i * 97) % width;
      const py = (i * 153) % height;
      const sz = 6 + (i % 4) * 2;
      const ang = (i * 45 * Math.PI) / 180;
      drawSakuraPetal(ctx, px, py, sz, ang, "rgba(244, 114, 182, 0.22)");
    }
  } else if (theme.patternType === "halftone") {
    // Pola Ben-Day dots komik pop art
    ctx.fillStyle = "rgba(220, 38, 38, 0.1)";
    const gap = 16;
    for (let x = gap / 2; x < width; x += gap) {
      for (let y = gap / 2; y < height; y += gap) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

/**
 * Render Specific Theme Ornaments
 */
export function renderThemeOrnaments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: PhotoboothTheme,
  slotBoxes: { x: number; y: number; w: number; h: number }[]
) {
  const type: OrnamentType = theme.ornamentType;
  if (type === "none") return;

  ctx.save();

  switch (type) {
    case "sakura-blossom": {
      // Ranting Sakura mekar di pojok atas kiri & kanan
      drawSakuraBranch(ctx, 15, 30, 90, 0.25);
      drawSakuraBranch(ctx, width - 15, 30, 90, 2.85);

      // Bunga mekar besar di sela-sela bawah
      drawSakuraFlower(ctx, 38, height - 70, 20, "#f472b6", "#e11d48");
      drawSakuraFlower(ctx, width - 38, height - 70, 20, "#fda4af", "#e11d48");

      // Kelopak berguguran di sekitar foto
      slotBoxes.forEach((b, idx) => {
        if (idx % 2 === 0) {
          drawSakuraPetal(ctx, b.x + b.w + 12, b.y + 10, 10, 0.4, "#f472b6");
        } else {
          drawSakuraPetal(ctx, b.x - 12, b.y + b.h - 10, 10, -0.6, "#fb7185");
        }
      });
      break;
    }

    case "pop-art": {
      // Bold Comic Book Action Bursts
      // 1. BOOM! burst di pojok atas kanan
      ctx.save();
      ctx.translate(width - 65, 55);
      ctx.rotate(0.1);
      ctx.fillStyle = "#ef4444";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      const spikes = 10;
      const outerR = 34;
      const innerR = 18;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (i * Math.PI) / spikes;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fef08a";
      ctx.font = "900 13px 'Arial Black', Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BOOM!", 0, 5);
      ctx.restore();

      // 2. WOW! speech bubble di pojok kiri bawah
      ctx.save();
      ctx.translate(55, height - 65);
      ctx.rotate(-0.08);

      ctx.fillStyle = "#3b82f6";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-30, -18, 60, 36, 12);
      } else {
        ctx.rect(-30, -18, 60, 36);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 12px 'Arial Black', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("WOW!", 0, 4);
      ctx.restore();

      // Bold Comic Frame Borders pada slot foto
      slotBoxes.forEach((b) => {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      });
      break;
    }

    case "kawaii-doodles": {
      if (slotBoxes.length > 0) {
        drawKawaiiBow(ctx, width / 2, slotBoxes[0].y - 18, 16, "#f43f5e");
      }

      drawCatPaw(ctx, 35, 45, 14, "#fda4af");
      drawCatPaw(ctx, width - 35, 45, 14, "#fda4af");
      drawHeart(ctx, 35, height - 70, 14, "#f43f5e", "#ffe4e6");
      drawHeart(ctx, width - 35, height - 70, 14, "#f43f5e", "#ffe4e6");

      slotBoxes.forEach((b, idx) => {
        if (idx % 2 === 0) {
          drawSparkleStar(ctx, b.x + b.w - 10, b.y - 10, 8, "#fb7185", false);
        } else {
          drawCatPaw(ctx, b.x + 12, b.y + b.h + 12, 8, "#f472b6");
        }
      });
      break;
    }

    case "y2k-cyber": {
      drawSparkleStar(ctx, 36, 40, 20, "#e879f9");
      drawSparkleStar(ctx, width - 36, 40, 20, "#22d3ee");
      drawSparkleStar(ctx, 42, height - 80, 16, "#f472b6");
      drawSparkleStar(ctx, width - 42, height - 80, 18, "#c084fc");

      drawHeart(ctx, width / 2 - 80, height - 70, 12, "#f43f5e", "#ffffff");
      drawHeart(ctx, width / 2 + 80, height - 70, 12, "#38bdf8", "#ffffff");

      slotBoxes.forEach((b) => {
        ctx.strokeStyle = "rgba(232, 121, 249, 0.7)";
        ctx.lineWidth = 3;
        const bLen = 14;

        ctx.beginPath();
        ctx.moveTo(b.x - 4, b.y + bLen);
        ctx.lineTo(b.x - 4, b.y - 4);
        ctx.lineTo(b.x + bLen, b.y - 4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(b.x + b.w + 4 - bLen, b.y - 4);
        ctx.lineTo(b.x + b.w + 4, b.y - 4);
        ctx.lineTo(b.x + b.w + 4, b.y + bLen);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(b.x - 4, b.y + b.h - bLen);
        ctx.lineTo(b.x - 4, b.y + b.h + 4);
        ctx.lineTo(b.x + bLen, b.y + b.h + 4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(b.x + b.w + 4 - bLen, b.y + b.h + 4);
        ctx.lineTo(b.x + b.w + 4, b.y + b.h + 4);
        ctx.lineTo(b.x + b.w + 4, b.y + b.h - bLen);
        ctx.stroke();
      });
      break;
    }

    case "party-confetti": {
      const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6"];
      for (let i = 0; i < 45; i++) {
        const cx = (i * 73) % width;
        const cy = (i * 127) % height;
        const col = colors[i % colors.length];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((i * 45 * Math.PI) / 180);
        ctx.fillStyle = col;
        if (i % 3 === 0) {
          ctx.fillRect(-4, -2, 8, 4);
        } else if (i % 3 === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawSparkleStar(ctx, 0, 0, 6, col, false);
        }
        ctx.restore();
      }
      break;
    }

    case "film-roll": {
      ctx.fillStyle = "#0a0a0c";
      const holeW = 12;
      const holeH = 18;
      const holeRadius = 3;

      for (let y = 25; y < height - 60; y += 38) {
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(10, y, holeW, holeH, holeRadius);
          ctx.roundRect(width - 22, y, holeW, holeH, holeRadius);
        } else {
          ctx.rect(10, y, holeW, holeH);
          ctx.rect(width - 22, y, holeW, holeH);
        }
        ctx.fill();
      }

      slotBoxes.forEach((b, idx) => {
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`► ${idx + 1}A`, 28, b.y + b.h / 2);
        ctx.textAlign = "right";
        ctx.fillText(`ISO 400`, width - 28, b.y + b.h / 2);
      });
      break;
    }

    case "retro-tokyo": {
      ctx.fillStyle = "#22d3ee";
      ctx.font = "bold 13px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.fillText("■ REC [00:26:14]", 36, 38);

      ctx.fillStyle = "#f43f5e";
      ctx.textAlign = "right";
      ctx.fillText("SON-OS 1998", width - 36, 38);

      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;
    }

    case "newspaper": {
      drawBarcode(ctx, 35, height - 70, 90, 32, "#1c1917");

      ctx.save();
      ctx.translate(width - 70, height - 55);
      ctx.rotate(-0.15);
      ctx.strokeStyle = "#78716c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#78716c";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SON-OS", 0, -8);
      ctx.fillText("PRESS", 0, 3);
      ctx.fillText("★ 2026 ★", 0, 14);
      ctx.restore();
      break;
    }

    case "botanical-love": {
      drawGoldLeafBranch(ctx, 30, 35, 60, 0.4, "#d97706");
      drawGoldLeafBranch(ctx, width - 30, 35, 60, 2.7, "#d97706");
      drawGoldLeafBranch(ctx, 30, height - 40, 60, -0.4, "#d97706");
      drawGoldLeafBranch(ctx, width - 30, height - 40, 60, -2.7, "#d97706");
      break;
    }
  }

  ctx.restore();
}
