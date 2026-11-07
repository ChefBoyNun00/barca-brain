import { T } from "@/i18n/language";
import { ScoopBadge } from "./ScoopBadge";
import { StoryLink } from "./StoryLink";
import { formatStoryAge, headlineOf, scoopOf, standfirstOf, type NewsStory } from "./stories";

/** Stories carrying Fabrizio Romano's or David Ornstein's reporting. */
export function Insiders({ stories, now }: { stories: NewsStory[]; now: Date }) {
  if (stories.length === 0) return null;
  return (
    <section className="insiders" aria-labelledby="insiders-title">
      <div className="section-head">
        <h2 id="insiders-title" className="nw-section-title">
          <T k="news.insiders" />
        </h2>
        <p className="section-note">
          <T k="news.insidersNote" />
        </p>
      </div>
      <div className="insiders-grid">
        {stories.map((story) => {
          const scoop = scoopOf(story);
          const standfirst = standfirstOf(story);
          return (
            <StoryLink key={story.id} story={story} className="insider" >
              {scoop && <ScoopBadge by={scoop} size="large" />}
              <p className="insider-title">{headlineOf(story)}</p>
              {standfirst && <p className="insider-summary">{standfirst}</p>}
              <p className="insider-age">{formatStoryAge(story.latestAt, now)}</p>
            </StoryLink>
          );
        })}
      </div>
    </section>
  );
}
