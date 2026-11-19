"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, WifiOff } from "lucide-react";
import { FloatingAiChat } from "@/components/chat";
import { ToastViewport } from "@/components/ui";
import { UploadSheet } from "@/components/vault";
import { useVaultStore } from "@/stores/use-vault-store";
import type { ChatThreadDto, FamilyProfileDto, UserAccountDto } from "@/types/domain.types";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { TopHeader } from "./TopHeader";

export interface AppShellProps {
  user: UserAccountDto;
  profiles: FamilyProfileDto[];
  unreadNotificationCount: number;
  initialThreads?: ChatThreadDto[];
  children: ReactNode;
}

export function AppShell({
  user,
  profiles,
  unreadNotificationCount,
  initialThreads = [],
  children,
}: AppShellProps) {
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
    <div className="flex min-h-screen bg-white text-[#0F172A]">
      <DesktopSidebar user={user} unreadNotificationCount={unreadNotificationCount} />

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <TopHeader
          unreadNotificationCount={unreadNotificationCount}
          activeProfileLabel={activeProfileLabel}
        />

        {isOffline && (
          <div
            role="status"
            className="flex items-center justify-center gap-2 border-b border-[#FDE68A] bg-[#FFFBEB] px-6 py-2.5 text-[13px] font-medium text-[#92400E]"
          >
            <WifiOff className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>
              You&apos;re offline — Viewing cached screens. Uploads and AI chat will resume once
              reconnected.
            </span>
          </div>
        )}

        {!user.googleScopesValid && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 border-b border-[#FDE68A] bg-[#FFFBEB] px-6 py-2.5 text-[13px] text-[#92400E] lg:px-10"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>
                Google Calendar &amp; Gmail sync paused. Reconnect your Google account to resume.
              </span>
            </div>
            <Link
              href="/profiles"
              className="shrink-0 font-semibold text-[#92400E] underline hover:no-underline"
            >
              Reconnect
            </Link>
          </div>
        )}

        {/* Crisp Cool Alabaster Top Scope Bar */}
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-3 lg:px-10">
          <div className="mx-auto max-w-[1320px]">
            <Suspense fallback={<div className="h-9" />}>
              <ProfileSwitcher profiles={profiles} />
            </Suspense>
          </div>
        </div>

        {/* Expanded Main Workspace Container */}
        <main className="mx-auto w-full max-w-[1320px] flex-1 px-6 py-8 pb-[104px] md:pb-12 lg:px-10">
          {children}
        </main>
      </div>

      <MobileBottomNav />
      <UploadSheet profiles={profiles} />
      <FloatingAiChat profiles={profiles} initialThreads={initialThreads} />
      <ToastViewport />
    </div>
  );
}
