// src/store/photoboothStore.ts
import { create } from "zustand";
import {
  DEFAULT_THEME_ID,
  getThemeById,
  PhotoboothTheme,
  PhotoboothLayout,
} from "@/components/apps/photobooth/themes/themes.config";
import {
  DEFAULT_FILTER_ID,
  getFilterById,
  PhotoboothFilter,
} from "@/components/apps/photobooth/filters/filters.config";

export type PhotoboothStep =
  | "select-theme"
  | "ready"
  | "counting"
  | "capturing"
  | "composing"
  | "result";

export interface PhotoboothState {
  selectedThemeId: string;
  selectedFilterId: string;
  customLayout: PhotoboothLayout;
  customShotCount: number;
  customCaption: string;
  showTimestamp: boolean;
  showStickers: boolean;

  currentStep: PhotoboothStep;
  countdown: number;
  currentShotIndex: number;
  capturedFrames: HTMLCanvasElement[];
  capturedPreviewUrls: string[];
  finalResultUrl: string | null;
  isComposing: boolean;
  error: string | null;

  // Selectors / Helpers
  getSelectedTheme: () => PhotoboothTheme;
  getSelectedFilter: () => PhotoboothFilter;
  getActiveLayout: () => PhotoboothLayout;
  getActiveShotCount: () => number;

  // Actions
  setTheme: (themeId: string) => void;
  setFilter: (filterId: string) => void;
  setLayout: (layout: PhotoboothLayout) => void;
  setShotCount: (shotCount: number) => void;
  setCustomCaption: (caption: string) => void;
  setShowTimestamp: (show: boolean) => void;
  setShowStickers: (show: boolean) => void;

  setStep: (step: PhotoboothStep) => void;
  startSession: () => void;
  setCountdown: (n: number) => void;
  addCapturedFrame: (canvas: HTMLCanvasElement, previewUrl: string) => void;
  setComposing: (isComposing: boolean) => void;
  setFinalResult: (url: string | null) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
  retakeCurrentSession: () => void;
}

export const usePhotoboothStore = create<PhotoboothState>((set, get) => {
  const initialTheme = getThemeById(DEFAULT_THEME_ID);

  return {
    selectedThemeId: DEFAULT_THEME_ID,
    selectedFilterId: DEFAULT_FILTER_ID,
    customLayout: initialTheme.layout,
    customShotCount: initialTheme.shotCount,
    customCaption: "",
    showTimestamp: true,
    showStickers: true,

    currentStep: "select-theme",
    countdown: 3,
    currentShotIndex: 0,
    capturedFrames: [],
    capturedPreviewUrls: [],
    finalResultUrl: null,
    isComposing: false,
    error: null,

    getSelectedTheme: () => {
      return getThemeById(get().selectedThemeId);
    },

    getSelectedFilter: () => {
      return getFilterById(get().selectedFilterId);
    },

    getActiveLayout: () => {
      const state = get();
      const theme = state.getSelectedTheme();
      // Pastikan layout yang dipilih didukung tema, jika tidak fallback ke theme.layout
      if (theme.allowedLayouts.includes(state.customLayout)) {
        return state.customLayout;
      }
      return theme.layout;
    },

    getActiveShotCount: () => {
      const state = get();
      const theme = state.getSelectedTheme();
      if (theme.allowedShotCounts.includes(state.customShotCount)) {
        return state.customShotCount;
      }
      return theme.shotCount;
    },

    setTheme: (themeId: string) => {
      const newTheme = getThemeById(themeId);
      set({
        selectedThemeId: themeId,
        customLayout: newTheme.layout,
        customShotCount: newTheme.shotCount,
      });
    },

    setFilter: (filterId: string) => {
      set({ selectedFilterId: filterId });
    },

    setLayout: (layout: PhotoboothLayout) => {
      set({ customLayout: layout });
    },

    setShotCount: (shotCount: number) => {
      set({ customShotCount: shotCount });
    },

    setCustomCaption: (caption: string) => {
      set({ customCaption: caption });
    },

    setShowTimestamp: (show: boolean) => {
      set({ showTimestamp: show });
    },

    setShowStickers: (show: boolean) => {
      set({ showStickers: show });
    },

    setStep: (currentStep: PhotoboothStep) => {
      set({ currentStep });
    },

    startSession: () => {
      const theme = get().getSelectedTheme();
      set({
        currentStep: "ready",
        currentShotIndex: 0,
        capturedFrames: [],
        capturedPreviewUrls: [],
        finalResultUrl: null,
        countdown: theme.countdownSeconds,
        error: null,
        isComposing: false,
      });
    },

    setCountdown: (countdown: number) => {
      set({ countdown });
    },

    addCapturedFrame: (canvas: HTMLCanvasElement, previewUrl: string) => {
      set((state) => ({
        capturedFrames: [...state.capturedFrames, canvas],
        capturedPreviewUrls: [...state.capturedPreviewUrls, previewUrl],
        currentShotIndex: state.currentShotIndex + 1,
      }));
    },

    setComposing: (isComposing: boolean) => {
      set({ isComposing });
    },

    setFinalResult: (finalResultUrl: string | null) => {
      set({ finalResultUrl, currentStep: "result", isComposing: false });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    resetSession: () => {
      set({
        currentStep: "select-theme",
        currentShotIndex: 0,
        capturedFrames: [],
        capturedPreviewUrls: [],
        finalResultUrl: null,
        error: null,
        isComposing: false,
      });
    },

    retakeCurrentSession: () => {
      const theme = get().getSelectedTheme();
      set({
        currentStep: "ready",
        currentShotIndex: 0,
        capturedFrames: [],
        capturedPreviewUrls: [],
        finalResultUrl: null,
        countdown: theme.countdownSeconds,
        error: null,
        isComposing: false,
      });
    },
  };
});
