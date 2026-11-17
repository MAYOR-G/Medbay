import type { TimelineGroupDto } from "@/server/services";
import type { FamilyProfileDto } from "@/types/domain.types";
import { TimelineRow } from "./TimelineRow";

export interface TimelineGroupProps {
  group: TimelineGroupDto;
  profileMap: Map<string, FamilyProfileDto>;
}

export function TimelineGroup({ group, profileMap }: TimelineGroupProps) {
  return (
    <section className="space-y-2.5">
      <h2 className="sticky top-14 z-10 bg-canvas/95 py-1 font-heading text-sm font-semibold tracking-wide text-text-secondary uppercase backdrop-blur-sm md:top-0">
        {group.label}
      </h2>
      <div className="space-y-2">
        {group.events.map((event) => (
          <TimelineRow
            key={event.id}
            event={event}
            profile={event.profileId ? profileMap.get(event.profileId) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
