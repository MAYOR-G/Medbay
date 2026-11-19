import type { TimelineGroupDto } from "@/server/services";
import type { FamilyProfileDto } from "@/types/domain.types";
import { TimelineRow } from "./TimelineRow";

export interface TimelineGroupProps {
  group: TimelineGroupDto;
  profileMap: Map<string, FamilyProfileDto>;
}

export function TimelineGroup({ group, profileMap }: TimelineGroupProps) {
  return (
    <section className="space-y-3">
      <h2 className="sticky top-16 z-10 bg-white/95 py-1.5 font-heading text-[18px] font-semibold text-[#0F172A] backdrop-blur-sm md:top-0">
        {group.label}
      </h2>
      <div className="space-y-2.5">
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
