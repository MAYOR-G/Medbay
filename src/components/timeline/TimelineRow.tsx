import Link from "next/link";
import {
  CalendarCheck,
  Eye,
  FileUp,
  Link2Off,
  Mail,
  Share2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { ProfileBadge, cn } from "@/components/ui";
import type { ActivityEventDto, ActivityEventType, FamilyProfileDto } from "@/types/domain.types";

export interface TimelineRowProps {
  event: ActivityEventDto;
  profile: FamilyProfileDto | undefined;
}

const EVENT_ICON_MAP: Record<ActivityEventType, { icon: typeof FileUp; toneClass: string }> = {
  DOCUMENT_UPLOADED: {
    icon: FileUp,
    toneClass: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
  },
  AI_SUMMARY_GENERATED: {
    icon: Sparkles,
    toneClass: "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
  },
  PROFILE_ASSIGNED: {
    icon: UserCheck,
    toneClass: "bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0]",
  },
  SHARE_LINK_CREATED: {
    icon: Share2,
    toneClass: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  },
  SHARE_LINK_ACCESSED: {
    icon: Eye,
    toneClass: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  },
  SHARE_LINK_REVOKED: {
    icon: Link2Off,
    toneClass: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]",
  },
  CALENDAR_APPOINTMENT_BOOKED: {
    icon: CalendarCheck,
    toneClass: "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
  },
  GMAIL_MEDICAL_DETECTED: {
    icon: Mail,
    toneClass: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  },
};

function resolveDeepLink(event: ActivityEventDto): string | null {
  if (event.documentId) {
    return `/vault/${event.documentId}`;
  }
  if (event.eventType === "CALENDAR_APPOINTMENT_BOOKED") {
    return "/chat";
  }
  if (event.eventType === "GMAIL_MEDICAL_DETECTED") {
    return "/notifications";
  }
  return null;
}

function formatTimeLabel(isoTimestamp: string): string {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function TimelineRow({ event, profile }: TimelineRowProps) {
  const { icon: Icon, toneClass } = EVENT_ICON_MAP[event.eventType];
  const href = resolveDeepLink(event);
  const timeText = formatTimeLabel(event.createdAt);

  const rowContent = (
    <div
      className={cn(
        "flex min-h-[64px] items-center justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)]",
        href && "transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC]",
      )}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            toneClass,
          )}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
        </span>

        <div className="min-w-0 space-y-1">
          <p className="text-[15px] leading-snug font-medium text-[#0F172A]">{event.description}</p>
          {profile && (
            <ProfileBadge
              name={profile.isPrimary ? "Self" : profile.fullName}
              colorIndex={profile.colorIndex}
            />
          )}
        </div>
      </div>

      <span className="shrink-0 font-mono text-xs text-[#64748B] tabular-nums">{timeText}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-2xl focus-visible:outline-none">
        {rowContent}
      </Link>
    );
  }

  return rowContent;
}
