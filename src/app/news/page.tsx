import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { T } from "@/i18n/language";
import { NewsPage } from "@/features/news/NewsPage";

export const metadata: Metadata = {
  title: "Barça news · Barça Brain",
  description:
    "Only the Barça stories that matter, ranked by heat, in two editions: the world's press and Israel's own.",
};

export default function News({ searchParams }: PageProps<"/news">) {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-10 pb-16">
        <p className="kicker">
          <T k="news.kicker" />
        </p>
        <h1 className="display-title mt-3">
          <T k="news.title" />
        </h1>
        <p className="mt-4 max-w-2xl">
          <T k="news.intro" />
        </p>
        <Suspense fallback={<PageLoader label="loading.news" />}>
          <NewsPage searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
