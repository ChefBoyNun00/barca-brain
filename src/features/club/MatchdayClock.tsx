"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { useScrollProgress } from "@/components/motion/use-scroll-progress";
import { MATCHDAY_HOURS } from "@/config/club-story";
import { useWords } from "./use-words";

/** Lit windows in the skyline: [x, y] on the 1200 × 200 skyline drawing. */
const WINDOWS = Array.from({ length: 70 }, (_, index) => [
  (index * 173) % 1180 + 10,
  140 + ((index * 37) % 50),
]);

/**
 * A home game, hour by hour. The section is tall and its picture stays pinned while you scroll:
 * the sun crosses the sky and sets, windows light up over the city, stars come out, and each
 * hour of the day takes its turn. Scrolling drives it, so it never moves on its own.
 */
export function MatchdayClock() {
  const w = useWords();
  const ref = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);
  const onProgress = useCallback((progress: number) => {
    const index = Math.min(MATCHDAY_HOURS.length - 1, Math.floor(progress * MATCHDAY_HOURS.length));
    setCurrent((previous) => (previous === index ? previous : index));
  }, []);
  useScrollProgress(ref, onProgress);

  return (
    <section
      ref={ref}
      className="clock"
      style={{ "--hours": MATCHDAY_HOURS.length } as CSSProperties}
    >
      <div className="clock-stage">
        <div aria-hidden="true" className="clock-sky">
          <span className="sky sky-day" />
          <span className="sky sky-dusk" />
          <span className="sky sky-night" />
          <span className="clock-stars" />
          <span className="clock-sun" />
          <span className="clock-moon" />
          <Skyline />
        </div>

        <ol className="clock-hours">
          {MATCHDAY_HOURS.map((hour, index) => (
            <li key={hour.time} className="clock-hour" data-on={index === current || undefined}>
              <p className="clock-time" dir="ltr">
                {hour.time}
              </p>
              <h3 className="clock-title">{w(hour.title)}</h3>
              <p className="clock-text">{w(hour.text)}</p>
            </li>
          ))}
        </ol>

        <ol aria-hidden="true" className="clock-dial" dir="ltr">
          {MATCHDAY_HOURS.map((hour, index) => (
            <li key={hour.time} data-on={index === current || undefined} data-past={index < current || undefined}>
              {hour.time}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** The towers' outline, used to draw them and to keep lit windows inside them. */
const TOWERS = `M0 200 V168 H40 V150 H70 V160 H110 V138 H130 V160 H170 V146 H210 V166 H250 V156 H280
           V120 H284 V96 L292 66 L300 96 V120 H306 V150 L318 150 V104 L324 70 L330 104 V150 H342
           V112 L350 58 L358 112 V150 H368 V108 L374 76 L380 108 V156 H420 V150 H460 V164 H520
           V140 H560 V160 H600 V150 H640 V162 H700
           V112 C700 70 760 70 760 112 V170 H800 V146 H840 V160 H900 V134 H930 V160 H980 V150
           H1020 V164 H1080 V142 H1110 V160 H1160 V152 H1200 V200 Z`;

/**
 * Barcelona's skyline, simplified: Montjuïc, the towers, the Torre Glòries and the spires of the
 * Sagrada Família. Hand-drawn shapes, not a map.
 */
function Skyline() {
  return (
    <svg className="clock-city" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice">
      <path
        className="city-hills"
        d="M0 150 C120 110 220 100 330 128 C420 150 470 120 560 126 C700 136 820 104 960 118 C1060 128 1130 110 1200 116 V200 H0 Z"
      />
      <path className="city-towers" d={TOWERS} />
      <clipPath id="club-city">
        <path d={TOWERS} />
      </clipPath>
      <g className="city-windows" clipPath="url(#club-city)">
        {WINDOWS.map(([x, y], index) => (
          <rect
            key={index}
            x={x}
            y={y}
            width="3"
            height="4"
            style={{ "--w": (index % 7) / 7 } as CSSProperties}
          />
        ))}
      </g>
    </svg>
  );
}
