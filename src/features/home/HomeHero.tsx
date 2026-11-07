import Image from "next/image";
import { BARCA_CREST_URL } from "@/config/display";
import type { HomeStanding } from "@/domain/home";
import { CountUp } from "./CountUp";
import { formatSeason } from "./format";
import type { SeasonSummary } from "./season-story";

const ordinalSuffix = (rank: number): string => {
  const suffixes: Record<string, string> = { one: "st", two: "nd", few: "rd", other: "th" };
  return suffixes[new Intl.PluralRules("en", { type: "ordinal" }).select(rank)] ?? "th";
};

type HomeHeroProps = {
  season: number;
  headline: string[];
  summary: SeasonSummary;
  total: number;
  standing: HomeStanding | null;
};

/** The first thing you see: where Barça stand, in big numbers that count up. */
export function HomeHero({ season, headline, summary, total, standing }: HomeHeroProps) {
  const tiles = [
    ...(standing
      ? [
          { label: "League position", value: standing.rank, suffix: ordinalSuffix(standing.rank) },
          { label: "Points", value: standing.points, suffix: "" },
        ]
      : []),
    { label: "Wins", value: summary.wins, suffix: "" },
    { label: "Draws", value: summary.draws, suffix: "" },
    { label: "Defeats", value: summary.losses, suffix: "" },
    { label: "Goals scored", value: summary.goalsFor, suffix: "" },
  ];

  return (
    <header className="hero">
      <div aria-hidden="true" className="hero-stripes" />
      <div className="page-gutter hero-inner">
        <div className="hero-top">
          <Image src={BARCA_CREST_URL} alt="FC Barcelona" width={64} height={64} unoptimized />
          <p className="hero-kicker">
            Més que un club · Season {formatSeason(season)} · {summary.played} of {total} played
          </p>
        </div>
        <h1 className="hero-title">
          {headline.map((line, index) => (
            <span key={line} className={index === 0 ? "block" : "block hero-hot"}>
              {line}
            </span>
          ))}
        </h1>
        <dl className="hero-stats">
          {tiles.map(({ label, value, suffix }, index) => (
            <div
              key={label}
              className="hero-stat"
              style={{ animationDelay: `${0.25 + index * 0.08}s` }}
            >
              <dd className="hero-stat-number">
                <CountUp value={value} suffix={suffix} />
              </dd>
              <dt className="hero-stat-label">{label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
