"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, FolderLock, MessageSquareText, Plus, Users } from "lucide-react";
import { cn } from "@/components/ui";
import { useVaultStore } from "@/stores/use-vault-store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const setUploadSheetOpen = useVaultStore((state) => state.setUploadSheetOpen);

  const isActive = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed inset-x-0 bottom-0 z-30 grid h-[68px] grid-cols-5 items-center border-t border-border-hairline bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-elevation-2 backdrop-blur-sm md:hidden"
    >
      <Link
        href="/vault"
        className={cn(
          "relative flex min-h-[44px] flex-col items-center justify-center gap-1 text-[12px]",
          isActive("/vault")
            ? "font-semibold text-accent-primary"
            : "font-medium text-text-secondary",
        )}
      >
        {isActive("/vault") && (
          <span className="absolute top-0 h-[3px] w-6 rounded-full bg-accent-primary" />
        )}
        <FolderLock className="h-5 w-5" aria-hidden="true" />
        <span>Vault</span>
      </Link>

      <Link
        href="/chat"
        className={cn(
          "relative flex min-h-[44px] flex-col items-center justify-center gap-1 text-[12px]",
          isActive("/chat")
            ? "font-semibold text-accent-primary"
            : "font-medium text-text-secondary",
        )}
      >
        {isActive("/chat") && (
          <span className="absolute top-0 h-[3px] w-6 rounded-full bg-accent-primary" />
        )}
        <MessageSquareText className="h-5 w-5" aria-hidden="true" />
        <span>AI Chat</span>
      </Link>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setUploadSheetOpen(true)}
          aria-label="Upload Document"
          className="-mt-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent-primary text-text-inverted shadow-elevation-3 transition-transform duration-150 hover:bg-accent-primary-hover active:scale-[0.985]"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <Link
        href="/timeline"
        className={cn(
          "relative flex min-h-[44px] flex-col items-center justify-center gap-1 text-[12px]",
          isActive("/timeline")
            ? "font-semibold text-accent-primary"
            : "font-medium text-text-secondary",
        )}
      >
        {isActive("/timeline") && (
          <span className="absolute top-0 h-[3px] w-6 rounded-full bg-accent-primary" />
        )}
        <Clock className="h-5 w-5" aria-hidden="true" />
        <span>Timeline</span>
      </Link>

      <Link
        href="/profiles"
        className={cn(
          "relative flex min-h-[44px] flex-col items-center justify-center gap-1 text-[12px]",
          isActive("/profiles")
            ? "font-semibold text-accent-primary"
            : "font-medium text-text-secondary",
        )}
      >
        {isActive("/profiles") && (
          <span className="absolute top-0 h-[3px] w-6 rounded-full bg-accent-primary" />
        )}
        <Users className="h-5 w-5" aria-hidden="true" />
        <span>Family</span>
      </Link>
    </nav>
  );
}
