import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { T } from "@/i18n/language";

/** The 404: the linesman's flag is up. */
export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="lost flex-1">
        <div className="lost-card">
          <p className="lost-kicker">
            <T k="lost.kicker" />
          </p>
          <h1 className="lost-title">
            <T k="lost.title" />
          </h1>
          <svg viewBox="0 0 320 90" className="lost-line" aria-hidden="true" focusable="false">
            <line x1="200" y1="0" x2="200" y2="90" strokeDasharray="6 6" />
            <circle cx="170" cy="45" r="11" className="lost-defender" />
            <circle cx="240" cy="45" r="11" className="lost-attacker" />
            <path d="M60 80V12" />
            <path d="M60 12h46l-12 13 12 13H60z" className="lost-flag" />
          </svg>
          <p className="lost-note">
            <T k="lost.note" />
          </p>
          <div className="lost-actions">
            <Link href="/" className="btn-primary">
              <T k="lost.home" />
            </Link>
            <Link href="/matches" className="chip chip-action">
              <T k="lost.matches" />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
