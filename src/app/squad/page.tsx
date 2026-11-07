import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SquadPage } from "@/features/squad/SquadPage";

export const metadata: Metadata = {
  title: "The squad · Barça Brain",
  description: "Every Barça player and their season.",
};

export default function SquadRoute() {
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
          <SquadPage />
        </Suspense>
      </main>
    </>
  );
}
