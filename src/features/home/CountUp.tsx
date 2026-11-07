"use client";

import { useEffect, useState } from "react";

type CountUpProps = { value: number; suffix?: string; durationMs?: number };

/** Counts up to the value on load. The real number is in the page first, so nothing depends on JS. */
export function CountUp({ value, suffix = "", durationMs = 1100 }: CountUpProps) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      // Ease out: fast at the start, settling on the real number.
      setShown(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return (
    <span aria-label={`${value}${suffix}`}>
      <span aria-hidden="true">
        {shown}
        {suffix}
      </span>
    </span>
  );
}
