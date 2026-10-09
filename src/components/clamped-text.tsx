"use client";

import { useState } from "react";
import { cn } from "cn";
import { CaretDown, CaretUp } from "@phosphor-icons/react/ssr";

const CLAMP: Record<number, string> = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
};

/**
 * Renders long-form text (task notes / roadmap item descriptions) inline so it
 * is readable without opening the edit dialog. Short text shows plainly; longer
 * text is clamped with a "Show more / Show less" toggle. Newlines are preserved.
 */
export function ClampedText({
  text,
  lines = 3,
  className,
}: {
  text: string;
  lines?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 160 || text.split("\n").length > lines;

  if (!isLong) {
    return (
      <p className={cn("text-sm leading-relaxed whitespace-pre-line text-muted-foreground", className)}>
        {text}
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p
        className={cn(
          "text-sm leading-relaxed whitespace-pre-line text-muted-foreground",
          !expanded && CLAMP[lines],
        )}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline"
        aria-expanded={expanded}
      >
        {expanded ? (
          <CaretUp size={12} strokeWidth={2} aria-hidden="true" />
        ) : (
          <CaretDown size={12} strokeWidth={2} aria-hidden="true" />
        )}
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
