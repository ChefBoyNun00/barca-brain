import { Suspense } from "react";
import { SiteNav } from "@/components/SiteNav";
import { HomeDashboard } from "@/features/home/HomeDashboard";
import { HomeSkeleton } from "@/features/home/HomeSkeleton";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Suspense fallback={<HomeSkeleton />}>
          <HomeDashboard />
        </Suspense>
      </main>
    </>
  );
}
