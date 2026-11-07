import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { getStoryData } from "@/features/news/get-story-data";
import { StoryPage } from "@/features/news/StoryPage";
import { headlineOf, standfirstOf } from "@/features/news/stories";

type Props = { params: Promise<{ topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const data = await getStoryData(topic);
  if (!data) return { title: "Story not found · Barça Brain" };
  return {
    title: `${headlineOf(data.story)} · Barça Brain`,
    description: standfirstOf(data.story) ?? undefined,
  };
}

async function Story({ params }: Props) {
  const { topic } = await params;
  return <StoryPage topic={topic} />;
}

export default function NewsStory({ params }: Props) {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-8 pb-16">
        <Suspense fallback={<PageLoader label="Loading the story" />}>
          <Story params={params} />
        </Suspense>
      </main>
    </>
  );
}
