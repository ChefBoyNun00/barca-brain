import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { T } from "@/i18n/language";
import { CertaintyMeter } from "./CertaintyMeter";
import { getStoryData } from "./get-story-data";
import { ScoopBadge } from "./ScoopBadge";
import { StoryArt } from "./StoryArt";
import { StoryCard } from "./StoryCard";
import {
  formatStoryAge,
  headlineOf,
  isCoveredByBothCities,
  meterStepOf,
  scoopOf,
  standfirstOf,
  topicOf,
} from "./stories";

const SIDE_LABELS = {
  barcelona: "Barcelona press",
  madrid: "Madrid press",
  national: "Spanish press",
  english: "English press",
  official: "Club",
} as const;

/** One story, in full. Without a write-up yet, each outlet's own summary stands in. */
export async function StoryPage({ topic }: { topic: string }) {
  await connection();
  const data = await getStoryData(topic);
  if (!data) notFound();
  const { now, story, squad, related } = data;
  const { writeup } = story;
  const scoop = scoopOf(story);
  const standfirst = standfirstOf(story);
  const players = squad.filter((player) => story.players.includes(player.name));

  return (
    <article className="sp">
      <Link href="/news" className="sp-back">
        ← <T k="news.back" />
      </Link>

      <header className="sp-head">
        <div className="sp-tags">
          <span className="sp-topic" data-topic={topicOf(story)}>
            <T k={`news.${topicOf(story)}`} />
          </span>
          {topicOf(story) === "transfers" && <CertaintyMeter step={meterStepOf(story)} />}
          {isCoveredByBothCities(story) && <span className="story-both">Both cities</span>}
        </div>
        <h1 className="sp-title">{headlineOf(story)}</h1>
        {standfirst && <p className="sp-standfirst">{standfirst}</p>}
        <p className="sp-meta">
          {scoop && <ScoopBadge by={scoop} />}
          <span>
            <T k="news.outlets" vars={{ count: story.outlets.length }} />
          </span>
          <span>
            <T k="news.updated" vars={{ age: formatStoryAge(story.latestAt, now) }} />
          </span>
        </p>
      </header>

      <div className="sp-art">
        <StoryArt story={story} squad={squad} size="hero" />
      </div>

      <div className="sp-layout">
        <div className="sp-main">
          {writeup ? (
            <>
              <div className="sp-body">
                {writeup.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {writeup.quotes.map((quote) => (
                <figure key={quote.text} className="sp-quote">
                  <blockquote>“{quote.text}”</blockquote>
                  <figcaption>
                    {quote.speaker} · <cite>{quote.outlet}</cite>
                  </figcaption>
                </figure>
              ))}

              {writeup.whatsNext && (
                <section className="sp-next" aria-labelledby="sp-next-title">
                  <h2 id="sp-next-title">
                    <T k="news.whatsNext" />
                  </h2>
                  <p>{writeup.whatsNext}</p>
                </section>
              )}
              <p className="sp-ai-note">
                <T k="news.aiNote" vars={{ count: writeup.articleCount }} />
              </p>
            </>
          ) : (
            <>
              <p className="sp-writing">
                <T k="news.writing" />
              </p>
              <ul className="sp-coverage">
                {story.coverage.map((article) => (
                  <li key={article.id}>
                    <p className="sp-coverage-outlet">{article.outlet}</p>
                    <p className="sp-coverage-title">{article.titleEn ?? article.titleOriginal}</p>
                    {article.summaryEn && <p>{article.summaryEn}</p>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="sp-side">
          {writeup && writeup.keyFacts.length > 0 && (
            <section className="sp-facts" aria-labelledby="sp-facts-title">
              <h2 id="sp-facts-title">
                <T k="news.keyFacts" />
              </h2>
              <ul>
                {writeup.keyFacts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </section>
          )}

          {players.length > 0 && (
            <ul className="sp-players">
              {players.map((player) => (
                <li key={player.id}>
                  <Link href={`/squad/${player.id}`} className="chip">
                    {player.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href={{ pathname: "/ask", query: { q: `Tell me more about: ${headlineOf(story)}` } }}
            className="sp-ask"
          >
            <T k="news.askAbout" /> →
          </Link>

          <section className="sp-sources" aria-labelledby="sp-sources-title">
            <h2 id="sp-sources-title">
              <T k="news.reportedBy" />
            </h2>
            <ul>
              {story.coverage.map((article) => (
                <li key={article.id}>
                  <a href={article.url} target="_blank" rel="noreferrer">
                    {article.outlet}
                  </a>
                  <span>
                    {SIDE_LABELS[article.pressSide]} · {formatStoryAge(article.publishedAt, now)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="sp-related" aria-labelledby="sp-related-title">
          <h2 id="sp-related-title" className="nw-section-title">
            <T k="news.related" />
          </h2>
          <div className="nw-grid">
            {related.map((other) => (
              <StoryCard key={other.id} story={other} squad={squad} now={now} size="tile" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
