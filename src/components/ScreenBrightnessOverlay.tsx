"use client";

import React from "react";
import { useSettingsStore } from "@/store/settingsStore";

export const ScreenBrightnessOverlay: React.FC = () => {
  const brightness = useSettingsStore((s) => s.brightness);
  // Calculate overlay opacity: 0 when brightness = 100, max 0.85 when brightness = 0
  const opacity = ((100 - brightness) / 100) * 0.85;

  return (
    <div
      id="brightness-overlay"
      className="fixed inset-0 pointer-events-none z-90 bg-black transition-opacity duration-200"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
};
