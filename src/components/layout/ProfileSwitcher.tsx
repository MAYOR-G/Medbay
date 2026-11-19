"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { cn } from "@/components/ui";
import { useVaultStore } from "@/stores/use-vault-store";
import type { FamilyProfileDto } from "@/types/domain.types";

export interface ProfileSwitcherProps {
  profiles: FamilyProfileDto[];
}

export function ProfileSwitcher({ profiles }: ProfileSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeProfileId = useVaultStore((state) => state.activeProfileId);
  const setActiveProfileId = useVaultStore((state) => state.setActiveProfileId);

  const urlProfileId = searchParams.get("profileId");
  const currentId = urlProfileId ?? activeProfileId;

  function selectProfile(profileId: string) {
    setActiveProfileId(profileId);

    if (pathname === "/dashboard" || pathname === "/vault" || pathname === "/timeline") {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (profileId === "all") {
        nextParams.delete("profileId");
      } else {
        nextParams.set("profileId", profileId);
      }
      nextParams.delete("page");
      const queryString = nextParams.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        role="tablist"
        aria-label="Filter by family member"
        className="flex items-center gap-2 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <span className="mr-1 hidden items-center gap-1.5 text-xs font-semibold tracking-wide text-[#64748B] uppercase sm:inline-flex">
          <Users className="h-3.5 w-3.5 shrink-0 text-[#059669]" aria-hidden="true" />
          <span>Patient Scope:</span>
        </span>

        <button
          type="button"
          role="tab"
          aria-selected={currentId === "all"}
          onClick={() => selectProfile("all")}
          className={cn(
            "inline-flex h-9 shrink-0 flex-row items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-[14px] transition-colors duration-150",
            currentId === "all"
              ? "border-[#A7F3D0] bg-[#ECFDF5] font-semibold text-[#065F46] shadow-2xs"
              : "border-[#E2E8F0] bg-white font-medium text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]",
          )}
        >
          {currentId === "all" && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#059669]" aria-hidden="true" />
          )}
          <span>All Family</span>
        </button>

        {profiles.map((profile) => {
          const isActive = currentId === profile.id;

          return (
            <button
              key={profile.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectProfile(profile.id)}
              className={cn(
                "inline-flex h-9 shrink-0 flex-row items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[14px] transition-colors duration-150",
                isActive
                  ? "border-[#A7F3D0] bg-[#ECFDF5] font-semibold text-[#065F46] shadow-2xs"
                  : "border-[#E2E8F0] bg-white font-medium text-[#475569] hover:border-[#CBD5E1] hover:text-[#0F172A]",
              )}
            >
              {isActive && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#059669]" aria-hidden="true" />
              )}
              <span>{profile.isPrimary ? "Self" : profile.fullName}</span>
              {!profile.isPrimary && (
                <span
                  className={cn(
                    "text-xs",
                    isActive ? "font-medium text-[#065F46]/80" : "text-[#64748B]",
                  )}
                >
                  ({profile.relationship})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
