"use client";

import { useState } from "react";
import { ChoiceChips, type Choice } from "@/components/ChoiceChips";
import { POSITION_LABELS } from "@/config/display";
import type { PlayerPosition, SquadPlayer } from "@/domain/home";
import { PlayerFace } from "./PlayerFace";
import { getPlayerTotals, sortSquad, type SquadSort } from "./squad-stats";

type PositionFilter = "all" | PlayerPosition;

const POSITION_CHOICES: Choice<PositionFilter>[] = [
  { id: "all", label: "Everyone" },
  { id: "GK", label: "Keepers" },
  { id: "DF", label: "Defenders" },
  { id: "MF", label: "Midfield" },
  { id: "FW", label: "Forwards" },
];

const SORT_CHOICES: Choice<SquadSort>[] = [
  { id: "goals", label: "Most goals" },
  { id: "youngest", label: "Youngest" },
  { id: "name", label: "A–Z" },
];

function PlayerTile({ player, onOpen }: { player: SquadPlayer; onOpen: () => void }) {
  const { goals, assists } = getPlayerTotals(player);
  const position = player.position ? POSITION_LABELS[player.position] : "Squad player";
  return (
    <button type="button" className="player" onClick={onOpen}>
      <span aria-hidden="true" className="player-cloth" />
      <PlayerFace player={player} size={104} />
      <span className="player-name">{player.name}</span>
      <span className="player-position">{position}</span>
      <span className="player-numbers">
        {goals > 0
          ? `${goals} goal${goals === 1 ? "" : "s"}${assists ? ` · ${assists} ast` : ""}`
          : " "}
      </span>
    </button>
  );
}

type SquadWallProps = { squad: SquadPlayer[]; onOpen: (playerId: string) => void };

export function SquadWall({ squad, onOpen }: SquadWallProps) {
  const [position, setPosition] = useState<PositionFilter>("all");
  const [sort, setSort] = useState<SquadSort>("goals");
  const shown = sortSquad(
    squad.filter((player) => position === "all" || player.position === position),
    sort,
  );

  return (
    <section id="squad" aria-labelledby="squad-title" className="page-gutter section reveal">
      <h2 id="squad-title" className="section-title">
        The squad
      </h2>
      <p className="section-note">Tap a player to open their card.</p>
      <div className="squad-controls">
        <ChoiceChips
          label="Filter by position"
          choices={POSITION_CHOICES}
          value={position}
          onChange={setPosition}
        />
        <ChoiceChips label="Sort players" choices={SORT_CHOICES} value={sort} onChange={setSort} />
      </div>
      <ul className="squad">
        {shown.map((player) => (
          <li key={player.id}>
            <PlayerTile player={player} onOpen={() => onOpen(player.id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
