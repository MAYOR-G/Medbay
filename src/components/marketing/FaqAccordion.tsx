"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/marketing-content";

export interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const panelId = `faq-panel-${idx}`;
        const buttonId = `faq-trigger-${idx}`;
        return (
          <div
            key={item.question}
            className="rounded-xl bg-[#F2F6F4] transition-colors duration-300"
          >
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-heading text-base font-semibold text-[#0F172A] transition-colors duration-300 hover:text-[#047857] sm:px-6 sm:py-5 sm:text-lg"
              >
                <span className="text-pretty">{item.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-[#047857] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="max-w-[65ch] px-5 pb-5 text-base leading-relaxed text-[#1E293B] sm:px-6 sm:pb-6 text-pretty"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
