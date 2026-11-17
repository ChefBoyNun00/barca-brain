"use client";

import Image from "next/image";
import { RACE_TEAMS_LIMIT } from "@/config/display";
import { useLanguage, useT } from "@/i18n/language";
import type { LeagueRow, SeasonMatch } from "@/domain/home";
import { displayTeam, formatMatchDate } from "./format";
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
  const t = useT();
  const language = useLanguage();
  const opponent = match.opponent ? displayTeam(match.opponent.name, language) : t("common.tbd");
  const venue = t(match.isHome ? "venue.home" : "venue.away");
  const date = formatMatchDate(match.kickoffAt, language);
  const word = pick ? describeOutcome(pick, language) : t("pick.tap");
  return (
    <button
      type="button"
      className="pick"
      data-pick={pick ?? "none"}
      data-tone={index % 2 === 0 ? "garnet" : "blue"}
      onClick={onTap}
      aria-label={t("pick.aria", {
        opponent,
        venue,
        date,
        state: pick ? t("pick.yours", { word }) : t("pick.none"),
      })}
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
      <span className="pick-name" dir="auto">
        {opponent}
      </span>
      <span className="pick-meta">
        {t(match.isHome ? "match.home" : "match.away")}
        {rank ? ` · ${rank}` : ""}
      </span>
    </button>
  );
}

type SeasonEndingProps = { matches: SeasonMatch[]; table: LeagueRow[] };

/** The viewer decides the rest of the league season and sees where it leads. */
export function SeasonEnding({ matches, table }: SeasonEndingProps) {
  const t = useT();
  const language = useLanguage();
  const [savedPicks, savePicks] = useEndingPicks();
  const remaining = getRemainingLeagueMatches(matches);
  // Saved picks for a match that has since been played no longer mean anything.
  const picks = Object.fromEntries(
    remaining.flatMap((match) => {
      const pick = savedPicks[match.id];
      return pick ? [[match.id, pick] as const] : [];
    }),
  );
  const ending = projectEnding(table, remaining, picks, language);
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
      <h1 id="ending-title" className="section-title">
        {t("explore.ending")}
      </h1>
      <p className="section-note">
        {remaining.length === 0
          ? t("ending.over")
          : t("ending.intro", { count: remaining.length })}
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
                {t("ending.winAll")}
              </button>
              <button
                type="button"
                className="chip chip-action"
                onClick={() => savePicks(pickLoseBigGames(remaining, table, BIG_GAME_RIVALS))}
              >
                {t("ending.loseBig")}
              </button>
              <button
                type="button"
                className="chip"
                disabled={ending.picked === 0}
                onClick={() => savePicks({})}
              >
                {t("ending.clear")}
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
            <p className="section-note">{t("ending.rankNote")}</p>
            {/* On small screens the full verdict sits below the tiles, out of sight while tapping. */}
            <p className="ending-peek" aria-hidden="true">
              <span>{ending.title}</span>
              <span className="ending-peek-count">
                {ending.picked}/{ending.remaining}
              </span>
            </p>
          </div>

          <aside className="verdict" aria-label={t("ending.verdict")}>
            <p className="verdict-kicker">
              {t("ending.picked", { picked: ending.picked, remaining: ending.remaining })}
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
                    <bdi>{displayTeam(team.name, language)}</bdi>
                  </span>
                  <span className="tally-number">{team.points}</span>
                  <Tally count={team.points} max={ending.maxPoints} muted={!team.isBarca} dense />
                </li>
              ))}
            </ul>
            <p className="verdict-detail">
              {t("ending.fullRow", { max: ending.maxPoints })}
              {winsNeeded !== null &&
                ` ${t("ending.winsNeeded", { wins: winsNeeded, remaining: ending.remaining })}`}
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
