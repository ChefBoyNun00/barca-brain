import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteNav } from "@/components/SiteNav";
import { ShareBar } from "@/features/share/ShareBar";
import { getSquadData } from "@/features/squad/get-squad-data";

type Props = { params: Promise<{ id: string }> };

async function findPlayer(id: string) {
  await connection();
  const { squad } = await getSquadData();
  return squad.find((player) => player.id === id) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const player = await findPlayer(id);
  if (!player) return { title: "Player not found · Barça Brain" };
  return { title: `${player.name} · Barça Brain`, openGraph: { images: [`/card/player/${id}`] } };
}

async function Detail({ params }: Props) {
  const { id } = await params;
  const player = await findPlayer(id);
  if (!player) notFound();
  return (
    <>
      <p className="section-note">This is the picture people see when you share this player.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="share-preview" src={`/card/player/${id}`} alt={`${player.name}'s season`} />
      <ShareBar path={`/squad/${id}`} cardPath={`/card/player/${id}`} title={player.name} />
    </>
  );
}

export default function PlayerPage({ params }: Props) {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-10 pb-16">
        <p className="kicker">Share a player</p>
        <h1 className="display-title mt-3">The player</h1>
        <Suspense
          fallback={<div role="status" aria-label="Loading" className="skeleton mt-8 h-96" />}
        >
          <Detail params={params} />
        </Suspense>
      </main>
    </>
  );
}
