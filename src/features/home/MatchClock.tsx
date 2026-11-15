"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/language";
import { getCountdownParts } from "./format";

const pad = (value: number) => String(value).padStart(2, "0");

type MatchClockProps = { kickoffAt: Date; serverNow: Date };

/** A small ticking clock to kick-off. Starts from the server's time so the first paint matches. */
export function MatchClock({ kickoffAt, serverNow }: MatchClockProps) {
  const t = useT();
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { days, hours, minutes, seconds } = getCountdownParts(kickoffAt, now);
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return (
    <span className="matchday-clock" aria-label={t("clock.label")}>
      {days > 0 ? t("clock.days", { days, clock }) : clock}
    </span>
  );
}
