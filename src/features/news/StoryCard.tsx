import type { SquadPlayer } from "@/domain/home";
import type { NewsCertainty } from "@/domain/news";
import { T } from "@/i18n/language";
import { ScoopBadge } from "./ScoopBadge";
import { StoryArt } from "./StoryArt";
import { StoryLink } from "./StoryLink";
import {
  certaintyOf,
  formatStoryAge,
  headlineOf,
  isCoveredByBothCities,
  isUntranslated,
  scoopOf,
  standfirstOf,
  type NewsStory,
} from "./stories";

export const CERTAINTY_LABELS: Record<NewsCertainty, string> = {
  official: "Official",
  reported: "Reported",
  rumour: "Rumour",
  opinion: "Opinion",
  news: "News",
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
                {CERTAINTY_LABELS[certainty]}
              </span>
            )}
            {isCoveredByBothCities(story) && <span className="story-both">Both cities</span>}
            <span className="story-age">{formatStoryAge(story.latestAt, now)}</span>
          </div>

          <Title className="nw-title" lang={untranslated ? "es" : "en"}>
            {headlineOf(story)}
          </Title>
          {standfirst && <p className="nw-summary">{standfirst}</p>}
          {untranslated && <p className="story-pending">Still in Spanish: translation pending.</p>}

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
                <T k="news.readStory" /> →
              </span>
            )}
          </div>
        </div>
      </StoryLink>
    </article>
  );
}
