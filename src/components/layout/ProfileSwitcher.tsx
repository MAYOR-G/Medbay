"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/components/ui";
import { useVaultStore } from "@/stores/use-vault-store";
import type { FamilyProfileDto } from "@/types/domain.types";

const ACTIVE_PILL_PALETTE: readonly string[] = [
  "bg-[#1B5E4B] border-[#1B5E4B] text-white",
  "bg-[#3730A3] border-[#3730A3] text-white",
  "bg-[#92400E] border-[#92400E] text-white",
  "bg-[#9D174D] border-[#9D174D] text-white",
  "bg-[#065F46] border-[#065F46] text-white",
  "bg-[#075985] border-[#075985] text-white",
  "bg-[#14211D] border-[#14211D] text-white",
];

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

    if (pathname === "/vault" || pathname === "/timeline") {
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
    <div
      role="tablist"
      aria-label="Filter by family member"
      className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        role="tab"
        aria-selected={currentId === "all"}
        onClick={() => selectProfile("all")}
        className="inline-flex min-h-[44px] shrink-0 items-center"
      >
        <span
          className={cn(
            "inline-flex h-9 items-center rounded-full border px-3 text-[14px] transition-colors duration-150",
            currentId === "all"
              ? "border-accent-primary bg-accent-primary font-semibold text-text-inverted"
              : "border-border-hairline bg-surface font-medium text-text-secondary hover:border-border-strong hover:text-text-primary",
          )}
        >
          All Family
        </span>
      </button>

      {profiles.map((profile) => {
        const isActive = currentId === profile.id;
        const activeClass =
          ACTIVE_PILL_PALETTE[Math.abs(profile.colorIndex) % ACTIVE_PILL_PALETTE.length] ??
          ACTIVE_PILL_PALETTE[0];

        return (
          <button
            key={profile.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => selectProfile(profile.id)}
            className="inline-flex min-h-[44px] shrink-0 items-center"
          >
            <span
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[14px] transition-colors duration-150",
                isActive
                  ? cn(activeClass, "font-semibold")
                  : "border-border-hairline bg-surface font-medium text-text-secondary hover:border-border-strong hover:text-text-primary",
              )}
            >
              <span>{profile.isPrimary ? "Self" : profile.fullName}</span>
              {!profile.isPrimary && (
                <span className={cn("text-xs", isActive ? "text-white/80" : "text-text-muted")}>
                  ({profile.relationship})
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
