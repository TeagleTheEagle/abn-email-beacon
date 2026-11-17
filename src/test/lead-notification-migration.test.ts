import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve("drizzle/migrations/0004_lead_notification_delivery.sql"),
  "utf8",
);
const journal = readFileSync(resolve("drizzle/migrations/meta/_journal.json"), "utf8");

describe("lead notification migration registration", () => {
  it("is additive and registered through the Drizzle journal", () => {
    expect(journal).toContain('"tag": "0004_lead_notification_delivery"');
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS notified_at");
    expect(migration).not.toMatch(/DROP\s+(TABLE|COLUMN)/i);
    expect(migration).not.toMatch(/TRUNCATE/i);
  });

  it("creates separate owner and customer delivery state and service-only atomic claims", () => {
    for (const field of [
      "owner_notification_status",
      "owner_notification_attempts",
      "owner_notification_attempt_id",
      "customer_confirmation_status",
      "customer_confirmation_attempts",
      "customer_confirmation_attempt_id",
    ]) {
      expect(migration).toContain(field);
    }
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.claim_lead_owner_notification");
    expect(migration).toContain(
      "CREATE OR REPLACE FUNCTION public.claim_lead_customer_confirmation",
    );
    expect(migration).toContain("RETURN FOUND");
    expect(migration).toContain("REVOKE ALL ON FUNCTION");
    expect(migration).toContain("TO service_role");
  });
});
