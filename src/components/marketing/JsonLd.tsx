import * as React from "react";

export interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Renders structured JSON-LD metadata safely inside a <script type="application/ld+json"> tag.
 * Escapes `<` to prevent script-tag breakout while keeping JSON-LD 100% valid.
 */
export function JsonLd({ data }: JsonLdProps) {
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
