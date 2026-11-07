"use client";

import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { POSITION_LABELS } from "@/config/display";
import { PLAYER_STORIES_LIMIT } from "@/config/news";
import type { SquadPlayer } from "@/domain/home";
import { displayCompetition, formatOptionalStat } from "../home/format";
import { findPlayerStories, type Story } from "../news/stories";
import { Jersey } from "./Jersey";
import { getJersey } from "./jersey-data";
import { isLaMasia } from "./la-masia";
import {
  formatGoalsPerMatch,
  formatShareOfGoals,
  getAge,
  getPlayerTotals,
} from "./squad-stats";

type PlayerCardProps = {
  player: SquadPlayer;
  now: Date;
  teamGoals: number;
  stories: Story[];
  onClose: () => void;
  onStep: (direction: 1 | -1) => void;
};

/** The browser's own dialog, which traps focus and closes on Escape for free. */
export function PlayerCard({
  player,
  now,
  teamGoals,
  stories,
  onClose,
  onStep,
}: PlayerCardProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, []);

  const closeOnBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) dialog.current?.close();
  };

  const stepWithArrows = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowLeft") onStep(-1);
    if (event.key === "ArrowRight") onStep(1);
  };

  const totals = getPlayerTotals(player);
  const playerStories = findPlayerStories(stories, player.name, PLAYER_STORIES_LIMIT);
  const age = getAge(player.birthDate, now);
  const perMatch = formatGoalsPerMatch(totals);
  const share = formatShareOfGoals(totals.goals, teamGoals);
  const details = [
    player.position ? POSITION_LABELS[player.position] : "Squad player",
    age !== null && `${age} years old`,
    player.nationality,
  ].filter(Boolean);

  return (
    <dialog
      ref={dialog}
      className="card-dialog"
      aria-labelledby="player-card-name"
      onClose={onClose}
      onClick={closeOnBackdrop}
      onKeyDown={stepWithArrows}
    >
      <div className="player-card" key={player.id}>
        <div className="player-card-cloth">
          <Jersey jersey={getJersey(player)} keeper={player.position === "GK"} mode="back" />
        </div>
        <div className="player-card-body">
          <h3 id="player-card-name" className="player-card-name">
            {player.name}
          </h3>
          <p className="player-card-details">{details.join(" · ")}</p>
          {isLaMasia(player) && <p className="player-masia">La Masia graduate</p>}

          {player.stats.length === 0 ? (
            <p className="player-card-empty">
              No goals or assists recorded this season yet. The free data only lists appearances
              for players who have scored or assisted.
            </p>
          ) : (
            <>
              <dl className="player-figures">
                <div>
                  <dt>Goals</dt>
                  <dd>{totals.goals}</dd>
                </div>
                <div>
                  <dt>Assists</dt>
                  <dd>{formatOptionalStat(totals.assists)}</dd>
                </div>
                <div>
                  <dt>Played</dt>
                  <dd>{formatOptionalStat(totals.matches)}</dd>
                </div>
                {perMatch && (
                  <div>
                    <dt>Per match</dt>
                    <dd>{perMatch}</dd>
                  </div>
                )}
                {share && (
                  <div>
                    <dt>Of Barça&apos;s goals</dt>
                    <dd>{share}</dd>
                  </div>
                )}
              </dl>
              <table className="player-splits">
                <thead>
                  <tr>
                    <th scope="col">Competition</th>
                    <th scope="col">Played</th>
                    <th scope="col">Goals</th>
                    <th scope="col">Assists</th>
                  </tr>
                </thead>
                <tbody>
                  {player.stats.map((row) => (
                    <tr key={row.competition}>
                      <th scope="row">{displayCompetition(row.competition)}</th>
                      <td>{formatOptionalStat(row.matches)}</td>
                      <td>{row.goals}</td>
                      <td>{formatOptionalStat(row.assists)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {playerStories.length > 0 && (
            <div className="player-press">
              <h4>In the Spanish press</h4>
              <ul>
                {playerStories.map(({ id, lead }) => (
                  <li key={id}>
                    <a href={lead.url} target="_blank" rel="noreferrer">
                      {lead.titleEn ?? lead.titleOriginal}
                    </a>{" "}
                    <span>{lead.outlet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="player-card-actions">
            <button
              type="button"
              className="wall-step"
              aria-label="Previous player"
              onClick={() => onStep(-1)}
            >
              ←
            </button>
            <button type="button" className="chip" onClick={() => dialog.current?.close()}>
              Close
            </button>
            <button
              type="button"
              className="wall-step"
              aria-label="Next player"
              onClick={() => onStep(1)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
