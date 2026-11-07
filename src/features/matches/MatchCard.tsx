import Image from "next/image";
import { BARCA_CREST_URL } from "@/config/display";
import type { SeasonMatch } from "@/domain/home";
import { displayCompetition, formatKickoff, formatMatchDate } from "../home/format";
import { describeMatch, describeOutcome, getMatchOutcome } from "../home/season-story";

type Team = { name: string; logoUrl: string | null };

function Side({ team }: { team: Team }) {
  return (
    <span className="match-card-team">
      {team.logoUrl && <Image src={team.logoUrl} alt="" width={48} height={48} unoptimized />}
      <span>{team.name}</span>
    </span>
  );
}

/** One match as a card. The home side is on the left, as on a scoreboard. */
export function MatchCard({ match, index }: { match: SeasonMatch; index: number }) {
  const outcome = getMatchOutcome(match);
  const barca: Team = { name: "Barça", logoUrl: BARCA_CREST_URL };
  const opponent: Team = {
    name: match.opponent?.name ?? "To be decided",
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
      style={{ "--i": index } as React.CSSProperties}
      aria-label={describeMatch(match)}
    >
      <header className="match-card-top">
        <span>
          {[displayCompetition(match.competition), match.round].filter(Boolean).join(" · ")}
        </span>
        {outcome && (
          <span className="match-card-badge" title={describeOutcome(outcome)}>
            {outcome}
          </span>
        )}
      </header>
      <div className="match-card-teams">
        <Side team={left} />
        <span className="match-card-score">{outcome ? `${leftGoals}–${rightGoals}` : "v"}</span>
        <Side team={right} />
      </div>
      <p className="match-card-foot">
        {outcome
          ? [
              formatMatchDate(match.kickoffAt),
              match.isHome ? "Home" : "Away",
              hasHalfTime && `HT ${match.halfTimeFor}–${match.halfTimeAgainst}`,
            ]
              .filter(Boolean)
              .join(" · ")
          : `${match.isHome ? "Home" : "Away"} · ${formatKickoff(match.kickoffAt)}`}
      </p>
    </article>
  );
}
