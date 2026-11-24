"use client";

import Image from "next/image";
import Link from "next/link";
import { BARCA_CREST_URL } from "@/config/display";
import type { SeasonMatch } from "@/domain/home";
import { useLanguage, useT } from "@/i18n/language";
import { formatScore } from "@/i18n/numbers";
import { displayCompetition, displayRound, displayTeam, formatKickoff, formatMatchDate } from "../home/format";
import {
  describeMatch,
  describeOutcome,
  getMatchOutcome,
  outcomeLetter,
} from "../home/season-story";

type Team = { name: string; logoUrl: string | null };

function Side({ team }: { team: Team }) {
  return (
    <span className="match-card-team">
      {team.logoUrl && <Image src={team.logoUrl} alt="" width={48} height={48} unoptimized />}
      <span dir="auto">{team.name}</span>
    </span>
  );
}

/** One match as a card. The home side is on the left, as on a scoreboard. */
type MatchCardProps = { match: SeasonMatch; index: number; showShare?: boolean };

export function MatchCard({ match, index, showShare = true }: MatchCardProps) {
  const t = useT();
  const language = useLanguage();
  const outcome = getMatchOutcome(match);
  const barca: Team = { name: t("common.barca"), logoUrl: BARCA_CREST_URL };
  const opponent: Team = {
    name: match.opponent ? displayTeam(match.opponent.name, language) : t("common.tbd"),
    logoUrl: match.opponent?.logoUrl ?? null,
  };
  const [left, right] = match.isHome ? [barca, opponent] : [opponent, barca];
  const [leftGoals, rightGoals] = match.isHome
    ? [match.goalsFor, match.goalsAgainst]
    : [match.goalsAgainst, match.goalsFor];
  const hasHalfTime = match.halfTimeFor !== null && match.halfTimeAgainst !== null;

  return (
    <article
      id={`match-${match.id}`}
      className="match-card"
      data-outcome={outcome ?? "none"}
      data-linked={showShare ? "" : undefined}
      style={{ "--i": index } as React.CSSProperties}
      aria-label={describeMatch(match, language)}
    >
      <header className="match-card-top">
        <span>
          {[displayCompetition(match.competition, language), displayRound(match.round, language)]
            .filter(Boolean)
            .join(" · ")}
        </span>
        {outcome && (
          <span className="match-card-badge" title={describeOutcome(outcome, language)}>
            {outcomeLetter(outcome, language)}
          </span>
        )}
      </header>
      <div className="match-card-teams">
        <Side team={left} />
        <span className="match-card-score">{outcome ? formatScore(language, leftGoals, rightGoals) : t("common.vs")}</span>
        <Side team={right} />
      </div>
      <p className="match-card-foot">
        {outcome ? (
          <>
            {formatMatchDate(match.kickoffAt, language)} · {t(match.isHome ? "match.home" : "match.away")}
            {hasHalfTime &&
              ` · ${t("match.halfTime", { score: formatScore(language, match.halfTimeFor, match.halfTimeAgainst) })}`}
          </>
        ) : (
          <>
            {t(match.isHome ? "match.home" : "match.away")} · {formatKickoff(match.kickoffAt, language)}
          </>
        )}
      </p>
      {/* The whole card is the door to the Matchday Room (the link stretches over it in CSS),
          so one visible "Matchday Room" line isn't repeated on every one of 46 cards. */}
      {showShare && (
        <Link className="match-card-link" href={`/matches/${match.id}`}>
          <span className="sr-only">
            {t("match.room")} {describeMatch(match, language)}
          </span>
        </Link>
      )}
    </article>
  );
}
