import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteNav } from "@/components/SiteNav";
import { ClubNow } from "@/features/club/ClubNow";
import { ClubStory } from "@/features/club/ClubStory";
import "@/features/club/club-story.css";

export const metadata: Metadata = {
  title: "More than a club · Barça Brain",
  description:
    "FC Barcelona's story in seven chapters: a newspaper advert, a language, a farmhouse, an idea and a city that keeps the same clock.",
};

export default function ClubPage() {
  return (
    <>
      <SiteNav />
      <main className="story flex-1" data-surface="dark">
        <ClubStory />
        {/* The last chapter reads live data, so the rest of the story never waits for it. */}
        <Suspense fallback={<div className="tonight-loading" aria-hidden="true" />}>
          <ClubNow />
        </Suspense>
      </main>
    </>
  );
}
