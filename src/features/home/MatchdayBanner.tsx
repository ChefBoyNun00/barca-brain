import Image from "next/image";
import Link from "next/link";
import { BARCA_CREST_URL } from "@/config/display";
import { T } from "@/i18n/language";
import { displayCompetition, formatKickoff } from "./format";
import { MatchClock } from "./MatchClock";
import type { MatchdayState } from "./matchday";
import { describeOutcome, getMatchOutcome } from "./season-story";

const CONFETTI = 14;

function Crest({ url }: { url: string | null }) {
  return url ? <Image src={url} alt="" width={56} height={56} unoptimized /> : null;
}

/** The top of the home page on match day: before, during and just after a match. */
export function MatchdayBanner({ state, now }: { state: MatchdayState; now: Date }) {
  if (state.kind === "none") return null;
  const { match, isClasico, kind } = state;
  const opponent = match.opponent?.name ?? "To be decided";
  const outcome = getMatchOutcome(match);
  const labelKey = isClasico
    ? "matchday.clasico"
    : kind === "fulltime"
      ? "matchday.fulltime"
      : "matchday.matchday";
  const venue = match.isHome ? "At home" : "Away";
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
      aria-label={`Barça v ${opponent}`}
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
                    ? `${match.goalsFor}–${match.goalsAgainst}`
                    : `${match.goalsAgainst}–${match.goalsFor}`}
                </span>
                <span className="matchday-names">
                  {match.isHome ? `Barça v ${opponent}` : `${opponent} v Barça`}
                </span>
              </>
            ) : (
              <span className="matchday-names">
                {match.isHome ? `Barça v ${opponent}` : `${opponent} v Barça`}
              </span>
            )}
          </p>
          <Crest url={right} />
        </div>

        <p className="matchday-note">
          {kind === "today" && (
            <>
              {venue} · {displayCompetition(match.competition)} · {formatKickoff(match.kickoffAt)}
              {" · kick-off in "}
              <MatchClock kickoffAt={match.kickoffAt} serverNow={now} />
            </>
          )}
          {kind === "live" && "Scores update once a day, so check back after the final whistle."}
          {kind === "fulltime" && outcome && `${describeOutcome(outcome)} · ${venue}`}
        </p>

        {isClasico && (
          <Link href="/news" className="chip chip-action matchday-link">
            What Barcelona and Madrid papers are saying →
          </Link>
        )}
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
