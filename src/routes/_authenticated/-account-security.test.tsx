import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { Route } from "./account";

const account = vi.hoisted(() => ({
  signIn: vi.fn(),
  update: vi.fn(),
  reset: vi.fn(),
  signOut: vi.fn(),
  navigate: vi.fn(),
  refreshProfile: vi.fn(),
}));
let currentUser: User;

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => options,
  Link: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <a {...props}>{children}</a>
  ),
  useNavigate: () => account.navigate,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: currentUser,
    profile: null,
    loading: false,
    signOut: account.signOut,
    refreshProfile: account.refreshProfile,
  }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: account.signIn,
      updateUser: account.update,
      resetPasswordForEmail: account.reset,
    },
    from: () => ({ update: () => ({ eq: vi.fn() }) }),
  },
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

function userWithProviders(providers: string[]): User {
  return {
    id: "user-1",
    email: "user@example.com",
    app_metadata: { providers },
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00Z",
  } as User;
}

const AccountComponent = (Route as unknown as { component: React.ComponentType }).component;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("account security UI", () => {
  it("shows wrong-credential feedback, never updates, and leaves the form usable", async () => {
    currentUser = userWithProviders(["email"]);
    account.signIn.mockResolvedValue({
      data: { session: null },
      error: new Error("Invalid login credentials"),
    });
    render(<AccountComponent />);

    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "wrong" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "new-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Change password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Current password is incorrect.");
    expect(account.update).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Change password" })).toBeEnabled();
  });

  it("offers a recovery-email setup flow instead of a current-password form to Google-only users", async () => {
    currentUser = userWithProviders(["google"]);
    account.reset.mockResolvedValue({ error: null });
    render(<AccountComponent />);

    expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Email me a password setup link" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/secure password setup link/);
    expect(account.signIn).not.toHaveBeenCalled();
    expect(account.reset).toHaveBeenCalledWith("user@example.com", {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  });

  it("surfaces sign-out failure instead of navigating away", async () => {
    currentUser = userWithProviders(["email"]);
    account.signOut.mockResolvedValue({ error: "Provider unavailable" });
    render(<AccountComponent />);

    fireEvent.click(screen.getByRole("button", { name: "Sign out everywhere" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Provider unavailable/);
    expect(account.signOut).toHaveBeenCalledWith("global");
    expect(account.navigate).not.toHaveBeenCalled();
  });
});
