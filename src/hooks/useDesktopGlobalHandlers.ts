import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";

export const useDesktopGlobalHandlers = () => {
  const {
    windows,
    launcherOpen,
    activeWindowId,
    closeLauncher,
    toggleLauncher,
    closeWindow,
    focusWindow,
    toggleQuickSettings,
  } = useWindowStore();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState("Beralih ke Desktop Mode...");
  const mounted = useSyncExternalStore(() => () => { }, () => true, () => false);
  const wasMobileRef = useRef<boolean>(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  // Resize mode transition
  useEffect(() => {
    const handleResize = () => {
      const isMobileNow = window.innerWidth < 768;
      if (wasMobileRef.current !== isMobileNow) {
        closeLauncher();
        toggleQuickSettings(false);
        setTransitionText(isMobileNow ? "Beralih ke Mobile Mode..." : "Beralih ke Desktop Mode...");
        setIsTransitioning(true);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1300);
      }
      wasMobileRef.current = isMobileNow;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [closeLauncher, toggleQuickSettings]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === "input" || targetTag === "textarea" || (e.target as HTMLElement)?.isContentEditable;

      if (e.key === "Escape") {
        if (launcherOpen) {
          closeLauncher();
        } else if (activeWindowId) {
          closeWindow(activeWindowId);
        }
      } else if ((e.altKey && e.code === "Space") || (e.ctrlKey && e.code === "Space")) {
        e.preventDefault();
        toggleLauncher();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w" && !isInput) {
        if (activeWindowId) {
          e.preventDefault();
          closeWindow(activeWindowId);
        }
      } else if ((e.altKey || e.ctrlKey) && e.key === "Tab") {
        const activeWindows = windows.filter((w) => !w.isMinimized);
        if (activeWindows.length > 1) {
          e.preventDefault();
          const currentIndex = activeWindows.findIndex((w) => w.id === activeWindowId);
          const nextIndex = (currentIndex + 1) % activeWindows.length;
          focusWindow(activeWindows[nextIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [launcherOpen, activeWindowId, windows, closeLauncher, closeWindow, focusWindow, toggleLauncher]);

  // Dynamic Browser Tab Title
  useEffect(() => {
    if (activeWindowId) {
      const activeWin = windows.find((w) => w.id === activeWindowId && !w.isMinimized);
      const app = APPS.find((a) => a.id === activeWindowId);
      if (activeWin && app) {
        document.title = `${app.title} — Son-OS`;
        return;
      }
    }
    document.title = "Son-OS — ChromeOS-inspired Web Desktop";
  }, [activeWindowId, windows]);

  return {
    mounted,
    isTransitioning,
    transitionText,
  };
};
