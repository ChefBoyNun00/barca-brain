"use client";

import Image from "next/image";
import { RACE_TEAMS_LIMIT } from "@/config/display";
import type { LeagueRow, SeasonMatch } from "@/domain/home";
import { formatMatchDate } from "./format";
import { describeOutcome, type MatchOutcome } from "./season-story";
import {
  getFinishPreview,
  getNextPick,
  getRemainingLeagueMatches,
  getWinsNeeded,
  pickEvery,
  pickLoseBigGames,
  projectEnding,
} from "./simulator";
import { Tally } from "./Tally";
import { useEndingPicks } from "./use-ending-picks";

const BIG_GAME_RIVALS = 3;

type PickTileProps = {
  match: SeasonMatch;
  index: number;
  pick: MatchOutcome | undefined;
  rank: number | undefined;
  onTap: () => void;
};

function PickTile({ match, index, pick, rank, onTap }: PickTileProps) {
  const opponent = match.opponent?.name ?? "To be decided";
  const venue = match.isHome ? "at home" : "away";
  const date = formatMatchDate(match.kickoffAt);
  const word = pick ? describeOutcome(pick) : "Tap";
  return (
    <button
      type="button"
      className="pick"
      data-pick={pick ?? "none"}
      data-tone={index % 2 === 0 ? "garnet" : "blue"}
      onClick={onTap}
      aria-label={`${opponent}, ${venue}, ${date}. ${
        pick ? `Your pick: ${word}` : "No pick yet"
      }. Press to change.`}
    >
      <span className="pick-stripe">
        {pick === "L" && (
          <>
            <span className="stripe-torn-top" />
            <span className="stripe-torn-bottom" />
          </>
        )}
        {(pick === "W" || pick === "D") && <span className="stripe-cloth" />}
        {match.opponent?.logoUrl && (
          <Image src={match.opponent.logoUrl} alt="" width={36} height={36} unoptimized />
        )}
        <span className="pick-word">{word}</span>
      </span>
      <span className="pick-name">{opponent}</span>
      <span className="pick-meta">
        {match.isHome ? "Home" : "Away"}
        {rank ? ` · ${rank}` : ""}
      </span>
    </button>
  );
}

type SeasonEndingProps = { matches: SeasonMatch[]; table: LeagueRow[] };

/** The viewer decides the rest of the league season and sees where it leads. */
export function SeasonEnding({ matches, table }: SeasonEndingProps) {
  const [savedPicks, savePicks] = useEndingPicks();
  const remaining = getRemainingLeagueMatches(matches);
  // Saved picks for a match that has since been played no longer mean anything.
  const picks = Object.fromEntries(
    remaining.flatMap((match) => {
      const pick = savedPicks[match.id];
      return pick ? [[match.id, pick] as const] : [];
    }),
  );
  const ending = projectEnding(table, remaining, picks);
  if (!ending) return null;

  const rankOf = new Map(table.map((row) => [row.teamId, row.rank]));
  const winsNeeded = getWinsNeeded(table, remaining);

  const tapMatch = (matchId: string) => {
    const { [matchId]: current, ...others } = picks;
    const next = getNextPick(current);
    savePicks(next ? { ...others, [matchId]: next } : others);
  };

  return (
    <section id="ending" aria-labelledby="ending-title" className="page-gutter section reveal">
      <h2 id="ending-title" className="section-title">
        Weave the ending
      </h2>
      <p className="section-note">
        {remaining.length === 0
          ? "The league season is over, so there is nothing left to decide."
          : `${remaining.length} league stripes are still empty. Tap one to choose a win, a draw or a defeat. This is a what-if, not a prediction.`}
      </p>

      {remaining.length > 0 && (
        <div className="ending">
          <div>
            <div className="ending-presets">
              <button
                type="button"
                className="chip chip-action"
                onClick={() => savePicks(pickEvery(remaining, "W"))}
              >
                Win them all
              </button>
              <button
                type="button"
                className="chip chip-action"
                onClick={() => savePicks(pickLoseBigGames(remaining, table, BIG_GAME_RIVALS))}
              >
                Lose the big games
              </button>
              <button
                type="button"
                className="chip"
                disabled={ending.picked === 0}
                onClick={() => savePicks({})}
              >
                Clear my picks
              </button>
            </div>
            <ol className="picks">
              {remaining.map((match, index) => (
                <li key={match.id}>
                  <PickTile
                    match={match}
                    index={index}
                    pick={picks[match.id]}
                    rank={rankOf.get(match.opponent?.id ?? "")}
                    onTap={() => tapMatch(match.id)}
                  />
                </li>
              ))}
            </ol>
            <p className="section-note">The small number is the opponent&apos;s league position.</p>
            {/* On small screens the full verdict sits below the tiles, out of sight while tapping. */}
            <p className="ending-peek" aria-hidden="true">
              <span>{ending.title}</span>
              <span className="ending-peek-count">
                {ending.picked}/{ending.remaining}
              </span>
            </p>
          </div>

          <aside className="verdict" aria-label="Where your season ends">
            <p className="verdict-kicker">
              {ending.picked} of {ending.remaining} picked
            </p>
            <div aria-live="polite">
              <p className="verdict-title">{ending.title}</p>
              <p className="verdict-detail">{ending.detail}</p>
            </div>
            <ul className="verdict-race">
              {getFinishPreview(ending.finish, RACE_TEAMS_LIMIT).map((team) => (
                <li key={team.teamId}>
                  <span className="verdict-team" data-strong={team.isBarca}>
                    {team.logoUrl && (
                      <Image src={team.logoUrl} alt="" width={20} height={20} unoptimized />
                    )}
                    {team.name}
                  </span>
                  <span className="tally-number">{team.points}</span>
                  <Tally count={team.points} max={ending.maxPoints} muted={!team.isBarca} dense />
                </li>
              ))}
            </ul>
            <p className="verdict-detail">
              A full row is a perfect {ending.maxPoints} points.
              {winsNeeded !== null &&
                ` Barça need ${winsNeeded} wins from ${ending.remaining} to pass the best rival's current pace.`}
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
