"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, WifiOff } from "lucide-react";
import { ToastViewport } from "@/components/ui";
import { UploadSheet } from "@/components/vault";
import { useVaultStore } from "@/stores/use-vault-store";
import type { FamilyProfileDto, UserAccountDto } from "@/types/domain.types";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { TopHeader } from "./TopHeader";

export interface AppShellProps {
  user: UserAccountDto;
  profiles: FamilyProfileDto[];
  unreadNotificationCount: number;
  children: ReactNode;
}

export function AppShell({ user, profiles, unreadNotificationCount, children }: AppShellProps) {
  const [isOffline, setIsOffline] = useState(false);
  const activeProfileId = useVaultStore((state) => state.activeProfileId);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const activeProfileLabel = activeProfile
    ? activeProfile.isPrimary
      ? "Self"
      : activeProfile.fullName
    : "All Family";

  return (
    <div className="flex min-h-screen bg-canvas text-text-primary">
      <DesktopSidebar user={user} unreadNotificationCount={unreadNotificationCount} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          unreadNotificationCount={unreadNotificationCount}
          activeProfileLabel={activeProfileLabel}
        />

        {isOffline && (
          <div
            role="status"
            className="flex items-center justify-center gap-2 border-b border-status-warning-border bg-status-warning-bg px-4 py-2 text-[13px] font-medium text-status-warning-text"
          >
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              You&apos;re offline — Viewing cached screens. Uploads and AI chat will resume once
              reconnected.
            </span>
          </div>
        )}

        {!user.googleScopesValid && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 border-b border-status-warning-border bg-status-warning-bg px-4 py-2 text-[13px] text-status-warning-text"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Google Calendar &amp; Gmail sync paused. Reconnect your Google account to resume.
              </span>
            </div>
            <Link href="/profiles" className="shrink-0 font-semibold underline hover:no-underline">
              Reconnect
            </Link>
          </div>
        )}

        <div className="border-b border-border-hairline bg-canvas/95 px-4 pt-2 pb-1 md:px-6">
          <div className="mx-auto max-w-[1040px]">
            <Suspense fallback={<div className="h-11" />}>
              <ProfileSwitcher profiles={profiles} />
            </Suspense>
          </div>
        </div>

        <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 py-6 pb-[88px] md:px-6 md:pb-8">
          {children}
        </main>
      </div>

      <MobileBottomNav />
      <UploadSheet profiles={profiles} />
      <ToastViewport />
    </div>
  );
}
