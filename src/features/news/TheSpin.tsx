import { T } from "@/i18n/language";
import { StoryLink } from "./StoryLink";
import type { CityTake, NewsStory } from "./stories";
import { StoryHeadline } from "./StoryText";

type Spin = { story: NewsStory; barcelona: CityTake; madrid: CityTake };

/**
 * One story, two cities. The Barcelona press and the Madrid press often tell the same news
 * very differently, so their headlines sit side by side.
 */
export function TheSpin({ spins }: { spins: Spin[] }) {
  if (spins.length === 0) return null;
  return (
    <section className="spin" aria-labelledby="spin-title">
      <div className="section-head">
        <h2 id="spin-title" className="nw-section-title">
          <T k="spin.title" />
        </h2>
        <p className="section-note">
          <T k="spin.note" />
        </p>
      </div>
      <ul className="spin-list">
        {spins.map(({ story, barcelona, madrid }) => (
          <li key={story.id} className="spin-card">
            <StoryLink story={story} className="spin-story">
              <span dir="auto"><StoryHeadline story={story} /></span>
            </StoryLink>
            <div className="spin-sides">
              <Take side="barcelona" take={barcelona} />
              <span className="spin-vs" aria-hidden="true">
                <T k="spin.vs" />
              </span>
              <Take side="madrid" take={madrid} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Take({ side, take }: { side: "barcelona" | "madrid"; take: CityTake }) {
  return (
    <figure className="spin-take" data-side={side}>
      <figcaption className="spin-city">
        <T k={side === "barcelona" ? "spin.barcelona" : "spin.madrid"} />
        <span className="spin-outlet">{take.outlet}</span>
      </figcaption>
      <blockquote className="spin-headline" lang={take.language} dir="auto">
        {take.headline}
      </blockquote>
    </figure>
  );
}
