import type { Metadata } from "next";
import { Suspense } from "react";
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
        <Suspense
          fallback={
            <div role="status" aria-label="Loading" className="page-gutter section">
              <div className="skeleton h-96" />
            </div>
          }
        >
          <SeasonPage />
        </Suspense>
      </main>
    </>
  );
}
