import type { NewsBriefing } from "@/domain/news";
import { formatStoryAge } from "./stories";

type BriefingProps = { briefing: NewsBriefing; now: Date };

/** How many bullets show before the rest fold away. */
const VISIBLE_BULLETS = 3;

/** The whole day's Spanish press in a few English lines. */
export function Briefing({ briefing, now }: BriefingProps) {
  const first = briefing.bullets.slice(0, VISIBLE_BULLETS);
  const more = briefing.bullets.slice(VISIBLE_BULLETS);
  return (
    <section aria-labelledby="briefing-title" className="briefing">
      <p className="briefing-kicker">
        Today in the Spanish press · {briefing.storyCount} stories read ·{" "}
        {formatStoryAge(briefing.createdAt, now)}
      </p>
      <h2 id="briefing-title" className="briefing-title">
        {briefing.headline}
      </h2>
      <ol className="briefing-bullets">
        {first.map((bullet) => (
          <li key={bullet.text}>{bullet.text}</li>
        ))}
      </ol>
      {more.length > 0 && (
        <details className="briefing-more">
          <summary>{more.length} more</summary>
          <ol start={VISIBLE_BULLETS + 1} className="briefing-bullets">
            {more.map((bullet) => (
              <li key={bullet.text}>{bullet.text}</li>
            ))}
          </ol>
        </details>
      )}
      <p className="briefing-note">Written by AI from the headlines below. Check the sources.</p>
    </section>
  );
}
