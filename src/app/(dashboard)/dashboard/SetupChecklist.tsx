"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
  ctaLabel: string;
}

interface SetupChecklistProps {
  items: ChecklistItem[];
  variant?: "hero" | "compact";
}

/**
 * Shared by Setup Mode (hero variant, replaces the stat grid entirely) and
 * the persistent footer chip (compact variant, inside a DismissibleCard) —
 * same underlying list, two presentations.
 */
export function SetupChecklist({ items, variant = "hero" }: SetupChecklistProps) {
  if (variant === "compact") {
    const remaining = items.filter((i) => !i.done);
    if (remaining.length === 0) return null;
    const next = remaining[0];
    return (
      <p className="text-[13px]">
        Finish setup ({remaining.length} of {items.length} left):{" "}
        <Link href={next.href} className="font-medium text-[var(--crm-accent)] hover:underline">
          {next.ctaLabel}
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col rounded-[var(--r-lg)] border border-[var(--crm-border)] overflow-hidden bg-[var(--crm-surface-1)]">
      {items.map((item, i) => (
        <div
          key={item.key}
          className={cn(
            "flex items-center gap-3 px-4 h-14",
            i > 0 && "border-t border-[var(--crm-border)]",
            !item.done && "hover:bg-[var(--crm-surface-2)]/60 transition-colors"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
              item.done
                ? "bg-success border-success text-white"
                : "border-[var(--crm-border-hover)] text-transparent"
            )}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span
            className={cn(
              "flex-1 text-[13px]",
              item.done ? "text-[var(--crm-text-tertiary)]" : "text-[var(--crm-text-primary)] font-medium"
            )}
          >
            {item.label}
          </span>
          {!item.done && (
            <Link
              href={item.href}
              className="text-[12px] font-medium text-[var(--crm-accent)] hover:underline shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crm-accent)] rounded-[var(--r-sm)] px-1"
            >
              {item.ctaLabel} →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
