"use client";

import Image from "next/image";
import { isRtl } from "@/i18n/dictionary";
import { useLanguage, useT } from "@/i18n/language";
import { formatScore } from "@/i18n/numbers";
import type { SeasonMatch } from "@/domain/home";
import { formatMatchDate } from "./format";
import { getMatchOutcome, outcomeLetter } from "./season-story";

const TICKER_RESULTS = 8;

function TickerItem({ match }: { match: SeasonMatch }) {
  const t = useT();
  const language = useLanguage();
  const outcome = getMatchOutcome(match);
  const opponent = match.opponent?.name ?? t("common.tbd");
  return (
    <li className="ticker-item">
      {match.opponent?.logoUrl && (
        <Image src={match.opponent.logoUrl} alt="" width={20} height={20} unoptimized />
      )}
      <span className="ticker-outcome" data-outcome={outcome ?? "none"}>
        {outcome ? outcomeLetter(outcome, language) : "·"}
      </span>
      {/* The strip runs left to right, but each item reads in the visitor's own direction. */}
      <span dir={isRtl(language) ? "rtl" : undefined}>
        {outcome
          ? t("ticker.result", { score: formatScore(language, match.goalsFor, match.goalsAgainst), opponent })
          : t("ticker.next", { opponent, date: formatMatchDate(match.kickoffAt, language) })}
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
  const t = useT();
  const played = matches.filter((match) => getMatchOutcome(match) !== null).slice(-TICKER_RESULTS);
  const next = matches[nextIndex];
  const items = [...played, ...(next && getMatchOutcome(next) === null ? [next] : [])];
  if (items.length === 0) return null;

  return (
    <div className="ticker" role="region" aria-label={t("ticker.label")}>
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
