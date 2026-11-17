import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { LinkExpiredError } from "@/lib/errors";
import * as repositories from "@/server/repositories";
import {
  buildShareUrl,
  calculateShareExpiration,
  resolvePublicShareDocument,
} from "@/server/services/share.service";
import type { Database } from "@/types/database.types";

const dummyClient = {} as SupabaseClient<Database>;

describe("share.service", () => {
  it("computes exact expiration timestamps for 24h, 7d, and 30d presets", () => {
    const base = new Date("2026-11-17T12:00:00.000Z");

    expect(calculateShareExpiration("24h", base).toISOString()).toBe("2026-11-18T12:00:00.000Z");
    expect(calculateShareExpiration("7d", base).toISOString()).toBe("2026-11-24T12:00:00.000Z");
    expect(calculateShareExpiration("30d", base).toISOString()).toBe("2026-12-17T12:00:00.000Z");
  });

  it("constructs canonical share URLs without double slashes", () => {
    expect(buildShareUrl("https://medbay.app/", "abc123")).toBe("https://medbay.app/share/abc123");
  });

  it("throws 410 LinkExpiredError when resolve_active_share_link returns null", async () => {
    vi.spyOn(repositories, "resolveActiveShareLink").mockResolvedValueOnce(null);

    await expect(
      resolvePublicShareDocument(dummyClient, "expired-token-123456789012"),
    ).rejects.toBeInstanceOf(LinkExpiredError);
  });
});
