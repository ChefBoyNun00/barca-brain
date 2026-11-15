"use client";

import type { NewsMedia } from "@/domain/news";
import { useT } from "@/i18n/language";
import { StoryAge } from "./StoryAge";

/** The latest podcast episodes, each playable on the page. Audio only loads when played. */
export function PodcastRow({ episodes, now }: { episodes: NewsMedia[]; now: Date }) {
  const t = useT();
  const playable = episodes.filter((episode) => episode.audioUrl);
  if (playable.length === 0) return null;
  return (
    <section className="podcasts" aria-labelledby="podcasts-title">
      <div className="section-head">
        <h2 id="podcasts-title" className="nw-section-title">
          {t("news.podcasts")}
        </h2>
        <p className="section-note">{t("news.podcastsNote")}</p>
      </div>
      <ul className="podcast-list">
        {playable.map((episode) => (
          <li key={episode.id} className="podcast">
            <p className="podcast-show">{episode.outlet}</p>
            <a className="podcast-title" href={episode.url} target="_blank" rel="noreferrer" dir="auto">
              {episode.title}
            </a>
            <p className="podcast-age">
              <StoryAge date={episode.publishedAt} now={now} />
            </p>
            <audio controls preload="none" src={episode.audioUrl ?? undefined}>
              <a href={episode.audioUrl ?? episode.url}>{t("news.listen")}</a>
            </audio>
          </li>
        ))}
      </ul>
    </section>
  );
}
