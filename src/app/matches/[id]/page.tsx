import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { describeMatch } from "@/features/home/season-story";
import { MatchShare } from "@/features/matches/MatchShare";
import { getSeasonData } from "@/features/season/get-season-data";
import { T } from "@/i18n/language";

type Props = { params: Promise<{ id: string }> };

async function findMatch(id: string) {
  await connection();
  const { matches } = await getSeasonData();
  return matches.find((match) => match.id === id) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const match = await findMatch(id);
  if (!match) return { title: "Match not found · Barça Brain" };
  return {
    title: `${describeMatch(match)} · Barça Brain`,
    openGraph: { images: [`/card/match/${id}`] },
  };
}

async function Detail({ params }: Props) {
  const { id } = await params;
  const match = await findMatch(id);
  if (!match) notFound();
  return <MatchShare match={match} />;
}

export default function MatchPage({ params }: Props) {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-10 pb-16">
        <p className="kicker">
          <T k="share.matchKicker" />
        </p>
        <h1 className="display-title mt-3">
          <T k="share.matchTitle" />
        </h1>
        <Suspense fallback={<PageLoader />}>
          <Detail params={params} />
        </Suspense>
      </main>
    </>
  );
}
