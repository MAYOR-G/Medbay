"use client";

import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { MedBayLogo } from "@/components/ui";
import { useVaultStore } from "@/stores/use-vault-store";

export interface TopHeaderProps {
  unreadNotificationCount: number;
  activeProfileLabel: string;
}

export function TopHeader({ unreadNotificationCount, activeProfileLabel }: TopHeaderProps) {
  const setUploadSheetOpen = useVaultStore((state) => state.setUploadSheetOpen);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-4 backdrop-blur-md md:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <Link href="/dashboard" className="shrink-0" aria-label="MedBay Dashboard">
          <MedBayLogo size="sm" />
        </Link>
        <span className="truncate rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 font-mono text-xs font-semibold text-[#065F46]">
          {activeProfileLabel}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setUploadSheetOpen(true)}
          aria-label="Upload Document"
          className="inline-flex h-10 flex-row items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] bg-[#059669] px-3 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#047857]"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>Upload</span>
        </button>

        <Link
          href="/notifications"
          aria-label={`Notifications (${unreadNotificationCount} unread)`}
          className="relative inline-flex h-10 w-10 shrink-0 flex-row items-center justify-center rounded-[10px] border border-[#E2E8F0] bg-white text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
        >
          <Bell className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#059669] px-1 font-mono text-[10px] font-bold text-white tabular-nums">
              {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
