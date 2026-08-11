"use client";

import React from "react";
import { JapaneseQuizApp } from "./apps/JapaneseQuizApp";
import { LovelyEverApp } from "./apps/LovelyEverApp";
import { AboutApp } from "./apps/AboutApp";
import { ContactApp } from "./apps/ContactApp";

interface AppContentProps {
  appId: string;
}

export const AppContent: React.FC<AppContentProps> = ({ appId }) => {
  switch (appId) {
    case "japanese-quiz":
      return <JapaneseQuizApp />;
    case "lovely-ever":
      return <LovelyEverApp />;
    case "about":
      return <AboutApp />;
    case "contact":
      return <ContactApp />;
    default:
      return (
        <div className="p-6 text-center text-zinc-400">
          <p className="text-lg font-medium text-zinc-200">App Placeholder</p>
          <p className="text-sm mt-1">Content for this app will be updated soon.</p>
        </div>
      );
  }
};
