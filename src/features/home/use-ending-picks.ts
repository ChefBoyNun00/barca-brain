"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";
import { ENDING_PICKS_STORAGE_KEY } from "@/config/display";
import type { Picks } from "./simulator";

const PicksSchema = z.record(z.string(), z.enum(["W", "D", "L"]));
const NO_PICKS: Picks = {};

const listeners = new Set<() => void>();
let current: Picks = NO_PICKS;
let hasRead = false;

/** Storage can be blocked or hold old data, and the page must work either way. */
function readPicks(): Picks {
  if (hasRead) return current;
  hasRead = true;
  try {
    const saved = localStorage.getItem(ENDING_PICKS_STORAGE_KEY);
    const parsed = PicksSchema.safeParse(saved ? JSON.parse(saved) : null);
    if (parsed.success) current = parsed.data;
  } catch {
    current = NO_PICKS;
  }
  return current;
}

function savePicks(next: Picks) {
  current = next;
  hasRead = true;
  try {
    localStorage.setItem(ENDING_PICKS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Picks still work for this visit, they just won't be remembered.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The viewer's own picks, kept in their browser. They never reach the database. */
export function useEndingPicks(): [Picks, (next: Picks) => void] {
  const picks = useSyncExternalStore(subscribe, readPicks, () => NO_PICKS);
  return [picks, savePicks];
}
