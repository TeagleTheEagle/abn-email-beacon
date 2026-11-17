import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve("drizzle/migrations/0006_owner_enquiry_pipeline.sql"), "utf8");

describe("owner enquiry access controls", () => {
  it("uses owner membership for both reads and workflow updates", () => {
    expect(sql).toContain('CREATE POLICY "owner_read_enquiries"');
    expect(sql).toContain('CREATE POLICY "owner_update_enquiry_workflow"');
    expect(sql).toContain("USING (public.is_enquiry_owner())");
    expect(sql).toContain("WITH CHECK (public.is_enquiry_owner())");
    expect(sql).toContain("REFERENCES auth.users(id) ON DELETE CASCADE");
  });

  it("does not grant ordinary accounts the owner list or unrestricted lead updates", () => {
    expect(sql).toContain("REVOKE ALL ON TABLE public.owner_memberships FROM anon, authenticated");
    expect(sql).toContain("REVOKE UPDATE ON public.leads FROM authenticated");
    expect(sql).toContain("GRANT UPDATE (stage, assigned_owner_id, next_follow_up_at, notes)");
    expect(sql).not.toContain("GRANT SELECT ON TABLE public.leads TO anon");
    expect(sql).not.toContain("GRANT INSERT ON TABLE public.owner_memberships TO authenticated");
  });
});
