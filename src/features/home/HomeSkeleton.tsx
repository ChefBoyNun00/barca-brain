const PLACEHOLDER_STRIPES = 46;

/** The loading state: the shirt's empty threads, so nothing jumps when data arrives. */
export function HomeSkeleton() {
  return (
    <div role="status" aria-label="Loading Barça's season">
      <div className="page-gutter pt-10 pb-8 sm:pt-16">
        <div className="skeleton h-5 w-56" />
        <div className="skeleton mt-4 h-24 w-3/4" />
      </div>
      <div className="wall">
        {Array.from({ length: PLACEHOLDER_STRIPES }, (_, index) => (
          <div key={index} className="stripe" data-outcome="none" />
        ))}
      </div>
    </div>
  );
}
