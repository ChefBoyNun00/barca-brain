import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteNav } from "@/components/SiteNav";
import { describeMatch } from "@/features/home/season-story";
import { MatchCard } from "@/features/matches/MatchCard";
import { getSeasonData } from "@/features/season/get-season-data";
import { ShareBar } from "@/features/share/ShareBar";

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
  return (
    <>
      <div className="share-match">
        <MatchCard match={match} index={0} showShare={false} />
      </div>
      <p className="section-note">This is the picture people see when you share it.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="share-preview" src={`/card/match/${id}`} alt={describeMatch(match)} />
      <ShareBar
        path={`/matches/${id}`}
        cardPath={`/card/match/${id}`}
        title={describeMatch(match)}
      />
    </>
  );
}

export default function MatchPage({ params }: Props) {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-10 pb-16">
        <p className="kicker">Share a match</p>
        <h1 className="display-title mt-3">The match</h1>
        <Suspense
          fallback={<div role="status" aria-label="Loading" className="skeleton mt-8 h-96" />}
        >
          <Detail params={params} />
        </Suspense>
      </main>
    </>
  );
}
