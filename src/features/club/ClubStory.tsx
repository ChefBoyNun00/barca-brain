"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal, RevealWords } from "@/components/motion/Reveal";
import {
  CHAPTERS,
  COLOURS_NOTE,
  CRUYFF_QUOTE,
  MASIA_LEGENDS,
  MASIA_ROWS,
  MES_QUE_UN_CLUB,
  STORY_A11Y,
  STORY_COVER,
  STORY_NOW,
  TONIGHT_ID,
  type Chapter,
} from "@/config/club-story";
import { BARCA_CREST_URL } from "@/config/display";
import { LA_MASIA_GRADUATES } from "@/config/la-masia";
import { PLAYER_SEARCH_NAMES, STADIUM_PHOTO } from "@/config/photos";
import { ChapterRail } from "./ChapterRail";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { BACKDROPS, type Moment } from "@/config/moments";
import { FansMosaic } from "./FansMosaic";
import { MatchdayClock } from "./MatchdayClock";
import { NameDrift } from "./NameDrift";
import { Odometer } from "./Odometer";
import { PassingPitch } from "./PassingPitch";
import { Senyera } from "./Senyera";
import { useWords } from "./use-words";

/** Today's academy graduates, by the names fans know (the provider says "Pablo Gavira" for Gavi). */
const MASIA_NOW = [...LA_MASIA_GRADUATES].map((name) => PLAYER_SEARCH_NAMES[name] ?? name);

/**
 * "The club": FC Barcelona's story told in chapters as you scroll, from a newspaper advert in
 * 1899 to a matchday in the city. Chapter seven, the live one, follows it on the page.
 */
export function ClubStory() {
  const w = useWords();
  const [founding, catalonia, culers, masia, idea, matchday] = CHAPTERS;
  const stops = [
    ...CHAPTERS.map(({ id, numeral, label }) => ({ id, numeral, label: w(label) })),
    { id: TONIGHT_ID, numeral: "VII", label: w(STORY_NOW.label) },
  ];

  return (
    <>
      <div aria-hidden="true" className="story-progress" />
      <ChapterRail stops={stops} label={w(STORY_A11Y.rail)} />

      <header className="cover">
        <div className="cover-photo">
          <Image src={STADIUM_PHOTO.src} alt="" fill priority sizes="100vw" />
        </div>
        <div className="cover-inner">
          <Reveal effect="fade" className="cover-crest">
            <Image src={BARCA_CREST_URL} alt="FC Barcelona" width={72} height={72} unoptimized />
          </Reveal>
          <Reveal as="p" effect="fade" delay={0.3} className="story-kicker">
            {w(STORY_COVER.kicker)}
          </Reveal>
          <RevealWords as="h1" text={w(STORY_COVER.title)} className="cover-title" step={0.12} delay={0.45} />
          <Reveal as="p" delay={1.1} className="cover-lead">
            {w(STORY_COVER.lead)}
          </Reveal>
        </div>
        <a href={`#${founding.id}`} className="cover-cue">
          <span>{w(STORY_COVER.scroll)}</span>
          <span aria-hidden="true" className="cover-cue-line" />
        </a>
      </header>

      <StoryChapter
        chapter={founding}
        tone="garnet"
        backdrop={BACKDROPS.club.founding}
        archival
        visual={<Odometer value="1899" />}
      >
        <Reveal as="aside" className="story-aside">
          {w(COLOURS_NOTE)}
        </Reveal>
      </StoryChapter>

      <StoryChapter
        chapter={catalonia}
        tone="gold"
        backdrop={BACKDROPS.club.catalonia}
        visual={<Senyera />}
      >
        <figure className="mes">
          <RevealWords
            as="blockquote"
            text={w(MES_QUE_UN_CLUB.quote)}
            className="mes-quote"
            step={0.18}
          />
          <Reveal as="figcaption" delay={0.6} className="mes-caption">
            <span className="mes-meaning">{w(MES_QUE_UN_CLUB.meaning)}</span>
            <span>{w(MES_QUE_UN_CLUB.credit)}</span>
          </Reveal>
        </figure>
      </StoryChapter>

      <StoryChapter
        chapter={culers}
        tone="blue"
        backdrop={BACKDROPS.club.culers}
        visual={<FansMosaic />}
      />

      <StoryChapter chapter={masia} tone="garnet" layout="stack" backdrop={BACKDROPS.club.masia}>
        <div className="drifts">
          <NameDrift label={w(MASIA_ROWS.legends)} names={MASIA_LEGENDS} />
          <NameDrift label={w(MASIA_ROWS.now)} names={MASIA_NOW} reverse />
        </div>
      </StoryChapter>

      <StoryChapter
        chapter={idea}
        tone="blue"
        backdrop={BACKDROPS.club.idea}
        visual={<PassingPitch label={w(STORY_A11Y.pitch)} />}
      >
        <Reveal as="figure" className="story-quote">
          <blockquote>{w(CRUYFF_QUOTE.quote)}</blockquote>
          <figcaption>{w(CRUYFF_QUOTE.credit)}</figcaption>
        </Reveal>
      </StoryChapter>

      <StoryChapter
        chapter={matchday}
        tone="dusk"
        layout="stack"
        backdrop={BACKDROPS.club.matchday}
      >
        <MatchdayClock />
      </StoryChapter>
    </>
  );
}

type Tone = "garnet" | "blue" | "gold" | "dusk";

/**
 * One chapter: a huge faint numeral behind, the words on one side and the moving picture on the
 * other ("split"), or the words above a full-width picture ("stack").
 */
function StoryChapter({
  chapter,
  tone,
  layout = "split",
  visual,
  backdrop,
  archival = false,
  children,
}: {
  chapter: Chapter;
  tone: Tone;
  layout?: "split" | "stack";
  visual?: ReactNode;
  /** A photo faded in behind the whole chapter. */
  backdrop?: Moment;
  /** Show the photo aged, for a chapter set long before it was taken. */
  archival?: boolean;
  children?: ReactNode;
}) {
  const w = useWords();
  return (
    <section id={chapter.id} className="chapter" data-tone={tone} data-layout={layout}>
      {backdrop && <PhotoBackdrop moment={backdrop} archival={archival} />}
      <span aria-hidden="true" className="chapter-numeral">
        {chapter.numeral}
      </span>
      <div className="chapter-inner">
        <div className="chapter-words">
          <Reveal as="p" className="story-kicker">
            {w(chapter.kicker)}
          </Reveal>
          <Reveal as="h2" effect="mask" delay={0.1} className="chapter-title">
            <span>{w(chapter.title)}</span>
          </Reveal>
          {chapter.body.map((paragraph, index) => (
            <Reveal as="p" key={index} delay={0.25 + index * 0.12} className="chapter-body">
              {w(paragraph)}
            </Reveal>
          ))}
          {layout === "split" && children}
        </div>
        {visual && <div className="chapter-visual">{visual}</div>}
      </div>
      {layout === "stack" && children}
    </section>
  );
}
