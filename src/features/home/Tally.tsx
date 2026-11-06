type TallyProps = {
  count: number;
  /** The longest row, so every row shares one scale. */
  max: number;
  muted?: boolean;
};

/** One stripe per unit. Decorative: the number is always written beside it. */
export function Tally({ count, max, muted = false }: TallyProps) {
  return (
    <div
      aria-hidden="true"
      className="tally"
      data-muted={muted}
      style={{ gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: count }, (_, index) => (
        <span key={index} style={{ "--i": index } as React.CSSProperties} />
      ))}
    </div>
  );
}
