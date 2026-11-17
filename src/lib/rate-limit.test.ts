import { afterEach, describe, expect, it, vi } from "vitest";
import { checkJarvisRateLimit } from "./rate-limit";

function request(cfIp?: string, forwarded?: string) {
  return new Request("https://www.teagueindustries.com.au/api/jarvis", {
    headers: {
      ...(cfIp ? { "cf-connecting-ip": cfIp } : {}),
      ...(forwarded ? { "x-forwarded-for": forwarded } : {}),
    },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("shared JARVIS rate limiting", () => {
  it("uses the deployment client address, not caller-supplied forwarding headers", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(Response.json(1)));
    vi.stubGlobal("fetch", fetchMock);

    await checkJarvisRateLimit(request("203.0.113.1", "198.51.100.1"));
    await checkJarvisRateLimit(request("203.0.113.1", "198.51.100.2"));

    const firstKey = fetchMock.mock.calls[0]?.[1]?.body;
    const secondKey = fetchMock.mock.calls[1]?.[1]?.body;
    expect(firstKey).toBe(secondKey);
    expect(firstKey).not.toContain("203.0.113.1");
    expect(firstKey).not.toContain("198.51.100");
  });

  it("enforces the shared count returned by the database", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(20)));

    expect((await checkJarvisRateLimit(request("203.0.113.1"))).allowed).toBe(true);
  });

  it("fails closed in production when shared limiting is unavailable", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Database unavailable")));

    expect(await checkJarvisRateLimit(request("203.0.113.1"))).toEqual({
      allowed: false,
      unavailable: true,
    });
  });
});
