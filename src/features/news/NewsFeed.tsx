"use client";

import { useState } from "react";
import { ChoiceChips, type Choice } from "@/components/ChoiceChips";
import type { SquadPlayer } from "@/domain/home";
import { filterStories, type CategoryFilter, type SideFilter, type Story } from "./stories";
import { StoryCard } from "./StoryCard";

const CATEGORY_CHOICES: Choice<CategoryFilter>[] = [
  { id: "all", label: "Everything" },
  { id: "transfers", label: "Transfers" },
  { id: "injuries", label: "Injuries" },
  { id: "match", label: "Matches" },
  { id: "club", label: "Club" },
];

const SIDE_CHOICES: Choice<SideFilter>[] = [
  { id: "all", label: "All press" },
  { id: "barcelona", label: "Barcelona press" },
  { id: "madrid", label: "Madrid press" },
  { id: "both", label: "Both cities" },
];

type NewsFeedProps = { stories: Story[]; squad: SquadPlayer[]; now: Date };

export function NewsFeed({ stories, squad, now }: NewsFeedProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [side, setSide] = useState<SideFilter>("all");
  const shown = filterStories(stories, { category, side });

  return (
    <>
      <div className="squad-controls">
        <ChoiceChips
          label="Filter by topic"
          choices={CATEGORY_CHOICES}
          value={category}
          onChange={setCategory}
        />
        <ChoiceChips label="Filter by press" choices={SIDE_CHOICES} value={side} onChange={setSide} />
      </div>
      {shown.length === 0 ? (
        <p className="section-note">No stories match those filters right now.</p>
      ) : (
        <div className="stories">
          {shown.map((story) => (
            <StoryCard key={story.id} story={story} squad={squad} now={now} />
          ))}
        </div>
      )}
    </>
  );
}
