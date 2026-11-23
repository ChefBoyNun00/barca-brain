import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { T } from "@/i18n/language";
import { CreditsList } from "@/features/credits/CreditsList";

export const metadata: Metadata = {
  title: "Credits · Barça Brain",
  description: "Where Barça Brain's photos and data come from.",
};

export default function CreditsPage() {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-10 pb-16">
        <h1 className="section-title">
          <T k="credits.title" />
        </h1>
        <p className="mt-4 max-w-2xl">
          <T k="credits.disclaimer" />
        </p>
        <h2 className="credits-heading">
          <T k="credits.data" />
        </h2>
        <p className="max-w-2xl">
          <T k="credits.dataBefore" />{" "}
          <a href="https://www.football-data.org" target="_blank" rel="noreferrer">
            football-data.org
          </a>
          <T k="credits.dataAfter" />
        </p>
        <h2 className="credits-heading">
          <T k="credits.news" />
        </h2>
        <p className="max-w-2xl">
          <T k="credits.newsNote" />
        </p>
        <h2 className="credits-heading">
          <T k="credits.privacy" />
        </h2>
        <p className="max-w-2xl">
          <T k="credits.privacyNote" />
        </p>
        <h2 className="credits-heading">
          <T k="credits.photos" />
        </h2>
        <p className="max-w-2xl">
          <T k="credits.photosNote" />
        </p>
        <Suspense fallback={<PageLoader label="loading.credits" />}>
          <CreditsList />
        </Suspense>
      </main>
    </>
  );
}
