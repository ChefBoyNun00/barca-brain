import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import { SiteNav } from "@/components/SiteNav";
import { T } from "@/i18n/language";
import { ShirtMaker } from "@/features/share/ShirtMaker";
import { cleanShirtInput } from "@/features/share/shirt-input";

type Props = { searchParams: Promise<{ name?: string; number?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { name, number } = await searchParams;
  const shirt = cleanShirtInput(name, number);
  const query = `name=${encodeURIComponent(shirt.name)}${shirt.number === null ? "" : `&number=${shirt.number}`}`;
  return {
    title: `${shirt.name}${shirt.number === null ? "" : ` ${shirt.number}`} · My Barça shirt`,
    description: "Put your name on a Barça shirt and share it.",
    openGraph: { images: [`/card/shirt?${query}`] },
  };
}

async function Maker({ searchParams }: Props) {
  const { name, number } = await searchParams;
  const shirt = cleanShirtInput(name, number);
  return <ShirtMaker initialName={shirt.name} initialNumber={shirt.number} />;
}

export default function ShirtPage({ searchParams }: Props) {
  return (
    <>
      <SiteNav />
      <main className="page-gutter flex-1 pt-10 pb-16">
        <p className="kicker">Més que un club</p>
        <h1 className="display-title mt-3">
          <T k="nav.shirt" />
        </h1>
        <p className="mt-4 max-w-2xl">
          <T k="shirt.note" />
        </p>
        <Suspense fallback={<PageLoader />}>
          <Maker searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
