import Image from "next/image";
import { BARCA_CREST_URL } from "@/config/display";
import { STADIUM_PHOTO } from "@/config/photos";
import type { HomeStanding } from "@/domain/home";
import { CountUp } from "./CountUp";
import type { TextKey } from "@/i18n/dictionary";
import { T } from "@/i18n/language";
import { formatSeason } from "./format";
import { buildHeadlineParts, type SeasonSummary } from "./season-story";
import { MatchdayBanner } from "./MatchdayBanner";
import type { MatchdayState } from "./matchday";

type Tile = { label: TextKey; value: number; suffix?: string; ordinalSuffix?: boolean };

type HomeHeroProps = {
  season: number;
  summary: SeasonSummary;
  total: number;
  standing: HomeStanding | null;
  matchday: MatchdayState;
  now: Date;
};

/** The first thing you see: where Barça stand, in big numbers that count up. */
export function HomeHero({ season, summary, total, standing, matchday, now }: HomeHeroProps) {
  const leagueTiles: Tile[] = standing
    ? [
        { label: "hero.position", value: standing.rank, ordinalSuffix: true },
        { label: "hero.points", value: standing.points },
      ]
    : [];
  const tiles: Tile[] = [
    ...leagueTiles,
    { label: "hero.wins", value: summary.wins },
    { label: "hero.draws", value: summary.draws },
    { label: "hero.defeats", value: summary.losses },
    { label: "hero.goals", value: summary.goalsFor },
  ];

  return (
    <header className="hero" data-matchday={matchday.kind !== "none"}>
      {/* The stadium sits under a dark wash, so white text keeps its contrast over any part of it. */}
      <Image
        className="hero-stadium"
        src={STADIUM_PHOTO.src}
        alt=""
        fill
        priority
        sizes="100vw"
      />
      <div aria-hidden="true" className="hero-stripes" />
      <MatchdayBanner state={matchday} now={now} />
      <div className="page-gutter hero-inner">
        <div className="hero-top">
          <Image src={BARCA_CREST_URL} alt="FC Barcelona" width={64} height={64} unoptimized />
          <p className="hero-kicker">
            <T
              k="hero.kicker"
              vars={{ season: formatSeason(season), played: summary.played, total }}
            />
          </p>
        </div>
        <h1 className="hero-title">
          {buildHeadlineParts(summary, standing).map(({ key, vars }, index) => (
            <span key={key} className={index === 0 ? "block" : "block hero-hot"}>
              <T k={key} vars={vars} />
            </span>
          ))}
        </h1>
        <dl className="hero-stats">
          {tiles.map(({ label, value, suffix, ordinalSuffix }, index) => (
            <div
              key={label}
              className="hero-stat"
              style={{ animationDelay: `${0.25 + index * 0.08}s` }}
            >
              <dd className="hero-stat-number">
                <CountUp value={value} suffix={suffix} ordinalSuffix={ordinalSuffix} />
              </dd>
              <dt className="hero-stat-label">
                <T k={label} />
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
