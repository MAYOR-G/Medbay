import Link from "next/link";
import type { ReactNode } from "react";
import { Bell, Clock, FolderLock, MessageSquareText, Plus, ShieldCheck, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/vault", label: "Vault", icon: FolderLock },
  { href: "/chat", label: "AI Chat", icon: MessageSquareText },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/profiles", label: "Family", icon: Users },
] as const;

export default function AppShellLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-canvas text-text-primary">
      {/* Desktop Left Navigation Rail (md+) */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border-hairline bg-surface md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border-hairline px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-primary text-text-inverted">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-heading text-lg font-semibold">MedBay</span>
        </div>

        <div className="p-4">
          <Link
            href="/vault"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-accent-primary px-4 text-[15px] font-semibold text-text-inverted transition-colors hover:bg-accent-primary-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Upload Document</span>
          </Link>
        </div>

        <nav aria-label="Primary Navigation" className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-[44px] items-center gap-3 rounded-md px-3 text-[15px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-border-hairline p-3">
          <Link
            href="/notifications"
            className="flex min-h-[44px] items-center gap-3 rounded-md px-3 text-[15px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span>Notifications</span>
          </Link>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Sticky Top Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border-hairline bg-surface/95 px-4 shadow-elevation-2 md:hidden">
          <Link
            href="/vault"
            className="flex items-center gap-2 font-heading text-lg font-semibold"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent-primary text-text-inverted">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>MedBay</span>
          </Link>
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Link>
        </header>

        <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 py-6 pb-[88px] md:px-6 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid h-[68px] grid-cols-5 items-center border-t border-border-hairline bg-surface/95 px-2 shadow-elevation-2 md:hidden"
      >
        <Link
          href="/vault"
          className="flex min-h-[44px] flex-col items-center justify-center gap-1 text-[12px] font-medium text-text-secondary"
        >
          <FolderLock className="h-5 w-5" aria-hidden="true" />
          <span>Vault</span>
        </Link>
        <Link
          href="/chat"
          className="flex min-h-[44px] flex-col items-center justify-center gap-1 text-[12px] font-medium text-text-secondary"
        >
          <MessageSquareText className="h-5 w-5" aria-hidden="true" />
          <span>AI Chat</span>
        </Link>
        <div className="flex justify-center">
          <Link
            href="/vault"
            aria-label="Upload Document"
            className="-mt-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent-primary text-text-inverted shadow-elevation-3 transition-transform active:scale-[0.985]"
          >
            <Plus className="h-6 w-6" aria-hidden="true" />
          </Link>
        </div>
        <Link
          href="/timeline"
          className="flex min-h-[44px] flex-col items-center justify-center gap-1 text-[12px] font-medium text-text-secondary"
        >
          <Clock className="h-5 w-5" aria-hidden="true" />
          <span>Timeline</span>
        </Link>
        <Link
          href="/profiles"
          className="flex min-h-[44px] flex-col items-center justify-center gap-1 text-[12px] font-medium text-text-secondary"
        >
          <Users className="h-5 w-5" aria-hidden="true" />
          <span>Family</span>
        </Link>
      </nav>
    </div>
  );
}
