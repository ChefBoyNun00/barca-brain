"use client";

import type { TextKey } from "@/i18n/dictionary";
import { useLanguage, useT } from "@/i18n/language";
import { formatStoryAge } from "./stories";

type StoryAgeProps = {
  date: Date;
  now: Date;
  /** A sentence to put the age in, such as "Updated {age}". */
  label?: TextKey;
};

/** "3h ago", or "לפני 3 שע׳" in Hebrew. Server-rendered pages use this to write it in either. */
export function StoryAge({ date, now, label }: StoryAgeProps) {
  const t = useT();
  const age = formatStoryAge(date, now, useLanguage());
  return <>{label ? t(label, { age }) : age}</>;
}
