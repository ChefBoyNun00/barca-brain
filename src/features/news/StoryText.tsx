"use client";

import { T, useLanguage } from "@/i18n/language";
import { coverageIn, headlineOf, standfirstOf, type NewsStory } from "./stories";

/**
 * A Hebrew reader sees an Israeli outlet's own Hebrew headline when one covered the story,
 * rather than our English version of it. Everyone else sees the English.
 */
export function StoryHeadline({ story }: { story: NewsStory }) {
  const hebrew = useLanguage() === "he" ? coverageIn(story, "he") : null;
  return <>{hebrew ? hebrew.titleOriginal : headlineOf(story)}</>;
}

/** The short summary under a headline, from the same outlet as the headline above it. */
export function StoryStandfirst({ story }: { story: NewsStory }) {
  const hebrew = useLanguage() === "he" ? coverageIn(story, "he") : null;
  return <>{hebrew ? (hebrew.snippetOriginal ?? standfirstOf(story)) : standfirstOf(story)}</>;
}

/** Says a headline is still in its original language, unless that is the reader's own. */
export function TranslationPending({ story }: { story: NewsStory }) {
  const language = useLanguage();
  if (story.lead.language === language || (language === "he" && coverageIn(story, "he"))) {
    return null;
  }
  return (
    <p className="story-pending">
      <T k="news.pending" />
    </p>
  );
}
