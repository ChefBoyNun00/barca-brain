import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { PressSide } from "@/config/news";
import type { TextKey } from "@/i18n/dictionary";
import { T } from "@/i18n/language";
import { AskLink } from "../ask/AskLink";
import { CertaintyMeter } from "./CertaintyMeter";
import { getStoryData } from "./get-story-data";
import { ScoopBadge } from "./ScoopBadge";
import { StoryArt } from "./StoryArt";
import { OutletPhoto } from "./OutletPhoto";
import { ReaderItem } from "./Reader";
import {
  headlineOf,
  isCoveredByBothCities,
  meterStepOf,
  photoOf,
  scoopOf,
  standfirstOf,
  topicOf,
} from "./stories";
import { StoryAge } from "./StoryAge";
import { CoverageText, StoryBody, StoryHeadline, StoryKeyFacts, StoryStandfirst } from "./StoryText";

const SIDE_LABELS = {
  barcelona: "press.barcelona",
  madrid: "press.madrid",
  national: "press.national",
  english: "press.english",
  israel: "press.israel",
  official: "press.official",
} as const satisfies Record<PressSide, TextKey>;

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
  const photo = photoOf(story);

  return (
    <article className="sp">
      <Link href="/news" className="sp-back">
        <T k="arrow.back" /> <T k="news.back" />
      </Link>

      <header className="sp-head">
        <div className="sp-tags">
          <span className="sp-topic" data-topic={topicOf(story)}>
            <T k={`news.${topicOf(story)}`} />
          </span>
          {topicOf(story) === "transfers" && <CertaintyMeter step={meterStepOf(story)} />}
          {isCoveredByBothCities(story) && (
            <span className="story-both">
              <T k="news.bothCities" />
            </span>
          )}
        </div>
        <h1 className="sp-title" dir="auto">
          <StoryHeadline story={story} />
        </h1>
        {standfirst && (
          <p className="sp-standfirst" dir="auto">
            <StoryStandfirst story={story} />
          </p>
        )}
        <p className="sp-meta">
          {scoop && <ScoopBadge by={scoop} />}
          <span>
            <T k="news.outlets" vars={{ count: story.outlets.length }} />
          </span>
          <span>
            <StoryAge date={story.latestAt} now={now} label="news.updated" />
          </span>
        </p>
      </header>

      {/* The outlet's photo, credited; our own art when no outlet gave one, or it will not load. */}
      <div className="sp-art">
        {photo ? (
          <OutletPhoto
            src={photo.url}
            priority
            credit={<T k="news.photoBy" vars={{ outlet: photo.outlet }} />}
            fallback={<StoryArt story={story} squad={squad} size="hero" />}
          />
        ) : (
          <StoryArt story={story} squad={squad} size="hero" />
        )}
      </div>

      <div className="sp-layout">
        <div className="sp-main">
          {writeup ? (
            <>
              <StoryBody writeup={writeup} />
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
                    <CoverageText article={article} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="sp-side">
          {writeup && <StoryKeyFacts writeup={writeup} />}

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

          <AskLink
            question="news.askQuery"
            vars={{ headline: headlineOf(story) }}
            className="sp-ask"
          >
            <T k="news.askAbout" /> <T k="arrow.forward" />
          </AskLink>

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
                    <T k={SIDE_LABELS[article.pressSide]} /> · <StoryAge date={article.publishedAt} now={now} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="sp-related" aria-labelledby="sp-related-title">
          <h2 id="sp-related-title" className="eyebrow">
            <T k="news.related" />
          </h2>
          <ol className="rd-list">
            {related.map((other) => (
              <ReaderItem key={other.id} story={other} squad={squad} now={now} />
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
