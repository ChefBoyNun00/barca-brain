import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
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
        <Suspense fallback={<PageLoader label="Loading" />}>
          <SquadPage />
        </Suspense>
      </main>
    </>
  );
}
