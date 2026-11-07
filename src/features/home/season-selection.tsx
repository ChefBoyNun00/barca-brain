"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export const SEASON_SECTION_ID = "season";

type SeasonSelection = {
  selected: number;
  select: (index: number) => void;
  /** Selects a match and brings the shirt into view, from anywhere on the page. */
  showOnShirt: (index: number) => void;
};

const SeasonSelectionContext = createContext<SeasonSelection | null>(null);

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type ProviderProps = { initialIndex: number; children: ReactNode };

/** Holds the chosen match, so other sections can point at the shirt. */
export function SeasonSelectionProvider({ initialIndex, children }: ProviderProps) {
  const [selected, select] = useState(initialIndex);

  const showOnShirt = useCallback((index: number) => {
    select(index);
    document
      .getElementById(SEASON_SECTION_ID)
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  const value = useMemo(() => ({ selected, select, showOnShirt }), [selected, showOnShirt]);

  return (
    <SeasonSelectionContext.Provider value={value}>{children}</SeasonSelectionContext.Provider>
  );
}

export function useSeasonSelection(): SeasonSelection {
  const selection = useContext(SeasonSelectionContext);
  if (!selection) throw new Error("useSeasonSelection needs a SeasonSelectionProvider");
  return selection;
}
