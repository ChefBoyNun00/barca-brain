import { Fragment } from "react";
import type { SquadPlayer } from "@/domain/home";
import type { NewsBriefing } from "@/domain/news";
import { T } from "@/i18n/language";
import { MoreStories } from "./MoreStories";
import { OutletPhoto } from "./OutletPhoto";
import { CERTAINTY_LABELS } from "./StoryCard";
import { StoryAge } from "./StoryAge";
import { StoryArt } from "./StoryArt";
import { StoryLink } from "./StoryLink";
import { BriefingWords, StoryHeadline, StoryStandfirst } from "./StoryText";
import {
  certaintyOf,
  isUntranslated,
  photoOf,
  standfirstOf,
  topicOf,
  type NewsStory,
} from "./stories";

type ReaderProps = {
  /** Already ranked, most important first. */
  stories: NewsStory[];
  squad: SquadPlayer[];
  now: Date;
  /** How many show before "More stories". */
  first: number;
};

/**
 * The news as a calm reader, not a feed: one lead story told properly, then one column of
 * summaries, each a headline, two lines and a photo. Everything opens the full story.
 */
export function Reader({ stories, squad, now, first }: ReaderProps) {
  const [lead, ...rest] = stories;
  if (!lead) return null;
  const shown = rest.slice(0, first - 1);
  const more = rest.slice(first - 1);
  return (
    <div className="rd">
      <LeadStory story={lead} squad={squad} now={now} />
      <ol className="rd-list">
        {shown.map((story) => (
          <ReaderItem key={story.id} story={story} squad={squad} now={now} />
        ))}
      </ol>
      <MoreStories count={more.length}>
        <ol className="rd-list">
          {more.map((story) => (
            <ReaderItem key={story.id} story={story} squad={squad} now={now} />
          ))}
        </ol>
      </MoreStories>
    </div>
  );
}

/** "Transfers · Reported" — what the story is about and how solid it is, in plain words. */
function StoryLabel({ story }: { story: NewsStory }) {
  const certainty = certaintyOf(story);
  const topic = topicOf(story);
  // "Other" is not a topic worth naming; the label then just says how solid the story is.
  const parts = [
    topic !== "other" && <T key="topic" k={`news.${topic}`} />,
    certainty && (
      <span key="certainty" data-certainty={certainty}>
        <T k={CERTAINTY_LABELS[certainty]} />
      </span>
    ),
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className="rd-label">
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && <span aria-hidden="true"> · </span>}
          {part}
        </Fragment>
      ))}
    </p>
  );
}

/** "Mundo Deportivo and 3 more · 2h ago", and on rows, whose photo it is. */
function StoryMeta({ story, now, credit = false }: { story: NewsStory; now: Date; credit?: boolean }) {
  const [first, ...others] = story.outlets;
  const photo = credit ? photoOf(story) : null;
  return (
    <p className="rd-meta">
      {others.length > 0 ? (
        <T k="news.outletAndMore" vars={{ outlet: first ?? "", count: others.length }} />
      ) : (
        first
      )}
      <span aria-hidden="true"> · </span>
      <StoryAge date={story.latestAt} now={now} />
      {photo && (
        <span className="rd-meta-credit">
          <span aria-hidden="true"> · </span>
          <T k="news.photoBy" vars={{ outlet: photo.outlet }} />
        </span>
      )}
    </p>
  );
}

function Picture({
  story,
  squad,
  size,
}: {
  story: NewsStory;
  squad: SquadPlayer[];
  size: "hero" | "tile";
}) {
  const photo = photoOf(story);
  const art = <StoryArt story={story} squad={squad} size={size} />;
  if (!photo) return art;
  return (
    <OutletPhoto
      src={photo.url}
      priority={size === "hero"}
      // The lead carries its credit on the photo; small rows credit it in the line under the summary.
      credit={size === "hero" ? <T k="news.photoBy" vars={{ outlet: photo.outlet }} /> : null}
      fallback={art}
    />
  );
}

function LeadStory({ story, squad, now }: { story: NewsStory; squad: SquadPlayer[]; now: Date }) {
  const untranslated = isUntranslated(story);
  return (
    <article className="rd-lead">
      <StoryLink story={story} className="rd-lead-link">
        <div className="rd-lead-picture">
          <Picture story={story} squad={squad} size="hero" />
        </div>
        <div className="rd-lead-words">
          <StoryLabel story={story} />
          <h2 className="rd-lead-title" dir="auto" lang={untranslated ? story.lead.language : undefined}>
            <StoryHeadline story={story} />
          </h2>
          {standfirstOf(story) && (
            <p className="rd-lead-summary" dir="auto">
              <StoryStandfirst story={story} />
            </p>
          )}
          <StoryMeta story={story} now={now} />
          {story.writeup && (
            <span className="rd-read">
              <T k="news.readStory" /> <T k="arrow.forward" />
            </span>
          )}
        </div>
      </StoryLink>
    </article>
  );
}

/** One story as a row: label, headline, a line of summary, who and when, a small photo. */
export function ReaderItem({ story, squad, now }: { story: NewsStory; squad: SquadPlayer[]; now: Date }) {
  const untranslated = isUntranslated(story);
  return (
    <li className="rd-item">
      <StoryLink story={story} className="rd-item-link">
        <div className="rd-item-words">
          <StoryLabel story={story} />
          <h3 className="rd-item-title" dir="auto" lang={untranslated ? story.lead.language : undefined}>
            <StoryHeadline story={story} />
          </h3>
          {standfirstOf(story) && (
            <p className="rd-item-summary" dir="auto">
              <StoryStandfirst story={story} />
            </p>
          )}
          <StoryMeta story={story} now={now} credit />
        </div>
        <div className="rd-item-picture">
          <Picture story={story} squad={squad} size="tile" />
        </div>
      </StoryLink>
    </li>
  );
}

/** The whole morning in a few lines: Claude's briefing over every story read today. */
export function InBrief({ briefing }: { briefing: NewsBriefing }) {
  return (
    <section aria-labelledby="in-brief" className="rd-brief">
      <h2 id="in-brief" className="eyebrow">
        <T k="news.inBrief" />
      </h2>
      <BriefingWords briefing={briefing} />
    </section>
  );
}
