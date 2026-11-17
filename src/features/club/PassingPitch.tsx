"use client";

import { useEffect, useRef, useState } from "react";

/** A 4-3-3 on a 100 × 64 pitch, attacking to the right. */
const PLAYERS = [
  [6, 32], // 0 goalkeeper
  [24, 10], // 1 left back
  [20, 24], // 2 centre back
  [20, 40], // 3 centre back
  [24, 54], // 4 right back
  [40, 32], // 5 holding midfielder
  [52, 20], // 6 midfielder
  [52, 44], // 7 midfielder
  [76, 10], // 8 left wing
  [82, 32], // 9 centre forward
  [76, 54], // 10 right wing
] as const;

/** Who passes to whom, in a loop: short passes, triangles, patience, then back to the start. */
const MOVE = [2, 5, 6, 1, 6, 8, 6, 5, 7, 10, 7, 9, 7, 5, 3, 5];

const PASS_MS = 950;
/** How many recent passes stay drawn, fading, so the triangles show. */
const TRAIL = 5;

const at = (step: number) => PLAYERS[MOVE[step % MOVE.length]!]!;

/**
 * Cruyff's idea, drawn: the ball moves around a 4-3-3 in short passes, leaving fading lines that
 * make triangles. It only plays while on screen, and stays still (showing one move's shape)
 * for visitors who asked for less motion.
 */
export function PassingPitch({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(TRAIL);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      timer = undefined;
      if (entry?.isIntersecting) {
        timer = window.setInterval(() => setStep((current) => current + 1), PASS_MS);
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  const passes = Array.from({ length: TRAIL }, (_, age) => step - age).filter((s) => s > 0);
  const [ballX, ballY] = at(step);

  return (
    <div ref={ref} className="pitch" role="img" aria-label={label} dir="ltr">
      <svg viewBox="0 0 100 64" preserveAspectRatio="xMidYMid meet">
        <g className="pitch-lines">
          <rect x="1" y="1" width="98" height="62" rx="0.5" pathLength={1} />
          <line x1="50" y1="1" x2="50" y2="63" pathLength={1} />
          <circle cx="50" cy="32" r="8" pathLength={1} />
          <rect x="1" y="16" width="14" height="32" pathLength={1} />
          <rect x="85" y="16" width="14" height="32" pathLength={1} />
          <rect x="1" y="25" width="5" height="14" pathLength={1} />
          <rect x="94" y="25" width="5" height="14" pathLength={1} />
        </g>
        <g className="pitch-passes">
          {passes.map((s, age) => {
            const [x1, y1] = at(s - 1);
            const [x2, y2] = at(s);
            return (
              <line
                key={s}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                pathLength={1}
                className="pass"
                style={{ opacity: 1 - age / TRAIL }}
              />
            );
          })}
        </g>
        <g className="pitch-players">
          {PLAYERS.map(([x, y], index) => (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={1.6}
              className={index === MOVE[step % MOVE.length] ? "player player-on" : "player"}
            />
          ))}
        </g>
        <g className="ball" style={{ transform: `translate(${ballX}px, ${ballY}px)` }}>
          <circle r={0.9} />
        </g>
      </svg>
    </div>
  );
}
