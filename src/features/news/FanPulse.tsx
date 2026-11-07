import type { NewsMedia } from "@/domain/news";
import { T } from "@/i18n/language";
import { formatStoryAge } from "./stories";

/** What the fans are talking about. These are conversations, so they open where they happen. */
export function FanPulse({ threads, now }: { threads: NewsMedia[]; now: Date }) {
  if (threads.length === 0) return null;
  return (
    <section className="fans" aria-labelledby="fans-title">
      <div className="section-head">
        <h2 id="fans-title" className="nw-section-title">
          <T k="news.fans" />
        </h2>
        <p className="section-note">
          <T k="news.fansNote" />
        </p>
      </div>
      <ul className="fan-list">
        {threads.map((thread, index) => (
          <li key={thread.id} style={{ "--i": index } as React.CSSProperties}>
            <a href={thread.url} target="_blank" rel="noreferrer" className="fan">
              <span className="fan-title">{thread.title}</span>
              <span className="fan-meta">
                {thread.author ? `u/${thread.author} · ` : ""}
                {formatStoryAge(thread.publishedAt, now)} ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
