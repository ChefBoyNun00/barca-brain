"use client";

import { useEffect, useState } from "react";
import { getCountdownParts } from "./format";

/** How far ahead the countdown thread starts to fill. */
const COUNTDOWN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

type CountdownProps = { kickoffAt: Date; serverNow: Date };

/** Starts from the server's time so the first paint matches, then ticks in the browser. */
export function Countdown({ kickoffAt, serverNow }: CountdownProps) {
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { days, hours, minutes, seconds } = getCountdownParts(kickoffAt, now);
  const units = [
    { label: "days", value: pad(days) },
    { label: "hrs", value: pad(hours) },
    { label: "min", value: pad(minutes) },
    { label: "sec", value: pad(seconds) },
  ];

  // The thread fills over the last 7 days and glows in the final hour.
  const msLeft = Math.max(0, kickoffAt.getTime() - now.getTime());
  const progress = Math.min(1, Math.max(0, 1 - msLeft / COUNTDOWN_WINDOW_MS));
  const imminent = msLeft > 0 && msLeft < 60 * 60 * 1000;

  return (
    <div aria-hidden="true" className="countdown-wrap">
      <div className="countdown">
        {units.map(({ label, value }) => (
          <div key={label}>
            {/* keyed on the value so the seconds digit ticks each time it changes */}
            <span key={value} className="countdown-value" data-tick={label === "sec"}>
              {value}
            </span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </div>
      <div
        className="countdown-thread"
        data-imminent={imminent}
        style={{ "--p": progress } as React.CSSProperties}
      />
    </div>
  );
}
