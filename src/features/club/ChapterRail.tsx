"use client";

import { useEffect, useRef, useState } from "react";

export type RailStop = { id: string; numeral: string; label: string };

/**
 * The chapters down the side of a wide screen, with the one you are reading lit in gold.
 * Each one is a link, so it doubles as a table of contents. It only shows while the story fills
 * the middle of the screen, so it never floats over the footer. On a phone it hides, and a thin
 * progress line across the top (in CSS) does the job instead.
 */
export function ChapterRail({ stops, label }: { stops: readonly RailStop[]; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [inStory, setInStory] = useState(false);

  useEffect(() => {
    const story = ref.current?.closest("main");
    if (!story) return;
    const watched = new Set<string>();

    // A chapter is "current" while it crosses the middle band of the screen.
    const chapters = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    const storyBand = new IntersectionObserver(
      ([entry]) => setInStory(entry?.isIntersecting ?? false),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    storyBand.observe(story);

    // Chapter eight streams in after the rest (it waits for live data), so keep looking for
    // chapters that were not on the page yet.
    const watchNew = () => {
      for (const { id } of stops) {
        const section = watched.has(id) ? null : document.getElementById(id);
        if (!section) continue;
        watched.add(id);
        chapters.observe(section);
      }
      if (watched.size === stops.length) arrivals.disconnect();
    };
    const arrivals = new MutationObserver(watchNew);
    arrivals.observe(story, { childList: true, subtree: true });
    watchNew();

    return () => {
      chapters.disconnect();
      storyBand.disconnect();
      arrivals.disconnect();
    };
  }, [stops]);

  return (
    <nav
      ref={ref}
      aria-label={label}
      className="rail"
      data-visible={(inStory && active !== null) || undefined}
    >
      <ol>
        {stops.map((stop) => (
          <li key={stop.id}>
            <a href={`#${stop.id}`} aria-current={active === stop.id ? "step" : undefined}>
              <span className="rail-numeral">{stop.numeral}</span>
              <span className="rail-label">{stop.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
