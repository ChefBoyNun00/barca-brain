import Image from "next/image";
import type { SeasonMatch } from "@/domain/home";
import { formatMatchDate } from "./format";
import { getMatchOutcome } from "./season-story";

const TICKER_RESULTS = 8;

function TickerItem({ match }: { match: SeasonMatch }) {
  const outcome = getMatchOutcome(match);
  const opponent = match.opponent?.name ?? "TBD";
  return (
    <li className="ticker-item">
      {match.opponent?.logoUrl && (
        <Image src={match.opponent.logoUrl} alt="" width={20} height={20} unoptimized />
      )}
      <span className="ticker-outcome" data-outcome={outcome ?? "none"}>
        {outcome ?? "·"}
      </span>
      <span>
        {outcome
          ? `Barça ${match.goalsFor}–${match.goalsAgainst} ${opponent}`
          : `Next: ${opponent} · ${formatMatchDate(match.kickoffAt)}`}
      </span>
    </li>
  );
}

/** A slow, endless strip of the latest results and the next match. Pauses on hover. */
export function ResultsTicker({
  matches,
  nextIndex,
}: {
  matches: SeasonMatch[];
  nextIndex: number;
}) {
  const played = matches.filter((match) => getMatchOutcome(match) !== null).slice(-TICKER_RESULTS);
  const next = matches[nextIndex];
  const items = [...played, ...(next && getMatchOutcome(next) === null ? [next] : [])];
  if (items.length === 0) return null;

  return (
    <div className="ticker" role="region" aria-label="Latest results">
      <ul className="ticker-track">
        {items.map((match) => (
          <TickerItem key={match.id} match={match} />
        ))}
        {/* The second copy makes the loop seamless. Screen readers skip it. */}
        <li aria-hidden="true" className="ticker-copy">
          <ul>
            {items.map((match) => (
              <TickerItem key={match.id} match={match} />
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
}
