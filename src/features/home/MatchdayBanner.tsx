"use client";

import Image from "next/image";
import Link from "next/link";
import { BARCA_CREST_URL } from "@/config/display";
import { T, useLanguage, useT } from "@/i18n/language";
import { formatScore } from "@/i18n/numbers";
import { displayCompetition, displayTeam, formatKickoff } from "./format";
import { MatchClock } from "./MatchClock";
import type { MatchdayState } from "./matchday";
import { describeOutcome, getMatchOutcome } from "./season-story";

const CONFETTI = 14;

function Crest({ url }: { url: string | null }) {
  return url ? <Image src={url} alt="" width={56} height={56} unoptimized /> : null;
}

/** The top of the home page on match day: before, during and just after a match. */
export function MatchdayBanner({ state, now }: { state: MatchdayState; now: Date }) {
  const t = useT();
  const language = useLanguage();
  if (state.kind === "none") return null;
  const { match, isClasico, kind } = state;
  const opponent = match.opponent ? displayTeam(match.opponent.name, language) : t("common.tbd");
  const barca = t("common.barca");
  const names = match.isHome
    ? t("common.versus", { home: barca, away: opponent })
    : t("common.versus", { home: opponent, away: barca });
  const outcome = getMatchOutcome(match);
  const labelKey = isClasico
    ? "matchday.clasico"
    : kind === "fulltime"
      ? "matchday.fulltime"
      : "matchday.matchday";
  const venue = t(match.isHome ? "common.atHome" : "common.away");
  // The home side is on the left, with its crest, as on a scoreboard.
  const opponentCrest = match.opponent?.logoUrl ?? null;
  const [left, right] = match.isHome
    ? [BARCA_CREST_URL, opponentCrest]
    : [opponentCrest, BARCA_CREST_URL];

  return (
    <section
      className="matchday"
      data-kind={kind}
      data-clasico={isClasico}
      data-outcome={outcome ?? "none"}
      aria-label={t("common.versus", { home: barca, away: opponent })}
    >
      <div className="page-gutter matchday-inner">
        <p className="matchday-label">
          {kind === "live" && <span aria-hidden="true" className="matchday-dot" />}
          <T k={labelKey} />
          {kind === "live" && (
            <>
              {" · "}
              <T k="matchday.inPlay" />
            </>
          )}
        </p>

        <div className="matchday-teams">
          <Crest url={left} />
          <p className="matchday-versus">
            {kind === "fulltime" && outcome ? (
              <>
                <span className="matchday-score">
                  {match.isHome
                    ? formatScore(language, match.goalsFor, match.goalsAgainst)
                    : formatScore(language, match.goalsAgainst, match.goalsFor)}
                </span>
                <span className="matchday-names">{names}</span>
              </>
            ) : (
              <span className="matchday-names">{names}</span>
            )}
          </p>
          <Crest url={right} />
        </div>

        <p className="matchday-note">
          {kind === "today" && (
            <>
              {venue} · {displayCompetition(match.competition, language)} ·{" "}
              {formatKickoff(match.kickoffAt, language)} · {t("matchday.kickoffIn")}{" "}
              <MatchClock kickoffAt={match.kickoffAt} serverNow={now} />
            </>
          )}
          {kind === "live" && t("matchday.liveNote")}
          {kind === "fulltime" && outcome && `${describeOutcome(outcome, language)} · ${venue}`}
        </p>

        <div className="matchday-links">
          <Link href={`/matches/${match.id}`} className="chip chip-action matchday-link">
            {t("match.room")}
          </Link>
          {isClasico && (
            <Link href="/news" className="chip chip-action matchday-link">
              {t("matchday.papers")} {t("arrow.forward")}
            </Link>
          )}
        </div>
      </div>

      {kind === "fulltime" && outcome && (
        <>
          <span aria-hidden="true" className="matchday-stripe" />
          {outcome === "W" &&
            Array.from({ length: CONFETTI }, (_, index) => (
              <span
                key={index}
                aria-hidden="true"
                className="matchday-spark"
                style={{ "--n": index } as React.CSSProperties}
              />
            ))}
        </>
      )}
    </section>
  );
}
