import { describe, expect, it, vi } from "vitest";
import {
  changePasswordWithVerification,
  isGoogleOnlyUser,
  sendPasswordSetupLink,
  type AccountAuthClient,
} from "./account-security";

function authClient(): AccountAuthClient {
  return {
    signInWithPassword: vi.fn(),
    updateUser: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  };
}

describe("account password security", () => {
  it("blocks a password change when the current password is wrong", async () => {
    const auth = authClient();
    vi.mocked(auth.signInWithPassword).mockResolvedValue({
      data: { session: null },
      error: new Error("Invalid login credentials"),
    });

    const result = await changePasswordWithVerification(
      auth,
      "user@example.com",
      "wrong",
      "new-password",
    );

    expect(result).toEqual({ success: false, error: "Current password is incorrect." });
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("distinguishes a provider verification failure from wrong credentials", async () => {
    const auth = authClient();
    vi.mocked(auth.signInWithPassword).mockResolvedValue({
      data: { session: null },
      error: new Error("Provider unavailable"),
    });

    const result = await changePasswordWithVerification(
      auth,
      "user@example.com",
      "current",
      "new-password",
    );

    expect(result).toEqual({
      success: false,
      error: "Could not verify your current password. Please try again.",
    });
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("blocks reauthentication if the returned session belongs to another account", async () => {
    const auth = authClient();
    vi.mocked(auth.signInWithPassword).mockResolvedValue({
      data: { session: { access_token: "valid" }, user: { id: "other-user" } },
      error: null,
    });

    const result = await changePasswordWithVerification(
      auth,
      "user@example.com",
      "current",
      "new-password",
      "expected-user",
    );

    expect(result).toEqual({
      success: false,
      error: "Verified account does not match the signed-in account. Please sign in again.",
    });
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("updates only after correct credentials establish a valid session", async () => {
    const auth = authClient();
    vi.mocked(auth.signInWithPassword).mockResolvedValue({
      data: { session: { access_token: "not-a-real-token" } },
      error: null,
    });
    vi.mocked(auth.updateUser).mockResolvedValue({ error: null });

    const result = await changePasswordWithVerification(
      auth,
      "user@example.com",
      "correct",
      "new-password",
    );

    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "correct",
    });
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "new-password" });
    expect(result).toEqual({ success: true });
  });

  it("handles an expired session and a provider update failure without success", async () => {
    const auth = authClient();
    vi.mocked(auth.signInWithPassword).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    expect(
      await changePasswordWithVerification(auth, "user@example.com", "current", "new-password"),
    ).toEqual({ success: false, error: "Your session has expired. Please sign in again." });

    vi.mocked(auth.signInWithPassword).mockResolvedValueOnce({
      data: { session: { access_token: "valid" } },
      error: null,
    });
    vi.mocked(auth.updateUser).mockResolvedValue({ error: new Error("Provider unavailable") });
    expect(
      await changePasswordWithVerification(auth, "user@example.com", "current", "new-password"),
    ).toEqual({ success: false, error: "Could not change your password. Please try again." });
  });

  it("identifies Google-only accounts without blocking email/password accounts", () => {
    expect(isGoogleOnlyUser({ app_metadata: { providers: ["google"] } })).toBe(true);
    expect(isGoogleOnlyUser({ app_metadata: { providers: ["google", "email"] } })).toBe(false);
    expect(isGoogleOnlyUser({ app_metadata: { providers: ["email"] } })).toBe(false);
  });

  it("uses the existing recovery flow to establish a Google-only password", async () => {
    const auth = authClient();
    vi.mocked(auth.resetPasswordForEmail).mockResolvedValue({ error: null });

    const result = await sendPasswordSetupLink(
      auth,
      "user@example.com",
      "https://example.com/reset-password",
    );

    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("user@example.com", {
      redirectTo: "https://example.com/reset-password",
    });
    expect(result).toEqual({ success: true });
  });
});
