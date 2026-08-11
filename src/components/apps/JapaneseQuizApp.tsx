"use client";

import React from "react";
import { IframeApp } from "./IframeApp";

export const JapaneseQuizApp: React.FC = () => {
  return (
    <IframeApp
      url="https://japanese-quiz-coral.vercel.app/"
      title="Japanese Quiz"
      githubUrl="https://github.com/18mson/japanese-quiz.git"
    />
  );
};
