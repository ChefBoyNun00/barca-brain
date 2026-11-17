/**
 * Wraps every page, and is rebuilt on each navigation, so its animations replay every time you
 * change page: a night-blue curtain with the crest's colours lifts away, and the page settles in
 * under it. All CSS (.curtain in premium.css), so it costs nothing to run.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter">
      <div aria-hidden="true" className="curtain">
        <span className="curtain-band" />
      </div>
      {children}
    </div>
  );
}
