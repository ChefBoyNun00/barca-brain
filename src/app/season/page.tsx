import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { SeasonPage } from "@/features/season/SeasonPage";

export const metadata: Metadata = {
  title: "Weave the ending · Barça Brain",
  description: "Decide the rest of the league season and see where it leads.",
};

export default function SeasonRoute() {
  return (
    <>
      <SiteNav />
      <main className="flex-1 pb-16">
        <Suspense fallback={<PageLoader label="Loading" />}>
          <SeasonPage />
        </Suspense>
      </main>
    </>
  );
}
