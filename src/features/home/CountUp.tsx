"use client";

import { useEffect, useState } from "react";
import { ordinal } from "@/i18n/dictionary";
import { useLanguage } from "@/i18n/language";

type CountUpProps = {
  value: number;
  suffix?: string;
  /** Writes the number as 1st / 1r, in the visitor's language. */
  ordinalSuffix?: boolean;
  durationMs?: number;
};

/** Counts up to the value on load. The real number is in the page first, so nothing depends on JS. */
export function CountUp({
  value,
  suffix = "",
  ordinalSuffix = false,
  durationMs = 1100,
}: CountUpProps) {
  const language = useLanguage();
  const written = ordinalSuffix ? ordinal(language, value).slice(String(value).length) : suffix;
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
    <span aria-label={`${value}${written}`}>
      <span aria-hidden="true">
        {shown}
        {written}
      </span>
    </span>
  );
}
