import { z } from "zod";
import { NEWS_RELATED_LIMIT, STORY_PAGE_SOURCES_LIMIT } from "@/config/news";
import { getAppDatabase } from "@/server/db/app-database";
import { getStoryPage } from "@/server/db/queries/news";
import { getNewsData } from "./get-news-data";
import { groupStories, topicOf, type NewsStory } from "./stories";

/** Topics are short hyphenated labels. Anything else in the address is not a story. */
const TopicSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/);

export async function getStoryData(rawTopic: string) {
  const topic = TopicSchema.safeParse(decodeURIComponent(rawTopic));
  if (!topic.success) return null;

  const db = getAppDatabase();
  const [{ writeup, articles }, news] = await Promise.all([
    getStoryPage(db, topic.data, STORY_PAGE_SOURCES_LIMIT),
    getNewsData(),
  ]);
  const [grouped] = groupStories(articles);
  if (!grouped) return null;

  const story: NewsStory = { ...grouped, writeup };
  const related = news.stories
    .filter((other) => other.id !== story.id && topicOf(other) === topicOf(story))
    .slice(0, NEWS_RELATED_LIMIT);
  return { now: news.now, story, squad: news.squad, related };
}
