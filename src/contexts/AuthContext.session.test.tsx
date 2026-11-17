import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { AuthProvider, useAuth } from "./AuthContext";

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
  single: vi.fn(),
}));
let authListener: (event: string, session: { user: User } | null) => void;

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: auth.getSession,
      onAuthStateChange: auth.onAuthStateChange,
      signOut: auth.signOut,
    },
    from: () => ({
      select: () => ({ eq: (_column: string, id: string) => ({ single: () => auth.single(id) }) }),
    }),
  },
}));

function account(id: string, providers: string[]): User {
  return {
    id,
    email: `${id}@example.com`,
    app_metadata: { providers },
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00Z",
  } as User;
}

function Probe() {
  const { user, profile, loading, signOut } = useAuth();
  return (
    <div>
      <span>{loading ? "loading" : (user?.id ?? "signed out")}</span>
      <span>{profile?.full_name ?? "no profile"}</span>
      <button
        onClick={async () => {
          await signOut();
        }}
      >
        Sign out
      </button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  auth.onAuthStateChange.mockImplementation((listener) => {
    authListener = listener;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  auth.signOut.mockResolvedValue({ error: null });
});

afterEach(cleanup);

describe("AuthProvider session isolation", () => {
  it("ignores a late profile response from the previous account", async () => {
    const first = account("first", ["email"]);
    const second = account("second", ["google"]);
    let resolveFirst: (value: unknown) => void = () => {};
    let resolveSecond: (value: unknown) => void = () => {};
    auth.getSession.mockResolvedValue({ data: { session: { user: first } }, error: null });
    auth.single.mockImplementation((id: string) => {
      if (id === "first")
        return new Promise((resolve) => {
          resolveFirst = resolve;
        });
      return new Promise((resolve) => {
        resolveSecond = resolve;
      });
    });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(await screen.findByText("first")).toBeInTheDocument();

    await act(async () => authListener("SIGNED_IN", { user: second }));
    await act(async () => {
      resolveSecond({ data: { id: "second", full_name: "Second profile" }, error: null });
      await Promise.resolve();
    });
    expect(await screen.findByText("Second profile")).toBeInTheDocument();

    await act(async () => {
      resolveFirst({ data: { id: "first", full_name: "First profile" }, error: null });
      await Promise.resolve();
    });
    expect(screen.getByText("Second profile")).toBeInTheDocument();
    expect(screen.queryByText("First profile")).not.toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("retains account state when sign-out fails", async () => {
    const first = account("first", ["email"]);
    auth.getSession.mockResolvedValue({ data: { session: { user: first } }, error: null });
    auth.single.mockResolvedValue({
      data: { id: "first", full_name: "First profile" },
      error: null,
    });
    auth.signOut.mockResolvedValue({ error: new Error("Provider unavailable") });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(await screen.findByText("First profile")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("First profile")).toBeInTheDocument();
  });
});
