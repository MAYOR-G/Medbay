"use client";

import * as React from "react";

export interface TaglineRevealProps {
  text: string;
  caption?: string;
}

/**
 * Editorial word-by-word scroll reveal statement.
 * Uses rAF-throttled scroll progress to illuminate each word in reading order,
 * falling back immediately to full ink under prefers-reduced-motion.
 */
export function TaglineReveal({ text, caption }: TaglineRevealProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const words = React.useMemo(() => text.trim().split(/\s+/), [text]);
  const [activeCount, setActiveCount] = React.useState(words.length);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let rafId = 0;

    const updateProgress = () => {
      rafId = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;
      const start = viewportHeight * 0.88;
      const end = viewportHeight * 0.34;
      const rawProgress = (start - rect.top) / (start - end);
      const clamped = Math.max(0, Math.min(1, rawProgress));
      const nextCount = Math.max(2, Math.round(clamped * words.length));
      setActiveCount(nextCount);
    };

    const scheduleUpdate = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [words.length]);

  return (
    <section
      aria-label="Clinical Clarity Statement"
      className="bg-[#F5F5F0] py-20 sm:py-28 lg:py-32"
    >
      <div ref={containerRef} className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-4xl space-y-6">
          <p className="font-heading text-3xl leading-[1.18] font-semibold tracking-[-0.025em] text-balance sm:text-4xl lg:text-5xl">
            {words.map((word, idx) => {
              const isLit = idx < activeCount;
              return (
                <React.Fragment key={`${word}-${idx}`}>
                  <span
                    className="inline-block transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      color: "#0F172A",
                      opacity: isLit ? 1 : 0.26,
                    }}
                  >
                    {word}
                  </span>{" "}
                </React.Fragment>
              );
            })}
          </p>
          {caption && (
            <p className="max-w-2xl text-base leading-relaxed text-[#475569] sm:text-lg text-pretty">
              {caption}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
