"use client";

import * as React from "react";
import { cn } from "@/components/ui/cn";

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

export function ScrollReveal({ children, className, delayMs = 0 }: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible={visible ? "true" : "false"}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={cn("medbay-reveal", className)}
    >
      {children}
    </div>
  );
}
