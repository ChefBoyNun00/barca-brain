"use client";

import type { NewsArticle, NewsBriefing, StoryWriteup } from "@/domain/news";
import { T, useLanguage } from "@/i18n/language";
import {
  headlineOf,
  hebrewHeadlineOf,
  hebrewStandfirstOf,
  standfirstOf,
  type NewsStory,
} from "./stories";

// The reader's language lives in the browser, so these small pieces pick the text there.
// A Hebrew reader gets Hebrew wherever the news job has written it, and English until then.

export function StoryHeadline({ story }: { story: NewsStory }) {
  const hebrew = useLanguage() === "he" ? hebrewHeadlineOf(story) : null;
  return <>{hebrew ?? headlineOf(story)}</>;
}

/** The short summary under a headline. */
export function StoryStandfirst({ story }: { story: NewsStory }) {
  const hebrew = useLanguage() === "he" ? hebrewStandfirstOf(story) : null;
  return <>{hebrew ?? standfirstOf(story)}</>;
}

/** Says a headline is still in its original language, unless that is the reader's own. */
export function TranslationPending({ story }: { story: NewsStory }) {
  const language = useLanguage();
  if (story.lead.language === language || (language === "he" && hebrewHeadlineOf(story))) {
    return null;
  }
  return (
    <p className="story-pending">
      <T k="news.pending" />
    </p>
  );
}

/** The write-up in the reader's language: its Hebrew once translated, else the English. */
export function useWriteupText(writeup: StoryWriteup) {
  return useLanguage() === "he" && writeup.hebrew ? writeup.hebrew : writeup;
}

export function StoryBody({ writeup }: { writeup: StoryWriteup }) {
  const text = useWriteupText(writeup);
  return (
    <>
      <div className="sp-body">
        {text.body.map((paragraph) => (
          <p key={paragraph} dir="auto">
            {paragraph}
          </p>
        ))}
      </div>

      {text.quotes.map((quote) => (
        <figure key={quote.text} className="sp-quote" dir="auto">
          <blockquote>“{quote.text}”</blockquote>
          <figcaption>
            {quote.speaker} · <cite>{quote.outlet}</cite>
          </figcaption>
        </figure>
      ))}

      {text.whatsNext && (
        <section className="sp-next" aria-labelledby="sp-next-title">
          <h2 id="sp-next-title">
            <T k="news.whatsNext" />
          </h2>
          <p dir="auto">{text.whatsNext}</p>
        </section>
      )}
    </>
  );
}

export function StoryKeyFacts({ writeup }: { writeup: StoryWriteup }) {
  const text = useWriteupText(writeup);
  if (text.keyFacts.length === 0) return null;
  return (
    <section className="sp-facts" aria-labelledby="sp-facts-title">
      <h2 id="sp-facts-title">
        <T k="news.keyFacts" />
      </h2>
      <ul>
        {text.keyFacts.map((fact) => (
          <li key={fact} dir="auto">
            {fact}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** One outlet's headline and summary, while the full story is still being written. */
export function CoverageText({ article }: { article: NewsArticle }) {
  const hebrew = useLanguage() === "he";
  const title = (hebrew && article.titleHe) || article.titleEn || article.titleOriginal;
  const summary = (hebrew && article.summaryHe) || article.summaryEn;
  return (
    <>
      <p className="sp-coverage-title" dir="auto">
        {title}
      </p>
      {summary && <p dir="auto">{summary}</p>}
    </>
  );
}

/** The day's briefing in the reader's language, marked so screen readers pronounce it right. */
export function BriefingWords({ briefing }: { briefing: NewsBriefing }) {
  const hebrew = useLanguage() === "he" ? briefing.hebrew : null;
  const text = hebrew ?? briefing;
  const lang = hebrew ? "he" : "en";
  return (
    <>
      <p className="rd-brief-headline" lang={lang} dir="auto">
        {text.headline}
      </p>
      <ul className="rd-brief-list" lang={lang} dir="auto">
        {text.bullets.map((bullet) => (
          <li key={bullet.text}>{bullet.text}</li>
        ))}
      </ul>
    </>
  );
}
