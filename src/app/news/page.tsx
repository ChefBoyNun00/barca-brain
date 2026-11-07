import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteNav } from "@/components/SiteNav";
import { NewsPage } from "@/features/news/NewsPage";

export const metadata: Metadata = {
  title: "The Spanish press, in English · Barça Brain",
  description: "What the Spanish football press is saying about Barça, translated.",
};

export default function News() {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-10 pb-16">
        <p className="kicker">Spanish in, English out</p>
        <h1 className="display-title mt-3">The press</h1>
        <p className="mt-4 max-w-2xl">
          Spanish and Catalan press, translated. Labels show how solid each story is, and every card
          links back to the source.
        </p>
        <Suspense
          fallback={
            <div role="status" aria-label="Loading the press" className="skeleton mt-8 h-96" />
          }
        >
          <NewsPage />
        </Suspense>
      </main>
    </>
  );
}
