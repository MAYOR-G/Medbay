import { expect, test } from "@playwright/test";

test.describe("MedBay Core Public & Security Smoke Suite", () => {
  test("renders landing page without horizontal overflow and links to login", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /your family's medical records, understood and ready anywhere/i,
      }),
    ).toBeVisible();

    await expect(page.getByText(/not a substitute for professional medical advice/i)).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);

    await page.getByRole("link", { name: /sign in/i }).first().click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: /welcome to medbay|sign in to medbay/i }),
    ).toBeVisible();
  });

  test("renders neutral expired fallback on invalid public share links with zero metadata leak", async ({
    page,
  }) => {
    const response = await page.goto("/share/nonexistent-share-token-00000000");
    expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    expect(response?.headers()["cache-control"]).toContain("no-store");

    await expect(page.getByRole("heading", { name: /link expired or revoked/i })).toBeVisible();
    await expect(page.getByText(/ai summary/i)).toHaveCount(0);
  });

  test("blocks unauthenticated cron trigger and invalid share file stream", async ({ request }) => {
    const shareRes = await request.get("/api/share/bad-token/file");
    expect([400, 410, 500]).toContain(shareRes.status());
    expect(shareRes.headers()["x-robots-tag"]).toBe("noindex, nofollow");

    const cronRes = await request.get("/api/cron/gmail-scan");
    expect([401, 500]).toContain(cronRes.status());
  });
});
