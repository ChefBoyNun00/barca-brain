import type { CSSProperties } from "react";
import { T } from "@/i18n/language";
import { Icon, IsraelFlag } from "@/components/Icon";
import { CERTAINTY_LABELS } from "./StoryCard";
import { StoryLink } from "./StoryLink";
import { certaintyOf, type NewsStory } from "./stories";
import { StoryAge } from "./StoryAge";
import { StoryHeadline } from "./StoryText";

export type HeatEntry = {
  story: NewsStory;
  /** 0 to 1, against the hottest story in the edition. */
  heat: number;
  /** Israeli edition only: outlets running the story abroad. 0 means only Israel has it. */
  abroad?: number;
};

type HeatChartProps = { entries: HeatEntry[]; now: Date; startAt: number };

/** The next biggest stories, numbered like a chart, each with a bar for how hot it is. */
export function HeatChart({ entries, now, startAt }: HeatChartProps) {
  if (entries.length === 0) return null;
  return (
    <aside className="heat" aria-labelledby="heat-title">
      <div className="heat-head">
        <h2 id="heat-title" className="heat-title">
          <T k="heat.title" />
        </h2>
        <p className="heat-note">
          <T k="heat.note" />
        </p>
      </div>
      <ol className="heat-list" start={startAt}>
        {entries.map(({ story, heat, abroad }, index) => {
          const certainty = certaintyOf(story);
          return (
            <li key={story.id}>
              <StoryLink story={story} className="heat-item">
                <span className="heat-rank" aria-hidden="true">
                  {startAt + index}
                </span>
                <span className="heat-body">
                  <span className="heat-headline" dir="auto">
                    <StoryHeadline story={story} />
                  </span>
                  <span
                    className="heat-bar"
                    style={{ "--heat": heat.toFixed(2) } as CSSProperties}
                    aria-hidden="true"
                  />
                  <span className="heat-meta">
                    {certainty && (
                      <span className="story-certainty" data-certainty={certainty}>
                        <T k={CERTAINTY_LABELS[certainty]} />
                      </span>
                    )}
                    <span>
                      {story.outlets.length > 1 ? (
                        <T k="news.outlets" vars={{ count: story.outlets.length }} />
                      ) : (
                        story.outlets[0]
                      )}
                    </span>
                    <span>
                      <StoryAge date={story.latestAt} now={now} />
                    </span>
                    {abroad !== undefined && <AbroadTag count={abroad} />}
                  </span>
                </span>
              </StoryLink>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

/** How far an Israeli story has travelled: how many outlets abroad run it, or none at all. */
export function AbroadTag({ count }: { count: number }) {
  return count > 0 ? (
    <span className="abroad-tag">
      <Icon name="globe" /> <T k="heat.abroad" vars={{ count }} />
    </span>
  ) : (
    <span className="abroad-tag" data-only="true">
      <IsraelFlag /> <T k="heat.onlyIsrael" />
    </span>
  );
}
