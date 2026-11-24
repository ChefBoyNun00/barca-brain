"use client";

import { useEffect } from "react";
import { MOTION } from "@/config/motion";

/**
 * Cards lean a few degrees toward the mouse, like a card held in the hand, and settle back when
 * it leaves. One listener for the whole app: anything marked data-tilt, or matching the card
 * list in premium.css, joins in. Only for a real mouse, and never for anyone who asked for less
 * motion. The look (perspective, the sheen) is in CSS; this only writes --rx, --ry and --mx.
 */
const TILT_SELECTOR = "[data-tilt], .nw-card, .moment-card";

export function PointerTilt() {
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)");
    let current: HTMLElement | null = null;

    const reset = (card: HTMLElement) => {
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
      card.style.removeProperty("--mx");
      delete card.dataset.tilting;
    };

    const onMove = (event: PointerEvent) => {
      if (calm.matches || !mouse.matches) return;
      const card = (event.target as Element | null)?.closest<HTMLElement>(TILT_SELECTOR) ?? null;
      if (current && current !== card) reset(current);
      current = card;
      if (!card) return;
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      card.dataset.tilting = "";
      card.style.setProperty("--rx", `${(-y * MOTION.cardTiltDegrees).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(x * MOTION.cardTiltDegrees).toFixed(2)}deg`);
      card.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
    };

    const onLeave = () => {
      if (current) reset(current);
      current = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return null;
}
