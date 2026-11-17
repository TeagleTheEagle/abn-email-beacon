import { describe, expect, it } from "vitest";
import { signUpSchema } from "./auth";

const validBase = {
  email: "jane@example.com",
  password: "supersecret1",
  confirmPassword: "supersecret1",
};

describe("signUpSchema optional name fields", () => {
  it("accepts blank full name and business name", () => {
    const result = signUpSchema.safeParse({ ...validBase, fullName: "", businessName: "" });
    expect(result.success).toBe(true);
  });

  it("accepts omitted full name and business name", () => {
    const result = signUpSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects a one-character full name", () => {
    const result = signUpSchema.safeParse({ ...validBase, fullName: "J", businessName: "" });
    expect(result.success).toBe(false);
  });
});
