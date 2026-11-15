import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { PlayerShare } from "@/features/squad/PlayerShare";
import { getSquadData } from "@/features/squad/get-squad-data";
import { T } from "@/i18n/language";

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
  return <PlayerShare id={id} name={player.name} />;
}

export default function PlayerPage({ params }: Props) {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-10 pb-16">
        <p className="kicker">
          <T k="share.playerKicker" />
        </p>
        <h1 className="display-title mt-3">
          <T k="share.playerTitle" />
        </h1>
        <Suspense fallback={<PageLoader />}>
          <Detail params={params} />
        </Suspense>
      </main>
    </>
  );
}
