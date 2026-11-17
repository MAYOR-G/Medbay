import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { logEvent } from "@/lib/logger";

const SRC_ROOT = path.resolve(import.meta.dirname, "../../src");

function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(full));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

describe("MedBay Security & Architectural Boundary Audit", () => {
  it("redacts PHI and token fields in structured logger", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    logEvent("info", {
      service: "audit-test",
      event: "redaction_check",
      userId: "user-123",
      meta: {
        extractedText: "Patient Jane Doe Hemoglobin A1c 9.2%",
        overview: "Sensitive medical summary",
        patientName: "Jane Doe",
        refreshToken: "secret-oauth-token",
        mimeType: "application/pdf",
      },
    });

    expect(infoSpy).toHaveBeenCalledOnce();
    const loggedJson = infoSpy.mock.calls[0]?.[0] as string;
    expect(loggedJson).not.toContain("Hemoglobin");
    expect(loggedJson).not.toContain("Sensitive medical summary");
    expect(loggedJson).not.toContain("Jane Doe");
    expect(loggedJson).not.toContain("secret-oauth-token");
    expect(loggedJson).toContain("[REDACTED]");
    expect(loggedJson).toContain("application/pdf");

    infoSpy.mockRestore();
  });

  it("forbids service_role admin client imports inside (app)/, components/, and actions/", () => {
    const restrictedDirs = [
      path.join(SRC_ROOT, "app/(app)"),
      path.join(SRC_ROOT, "components"),
      path.join(SRC_ROOT, "server/actions"),
    ];

    for (const dir of restrictedDirs) {
      for (const file of collectTsFiles(dir)) {
        const content = fs.readFileSync(file, "utf8");
        expect(content).not.toContain("lib/supabase/admin");
        expect(content).not.toContain("createSupabaseAdminClient");
      }
    }
  });

  it("forbids direct supabase.from() or .rpc() calls outside repositories and storage adapter", () => {
    const repoDir = path.join(SRC_ROOT, "server/repositories");
    const storageAdapterPath = path.join(SRC_ROOT, "server/integrations/storage.adapter.ts");
    for (const file of collectTsFiles(SRC_ROOT)) {
      if (file.startsWith(repoDir) || file === storageAdapterPath) continue;
      const content = fs.readFileSync(file, "utf8");
      expect(content).not.toMatch(/\.from\(["'`]/);
      expect(content).not.toMatch(/\.rpc\(["'`]/);
    }
  });
});
