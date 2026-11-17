import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * A year that rolls into place like an old station board, one wheel per digit, when it scrolls
 * into view. Screen readers just hear the number.
 */
export function Odometer({ value }: { value: string }) {
  return (
    <Reveal effect="fade" className="odo" as="p">
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="odo-track" dir="ltr">
        {[...value].map((digit, index) => (
          <span key={index} className="odo-window">
            {/* Invisible copy of the final digit: gives the window that digit's own width. */}
            <span className="odo-size">{digit}</span>
            <span
              className="odo-wheel"
              style={{ "--d": Number(digit), "--i": index } as CSSProperties}
            >
              {DIGITS.map((shown) => (
                <span key={shown}>{shown}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </Reveal>
  );
}
