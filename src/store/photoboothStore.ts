// src/store/photoboothStore.ts
import { create } from "zustand";
import {
  DEFAULT_THEME_ID,
  getThemeById,
  PhotoboothTheme,
} from "@/components/apps/photobooth/themes/themes.config";

export type PhotoboothStep =
  | "select-theme"
  | "ready"
  | "counting"
  | "capturing"
  | "composing"
  | "result";

export interface PhotoboothState {
  selectedThemeId: string;
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

  // Actions
  setTheme: (themeId: string) => void;
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

export const usePhotoboothStore = create<PhotoboothState>((set, get) => ({
  selectedThemeId: DEFAULT_THEME_ID,
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

  setTheme: (themeId: string) => {
    set({ selectedThemeId: themeId });
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
}));
