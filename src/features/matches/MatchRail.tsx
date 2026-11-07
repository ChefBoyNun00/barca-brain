"use client";

import { useEffect, useRef } from "react";
import type { SeasonMatch } from "@/domain/home";
import { MatchCard } from "./MatchCard";

type MatchRailProps = { matches: SeasonMatch[]; focusId: string | null };

/** A swipeable row of cards. It opens centred on the latest result, never moving the page. */
export function MatchRail({ matches, focusId }: MatchRailProps) {
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = rail.current;
    const card = focusId
      ? container?.querySelector<HTMLElement>(`#match-${CSS.escape(focusId)}`)
      : null;
    if (!container || !card) return;
    container.scrollLeft = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
  }, [focusId]);

  return (
    <div
      ref={rail}
      className="match-rail"
      tabIndex={0}
      role="region"
      aria-label="Latest and next matches"
    >
      {matches.map((match, index) => (
        <MatchCard key={match.id} match={match} index={index} />
      ))}
    </div>
  );
}
