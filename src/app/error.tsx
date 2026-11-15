"use client";

import { useEffect } from "react";
import { useT } from "@/i18n/language";

type ErrorPageProps = { error: unknown; retry: () => void };

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  const t = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <section className="card max-w-md text-center">
        <h1 className="text-2xl font-bold text-heading">{t("error.title")}</h1>
        <p className="mt-2 text-secondary">{t("error.note")}</p>
        <button type="button" onClick={() => retry()} className="btn-primary mt-6">
          {t("error.retry")}
        </button>
      </section>
    </main>
  );
}
