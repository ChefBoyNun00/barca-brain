import Link from "next/link";
import type { ReactNode } from "react";
import { hasStoryPage, type Story } from "./stories";

/** Stories with a topic open their own page. The rest are still being read, so go to the source. */
export function StoryLink({
  story,
  className,
  tabIndex,
  children,
}: {
  story: Story;
  className?: string;
  /** -1 for a visual copy, such as the ticker's second loop, so keyboards skip it. */
  tabIndex?: number;
  children: ReactNode;
}) {
  if (hasStoryPage(story)) {
    return (
      <Link
        href={`/news/${encodeURIComponent(story.id)}`}
        className={className}
        tabIndex={tabIndex}
      >
        {children}
      </Link>
    );
  }
  return (
    <a
      href={story.lead.url}
      target="_blank"
      rel="noreferrer"
      className={className}
      tabIndex={tabIndex}
    >
      {children}
    </a>
  );
}
