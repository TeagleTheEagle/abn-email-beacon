import { describe, expect, it, vi } from "vitest";
import { TtlCache } from "./ttl-cache";

function clock(start = 0) {
  let t = start;
  return { now: () => t, tick: (ms: number) => (t += ms) };
}

describe("TtlCache", () => {
  it("reuses a value until it expires", async () => {
    const c = clock();
    const cache = new TtlCache(c.now);
    const load = vi.fn(async () => "fresh");

    expect(await cache.get("k", 1000, load)).toBe("fresh");
    expect(await cache.get("k", 1000, load)).toBe("fresh");
    expect(load).toHaveBeenCalledTimes(1);

    c.tick(1001);
    await cache.get("k", 1000, load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("shares one in-flight request between concurrent callers", async () => {
    const cache = new TtlCache();
    let resolve!: (v: string) => void;
    const load = vi.fn(() => new Promise<string>((r) => (resolve = r)));

    const a = cache.get("k", 1000, load);
    const b = cache.get("k", 1000, load);
    resolve("one");
    expect(await Promise.all([a, b])).toEqual(["one", "one"]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("forgets failures and values the caller does not want kept", async () => {
    const cache = new TtlCache();
    const failing = vi.fn(async () => {
      throw new Error("shopify down");
    });
    await expect(cache.get("k", 1000, failing)).rejects.toThrow("shopify down");
    await expect(cache.get("k", 1000, failing)).rejects.toThrow("shopify down");
    expect(failing).toHaveBeenCalledTimes(2);

    const empty = vi.fn(async () => [] as string[]);
    await cache.get("list", 1000, empty, (v) => v.length > 0);
    await cache.get("list", 1000, empty, (v) => v.length > 0);
    expect(empty).toHaveBeenCalledTimes(2);
  });
});
