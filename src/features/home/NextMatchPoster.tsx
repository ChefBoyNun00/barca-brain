"use client";

import Image from "next/image";
import Link from "next/link";
import type { LeagueRow, SeasonMatch } from "@/domain/home";
import { useLanguage, useT } from "@/i18n/language";
import { Countdown } from "./Countdown";
import { displayCompetition, displayRound, formatKickoff } from "./format";
import { TaleOfTheTape } from "./TaleOfTheTape";

type NextMatchPosterProps = {
  match: SeasonMatch;
  matches: SeasonMatch[];
  table: LeagueRow[];
  now: Date;
};

/** The next match as a poster: who, where, when, a countdown, and how the sides compare. */
export function NextMatchPoster({ match, matches, table, now }: NextMatchPosterProps) {
  const t = useT();
  const language = useLanguage();
  const opponent = match.opponent?.name ?? t("common.tbd");
  // The CSS shrinks the name until its longest word fits on one line.
  const longestWord = Math.max(...opponent.split(/\s+/).map((word) => word.length));
  return (
    <section aria-labelledby="next-up" className="poster reveal">
      <div className="page-gutter poster-inner">
        <p id="next-up" className="poster-kicker">
          {t("home.nextMatch")}
        </p>
        <div className="poster-teams">
          {match.opponent?.logoUrl && (
            <Image src={match.opponent.logoUrl} alt="" width={96} height={96} unoptimized />
          )}
          <p
            className="poster-opponent"
            style={{ "--name-chars": longestWord } as React.CSSProperties}
          >
            <bdi>{opponent}</bdi>
          </p>
        </div>
        <p className="poster-meta">
          {[
            t(match.isHome ? "common.atHome" : "common.away"),
            displayCompetition(match.competition, language),
            displayRound(match.round, language),
            formatKickoff(match.kickoffAt, language),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <Countdown kickoffAt={match.kickoffAt} serverNow={now} />
        <TaleOfTheTape table={table} matches={matches} opponentId={match.opponent?.id} />
        <Link className="poster-ask" href={{ pathname: "/ask", query: { q: t("q.preview") } }}>
          {t("home.preview")} {t("arrow.forward")}
        </Link>
      </div>
    </section>
  );
}
