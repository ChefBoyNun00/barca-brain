import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { T } from "@/i18n/language";
import { NewsPage } from "@/features/news/NewsPage";

export const metadata: Metadata = {
  title: "Barça news · Barça Brain",
  description:
    "Every Barça story from the Spanish and English press, Fabrizio Romano and David Ornstein, the club and the fans, written up in full.",
};

export default function News() {
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
          The Spanish and English press, the transfer insiders, the club and the fans, in one place.
          Every story is written up in full, with how solid it is and who reported it.
        </p>
        <Suspense fallback={<PageLoader label="Loading the news" />}>
          <NewsPage />
        </Suspense>
      </main>
    </>
  );
}
