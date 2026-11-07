import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { StatsPage } from "@/features/stats/StatsPage";

export const metadata: Metadata = {
  title: "Season in numbers · Barça Brain",
  description: "Barça's season worked out from the results: records, runs, top scorers.",
};

export default function StatsRoute() {
  return (
    <>
      <SiteNav />
      <main className="flex-1 pb-16">
        <Suspense fallback={<PageLoader label="Loading the numbers" />}>
          <StatsPage />
        </Suspense>
      </main>
    </>
  );
}
