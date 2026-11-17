"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Bell,
  Clock,
  FolderLock,
  LogOut,
  MessageSquareText,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button, cn } from "@/components/ui";
import { signOutAction } from "@/server/actions/account.action";
import { useVaultStore } from "@/stores/use-vault-store";
import type { UserAccountDto } from "@/types/domain.types";

const PRIMARY_NAV = [
  { href: "/vault", label: "Vault", icon: FolderLock },
  { href: "/chat", label: "AI Chat", icon: MessageSquareText },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/profiles", label: "Family & Settings", icon: Users },
] as const;

export interface DesktopSidebarProps {
  user: UserAccountDto;
  unreadNotificationCount: number;
}

export function DesktopSidebar({ user, unreadNotificationCount }: DesktopSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const setUploadSheetOpen = useVaultStore((state) => state.setUploadSheetOpen);
  const addToast = useVaultStore((state) => state.addToast);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  function handleSignOut() {
    startTransition(async () => {
      const result = await signOutAction();
      if (result.success) {
        router.push(result.data.redirectTo);
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  return (
    <aside className="hidden w-[72px] shrink-0 flex-col border-r border-border-hairline bg-surface md:flex lg:w-[240px]">
      <div className="flex h-16 items-center justify-center border-b border-border-hairline px-3 lg:justify-start lg:px-5">
        <Link
          href="/vault"
          className="flex items-center gap-2.5 font-heading text-lg font-semibold"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary text-text-inverted">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="hidden lg:inline">MedBay</span>
        </Link>
      </div>

      <div className="p-3 lg:p-4">
        <Button
          variant="primary"
          onClick={() => setUploadSheetOpen(true)}
          aria-label="Upload Document"
          className="w-full px-0 lg:px-4"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden lg:inline">Upload Document</span>
        </Button>
      </div>

      <nav aria-label="Primary Navigation" className="flex-1 space-y-1 px-2 lg:px-3">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "flex min-h-[44px] items-center justify-center gap-3 rounded-md px-2 text-[15px] transition-colors lg:justify-start lg:px-3",
                active
                  ? "bg-accent-primary-tint font-semibold text-accent-primary"
                  : "font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border-hairline p-2 lg:p-3">
        <Link
          href="/notifications"
          title="Notifications"
          className={cn(
            "relative flex min-h-[44px] items-center justify-center gap-3 rounded-md px-2 text-[15px] transition-colors lg:justify-between lg:px-3",
            isActive("/notifications")
              ? "bg-accent-primary-tint font-semibold text-accent-primary"
              : "font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
          )}
        >
          <span className="flex items-center gap-3">
            <Bell className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">Notifications</span>
          </span>
          {unreadNotificationCount > 0 && (
            <span className="rounded-full bg-status-danger-text px-1.5 py-0.5 font-mono text-[11px] font-semibold text-text-inverted tabular-nums">
              {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
            </span>
          )}
        </Link>

        <div className="flex items-center justify-center gap-2 rounded-md px-2 py-2 lg:justify-between lg:px-3">
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-[14px] font-semibold text-text-primary">{user.fullName}</p>
            <p className="truncate text-[12px] text-text-muted">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            aria-label="Sign out"
            title="Sign out"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
