import { T } from "@/i18n/language";
import { StoryLink } from "./StoryLink";
import type { NewsStory } from "./stories";
import { StoryAge } from "./StoryAge";
import { StoryHeadline } from "./StoryText";

/** What the world is talking about that no Israeli outlet has run yet. */
export function NotInIsrael({ stories, now }: { stories: NewsStory[]; now: Date }) {
  if (stories.length === 0) return null;
  return (
    <section className="gap" aria-labelledby="gap-title">
      <div className="section-head">
        <h2 id="gap-title" className="nw-section-title">
          <T k="gap.title" />
        </h2>
        <p className="section-note">
          <T k="gap.note" />
        </p>
      </div>
      <ul className="gap-list">
        {stories.map((story) => (
          <li key={story.id}>
            <StoryLink story={story} className="gap-item">
              <span className="gap-count">
                <span className="gap-number">{story.outlets.length}</span>
                <T k="gap.outlets" />
              </span>
              <span className="gap-headline" dir="auto">
                <StoryHeadline story={story} />
              </span>
              <span className="gap-age">
                <StoryAge date={story.latestAt} now={now} />
              </span>
            </StoryLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
