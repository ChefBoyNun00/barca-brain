import { Suspense } from "react";
import { SiteNav } from "@/components/SiteNav";
import { HomeDashboard } from "@/features/home/HomeDashboard";
import { HomeSkeleton } from "@/features/home/HomeSkeleton";

type HomeProps = { searchParams: Promise<{ match?: string | string[] }> };

/** `?match=12` opens the shirt on that match, which is how the table links back. */
async function HomeWithSelection({ searchParams }: HomeProps) {
  const { match } = await searchParams;
  const parsed = typeof match === "string" && /^\d{1,3}$/.test(match) ? Number(match) : undefined;
  return <HomeDashboard selectedMatch={parsed} />;
}

export default function Home({ searchParams }: HomeProps) {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Suspense fallback={<HomeSkeleton />}>
          <HomeWithSelection searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
