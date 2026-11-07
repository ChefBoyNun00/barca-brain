import type { SquadPlayer } from "@/domain/home";
import type { NewsCertainty } from "@/domain/news";
import { StoryArt } from "./StoryArt";
import { formatStoryAge, isCoveredByBothCities, type Story } from "./stories";

const CERTAINTY_LABELS: Record<NewsCertainty, string> = {
  official: "Official",
  reported: "Reported",
  rumour: "Rumour",
  opinion: "Opinion",
  news: "News",
};

const SIDE_LABELS = {
  barcelona: "Barcelona press",
  madrid: "Madrid press",
  national: "National press",
  english: "English press",
  official: "Club",
} as const;

type StoryCardProps = {
  story: Story;
  squad: SquadPlayer[];
  now: Date;
  variant: "hero" | "tile";
};

/** A story with its picture. The hero is the big one at the top, tiles sit in the rows. */
export function StoryCard({ story, squad, now, variant }: StoryCardProps) {
  const { lead, coverage, outlets } = story;
  const isTranslated = lead.titleEn !== null;
  const Title = variant === "hero" ? "h2" : "h3";

  return (
    <article className="nw-card" data-variant={variant}>
      <StoryArt story={story} squad={squad} size={variant} />
      <div className="nw-card-body">
        <div className="story-tags">
          {lead.certainty && (
            <span className="story-certainty" data-certainty={lead.certainty}>
              {CERTAINTY_LABELS[lead.certainty]}
            </span>
          )}
          {isCoveredByBothCities(story) && <span className="story-both">Both cities</span>}
          <span className="story-age">{formatStoryAge(story.latestAt, now)}</span>
        </div>

        <Title className="nw-title" lang={isTranslated ? "en" : "es"}>
          {lead.titleEn ?? lead.titleOriginal}
        </Title>
        {lead.summaryEn && <p className="nw-summary">{lead.summaryEn}</p>}
        {!isTranslated && <p className="story-pending">Still in Spanish: translation pending.</p>}

        <p className="story-outlets">
          {outlets.length > 1 ? `${outlets.length} outlets: ` : ""}
          {outlets.slice(0, 3).join(", ")}
          {outlets.length > 3 ? ` +${outlets.length - 3}` : ""}
          {outlets.length === 1 && ` · ${SIDE_LABELS[lead.pressSide]}`}
        </p>

        <details className="story-sources">
          <summary>{isTranslated ? "Original Spanish and sources" : "Sources"}</summary>
          <ul>
            {coverage.map((article) => (
              <li key={article.id}>
                <a href={article.url} target="_blank" rel="noreferrer">
                  <span lang="es">{article.titleOriginal}</span>
                </a>
                <span className="story-source-outlet">
                  {article.outlet} · {SIDE_LABELS[article.pressSide]}
                </span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </article>
  );
}
