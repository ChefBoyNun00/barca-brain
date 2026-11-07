import { T } from "@/i18n/language";
import { CertaintyMeter } from "./CertaintyMeter";
import { ScoopBadge } from "./ScoopBadge";
import { StoryLink } from "./StoryLink";
import { formatStoryAge, headlineOf, meterStepOf, scoopOf, type NewsStory } from "./stories";

/** Every transfer story, firmest first, with how close each deal is. */
export function TransferBoard({ stories, now }: { stories: NewsStory[]; now: Date }) {
  if (stories.length === 0) return null;
  const sorted = [...stories].sort(
    (a, b) => meterStepOf(b) - meterStepOf(a) || b.latestAt.getTime() - a.latestAt.getTime(),
  );
  return (
    <section className="board" aria-labelledby="board-title">
      <div className="board-head">
        <h2 id="board-title" className="board-title">
          <T k="news.board" />
        </h2>
        <p className="board-note">
          <T k="news.boardNote" />
        </p>
      </div>
      <ol className="board-list">
        {sorted.map((story, index) => {
          const scoop = scoopOf(story);
          return (
            <li key={story.id} style={{ "--i": index } as React.CSSProperties}>
              <StoryLink story={story} className="board-card">
                <CertaintyMeter step={meterStepOf(story)} />
                <h3 className="board-card-title">{headlineOf(story)}</h3>
                <p className="board-card-meta">
                  {scoop ? <ScoopBadge by={scoop} /> : story.outlets.slice(0, 2).join(", ")}
                  <span>{formatStoryAge(story.latestAt, now)}</span>
                </p>
              </StoryLink>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
