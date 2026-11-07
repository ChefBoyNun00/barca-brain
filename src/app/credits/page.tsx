import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteNav } from "@/components/SiteNav";
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
        <h1 className="section-title">Credits</h1>
        <p className="mt-4 max-w-2xl">
          Barça Brain is an unofficial fan project. It is not affiliated with, or endorsed by, FC
          Barcelona, La Liga or UEFA. Club names and crests belong to their owners.
        </p>
        <h2 className="credits-heading">Data</h2>
        <p className="max-w-2xl">
          Fixtures, tables, squads and scorers come from{" "}
          <a href="https://www.football-data.org" target="_blank" rel="noreferrer">
            football-data.org
          </a>
          , which also supplies the crests.
        </p>
        <h2 className="credits-heading">News</h2>
        <p className="max-w-2xl">
          Headlines and short snippets come from the public feeds of Mundo Deportivo, Diario AS, El
          País, El Mundo and Google News. Translations and labels are written by AI and can be
          wrong. Every story links to the outlet that published it.
        </p>
        <h2 className="credits-heading">Player photos</h2>
        <p className="max-w-2xl">
          Photos come from Wikimedia Commons under free licences, and are cropped to fit. Each link
          opens the original with its full licence.
        </p>
        <Suspense fallback={<div role="status" aria-label="Loading credits" className="skeleton mt-6 h-40" />}>
          <CreditsList />
        </Suspense>
      </main>
    </>
  );
}
