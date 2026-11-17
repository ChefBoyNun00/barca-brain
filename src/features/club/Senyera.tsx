import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";

/** The Senyera, Catalonia's flag: four red stripes on gold, drawn in one after another. */
export function Senyera() {
  return (
    <Reveal effect="fade" className="senyera" aria-hidden>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
        <span
          key={index}
          className={index % 2 === 0 ? "senyera-gold" : "senyera-red"}
          style={{ "--i": index } as CSSProperties}
        />
      ))}
    </Reveal>
  );
}
