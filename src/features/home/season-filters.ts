import type { SeasonMatch } from "@/domain/home";

export type SeasonFilter = {
  id: string;
  label: string;
  includes: (match: SeasonMatch) => boolean;
};

/** To add a filter, add one line here. The shirt and its record pick it up. */
export const SEASON_FILTERS: SeasonFilter[] = [
  { id: "all", label: "All", includes: () => true },
  { id: "league", label: "League", includes: (match) => match.isLeague },
  { id: "europe", label: "Europe", includes: (match) => !match.isLeague },
  { id: "home", label: "Home", includes: (match) => match.isHome },
  { id: "away", label: "Away", includes: (match) => !match.isHome },
];
