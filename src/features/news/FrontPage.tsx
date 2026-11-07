import type { SquadPlayer } from "@/domain/home";
import { T } from "@/i18n/language";
import { StoryCard } from "./StoryCard";
import { StoryLink } from "./StoryLink";
import { formatStoryAge, headlineOf, type NewsStory } from "./stories";

type FrontPageProps = { lead: NewsStory; top: NewsStory[]; squad: SquadPlayer[]; now: Date };

/** The front page: the story most outlets are running, and the next biggest beside it. */
export function FrontPage({ lead, top, squad, now }: FrontPageProps) {
  return (
    <section className="front" aria-label="Top story">
      <StoryCard story={lead} squad={squad} now={now} size="lead" />
      {top.length > 0 && (
        <aside className="front-side" aria-labelledby="top-stories">
          <h2 id="top-stories" className="front-side-title">
            <T k="news.topStories" />
          </h2>
          <ol className="front-list">
            {top.map((story) => (
              <li key={story.id}>
                <StoryLink story={story} className="front-item">
                  <span className="front-item-title">{headlineOf(story)}</span>
                  <span className="front-item-meta">
                    {story.outlets.length > 1 ? (
                      <T k="news.outlets" vars={{ count: story.outlets.length }} />
                    ) : (
                      story.outlets[0]
                    )}{" "}
                    · {formatStoryAge(story.latestAt, now)}
                  </span>
                </StoryLink>
              </li>
            ))}
          </ol>
        </aside>
      )}
    </section>
  );
}
