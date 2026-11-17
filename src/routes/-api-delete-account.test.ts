import { afterEach, describe, expect, it, vi } from "vitest";
import { Route } from "./api.delete-account";

const auth = vi.hoisted(() => ({ getUser: vi.fn(), deleteUser: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => options,
}));
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { auth: { getUser: auth.getUser, admin: { deleteUser: auth.deleteUser } } },
}));

const post = (
  Route as unknown as {
    server: { handlers: { POST: (args: { request: Request }) => Promise<Response> } };
  }
).server.handlers.POST;

function call(token?: string, origin = "https://www.teagueindustries.com.au") {
  return post({
    request: new Request("https://www.teagueindustries.com.au/api/delete-account", {
      method: "POST",
      headers: { origin, ...(token ? { authorization: `Bearer ${token}` } : {}) },
    }),
  });
}

afterEach(() => vi.clearAllMocks());

describe("account deletion endpoint boundaries", () => {
  it("rejects hostile origins and missing sessions without deleting", async () => {
    expect((await call(undefined, "https://teagueindustries.com.au.evil.example")).status).toBe(
      403,
    );
    expect((await call()).status).toBe(401);
    expect(auth.deleteUser).not.toHaveBeenCalled();
  });

  it("rejects an expired session", async () => {
    auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error("Expired") });
    const response = await call("an-expired-session-token");
    expect(response.status).toBe(401);
    expect(auth.deleteUser).not.toHaveBeenCalled();
  });

  it("deletes only the user identified by the validated session", async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: "test-user-id" } }, error: null });
    auth.deleteUser.mockResolvedValue({ error: null });
    const response = await call("a-valid-test-session-token");
    expect(response.status).toBe(200);
    expect(auth.deleteUser).toHaveBeenCalledWith("test-user-id");
  });
});
