"use client";

import React, { useEffect, useRef } from "react";
import { useWindowStore } from "@/store/windowStore";
import { PLAYLIST } from "@/config/musicConfig";

export const GlobalAudioManager: React.FC = () => {
  const {
    mediaTrackIndex,
    mediaIsPlaying,
    mediaVolume,
    mediaIsMuted,
    mediaIsRepeat,
    playNextTrack,
    setMediaCurrentTime,
    setMediaDuration,
    toggleMediaPlay,
  } = useWindowStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = PLAYLIST[mediaTrackIndex] || PLAYLIST[0];

  // Synchronize audio volume and mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = mediaIsMuted ? 0 : mediaVolume;
    }
  }, [mediaVolume, mediaIsMuted]);

  // Synchronize audio play / pause state
  useEffect(() => {
    if (!audioRef.current) return;

    if (mediaIsPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy fallback
          toggleMediaPlay(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [mediaIsPlaying, mediaTrackIndex, toggleMediaPlay]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setMediaCurrentTime(audioRef.current.currentTime);
      setMediaDuration(audioRef.current.duration || currentTrack.duration);
    }
  };

  const handleEnded = () => {
    if (mediaIsRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      playNextTrack();
    }
  };

  return (
    <audio
      ref={audioRef}
      src={currentTrack.audioUrl}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      onLoadedMetadata={handleTimeUpdate}
      className="hidden"
    />
  );
};
