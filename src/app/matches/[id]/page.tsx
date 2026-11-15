import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { describeMatch } from "@/features/home/season-story";
import { getMatchRoomData } from "@/features/match-room/get-match-room-data";
import { MatchRoomView } from "@/features/match-room/MatchRoomView";
import { MatchCard } from "@/features/matches/MatchCard";
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
  await connection();
  const data = await getMatchRoomData(id);
  if (!data) notFound();
  return (
    <>
      <div className="share-match">
        <MatchCard match={data.match} index={0} showShare={false} />
      </div>
      <MatchRoomView match={data.match} room={data.room} now={new Date()} />
      <MatchShare match={data.match} />
    </>
  );
}

export default function MatchPage({ params }: Props) {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-10 pb-16">
        <h1 className="display-title">
          <T k="room.kicker" />
        </h1>
        <Suspense fallback={<PageLoader />}>
          <Detail params={params} />
        </Suspense>
      </main>
    </>
  );
}
