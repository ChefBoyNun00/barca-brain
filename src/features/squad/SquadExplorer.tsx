"use client";

import { useState } from "react";
import type { SquadPlayer } from "@/domain/home";
import type { Story } from "../news/stories";
import { PlayerCard } from "./PlayerCard";
import { ScorersBoard } from "./ScorersBoard";
import { sortSquad } from "./squad-stats";
import { SquadWall } from "./SquadWall";

type SquadExplorerProps = {
  squad: SquadPlayer[];
  now: Date;
  teamGoals: number;
  stories: Story[];
};

/** The wall and the board share one player card, so either can open it. */
export function SquadExplorer({ squad, now, teamGoals, stories }: SquadExplorerProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  // The card's arrows follow the wall's default order, so the next player is the expected one.
  const ordered = sortSquad(squad, "goals");
  const openIndex = ordered.findIndex((player) => player.id === openId);
  const openPlayer = ordered[openIndex];

  const step = (direction: 1 | -1) => {
    const next = ordered[(openIndex + direction + ordered.length) % ordered.length];
    if (next) setOpenId(next.id);
  };

  if (squad.length === 0) {
    return (
      <section id="squad" className="page-gutter section">
        <h2 className="section-title">The squad</h2>
        <p className="section-note">The squad will appear after the next daily update.</p>
      </section>
    );
  }

  return (
    <>
      <SquadWall squad={squad} onOpen={setOpenId} />
      <ScorersBoard squad={squad} onOpen={setOpenId} />
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
