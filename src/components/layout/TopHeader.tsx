"use client";

import Link from "next/link";
import { Bell, ShieldCheck } from "lucide-react";

export interface TopHeaderProps {
  unreadNotificationCount: number;
  activeProfileLabel: string;
}

export function TopHeader({ unreadNotificationCount, activeProfileLabel }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border-hairline bg-surface/95 px-4 shadow-elevation-2 backdrop-blur-sm md:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <Link
          href="/vault"
          className="flex shrink-0 items-center gap-2 font-heading text-lg font-semibold"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent-primary text-text-inverted">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>MedBay</span>
        </Link>
        <span className="truncate rounded-full border border-accent-primary-border bg-accent-primary-tint px-2.5 py-0.5 font-mono text-xs font-medium text-accent-primary">
          {activeProfileLabel}
        </span>
      </div>

      <Link
        href="/notifications"
        aria-label={`Notifications (${unreadNotificationCount} unread)`}
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadNotificationCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-status-danger-text px-1 font-mono text-[10px] font-semibold text-text-inverted tabular-nums">
            {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
          </span>
        )}
      </Link>
    </header>
  );
}
