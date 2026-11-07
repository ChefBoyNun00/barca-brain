import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { MatchesPage } from "@/features/matches/MatchesPage";

export const metadata: Metadata = {
  title: "Matches · Barça Brain",
  description: "Every Barça result and fixture this season.",
};

export default function MatchesRoute() {
  return (
    <>
      <SiteNav />
      <main className="flex-1 pb-16">
        <Suspense fallback={<PageLoader label="Loading matches" />}>
          <MatchesPage />
        </Suspense>
      </main>
    </>
  );
}
