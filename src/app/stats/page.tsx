import type { Metadata } from "next";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { BACKDROPS } from "@/config/moments";
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
      <PhotoBackdrop moment={BACKDROPS.page.stats} tone="page" priority />
      <main className="flex-1 pb-16">
        <Suspense fallback={<PageLoader label="loading.numbers" />}>
          <StatsPage />
        </Suspense>
      </main>
    </>
  );
}
