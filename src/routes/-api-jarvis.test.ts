import { afterEach, describe, expect, it, vi } from "vitest";
import { Route } from "./api.jarvis";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => options,
}));

const post = (
  Route as unknown as {
    server: { handlers: { POST: (args: { request: Request }) => Promise<Response> } };
  }
).server.handlers.POST;

function call(body: BodyInit, origin = "https://www.teagueindustries.com.au") {
  return post({
    request: new Request("https://www.teagueindustries.com.au/api/jarvis", {
      method: "POST",
      headers: { origin, "Content-Type": "application/json" },
      body,
    }),
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("JARVIS endpoint validation and fallback", () => {
  it("rejects a hostile lookalike origin before any external request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await call(
      '{"message":"Hello"}',
      "https://teagueindustries.com.au.evil.example",
    );

    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an unrelated Lovable tenant before parsing an invalid payload", async () => {
    const response = await call("not-json", "https://unrelated-tenant.lovable.app");

    expect(response.status).toBe(403);
  });

  it.each(["null", "not-json", '{"message":"Hello","history":[null]}'])(
    "returns 400 for malformed input %s",
    async (body) => {
      const response = await call(body);
      expect(response.status).toBe(400);
    },
  );

  it("uses the deterministic fallback without an AI key or live AI call", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "");
    const response = await call(JSON.stringify({ message: "How much does a website cost?" }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.text).toContain("A$500");
    expect(body.source).toBe("public-api+local");
  });
});
