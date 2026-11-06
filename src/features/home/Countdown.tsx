"use client";

import { useEffect, useState } from "react";
import { getCountdownParts } from "./format";

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

  return (
    <div aria-hidden="true" className="countdown">
      {units.map(({ label, value }) => (
        <div key={label}>
          <span className="countdown-value">{value}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
