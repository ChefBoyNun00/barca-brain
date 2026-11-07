"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Segmented } from "@/components/Segmented";
import type { TextKey } from "@/i18n/dictionary";
import { useT } from "@/i18n/language";
import { BARCA_CREST_URL, REPLAY_STEP_MS } from "@/config/display";
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

/** A crest always sits next to its own team's name, whichever side that team is on. */
function MatchSide({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  return (
    <span className="match-side">
      {logoUrl && <Image src={logoUrl} alt="" width={56} height={56} unoptimized />}
      <span className="match-team">{name}</span>
    </span>
  );
}

function MatchDetail({ match }: { match: SeasonMatch }) {
  const outcome = getMatchOutcome(match);
  const hasHalfTime = match.halfTimeFor !== null && match.halfTimeAgainst !== null;
  const barca = { name: "Barça", logoUrl: BARCA_CREST_URL as string | null };
  const opponent = {
    name: match.opponent?.name ?? "To be decided",
    logoUrl: match.opponent?.logoUrl ?? null,
  };
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
        <MatchSide name={left.name} logoUrl={left.logoUrl} />
        <p className="match-score">{outcome ? `${leftGoals}–${rightGoals}` : "v"}</p>
        <MatchSide name={right.name} logoUrl={right.logoUrl} />
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

function describeRecord(matches: SeasonMatch[], t: ReturnType<typeof useT>): string {
  const { played, wins, draws, losses, goalsFor } = summariseSeason(matches);
  if (played === 0) return t("season.nothing");
  const vars = { wins, draws, losses, goals: goalsFor };
  return goalsFor === 1 ? t("season.recordOne", vars) : t("season.record", vars);
}

type WovenSeasonProps = { matches: SeasonMatch[]; lastPlayedIndex: number; nextIndex: number };

export function WovenSeason({ matches, lastPlayedIndex, nextIndex }: WovenSeasonProps) {
  const t = useT();
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
        <Segmented
          label="Show matches from"
          choices={SEASON_FILTERS.map(({ id }) => ({ id, label: t(`filter.${id}` as TextKey) }))}
          value={filterId}
          onChange={setFilterId}
        />
        <p className="wall-record" aria-live="polite">
          {isReplaying
            ? t("season.after", {
                n: selected + 1,
                record: describeRecord(matches.slice(0, selected + 1), t),
              })
            : describeRecord(shown, t)}
        </p>
        {lastPlayedIndex >= 0 && (
          <button type="button" className="chip chip-action" onClick={toggleReplay}>
            {isReplaying ? t("season.stop") : t("season.replay")}
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

      <p className="wall-legend">{t("season.legend")}</p>

      <details className="wall-table">
        <summary>{t("season.list")}</summary>
        <ol>
          {matches.map((item) => (
            <li key={item.id}>{describeMatch(item)}</li>
          ))}
        </ol>
      </details>
    </section>
  );
}
