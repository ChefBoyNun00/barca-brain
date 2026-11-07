import { SCOOP_JOURNALISTS, type ScoopJournalist } from "@/config/news";

const INITIALS: Record<ScoopJournalist, string> = { romano: "FR", ornstein: "DO" };

/** Marks a story that carries a named journalist's reporting. */
export function ScoopBadge({ by, size = "small" }: { by: ScoopJournalist; size?: "small" | "large" }) {
  const name = SCOOP_JOURNALISTS.find((journalist) => journalist.id === by)?.name ?? by;
  return (
    <span className="scoop" data-by={by} data-size={size}>
      <span className="scoop-avatar" aria-hidden="true">
        {INITIALS[by]}
      </span>
      <span className="scoop-name">{name}</span>
    </span>
  );
}
