"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Bell,
  Clock,
  FolderLock,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Plus,
  Users,
} from "lucide-react";
import { MedBayLogo, cn } from "@/components/ui";
import { signOutAction } from "@/server/actions/account.action";
import { useVaultStore } from "@/stores/use-vault-store";
import type { UserAccountDto } from "@/types/domain.types";

const PRIMARY_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vault", label: "Vault", icon: FolderLock },
  { href: "/chat", label: "AI Chat", icon: MessageSquareText },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/profiles", label: "Family & Settings", icon: Users },
] as const;

export interface DesktopSidebarProps {
  user: UserAccountDto;
  unreadNotificationCount: number;
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MB";
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "MB").toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
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
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-[#E2E8F0] bg-white md:flex">
      {/* Top Header (h-16 px-5) */}
      <div className="flex h-16 shrink-0 items-center border-b border-[#E2E8F0] px-5">
        <Link href="/dashboard" aria-label="MedBay Dashboard">
          <MedBayLogo size="sm" />
        </Link>
      </div>

      {/* Primary CTA (px-4 pt-3 pb-4) */}
      <div className="px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={() => setUploadSheetOpen(true)}
          className="inline-flex h-11 w-full flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#059669] px-4 font-body text-[15px] font-semibold text-white shadow-xs transition-[background-color,transform] duration-150 hover:bg-[#047857] active:bg-[#065F46] active:scale-[0.985]"
        >
          <Plus className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Navigation Links (px-3 space-y-1) */}
      <nav aria-label="Primary Navigation" className="flex-1 space-y-1 overflow-y-auto px-3">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex h-11 flex-row items-center gap-3 whitespace-nowrap rounded-[10px] px-3.5 text-[15px] transition-colors duration-150",
                active
                  ? "bg-[#ECFDF5] font-semibold text-[#065F46]"
                  : "font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]",
              )}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-[#059669]"
                />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-[#059669]" : "text-[#64748B]",
                )}
                strokeWidth={active ? 2 : 1.75}
                aria-hidden="true"
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Utility Footer (p-4 border-t border-[#E2E8F0]) */}
      <div className="space-y-3 border-t border-[#E2E8F0] p-4">
        <Link
          href="/notifications"
          className={cn(
            "relative flex h-11 flex-row items-center justify-between gap-2 whitespace-nowrap rounded-[10px] px-3.5 text-[15px] transition-colors duration-150",
            isActive("/notifications")
              ? "bg-[#ECFDF5] font-semibold text-[#065F46]"
              : "font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]",
          )}
        >
          {isActive("/notifications") && (
            <span
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-[#059669]"
            />
          )}
          <span className="inline-flex flex-row items-center gap-3">
            <Bell
              className={cn(
                "h-[18px] w-[18px] shrink-0",
                isActive("/notifications") ? "text-[#059669]" : "text-[#64748B]",
              )}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span>Notifications</span>
          </span>
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums",
              unreadNotificationCount > 0
                ? "bg-[#059669] text-white"
                : "border border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]",
            )}
          >
            {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
          </span>
        </Link>

        {/* Clean User Avatar Card */}
        <div className="flex items-center justify-between gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] font-heading text-xs font-bold text-[#065F46]">
              {getInitials(user.fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-[#0F172A]">{user.fullName}</p>
              <p className="truncate text-[12px] text-[#64748B]">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            aria-label="Sign out"
            title="Sign out"
            className="inline-flex h-9 w-9 shrink-0 flex-row items-center justify-center rounded-lg text-[#475569] transition-colors duration-150 hover:bg-white hover:text-[#0F172A] disabled:opacity-60"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
