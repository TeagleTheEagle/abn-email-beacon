import { describe, expect, it } from "vitest";
import {
  isAllowedRequestOrigin,
  parseJarvisRequest,
  readBoundedJson,
  validateCheckoutUrl,
} from "./request-security";

function request(origin?: string) {
  return new Request("https://www.teagueindustries.com.au/api/jarvis", {
    headers: origin ? { origin } : {},
  });
}

describe("request origin validation", () => {
  it.each([
    "https://www.teagueindustries.com.au",
    "https://teagueindustries.com.au",
    "https://abn-email-beacon.lovable.app",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
  ])("accepts %s", (origin) => {
    expect(isAllowedRequestOrigin(request(origin))).toBe(true);
  });

  it.each([
    "https://www.teagueindustries.com.au.evil.example",
    "https://evil.example/?next=www.teagueindustries.com.au",
    "https://localhost.evil.example",
    "javascript:alert(1)",
    "https://evil.lovable.app.evil.example",
  ])("rejects %s", (origin) => {
    expect(isAllowedRequestOrigin(request(origin))).toBe(false);
  });

  it("allows non-browser requests without an origin but rejects malformed referrers", () => {
    expect(isAllowedRequestOrigin(request())).toBe(true);
    const referer = new Request("https://example.com", { headers: { referer: "not a URL" } });
    expect(isAllowedRequestOrigin(referer)).toBe(false);
  });
});

describe("bounded request parsing", () => {
  it("parses valid JSON", async () => {
    const result = await readBoundedJson(
      new Request("https://example.com", { method: "POST", body: '{"message":"Hello"}' }),
      1024,
    );
    expect(result).toEqual({ ok: true, value: { message: "Hello" } });
  });

  it("rejects malformed and null JSON safely", async () => {
    for (const body of ["not-json", "null"]) {
      const result = await readBoundedJson(
        new Request("https://example.com", { method: "POST", body }),
        1024,
      );
      expect(result.ok).toBe(false);
    }
  });

  it("rejects a streamed body that exceeds the byte limit", async () => {
    const result = await readBoundedJson(
      new Request("https://example.com", {
        method: "POST",
        body: JSON.stringify({ text: "x".repeat(200) }),
      }),
      64,
    );
    expect(result).toMatchObject({ ok: false, status: 413 });
  });
});

describe("JARVIS payload validation", () => {
  it("accepts bounded history and cart context", () => {
    const result = parseJarvisRequest({
      message: "Tell me about websites",
      history: [{ sender: "user", text: "Hello" }],
      cartCount: 2,
      checkoutUrl: "https://jk1j1p-c5.myshopify.com/cart/test",
    });
    expect(result.ok).toBe(true);
  });

  it.each([
    null,
    [],
    {},
    { message: "x".repeat(801) },
    { message: "Hello", history: Array(9).fill({ sender: "user", text: "Hi" }) },
    { message: "Hello", history: [null] },
    { message: "Hello", history: [{ sender: "other", text: "Hi" }] },
    { message: "Hello", history: [{ sender: "user", text: "x".repeat(501) }] },
    { message: "Hello", cartCount: -1 },
    { message: "Hello", cartCount: 1.5 },
  ])("rejects malformed or excessive input %#", (body) => {
    expect(parseJarvisRequest(body).ok).toBe(false);
  });

  it("accepts only HTTPS checkout URLs on the configured store domains", () => {
    expect(validateCheckoutUrl("https://jk1j1p-c5.myshopify.com/cart/1")).toBe(true);
    expect(validateCheckoutUrl("https://shop.teagueindustries.com.au/cart/1")).toBe(true);
    expect(validateCheckoutUrl("https://jk1j1p-c5.myshopify.com.evil.example/cart/1")).toBe(false);
    expect(validateCheckoutUrl("javascript:alert(1)")).toBe(false);
  });
});
