import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";

const COLUMNS = 28;
const ROWS = 12;
/** Each blaugrana stripe of the mosaic is this many seats wide, like the shirt. */
const STRIPE = 4;

/**
 * A stand of seats that fills from the front as it scrolls into view, in the shirt's stripes,
 * then keeps a slow Mexican wave going across it. Purely decorative.
 */
export function FansMosaic() {
  const seats = Array.from({ length: COLUMNS * ROWS }, (_, index) => {
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    return { column, row, garnet: Math.floor(column / STRIPE) % 2 === 1 };
  });
  return (
    <Reveal
      effect="fade"
      className="mosaic"
      style={{ "--cols": COLUMNS } as CSSProperties}
      aria-hidden
    >
      {seats.map(({ column, row, garnet }) => (
        <span
          key={`${column}-${row}`}
          className={garnet ? "seat seat-garnet" : "seat"}
          style={{ "--c": column, "--r": ROWS - row } as CSSProperties}
        />
      ))}
    </Reveal>
  );
}
