import Image from "next/image";
import { BARCA_CREST_URL } from "@/config/display";
import type { SquadPlayer } from "@/domain/home";
import { Jersey } from "../squad/Jersey";
import { getJersey } from "../squad/jersey-data";
import { topicOf, type Story, type StoryTopic } from "./stories";

const TOPIC_ICONS: Record<StoryTopic, string> = {
  transfers: "M7 7h11l-3-3M17 17H6l3 3",
  injuries: "M12 5v14M5 12h14",
  match: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8l3 2-1 4h-4l-1-4z",
  club: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z",
  other: "M4 4h13v16H6a2 2 0 0 1-2-2zM8 8h6M8 12h6",
};

export const TOPIC_LABELS: Record<StoryTopic, string> = {
  transfers: "Transfers",
  injuries: "Injuries",
  match: "Matches",
  club: "Club",
  other: "More news",
};

type StoryArtProps = { story: Story; squad: SquadPlayer[]; size: "hero" | "tile" };

/**
 * The picture for a story. We do not copy outlets' photos, so it is made from what we own:
 * the shirt of the player the story is about, or the crest, over a colour for the topic.
 */
export function StoryArt({ story, squad, size }: StoryArtProps) {
  const topic = topicOf(story);
  const player = story.players.flatMap((name) => squad.find((p) => p.name === name) ?? [])[0];

  return (
    <div className="story-art" data-topic={topic} data-size={size} aria-hidden="true">
      <Image
        className="story-art-crest"
        src={BARCA_CREST_URL}
        alt=""
        width={160}
        height={160}
        unoptimized
      />
      {player ? (
        <span className="story-art-jersey">
          <Jersey jersey={getJersey(player)} keeper={player.position === "GK"} mode="back" />
        </span>
      ) : (
        <svg viewBox="0 0 24 24" className="story-art-icon" focusable="false">
          <path d={TOPIC_ICONS[topic]} />
        </svg>
      )}
      <span className="story-art-badge">{TOPIC_LABELS[topic]}</span>
    </div>
  );
}
