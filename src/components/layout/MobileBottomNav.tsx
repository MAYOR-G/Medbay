"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  FolderLock,
  LayoutDashboard,
  MessageSquareText,
  Users,
} from "lucide-react";
import { cn } from "@/components/ui";

const MOBILE_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vault", label: "Vault", icon: FolderLock },
  { href: "/chat", label: "AI Chat", icon: MessageSquareText },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/profiles", label: "Family", icon: Users },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const isActive = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed inset-x-0 bottom-0 z-30 grid h-[68px] grid-cols-5 items-center border-t border-[#E2E8F0] bg-white px-2 pb-[env(safe-area-inset-bottom)] shadow-elevation-2 md:hidden"
    >
      {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex min-h-[44px] flex-col items-center justify-center gap-1 text-[12px] transition-colors",
              active ? "font-semibold text-[#059669]" : "font-medium text-[#475569]",
            )}
          >
            {active && (
              <span className="absolute top-0 h-[3px] w-7 rounded-full bg-[#059669]" />
            )}
            <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2 : 1.75} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
