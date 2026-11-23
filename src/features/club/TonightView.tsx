"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { Reveal } from "@/components/motion/Reveal";
import { STORY_EXITS, STORY_NOW, TONIGHT_ID, TONIGHT_NUMERAL } from "@/config/club-story";
import { BACKDROPS } from "@/config/moments";
import { displayCompetition, displayTeam, formatKickoff } from "@/features/home/format";
import { HeadlineLine } from "@/features/home/HeadlineLine";
import type { HeadlinePart } from "@/features/home/season-story";
import { useLanguage } from "@/i18n/language";
import { useWords } from "./use-words";

export type TonightMatch = {
  opponent: string;
  logoUrl: string | null;
  kickoffAt: Date;
  isHome: boolean;
  competition: string;
};

/** Chapter eight: this season in one line, the next match, and the doors into the rest of the app. */
export function TonightView({ headline, next }: { headline: HeadlinePart[]; next: TonightMatch | null }) {
  const w = useWords();
  const language = useLanguage();

  return (
    <section id={TONIGHT_ID} className="chapter tonight" data-tone="garnet" data-layout="stack">
      <PhotoBackdrop moment={BACKDROPS.club.tonight} />
      <span aria-hidden="true" className="chapter-numeral">
        {TONIGHT_NUMERAL}
      </span>
      <div className="chapter-inner">
        <div className="chapter-words">
          <Reveal as="p" className="story-kicker">
            {w(STORY_NOW.kicker)}
          </Reveal>
          <Reveal as="h2" effect="mask" delay={0.1} className="chapter-title">
            <span>{w(STORY_NOW.title)}</span>
          </Reveal>
          <Reveal as="p" delay={0.25} className="chapter-body">
            {w(STORY_NOW.lead)}
          </Reveal>
        </div>
      </div>

      {headline.length > 0 ? (
        <Reveal as="p" delay={0.2} className="tonight-headline">
          {headline.map(({ key, vars, competition }) => (
            <span key={key}>
              <HeadlineLine k={key} vars={vars} competition={competition} />
            </span>
          ))}
        </Reveal>
      ) : (
        <p className="chapter-body tonight-empty">{w(STORY_NOW.noData)}</p>
      )}

      {next && (
        <Reveal delay={0.3} className="tonight-next">
          <p className="story-kicker">{w(STORY_NOW.next)}</p>
          <div className="tonight-match">
            {next.logoUrl && (
              <Image src={next.logoUrl} alt="" width={48} height={48} unoptimized />
            )}
            <p>
              <bdi className="tonight-opponent">{displayTeam(next.opponent, language)}</bdi>
              <span className="tonight-when">
                {w(next.isHome ? STORY_NOW.home : STORY_NOW.away)} ·{" "}
                {displayCompetition(next.competition, language)} ·{" "}
                {formatKickoff(next.kickoffAt, language)}
              </span>
            </p>
          </div>
        </Reveal>
      )}

      <nav className="tonight-exits">
        {STORY_EXITS.map(({ href, label }, index) => (
          <Reveal key={href} delay={0.1 * index} effect="rise">
            <Link href={href} className="exit">
              <span>{w(label)}</span>
              <Icon name="arrow" className="icon icon-flip exit-arrow" />
            </Link>
          </Reveal>
        ))}
      </nav>
    </section>
  );
}
