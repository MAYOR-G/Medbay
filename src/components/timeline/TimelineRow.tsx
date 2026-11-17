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
    toneClass: "bg-accent-primary-tint text-accent-primary border-accent-primary-border",
  },
  AI_SUMMARY_GENERATED: {
    icon: Sparkles,
    toneClass: "bg-status-success-bg text-status-success-text border-status-success-border",
  },
  PROFILE_ASSIGNED: {
    icon: UserCheck,
    toneClass: "bg-surface-subtle text-text-primary border-border-hairline",
  },
  SHARE_LINK_CREATED: {
    icon: Share2,
    toneClass: "bg-status-info-bg text-status-info-text border-status-info-border",
  },
  SHARE_LINK_ACCESSED: {
    icon: Eye,
    toneClass: "bg-status-info-bg text-status-info-text border-status-info-border",
  },
  SHARE_LINK_REVOKED: {
    icon: Link2Off,
    toneClass: "bg-status-danger-bg text-status-danger-text border-status-danger-border",
  },
  CALENDAR_APPOINTMENT_BOOKED: {
    icon: CalendarCheck,
    toneClass: "bg-status-success-bg text-status-success-text border-status-success-border",
  },
  GMAIL_MEDICAL_DETECTED: {
    icon: Mail,
    toneClass: "bg-status-info-bg text-status-info-text border-status-info-border",
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
        "flex min-h-[60px] items-center justify-between gap-3 rounded-md border border-border-hairline bg-surface px-3.5 py-3 shadow-elevation-1",
        href && "transition-colors hover:border-border-strong hover:bg-surface-hover",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
            toneClass,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 space-y-1">
          <p className="text-[15px] leading-[1.4] text-text-primary">{event.description}</p>
          {profile && (
            <ProfileBadge
              name={profile.isPrimary ? "Self" : profile.fullName}
              colorIndex={profile.colorIndex}
            />
          )}
        </div>
      </div>

      <span className="shrink-0 font-mono text-xs text-text-muted tabular-nums">{timeText}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-md focus-visible:outline-none">
        {rowContent}
      </Link>
    );
  }

  return rowContent;
}
