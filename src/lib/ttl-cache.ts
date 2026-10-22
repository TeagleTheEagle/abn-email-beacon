// A tiny time-limited memo for server-rendered Shopify reads.
//
// The shop and product pages ask Shopify for data on every request, which makes
// them noticeably slower than the rest of the site. Caching the answer for a short
// while on the server lets repeat visits render straight away. The cache lives in
// the server process's memory, so it is per instance and disappears on restart;
// it never runs in the browser, where React Query already does this job.

type Entry<T> = { value: Promise<T>; expires: number };

export class TtlCache {
  private entries = new Map<string, Entry<unknown>>();

  constructor(private now: () => number = () => Date.now()) {}

  /**
   * Return the cached value for `key`, or run `load` and remember its result for
   * `ttlMs`. Concurrent callers share one in-flight request. Failures and values
   * that `keep` rejects are not remembered, so a Shopify hiccup never sticks.
   */
  async get<T>(
    key: string,
    ttlMs: number,
    load: () => Promise<T>,
    keep: (value: T) => boolean = () => true,
  ): Promise<T> {
    const hit = this.entries.get(key);
    if (hit && hit.expires > this.now()) return hit.value as Promise<T>;

    const value = load().then(
      (result) => {
        if (!keep(result)) this.entries.delete(key);
        return result;
      },
      (error: unknown) => {
        this.entries.delete(key);
        throw error;
      },
    );
    this.entries.set(key, { value, expires: this.now() + ttlMs });
    return value;
  }

  clear() {
    this.entries.clear();
  }
}

const serverCache = new TtlCache();

/** Cache on the server only; in the browser just run `load`. */
export function cachedOnServer<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
  keep?: (value: T) => boolean,
): Promise<T> {
  if (typeof window !== "undefined") return load();
  return serverCache.get(key, ttlMs, load, keep);
}
