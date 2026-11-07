import { Suspense } from "react";
import { HomeDashboard } from "@/features/home/HomeDashboard";
import { HomeSkeleton } from "@/features/home/HomeSkeleton";

export default function Home() {
  return (
    <>
      <nav aria-label="Main" className="nav">
        <span className="brand">Barça Brain</span>
      </nav>
      <main className="flex-1">
        <Suspense fallback={<HomeSkeleton />}>
          <HomeDashboard />
        </Suspense>
      </main>
    </>
  );
}
