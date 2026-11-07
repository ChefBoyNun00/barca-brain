"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ChoiceChips } from "@/components/ChoiceChips";
import { REPLAY_STEP_MS } from "@/config/display";
import type { SeasonMatch } from "@/domain/home";
import { displayCompetition, formatKickoff, formatMatchDate } from "./format";
import { SEASON_FILTERS } from "./season-filters";
import { prefersReducedMotion, useSeasonSelection } from "./season-selection";
import {
  SEASON_SECTION_ID,
  describeMatch,
  describeOutcome,
  getMatchOutcome,
  summariseSeason,
} from "./season-story";

type StripeProps = {
  match: SeasonMatch;
  index: number;
  isNext: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  isUnwoven: boolean;
};

function Stripe({ match, index, isNext, isSelected, isDimmed, isUnwoven }: StripeProps) {
  const outcome = getMatchOutcome(match);
  return (
    <div
      className="stripe"
      data-outcome={outcome ?? "none"}
      data-tone={index % 2 === 0 ? "garnet" : "blue"}
      data-next={isNext}
      data-selected={isSelected}
      data-dimmed={isDimmed}
      data-unwoven={isUnwoven}
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
              describeOutcome(outcome),
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

function describeRecord(matches: SeasonMatch[]): string {
  const { played, wins, draws, losses, goalsFor } = summariseSeason(matches);
  if (played === 0) return "Nothing played yet";
  return `${wins}W ${draws}D ${losses}L · ${goalsFor} goal${goalsFor === 1 ? "" : "s"}`;
}

type WovenSeasonProps = { matches: SeasonMatch[]; lastPlayedIndex: number; nextIndex: number };

export function WovenSeason({ matches, lastPlayedIndex, nextIndex }: WovenSeasonProps) {
  const { selected, select } = useSeasonSelection();
  const [filterId, setFilterId] = useState("all");
  const [isReplaying, setIsReplaying] = useState(false);
  const wall = useRef<HTMLDivElement>(null);
  const lastIndex = matches.length - 1;
  const match = matches[selected];
  const filter = SEASON_FILTERS.find(({ id }) => id === filterId) ?? SEASON_FILTERS[0]!;
  const shown = matches.filter(filter.includes);

  useEffect(() => {
    if (!isReplaying) return;
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      select(index);
      if (index >= lastPlayedIndex) setIsReplaying(false);
    }, REPLAY_STEP_MS);
    return () => clearInterval(timer);
  }, [isReplaying, lastPlayedIndex, select]);

  const chooseMatch = (index: number) => {
    setIsReplaying(false);
    select(index);
  };

  const selectFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = wall.current?.getBoundingClientRect();
    if (!bounds) return;
    const position = (event.clientX - bounds.left) / bounds.width;
    chooseMatch(Math.min(lastIndex, Math.max(0, Math.floor(position * matches.length))));
  };

  const toggleReplay = () => {
    if (isReplaying) {
      setIsReplaying(false);
    } else if (prefersReducedMotion() || lastPlayedIndex <= 0) {
      select(Math.max(lastPlayedIndex, 0));
    } else {
      setFilterId("all");
      select(0);
      setIsReplaying(true);
    }
  };

  if (!match) return null;

  return (
    <section id={SEASON_SECTION_ID} aria-label="The season, one stripe per match">
      <div className="page-gutter wall-controls">
        <ChoiceChips
          label="Show matches from"
          choices={SEASON_FILTERS}
          value={filterId}
          onChange={setFilterId}
        />
        <p className="wall-record" aria-live="polite">
          {isReplaying
            ? `After ${selected + 1}: ${describeRecord(matches.slice(0, selected + 1))}`
            : describeRecord(shown)}
        </p>
        {lastPlayedIndex >= 0 && (
          <button type="button" className="chip chip-action" onClick={toggleReplay}>
            {isReplaying ? "Stop" : "▶ Replay the season"}
          </button>
        )}
      </div>

      <div onPointerDown={selectFromPointer} onPointerMove={selectFromPointer}>
        <div ref={wall} className="wall">
          {matches.map((item, index) => (
            <Stripe
              key={item.id}
              match={item}
              index={index}
              isNext={index === nextIndex}
              isSelected={index === selected}
              isDimmed={!filter.includes(item)}
              isUnwoven={isReplaying && index > selected}
            />
          ))}
          {/* The real control: keyboards and screen readers use this, pointers use the wall. */}
          <input
            type="range"
            className="wall-input"
            min={0}
            max={lastIndex}
            value={selected}
            onChange={(event) => chooseMatch(Number(event.target.value))}
            aria-label="Choose a match"
            aria-valuetext={describeMatch(match)}
          />
        </div>
        <div className="wall-crests" aria-hidden="true">
          {matches.map((item, index) => (
            <span
              key={item.id}
              data-selected={index === selected}
              data-dimmed={!filter.includes(item)}
            >
              {item.opponent?.logoUrl && (
                <Image src={item.opponent.logoUrl} alt="" width={28} height={28} unoptimized />
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="wall-readout">
        <button
          type="button"
          className="wall-step"
          aria-label="Previous match"
          disabled={selected === 0}
          onClick={() => chooseMatch(selected - 1)}
        >
          ←
        </button>
        <MatchDetail match={match} />
        <button
          type="button"
          className="wall-step"
          aria-label="Next match"
          disabled={selected === lastIndex}
          onClick={() => chooseMatch(selected + 1)}
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
