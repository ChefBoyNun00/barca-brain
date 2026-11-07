"use client";

import { useState } from "react";
import { ChoiceChips, type Choice } from "@/components/ChoiceChips";
import { POSITION_LABELS } from "@/config/display";
import type { PlayerPosition, SquadPlayer } from "@/domain/home";
import { Jersey } from "./Jersey";
import { getJersey } from "./jersey-data";
import { sortSquad, type SquadSort } from "./squad-stats";

type PositionFilter = "all" | PlayerPosition;

const POSITION_CHOICES: Choice<PositionFilter>[] = [
  { id: "all", label: "Everyone" },
  { id: "GK", label: "Keepers" },
  { id: "DF", label: "Defenders" },
  { id: "MF", label: "Midfield" },
  { id: "FW", label: "Forwards" },
];

const SORT_CHOICES: Choice<SquadSort>[] = [
  { id: "number", label: "By number" },
  { id: "goals", label: "Most goals" },
  { id: "youngest", label: "Youngest" },
  { id: "name", label: "A–Z" },
];

function Hanger({ player, onOpen }: { player: SquadPlayer; onOpen: () => void }) {
  const jersey = getJersey(player);
  const position = player.position ? POSITION_LABELS[player.position] : "Squad player";
  return (
    <button
      type="button"
      className="hanger"
      onClick={onOpen}
      aria-label={`${player.name}${jersey.number === null ? "" : `, number ${jersey.number}`}. ${position}. Open stats.`}
    >
      <span aria-hidden="true" className="hanger-hook" />
      <Jersey jersey={jersey} keeper={player.position === "GK"} mode="flip" />
      {/* Touch screens cannot hover, so the name is also written underneath. */}
      <span aria-hidden="true" className="hanger-caption">
        {jersey.number === null ? jersey.printed : `${jersey.number} · ${jersey.printed}`}
      </span>
    </button>
  );
}

type WardrobeProps = {
  squad: SquadPlayer[];
  onOpen: (playerId: string) => void;
};

/** The squad as shirts on a rail. Hover one to see its back, open it for the stats. */
export function Wardrobe({ squad, onOpen }: WardrobeProps) {
  const [position, setPosition] = useState<PositionFilter>("all");
  const [sort, setSort] = useState<SquadSort>("number");
  const shown = sortSquad(
    squad.filter((player) => position === "all" || player.position === position),
    sort,
  );

  return (
    <section id="squad" aria-labelledby="squad-title" className="page-gutter section reveal">
      <h1 id="squad-title" className="section-title">
        The squad
      </h1>
      <p className="section-note">Look at the back of a shirt, then open it for the numbers.</p>
      <div className="squad-controls">
        <ChoiceChips
          label="Filter by position"
          choices={POSITION_CHOICES}
          value={position}
          onChange={setPosition}
        />
        <ChoiceChips label="Sort players" choices={SORT_CHOICES} value={sort} onChange={setSort} />
      </div>
      {shown.length === 0 ? (
        <p className="section-note">No players in this group.</p>
      ) : (
        <ul className="wardrobe">
          {shown.map((player) => (
            <li key={player.id}>
              <Hanger player={player} onOpen={() => onOpen(player.id)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
