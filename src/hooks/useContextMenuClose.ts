import { useEffect, RefObject } from "react";

export function useContextMenuClose(
  isOpen: boolean,
  onClose: () => void,
  menuRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleCloseAll = () => {
      onClose();
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef?.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleScrollOrResize = () => {
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("sonos-close-context-menus", handleCloseAll);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("sonos-close-context-menus", handleCloseAll);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, menuRef]);
}

export function closeAllContextMenus() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sonos-close-context-menus"));
  }
}
