"use client";

import { useEffect } from "react";

type ErrorPageProps = { error: unknown; retry: () => void };

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <section className="card max-w-md text-center">
        <h1 className="text-2xl font-bold text-heading">We couldn&apos;t load Barça&apos;s data</h1>
        <p className="mt-2 text-secondary">Something went wrong on our side. Please try again.</p>
        <button type="button" onClick={() => retry()} className="btn-primary mt-6">
          Try again
        </button>
      </section>
    </main>
  );
}
