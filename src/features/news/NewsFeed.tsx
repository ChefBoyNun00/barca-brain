"use client";

import { useState } from "react";
import { ChoiceChips } from "@/components/ChoiceChips";
import { Segmented } from "@/components/Segmented";
import type { SquadPlayer } from "@/domain/home";
import type { TextKey } from "@/i18n/dictionary";
import { useT } from "@/i18n/language";
import { StoryCard, type CardSize } from "./StoryCard";
import { filterStories, type CategoryFilter, type NewsStory, type SideFilter } from "./stories";

const SIDE_CHOICES: { id: SideFilter; label: TextKey }[] = [
  { id: "all", label: "news.all" },
  { id: "barcelona", label: "news.barcelona" },
  { id: "madrid", label: "news.madrid" },
  { id: "english", label: "news.english" },
  { id: "both", label: "news.both" },
];

const CATEGORY_CHOICES: { id: CategoryFilter; label: TextKey }[] = [
  { id: "all", label: "news.allTopics" },
  { id: "transfers", label: "news.transfers" },
  { id: "match", label: "news.match" },
  { id: "injuries", label: "news.injuries" },
  { id: "club", label: "news.club" },
  { id: "other", label: "news.other" },
];

/** How many stories show before "Show all". */
const FIRST_PAGE = 18;

/** A repeating rhythm of card shapes, so the page reads like a magazine, not a grid of squares. */
const RHYTHM: CardSize[] = ["wide", "tile", "tile", "text", "tile", "tile", "text", "tile"];
const TONES = ["garnet", "blue", "navy"] as const;

type NewsFeedProps = { stories: NewsStory[]; squad: SquadPlayer[]; now: Date };

export function NewsFeed({ stories, squad, now }: NewsFeedProps) {
  const t = useT();
  const [side, setSide] = useState<SideFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [showAll, setShowAll] = useState(false);
  const shown = filterStories(stories, { category, side });
  const visible = showAll ? shown : shown.slice(0, FIRST_PAGE);

  return (
    <section aria-labelledby="everything-title" className="nw-feed">
      <div className="section-head">
        <h2 id="everything-title" className="nw-section-title">
          {t("news.everything")}
        </h2>
      </div>
      <div className="news-bar">
        <ChoiceChips
          label="Filter by topic"
          choices={CATEGORY_CHOICES.map(({ id, label }) => ({ id, label: t(label) }))}
          value={category}
          onChange={setCategory}
        />
        <Segmented
          label="Filter by press"
          choices={SIDE_CHOICES.map(({ id, label }) => ({ id, label: t(label) }))}
          value={side}
          onChange={setSide}
        />
      </div>

      {shown.length === 0 ? (
        <p className="section-note">No stories match that filter right now.</p>
      ) : (
        <>
          <div className="nw-grid">
            {visible.map((story, index) => {
              const size = RHYTHM[index % RHYTHM.length]!;
              return (
                <StoryCard
                  key={story.id}
                  story={story}
                  squad={squad}
                  now={now}
                  size={size}
                  tone={size === "text" ? TONES[index % TONES.length] : undefined}
                />
              );
            })}
          </div>
          {shown.length > FIRST_PAGE && (
            <button
              type="button"
              className="chip chip-action nw-more"
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll ? t("news.showFewer") : t("news.showAll", { count: shown.length })}
            </button>
          )}
        </>
      )}
    </section>
  );
}
