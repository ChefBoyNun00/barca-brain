"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import type { SeasonMatch } from "@/domain/home";
import { displayCompetition, formatKickoff, formatMatchDate } from "./format";
import { getMatchOutcome, type MatchOutcome } from "./season-story";

const OUTCOME_WORDS: Record<MatchOutcome, string> = { W: "Win", D: "Draw", L: "Defeat" };

function describeMatch(match: SeasonMatch): string {
  const opponent = match.opponent?.name ?? "Opponent to be decided";
  const venue = match.isHome ? "at home" : "away";
  const outcome = getMatchOutcome(match);
  if (!outcome) return `${opponent}, ${venue}, ${formatMatchDate(match.kickoffAt)}, not played yet`;
  return `${OUTCOME_WORDS[outcome]}, ${match.goalsFor}–${match.goalsAgainst} ${venue} to ${opponent}, ${formatMatchDate(match.kickoffAt)}`;
}

type StripeProps = { match: SeasonMatch; index: number; isNext: boolean; isSelected: boolean };

function Stripe({ match, index, isNext, isSelected }: StripeProps) {
  const outcome = getMatchOutcome(match);
  return (
    <div
      className="stripe"
      data-outcome={outcome ?? "none"}
      data-tone={index % 2 === 0 ? "garnet" : "blue"}
      data-next={isNext}
      data-selected={isSelected}
      style={{ "--i": index } as React.CSSProperties}
    >
      {!match.isLeague && <span className="stripe-cap" />}
      {outcome === "L" && (
        <>
          <span className="stripe-torn-top" />
          <span className="stripe-torn-bottom" />
        </>
      )}
      {(outcome === "W" || outcome === "D") && <span className="stripe-cloth" />}
      {outcome && (
        <span className="stripe-goals">
          {Array.from({ length: match.goalsFor ?? 0 }, (_, goal) => (
            <span key={goal} />
          ))}
        </span>
      )}
    </div>
  );
}

function MatchDetail({ match }: { match: SeasonMatch }) {
  const outcome = getMatchOutcome(match);
  const hasHalfTime = match.halfTimeFor !== null && match.halfTimeAgainst !== null;
  const barca = "Barça";
  const opponent = match.opponent?.name ?? "To be decided";
  const [left, right] = match.isHome ? [barca, opponent] : [opponent, barca];
  const [leftGoals, rightGoals] = match.isHome
    ? [match.goalsFor, match.goalsAgainst]
    : [match.goalsAgainst, match.goalsFor];

  return (
    <div className="match-detail" key={match.id}>
      <p className="match-meta">
        {[displayCompetition(match.competition), match.round].filter(Boolean).join(" · ")}
      </p>
      <div className="match-line">
        {match.opponent?.logoUrl && (
          <Image src={match.opponent.logoUrl} alt="" width={56} height={56} unoptimized />
        )}
        {outcome ? (
          <p className="match-score">
            {left} {leftGoals}–{rightGoals} {right}
          </p>
        ) : (
          <p className="match-score">
            {left} v {right}
          </p>
        )}
      </div>
      <p className="match-note">
        {outcome
          ? [
              OUTCOME_WORDS[outcome],
              formatMatchDate(match.kickoffAt),
              hasHalfTime && `Barça ${match.halfTimeFor}–${match.halfTimeAgainst} at half-time`,
            ]
              .filter(Boolean)
              .join(" · ")
          : `Still to come · ${formatKickoff(match.kickoffAt)}`}
      </p>
    </div>
  );
}

type WovenSeasonProps = { matches: SeasonMatch[]; lastPlayedIndex: number; nextIndex: number };

export function WovenSeason({ matches, lastPlayedIndex, nextIndex }: WovenSeasonProps) {
  const [selected, setSelected] = useState(Math.max(lastPlayedIndex, 0));
  const wall = useRef<HTMLDivElement>(null);
  const lastIndex = matches.length - 1;
  const match = matches[selected];

  const selectFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = wall.current?.getBoundingClientRect();
    if (!bounds) return;
    const position = (event.clientX - bounds.left) / bounds.width;
    setSelected(Math.min(lastIndex, Math.max(0, Math.floor(position * matches.length))));
  };

  if (!match) return null;

  return (
    <section aria-label="The season, one stripe per match">
      <div
        ref={wall}
        className="wall"
        onPointerDown={selectFromPointer}
        onPointerMove={selectFromPointer}
      >
        {matches.map((item, index) => (
          <Stripe
            key={item.id}
            match={item}
            index={index}
            isNext={index === nextIndex}
            isSelected={index === selected}
          />
        ))}
        {/* The real control: keyboards and screen readers use this, pointers use the wall. */}
        <input
          type="range"
          className="wall-input"
          min={0}
          max={lastIndex}
          value={selected}
          onChange={(event) => setSelected(Number(event.target.value))}
          aria-label="Choose a match"
          aria-valuetext={describeMatch(match)}
        />
      </div>

      <div className="wall-readout">
        <button
          type="button"
          className="wall-step"
          aria-label="Previous match"
          disabled={selected === 0}
          onClick={() => setSelected(selected - 1)}
        >
          ←
        </button>
        <MatchDetail match={match} />
        <button
          type="button"
          className="wall-step"
          aria-label="Next match"
          disabled={selected === lastIndex}
          onClick={() => setSelected(selected + 1)}
        >
          →
        </button>
      </div>

      <p className="wall-legend">
        Every stripe is a match. Every dot is a goal. A defeat tears the shirt, a diamond marks
        Europe, and the empty threads are still to be played.
      </p>

      <details className="wall-table">
        <summary>See every match as a list</summary>
        <ol>
          {matches.map((item) => (
            <li key={item.id}>{describeMatch(item)}</li>
          ))}
        </ol>
      </details>
    </section>
  );
}
