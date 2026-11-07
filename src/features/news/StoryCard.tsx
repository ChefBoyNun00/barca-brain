import type { SquadPlayer } from "@/domain/home";
import type { NewsCertainty } from "@/domain/news";
import { PlayerFace } from "../squad/PlayerFace";
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
  official: "Club",
} as const;

type StoryCardProps = { story: Story; squad: SquadPlayer[]; now: Date };

export function StoryCard({ story, squad, now }: StoryCardProps) {
  const { lead, coverage, outlets } = story;
  const faces = story.players.flatMap((name) => squad.find((p) => p.name === name) ?? []);
  const isTranslated = lead.titleEn !== null;

  return (
    <article className="story">
      <div className="story-tags">
        {lead.certainty && (
          <span className="story-certainty" data-certainty={lead.certainty}>
            {CERTAINTY_LABELS[lead.certainty]}
          </span>
        )}
        {isCoveredByBothCities(story) && <span className="story-both">Both cities</span>}
        <span className="story-age">{formatStoryAge(story.latestAt, now)}</span>
      </div>

      <h3 className="story-title" lang={isTranslated ? "en" : "es"}>
        {lead.titleEn ?? lead.titleOriginal}
      </h3>
      {lead.summaryEn && <p className="story-summary">{lead.summaryEn}</p>}
      {!isTranslated && <p className="story-pending">Still in Spanish: translation pending.</p>}

      {faces.length > 0 && (
        <ul className="story-faces" aria-label="Players in this story">
          {faces.map((player) => (
            <li key={player.id}>
              <PlayerFace player={player} size={32} />
              <span>{player.name}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="story-outlets">
        {outlets.length > 1 ? `${outlets.length} outlets: ` : ""}
        {outlets.slice(0, 4).join(", ")}
        {outlets.length > 4 ? ` and ${outlets.length - 4} more` : ""}
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
    </article>
  );
}
