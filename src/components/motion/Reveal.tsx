"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Which element to render. Defaults to a div. */
  as?: ElementType;
  /** How it arrives: rise from below, rise out of a mask (for big titles), or just fade. */
  effect?: "rise" | "mask" | "fade" | "words";
  /** Seconds to wait, for staggering a group. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
  "aria-hidden"?: boolean;
};

/**
 * Shows its content with a gentle entrance the first time it scrolls into view.
 * The look lives in CSS (.rv in motion.css). This only says "you're on screen now".
 * Without JavaScript, or for visitors who asked for less motion, the content is simply there.
 */
export function Reveal({
  children,
  as: Tag = "div",
  effect = "rise",
  delay = 0,
  className = "",
  style,
  id,
  "aria-hidden": ariaHidden,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.dataset.shown = "";
        observer.disconnect();
      },
      // Fires a little before the element is fully in, so it never arrives late.
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      aria-hidden={ariaHidden}
      className={`rv rv-${effect} ${className}`}
      style={{ ...style, "--rv-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/**
 * Splits a line into words that arrive one after another. Each word keeps its own space, so
 * Hebrew and English both wrap normally. Screen readers get the whole line at once.
 * Each word is its own box, and boxes follow the page's direction, so a Latin line on a Hebrew
 * page would come out backwards: the words box therefore takes its direction from the text.
 */
export function RevealWords({
  text,
  as: Tag = "span",
  className = "",
  step = 0.06,
  delay = 0,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  step?: number;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <Reveal as={Tag} effect="words" className={className} delay={delay}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" dir="auto">
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            <span className="rv-word">
              <span style={{ "--i": index, "--step": `${step}s` } as CSSProperties}>{word}</span>
            </span>
            {index < words.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </span>
    </Reveal>
  );
}
