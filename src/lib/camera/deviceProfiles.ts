// src/lib/camera/deviceProfiles.ts

export type ChipsetTier = "entry" | "mid-low" | "mid-high" | "flagship";

export interface ColorCorrectionConfig {
  saturation: number; // 1.0 = normal, >1.0 = boost (cocok untuk IPS G45)
  contrast: number; // 1.0 = normal
  brightness: number; // 1.0 = normal
  warmth: number; // 0.0 = netral, >0 = warm, <0 = cool (penyesuaian AMOLED A54)
  sharpness: number; // 0.0 = none, 0.2 - 0.5 = subtle unsharp mask
}

export interface CameraConstraintLadder {
  idealWidth: number;
  idealHeight: number;
  idealFrameRate: number;
  minFrameRate?: number;
  maxFrameRate?: number;
  facingMode: "user" | "environment";
  exposureCompensationBias?: number; // Nilai negatif untuk shutter lebih cepat (hindari blur di non-OIS)
}

export interface PostProcessingConfig {
  enableLowLightDenoise: boolean;
  denoiseStrength: number; // 0.0 - 1.0
  multiFrameBurstCount: number; // 1 = single shot, 3-5 = burst & pick sharpest (untuk G45)
  maxCanvasDimension: number; // Batasi resolusi processing di canvas agar chipset tidak lag
  useWebWorker: boolean;
}

export interface DeviceProfile {
  id: string;
  brand: "motorola" | "samsung" | "apple" | "generic";
  modelName: string;
  chipsetTier: ChipsetTier;
  hasOIS: boolean;
  displayType: "ips" | "amoled" | "oled" | "lcd";
  constraintsLadder: CameraConstraintLadder[];
  colorCorrection: ColorCorrectionConfig;
  postProcessing: PostProcessingConfig;
  preferredCaptureMethod?: "auto" | "image-capture" | "canvas-fallback";
  notes?: string;
}

// -------------------------------------------------------------
// DEFAULT PROFILES
// -------------------------------------------------------------

export const MOTO_G45_5G_PROFILE: DeviceProfile = {
  id: "motorola-g45-5g",
  brand: "motorola",
  modelName: "Moto G45 5G (Snapdragon 6s Gen 3)",
  chipsetTier: "mid-low",
  hasOIS: false, // Tidak ada OIS -> rentan blur di handheld/low-light
  displayType: "ips",
  constraintsLadder: [
    // Tier 1: 1080p @ 30fps (stabil untuk SD 6s Gen 3)
    {
      idealWidth: 1920,
      idealHeight: 1080,
      idealFrameRate: 30,
      minFrameRate: 24,
      maxFrameRate: 30,
      facingMode: "environment",
      exposureCompensationBias: -0.3, // Bias sedikit underexpose -> Shutter lebih cepat
    },
    // Tier 2: 720p @ 30fps
    {
      idealWidth: 1280,
      idealHeight: 720,
      idealFrameRate: 30,
      facingMode: "environment",
    },
    // Tier 3: 640x480 (Safe fallback)
    {
      idealWidth: 640,
      idealHeight: 480,
      idealFrameRate: 24,
      facingMode: "environment",
    },
  ],
  colorCorrection: {
    saturation: 1.12, // Boost sedikit saturasi agar preview di layar IPS lebih vibrant
    contrast: 1.05,
    brightness: 1.0,
    warmth: 0.02,
    sharpness: 0.35, // Unsharp mask ringan untuk kompensasi ketiadaan OIS
  },
  postProcessing: {
    enableLowLightDenoise: true,
    denoiseStrength: 0.45,
    multiFrameBurstCount: 3, // Ambil 3 frame kilat, pilih yang paling tajam
    maxCanvasDimension: 1920,
    useWebWorker: true, // Jangan block main thread UI SonOS
  },
};

export const SAMSUNG_A54_PROFILE: DeviceProfile = {
  id: "samsung-a54-5g",
  brand: "samsung",
  modelName: "Samsung Galaxy A54 5G (Exynos 1380)",
  chipsetTier: "mid-high",
  hasOIS: true, // Punya hardware OIS
  displayType: "amoled",
  constraintsLadder: [
    // Tier 1: 1440p / FHD 60fps
    {
      idealWidth: 2560,
      idealHeight: 1440,
      idealFrameRate: 30,
      minFrameRate: 30,
      maxFrameRate: 60,
      facingMode: "environment",
      exposureCompensationBias: 0.0,
    },
    // Tier 2: 1080p @ 30-60fps
    {
      idealWidth: 1920,
      idealHeight: 1080,
      idealFrameRate: 30,
      facingMode: "environment",
    },
    // Tier 3: 720p Safe fallback
    {
      idealWidth: 1280,
      idealHeight: 720,
      idealFrameRate: 30,
      facingMode: "environment",
    },
  ],
  colorCorrection: {
    saturation: 0.98, // Layar AMOLED sudah sangat saturated, hindari oversaturation
    contrast: 1.0,
    brightness: 1.0,
    warmth: -0.02, // Sedikit cool tone balance
    sharpness: 0.15,
  },
  postProcessing: {
    enableLowLightDenoise: true,
    denoiseStrength: 0.2, // OIS sudah bantu stabilisasi sensor, denoise secukupnya
    multiFrameBurstCount: 1, // Cukup single shot karena ada OIS
    maxCanvasDimension: 2560,
    useWebWorker: true,
  },
};

export const GENERIC_MOBILE_PROFILE: DeviceProfile = {
  id: "generic-mobile",
  brand: "generic",
  modelName: "Generic Mobile Device",
  chipsetTier: "mid-low",
  hasOIS: false,
  displayType: "ips",
  constraintsLadder: [
    { idealWidth: 1920, idealHeight: 1080, idealFrameRate: 30, facingMode: "environment" },
    { idealWidth: 1280, idealHeight: 720, idealFrameRate: 30, facingMode: "environment" },
    { idealWidth: 640, idealHeight: 480, idealFrameRate: 24, facingMode: "environment" },
  ],
  colorCorrection: { saturation: 1.0, contrast: 1.0, brightness: 1.0, warmth: 0.0, sharpness: 0.0 },
  postProcessing: {
    enableLowLightDenoise: false,
    denoiseStrength: 0.0,
    multiFrameBurstCount: 1,
    maxCanvasDimension: 1920,
    useWebWorker: false,
  },
};

export const GENERIC_DESKTOP_PROFILE: DeviceProfile = {
  id: "generic-desktop",
  brand: "generic",
  modelName: "Desktop / Laptop Webcam",
  chipsetTier: "mid-high",
  hasOIS: false,
  displayType: "ips",
  constraintsLadder: [
    { idealWidth: 1280, idealHeight: 720, idealFrameRate: 30, facingMode: "user" },
    { idealWidth: 640, idealHeight: 480, idealFrameRate: 30, facingMode: "user" },
  ],
  colorCorrection: { saturation: 1.0, contrast: 1.0, brightness: 1.0, warmth: 0.0, sharpness: 0.0 },
  postProcessing: {
    enableLowLightDenoise: false,
    denoiseStrength: 0.0,
    multiFrameBurstCount: 1,
    maxCanvasDimension: 1280,
    useWebWorker: false,
  },
};

// -------------------------------------------------------------
// DEVICE DETECTION ENGINE
// -------------------------------------------------------------

interface NavigatorUAData {
  brands: Array<{ brand: string; version: string }>;
  mobile: boolean;
  platform: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{
    model?: string;
    platformVersion?: string;
    architecture?: string;
  }>;
}

export async function detectDeviceProfile(): Promise<DeviceProfile> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return GENERIC_DESKTOP_PROFILE;
  }

  const nav = navigator as unknown as { userAgentData?: NavigatorUAData };

  // 1. Deteksi modern via Client Hints (navigator.userAgentData)
  if (nav.userAgentData?.getHighEntropyValues) {
    try {
      const hints = await nav.userAgentData.getHighEntropyValues(["model", "platformVersion"]);
      const model = (hints.model || "").toLowerCase();

      // Motorola G45 5G identifiers
      if (model.includes("g45") || model.includes("xt2433") || model.includes("motorola")) {
        return MOTO_G45_5G_PROFILE;
      }
      // Samsung A54 5G identifiers
      if (model.includes("a54") || model.includes("sm-a546") || model.includes("samsung")) {
        return SAMSUNG_A54_PROFILE;
      }
    } catch {
      // Fallback ke UA string jika permission dibatasi
    }
  }

  // 2. Fallback ke User-Agent regex parsing
  const ua = navigator.userAgent.toLowerCase();

  // Check Motorola Moto G45
  if (
    /moto.*g45|xt2433/i.test(ua) ||
    (/motorola|moto/i.test(ua) && /android/i.test(ua))
  ) {
    return MOTO_G45_5G_PROFILE;
  }

  // Check Samsung Galaxy A54
  if (
    /sm-a546|galaxy a54/i.test(ua) ||
    (/samsung/i.test(ua) && /android/i.test(ua) && /sm-a/i.test(ua))
  ) {
    return SAMSUNG_A54_PROFILE;
  }

  // Check apakah Mobile atau Desktop
  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua) || nav.userAgentData?.mobile;
  return isMobile ? GENERIC_MOBILE_PROFILE : GENERIC_DESKTOP_PROFILE;
}
