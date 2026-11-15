import type { SquadPlayer } from "@/domain/home";
import type { NewsCertainty } from "@/domain/news";
import type { TextKey } from "@/i18n/dictionary";
import { T } from "@/i18n/language";
import { ScoopBadge } from "./ScoopBadge";
import { StoryArt } from "./StoryArt";
import { StoryLink } from "./StoryLink";
import {
  certaintyOf,
  isCoveredByBothCities,
  isUntranslated,
  scoopOf,
  standfirstOf,
  type NewsStory,
} from "./stories";
import { StoryAge } from "./StoryAge";
import { StoryHeadline, StoryStandfirst, TranslationPending } from "./StoryText";

export const CERTAINTY_LABELS: Record<NewsCertainty, TextKey> = {
  official: "certainty.official",
  reported: "certainty.reported",
  rumour: "certainty.rumour",
  opinion: "certainty.opinion",
  news: "certainty.news",
};

/** wide: picture beside the words. text: no picture, a bold colour block. tile: the default. */
export type CardSize = "lead" | "wide" | "tile" | "text";

type StoryCardProps = {
  story: NewsStory;
  squad: SquadPlayer[];
  now: Date;
  size: CardSize;
  /** Cards on a coloured block take turns between the club colours. */
  tone?: "garnet" | "blue" | "navy";
};

/** One story. The whole card opens it. */
export function StoryCard({ story, squad, now, size, tone }: StoryCardProps) {
  const certainty = certaintyOf(story);
  const scoop = scoopOf(story);
  const standfirst = standfirstOf(story);
  const untranslated = isUntranslated(story);
  const Title = size === "lead" ? "h2" : "h3";

  return (
    <article className="nw-card" data-size={size} data-tone={tone}>
      <StoryLink story={story} className="nw-card-link">
        {size !== "text" && (
          <StoryArt story={story} squad={squad} size={size === "lead" ? "hero" : "tile"} />
        )}
        <div className="nw-card-body">
          <div className="story-tags">
            {certainty && (
              <span className="story-certainty" data-certainty={certainty}>
                <T k={CERTAINTY_LABELS[certainty]} />
              </span>
            )}
            {isCoveredByBothCities(story) && (
              <span className="story-both">
                <T k="news.bothCities" />
              </span>
            )}
            <span className="story-age"><StoryAge date={story.latestAt} now={now} /></span>
          </div>

          <Title className="nw-title" lang={untranslated ? story.lead.language : undefined} dir="auto">
            <StoryHeadline story={story} />
          </Title>
          {standfirst && (
            <p className="nw-summary" dir="auto">
              <StoryStandfirst story={story} />
            </p>
          )}
          {untranslated && <TranslationPending story={story} />}

          <div className="nw-card-foot">
            {scoop ? (
              <ScoopBadge by={scoop} />
            ) : (
              <span className="story-outlets">
                {story.outlets.length > 1 ? (
                  <T k="news.outlets" vars={{ count: story.outlets.length }} />
                ) : (
                  story.outlets[0]
                )}
              </span>
            )}
            {story.writeup && size === "lead" && (
              <span className="nw-read">
                <T k="news.readStory" /> <T k="arrow.forward" />
              </span>
            )}
          </div>
        </div>
      </StoryLink>
    </article>
  );
}
