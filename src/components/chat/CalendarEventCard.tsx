import { CalendarCheck, ExternalLink, MapPin } from "lucide-react";
import type { CalendarEventArtifact } from "@/types/domain.types";

export function CalendarEventCard({ event }: { event: CalendarEventArtifact }) {
  const startFormatted = new Date(event.startIso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const safeLink = event.htmlLink.startsWith("https://") ? event.htmlLink : "#";

  return (
    <div className="rounded-lg border border-status-success-border bg-status-success-bg p-4 text-status-success-text">
      <div className="flex items-center gap-2">
        <CalendarCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
        <h4 className="font-body text-[15px] font-semibold">
          Appointment Added to Google Calendar
        </h4>
      </div>

      <div className="mt-2.5 space-y-1 text-[14px] text-text-primary">
        <p className="font-semibold">{event.title}</p>
        <p className="font-mono text-xs text-text-secondary tabular-nums">
          {startFormatted} ({event.timezone})
        </p>
        {event.location && (
          <p className="flex items-center gap-1.5 text-[13px] text-text-secondary">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
            <span>{event.location}</span>
          </p>
        )}
      </div>

      <div className="mt-3">
        <a
          href={safeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-status-success-border bg-surface px-3 text-[13px] font-semibold text-status-success-text hover:bg-surface-hover"
        >
          <span>Open in Google Calendar</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
