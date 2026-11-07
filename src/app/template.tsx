/** Wraps every page so each one eases in when you navigate to it. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
