import Image from "next/image";
import Link from "next/link";
import { BARCA_CREST_URL } from "@/config/display";

const SECTIONS = [
  { href: "/squad", label: "Squad" },
  { href: "/table", label: "Table" },
  { href: "/season", label: "Ending" },
  { href: "/news", label: "News" },
  { href: "/ask", label: "Ask" },
];

export function SiteNav() {
  return (
    <nav aria-label="Main" className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <Image src={BARCA_CREST_URL} alt="" width={28} height={28} unoptimized />
          <span className="brand-name">Barça Brain</span>
        </Link>
        <ul className="nav-links">
          {SECTIONS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
