"use client";

import { useEffect, type RefObject } from "react";

/**
 * How far you have scrolled through a tall section, from 0 (its top reaches the top of the
 * screen) to 1 (its bottom reaches the bottom). Written straight onto the element as the CSS
 * variable --p, so animations follow the scroll without React re-rendering on every frame.
 * onProgress is for the few things CSS cannot do, like knowing which step is current.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress?: (progress: number) => void,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      const progress = travel <= 0 ? 1 : Math.min(1, Math.max(0, -box.top / travel));
      element.style.setProperty("--p", progress.toFixed(4));
      onProgress?.(progress);
    };
    // At most one measurement per frame, however fast the scroll events arrive.
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, onProgress]);
}
