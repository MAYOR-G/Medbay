import { describe, expect, it } from "vitest";
import {
  formatTimelineDateHeader,
  groupActivityEventsByDate,
  resolveEventTypesForCategory,
} from "@/server/services/timeline.service";
import type { ActivityEventDto } from "@/types/domain.types";

function makeEvent(id: string, createdAt: string): ActivityEventDto {
  return {
    id,
    userId: "user-1",
    profileId: null,
    documentId: null,
    eventType: "DOCUMENT_UPLOADED",
    description: `Event ${id}`,
    metadata: {},
    createdAt,
  };
}

describe("timeline.service", () => {
  it("groups events by Today, Yesterday, and formatted dates", () => {
    const now = new Date();
    const todayIso = now.toISOString();
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayIso = yesterdayDate.toISOString();
    const olderIso = "2025-03-10T10:00:00.000Z";

    expect(formatTimelineDateHeader(todayIso, now)).toBe("Today");
    expect(formatTimelineDateHeader(yesterdayIso, now)).toBe("Yesterday");
    expect(formatTimelineDateHeader(olderIso, now)).toBe("Mar 10, 2025");

    const groups = groupActivityEventsByDate(
      [makeEvent("1", todayIso), makeEvent("2", yesterdayIso), makeEvent("3", olderIso)],
      now,
    );
    expect(groups).toHaveLength(3);
    expect(groups[0]?.label).toBe("Today");
    expect(groups[1]?.label).toBe("Yesterday");
    expect(groups[2]?.label).toBe("Mar 10, 2025");
  });

  it("maps UI category pills to database activity event types", () => {
    expect(resolveEventTypesForCategory("all")).toBeUndefined();
    expect(resolveEventTypesForCategory("shares")).toEqual([
      "SHARE_LINK_CREATED",
      "SHARE_LINK_ACCESSED",
      "SHARE_LINK_REVOKED",
    ]);
    expect(resolveEventTypesForCategory("appointments")).toEqual(["CALENDAR_APPOINTMENT_BOOKED"]);
  });
});
