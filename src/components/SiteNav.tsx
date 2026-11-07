import Link from "next/link";

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
          Barça Brain
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
