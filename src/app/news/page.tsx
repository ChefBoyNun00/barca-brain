import type { Metadata } from "next";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { BACKDROPS } from "@/config/moments";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { T } from "@/i18n/language";
import { NewsPage } from "@/features/news/NewsPage";
import { TodayDate } from "@/features/news/TodayDate";

export const metadata: Metadata = {
  title: "Today at Barça · Barça Brain",
  description:
    "The Barça stories that matter, summarised, in two editions: the world's press and Israel's own.",
};

export default function News({ searchParams }: PageProps<"/news">) {
  return (
    <>
      <SiteNav />
      <PhotoBackdrop moment={BACKDROPS.page.news} tone="page" priority />
      <main className="page-gutter rd-page flex-1 pb-16">
        {/* A newspaper's masthead: the date, the name, one line on what this is. */}
        <header className="rd-masthead">
          <p className="eyebrow">
            {/* Today's date must be worked out per visit, not frozen into the prerendered page. */}
            <Suspense fallback={null}>
              <TodayDate />
            </Suspense>
          </p>
          <h1 className="rd-masthead-title">
            <T k="news.title" />
          </h1>
          <p className="rd-masthead-intro">
            <T k="news.intro" />
          </p>
        </header>
        <Suspense fallback={<PageLoader label="loading.news" />}>
          <NewsPage searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
