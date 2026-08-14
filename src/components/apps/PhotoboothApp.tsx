// src/components/apps/PhotoboothApp.tsx
"use client";

import React from "react";
import { usePhotoboothStore } from "@/store/photoboothStore";
import { ThemeSelector } from "./photobooth/components/ThemeSelector";
import { CaptureSequence } from "./photobooth/components/CaptureSequence";
import { ResultView } from "./photobooth/components/ResultView";

export const PhotoboothApp: React.FC = () => {
  const { currentStep, startSession } = usePhotoboothStore();

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-zinc-100 select-none overflow-hidden font-sans relative">
      {currentStep === "select-theme" ? (
        <ThemeSelector onStartSession={startSession} />
      ) : currentStep === "ready" || currentStep === "counting" || currentStep === "capturing" ? (
        <CaptureSequence />
      ) : (
        <ResultView />
      )}
    </div>
  );
};
