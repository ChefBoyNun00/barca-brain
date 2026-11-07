"use client";

import { useState } from "react";
import { Segmented } from "@/components/Segmented";
import type { TextKey } from "@/i18n/dictionary";
import { useT } from "@/i18n/language";
import { DISPLAY_LOCALE, DISPLAY_TIME_ZONE } from "@/config/display";
import type { SeasonMatch } from "@/domain/home";
import { SEASON_FILTERS } from "../home/season-filters";
import { getMatchOutcome, summariseSeason } from "../home/season-story";
import { MatchCard } from "./MatchCard";

const monthOf = (match: SeasonMatch) =>
  new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: DISPLAY_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(match.kickoffAt);

function groupByMonth(matches: SeasonMatch[]) {
  const groups: { month: string; matches: SeasonMatch[] }[] = [];
  for (const match of matches) {
    const month = monthOf(match);
    const last = groups.at(-1);
    if (last?.month === month) last.matches.push(match);
    else groups.push({ month, matches: [match] });
  }
  return groups;
}

type MatchBoardProps = { matches: SeasonMatch[]; nextMatchId: string | null };

/** Every match of the season as cards, by month, with a filter that slides between options. */
export function MatchBoard({ matches, nextMatchId }: MatchBoardProps) {
  const t = useT();
  const [filterId, setFilterId] = useState(SEASON_FILTERS[0]?.id ?? "all");
  const filter = SEASON_FILTERS.find(({ id }) => id === filterId) ?? SEASON_FILTERS[0];
  const shown = matches.filter((match) => filter?.includes(match) ?? true);
  const record = summariseSeason(shown);
  const groups = groupByMonth(shown);
  const nextShown = shown.some((match) => match.id === nextMatchId);
  let cardIndex = 0;

  return (
    <>
      <div className="board-bar">
        <Segmented
          label="Choose which matches to show"
          choices={SEASON_FILTERS.map(({ id }) => ({ id, label: t(`filter.${id}` as TextKey) }))}
          value={filterId}
          onChange={setFilterId}
        />
        <p className="board-record">
          {record.played === 0
            ? t("season.nothing")
            : t(record.goalsFor === 1 ? "season.recordOne" : "season.record", {
                wins: record.wins,
                draws: record.draws,
                losses: record.losses,
                goals: record.goalsFor,
              })}
        </p>
        {nextShown && (
          <a href={`#match-${nextMatchId}`} className="chip chip-action">
            {t("matches.jump")}
          </a>
        )}
      </div>
      {shown.length === 0 ? (
        <p className="section-note">No matches in this group yet.</p>
      ) : (
        groups.map(({ month, matches: monthMatches }) => (
          <section key={month} aria-label={month} className="board-month">
            <h2 className="board-month-title">{month}</h2>
            <div className="board-grid">
              {monthMatches.map((match) => (
                <MatchCard key={match.id} match={match} index={cardIndex++ % 12} />
              ))}
            </div>
          </section>
        ))
      )}
      {shown.length > 0 && shown.every((match) => getMatchOutcome(match) === null) && (
        <p className="section-note">These matches are all still to come.</p>
      )}
    </>
  );
}
