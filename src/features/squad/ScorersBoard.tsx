"use client";

import { useState } from "react";
import { ChoiceChips, type Choice } from "@/components/ChoiceChips";
import { TOP_SCORERS_LIMIT } from "@/config/display";
import type { SquadPlayer } from "@/domain/home";
import { formatOptionalStat } from "../home/format";
import { Tally } from "../home/Tally";
import { PlayerFace } from "./PlayerFace";
import { buildScorerBoard, type ScorerScope } from "./squad-stats";

const SCOPE_CHOICES: Choice<ScorerScope>[] = [
  { id: "league", label: "League" },
  { id: "europe", label: "Europe" },
  { id: "all", label: "All" },
];

type ScorersBoardProps = { squad: SquadPlayer[]; onOpen: (playerId: string) => void };

export function ScorersBoard({ squad, onOpen }: ScorersBoardProps) {
  const [scope, setScope] = useState<ScorerScope>("league");
  const board = buildScorerBoard(squad, scope, TOP_SCORERS_LIMIT);
  const mostGoals = board[0]?.goals ?? 0;

  return (
    <section aria-labelledby="scorers" className="page-gutter section reveal">
      <h2 id="scorers" className="section-title">
        Who&apos;s weaving
      </h2>
      <p className="section-note">One stripe, one goal.</p>
      <div className="squad-controls">
        <ChoiceChips
          label="Choose a competition"
          choices={SCOPE_CHOICES}
          value={scope}
          onChange={setScope}
        />
      </div>
      {board.length === 0 ? (
        <p className="section-note">No goals recorded here yet.</p>
      ) : (
        <ol className="board">
          {board.map(({ player, goals, assists }) => (
            <li key={player.id}>
              <button type="button" className="board-row" onClick={() => onOpen(player.id)}>
                <PlayerFace player={player} size={48} />
                <span className="tally-name" data-strong="true">
                  {player.name}
                </span>
                <Tally count={goals} max={mostGoals} />
                <span className="tally-number">
                  {goals}
                  <span className="tally-extra"> · {formatOptionalStat(assists)} ast</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
      <p className="section-note">
        Assists only cover goalscorers, and a dash means the data gave no figure.
      </p>
    </section>
  );
}
