import type { NewsBriefing } from "@/domain/news";
import { formatStoryAge } from "./stories";

type BriefingProps = { briefing: NewsBriefing; now: Date };

/** The whole day's Spanish press in a few English lines. */
export function Briefing({ briefing, now }: BriefingProps) {
  return (
    <section aria-labelledby="briefing-title" className="briefing">
      <p className="briefing-kicker">
        Today in the Spanish press · {briefing.storyCount} stories read ·{" "}
        {formatStoryAge(briefing.createdAt, now)}
      </p>
      <h2 id="briefing-title" className="briefing-title">
        {briefing.headline}
      </h2>
      <ul className="briefing-bullets">
        {briefing.bullets.map((bullet) => (
          <li key={bullet.text}>{bullet.text}</li>
        ))}
      </ul>
      <p className="briefing-note">Written by AI from the headlines below. Check the sources.</p>
    </section>
  );
}
