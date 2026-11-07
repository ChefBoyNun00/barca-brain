import { T } from "@/i18n/language";
import { StoryLink } from "./StoryLink";
import { headlineOf, type NewsStory } from "./stories";

/** The newest headlines, running along the top like a stadium ticker. */
export function BreakingStrip({ stories, live }: { stories: NewsStory[]; live: boolean }) {
  if (stories.length === 0) return null;
  // Drawn twice so the loop has no gap; the copy is hidden from screen readers.
  const items = (copy: boolean) =>
    stories.map((story) => (
      <li key={`${story.id}-${copy}`} aria-hidden={copy || undefined}>
        <StoryLink story={story} className="breaking-item" tabIndex={copy ? -1 : undefined}>
          {headlineOf(story)}
        </StoryLink>
      </li>
    ));
  return (
    <section className="breaking" aria-label="Latest headlines">
      <p className="breaking-label" data-live={live}>
        <span className="breaking-dot" aria-hidden="true" />
        <T k={live ? "news.breaking" : "news.latest"} />
      </p>
      <div className="breaking-window">
        <ul className="breaking-track">
          {items(false)}
          {items(true)}
        </ul>
      </div>
    </section>
  );
}
