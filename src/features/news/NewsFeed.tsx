"use client";

import { useState } from "react";
import { Segmented } from "@/components/Segmented";
import type { Choice } from "@/components/ChoiceChips";
import type { SquadPlayer } from "@/domain/home";
import { TOPIC_LABELS } from "./StoryArt";
import { StoryCard } from "./StoryCard";
import {
  filterStories,
  pickHero,
  topicOf,
  type SideFilter,
  type Story,
  type StoryTopic,
} from "./stories";

const SIDE_CHOICES: Choice<SideFilter>[] = [
  { id: "all", label: "All press" },
  { id: "barcelona", label: "Barcelona" },
  { id: "madrid", label: "Madrid" },
  { id: "both", label: "Both" },
];

const TOPIC_ORDER: StoryTopic[] = ["transfers", "match", "injuries", "club", "other"];

/** A row shows this many tiles before "Show all", so no topic can swamp the page. */
const ROW_LIMIT = 8;

type NewsFeedProps = { stories: Story[]; squad: SquadPlayer[]; now: Date };

export function NewsFeed({ stories, squad, now }: NewsFeedProps) {
  const [side, setSide] = useState<SideFilter>("all");
  const [open, setOpen] = useState<ReadonlySet<StoryTopic>>(new Set());
  const shown = filterStories(stories, { category: "all", side });
  const hero = pickHero(shown);
  const rest = shown.filter((story) => story !== hero);
  const rows = TOPIC_ORDER.map((topic) => ({
    topic,
    stories: rest.filter((story) => topicOf(story) === topic),
  })).filter((row) => row.stories.length > 0);

  const toggle = (topic: StoryTopic) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });

  return (
    <>
      <div className="news-bar">
        <Segmented label="Filter by press" choices={SIDE_CHOICES} value={side} onChange={setSide} />
        {rows.length > 1 && (
          <nav aria-label="Jump to a topic" className="news-jump">
            {rows.map(({ topic, stories: rowStories }) => (
              <a key={topic} href={`#topic-${topic}`} className="chip">
                {TOPIC_LABELS[topic]} · {rowStories.length}
              </a>
            ))}
          </nav>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="section-note">No stories match that filter right now.</p>
      ) : (
        <>
          {hero && <StoryCard story={hero} squad={squad} now={now} variant="hero" />}
          {rows.map(({ topic, stories: rowStories }) => {
            const isOpen = open.has(topic);
            const visible = isOpen ? rowStories : rowStories.slice(0, ROW_LIMIT);
            return (
              <section
                key={topic}
                id={`topic-${topic}`}
                aria-labelledby={`row-${topic}`}
                className="nw-row-wrap"
              >
                <div className="section-head">
                  <h2 id={`row-${topic}`} className="nw-row-title" data-topic={topic}>
                    {TOPIC_LABELS[topic]}
                  </h2>
                  {rowStories.length > ROW_LIMIT && (
                    <button
                      type="button"
                      className="chip chip-action"
                      onClick={() => toggle(topic)}
                    >
                      {isOpen ? "Show fewer" : `Show all ${rowStories.length}`}
                    </button>
                  )}
                </div>
                <div className="nw-row" data-open={isOpen}>
                  {visible.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      squad={squad}
                      now={now}
                      variant="tile"
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </>
  );
}
