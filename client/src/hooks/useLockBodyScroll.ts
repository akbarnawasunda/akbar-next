import { useEffect } from "react";

/**
 * Custom hook to lock body scrolling when the mobile navigation menu or modal is open.
 * Prevents background content from scrolling while the menu is active.
 * Restores original document styles cleanly on unmount or when `isLocked` is false.
 */
export function useLockBodyScroll(isLocked: boolean): void {
  useEffect(() => {
    if (typeof document === "undefined" || !isLocked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift on desktop/tablet
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}
