"use client";

import { useState } from "react";
import type { SquadPlayer } from "@/domain/home";
import type { Story } from "../news/stories";
import { PlayerCard } from "./PlayerCard";
import { sortSquad } from "./squad-stats";
import { Wardrobe } from "./Wardrobe";

type SquadExplorerProps = {
  squad: SquadPlayer[];
  now: Date;
  teamGoals: number;
  stories: Story[];
};

/** The wardrobe, with one player card that opens over it. */
export function SquadExplorer({ squad, now, teamGoals, stories }: SquadExplorerProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  // The card's arrows follow the wardrobe's default order, so the next player is the expected one.
  const ordered = sortSquad(squad, "number");
  const openIndex = ordered.findIndex((player) => player.id === openId);
  const openPlayer = ordered[openIndex];

  const step = (direction: 1 | -1) => {
    const next = ordered[(openIndex + direction + ordered.length) % ordered.length];
    if (next) setOpenId(next.id);
  };

  if (squad.length === 0) {
    return (
      <section id="squad" className="page-gutter section">
        <h1 className="section-title">The squad</h1>
        <p className="section-note">The squad will appear after the next daily update.</p>
      </section>
    );
  }

  return (
    <>
      <Wardrobe squad={squad} onOpen={setOpenId} />
      {openPlayer && (
        <PlayerCard
          player={openPlayer}
          now={now}
          teamGoals={teamGoals}
          stories={stories}
          onClose={() => setOpenId(null)}
          onStep={step}
        />
      )}
    </>
  );
}
