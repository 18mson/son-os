// src/lib/camera/lensDetection.ts

export type LensType = "main" | "ultra-wide" | "telephoto" | "macro" | "front" | "unknown";

export interface ParsedCameraDevice {
  deviceId: string;
  label: string;
  lensType: LensType;
  displayName: string;
  shortLabel: string; // e.g. "1x", "0.5x", "Selfie", "Tele", "Macro"
  facing: "user" | "environment";
  index: number;
}

/**
 * Mengidentifikasi dan mengkategorisasi kamera fisik dari enumerateDevices()
 * Khusus menangani penamaan Samsung Galaxy (A54, S-series), Motorola, Xiaomi, iPhone, dsb.
 */
export function parseCameraDevices(devices: MediaDeviceInfo[]): ParsedCameraDevice[] {
  const videoDevices = devices.filter((d) => d.kind === "videoinput");
  const result: ParsedCameraDevice[] = [];

  // Hitung berapa kamera belakang dan depan yang terdeteksi
  let backCount = 0;
  let frontCount = 0;

  videoDevices.forEach((dev, idx) => {
    const rawLabel = dev.label || `Camera ${idx + 1}`;
    const labelLower = rawLabel.toLowerCase();

    let lensType: LensType = "unknown";
    let facing: "user" | "environment" = "environment";
    let displayName = rawLabel;
    let shortLabel = `${idx + 1}x`;

    // 1. Deteksi Kamera Depan / Selfie
    if (
      labelLower.includes("front") ||
      labelLower.includes("user") ||
      labelLower.includes("selfie") ||
      labelLower.includes("facing front") ||
      /camera[2]?\s*1\b/i.test(labelLower) // Android Camera2 ID 1 = Front
    ) {
      lensType = "front";
      facing = "user";
      frontCount++;
      displayName = frontCount > 1 ? `Kamera Depan ${frontCount}` : "Kamera Depan (Selfie)";
      shortLabel = "Depan";
    }
    // 2. Deteksi Kamera Ultra-Wide (0.5x)
    else if (
      labelLower.includes("ultra") ||
      labelLower.includes("super wide") ||
      labelLower.includes("wide-angle") ||
      labelLower.includes("0.5x") ||
      labelLower.includes("0.6x") ||
      /camera[2]?\s*2\b/i.test(labelLower) // Samsung A54 / Android Camera2 ID 2 = Ultra-Wide
    ) {
      lensType = "ultra-wide";
      facing = "environment";
      displayName = "Ultra Wide (0.5x)";
      shortLabel = "0.5x";
      backCount++;
    }
    // 3. Deteksi Kamera Macro
    else if (
      labelLower.includes("macro") ||
      /camera[2]?\s*3\b/i.test(labelLower) // Samsung A54 Camera2 ID 3 = Macro
    ) {
      lensType = "macro";
      facing = "environment";
      displayName = "Kamera Macro";
      shortLabel = "Macro";
      backCount++;
    }
    // 4. Deteksi Kamera Telephoto / Zoom
    else if (
      labelLower.includes("tele") ||
      labelLower.includes("zoom") ||
      labelLower.includes("2x") ||
      labelLower.includes("3x") ||
      labelLower.includes("5x")
    ) {
      lensType = "telephoto";
      facing = "environment";
      displayName = "Telephoto / Zoom";
      shortLabel = "2x";
      backCount++;
    }
    // 5. Deteksi Kamera Utama / Wide (1x Normal)
    else if (
      labelLower.includes("main") ||
      labelLower.includes("primary") ||
      labelLower.includes("standard") ||
      /camera[2]?\s*0\b/i.test(labelLower) || // Android Camera2 ID 0 = Main Wide
      labelLower.includes("back 0") ||
      labelLower.includes("facing back 0") ||
      (labelLower.includes("wide") && !labelLower.includes("ultra"))
    ) {
      lensType = "main";
      facing = "environment";
      displayName = "Kamera Utama (1x Normal)";
      shortLabel = "1x";
      backCount++;
    }
    // 6. Generic Back Camera Fallback
    else if (
      labelLower.includes("back") ||
      labelLower.includes("environment") ||
      labelLower.includes("rear")
    ) {
      backCount++;
      facing = "environment";
      // Kamera belakang pertama umumnya adalah kamera utama
      if (backCount === 1) {
        lensType = "main";
        displayName = "Kamera Utama (1x Normal)";
        shortLabel = "1x";
      } else if (backCount === 2) {
        lensType = "ultra-wide";
        displayName = "Ultra Wide (0.5x)";
        shortLabel = "0.5x";
      } else {
        lensType = "telephoto";
        displayName = `Kamera Belakang ${backCount}`;
        shortLabel = `${backCount}x`;
      }
    }
    // 7. Unspecified device fallback
    else {
      // Jika belum diketahui, asumsikan index 0 = Main, index 1 = Front
      if (idx === 0) {
        lensType = "main";
        facing = "environment";
        displayName = "Kamera Utama (1x)";
        shortLabel = "1x";
        backCount++;
      } else if (idx === 1 && frontCount === 0) {
        lensType = "front";
        facing = "user";
        displayName = "Kamera Depan";
        shortLabel = "Depan";
        frontCount++;
      } else {
        lensType = "unknown";
        facing = "environment";
        displayName = rawLabel || `Kamera ${idx + 1}`;
        shortLabel = `Cam ${idx + 1}`;
      }
    }

    result.push({
      deviceId: dev.deviceId,
      label: rawLabel,
      lensType,
      displayName,
      shortLabel,
      facing,
      index: idx,
    });
  });

  return result;
}

/**
 * Mencari kamera terbaik berdasarkan facingMode yang diinginkan.
 * Khusus untuk "environment" (belakang), memprioritaskan kamera Utama (Main 1x)
 * dan MENGHINDARI Ultra-Wide/Macro yang tidak sengaja terpilih.
 */
export function findBestLensForFacing(
  parsedLenses: ParsedCameraDevice[],
  targetFacing: "user" | "environment"
): ParsedCameraDevice | null {
  if (parsedLenses.length === 0) return null;

  if (targetFacing === "user") {
    // Prioritaskan lensType: front
    const frontLens = parsedLenses.find((l) => l.lensType === "front");
    if (frontLens) return frontLens;

    const userFacing = parsedLenses.find((l) => l.facing === "user");
    if (userFacing) return userFacing;

    return parsedLenses[0];
  }

  // Untuk targetFacing === "environment" (belakang)
  // 1. Prioritas 1: Lensa bertipe "main" (1x Normal)
  const mainLens = parsedLenses.find((l) => l.lensType === "main" && l.facing === "environment");
  if (mainLens) return mainLens;

  // 2. Prioritas 2: Kamera belakang apa saja selain ultra-wide/macro
  const regularBack = parsedLenses.find(
    (l) => l.facing === "environment" && l.lensType !== "ultra-wide" && l.lensType !== "macro"
  );
  if (regularBack) return regularBack;

  // 3. Prioritas 3: Kamera belakang apapun
  const anyBack = parsedLenses.find((l) => l.facing === "environment");
  if (anyBack) return anyBack;

  return parsedLenses[0];
}
