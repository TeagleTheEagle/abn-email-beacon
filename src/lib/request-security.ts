export type HistoryTurn = { sender: "user" | "jarvis"; text: string };
export type JarvisRequest = {
  message: string;
  history: HistoryTurn[];
  cartCount: number;
  checkoutUrl: string | null;
};
export type JsonReadResult =
  { ok: true; value: unknown } | { ok: false; status: 400 | 413; error: string };

const ALLOWED_HOSTS = new Set([
  "www.teagueindustries.com.au",
  "teagueindustries.com.au",
  "localhost",
  "127.0.0.1",
]);
const ALLOWED_PLATFORM_SUFFIXES = [".lovable.app", ".lovable.dev", ".lovableproject.com"];

export function isAllowedRequestOrigin(request: Request): boolean {
  const value = request.headers.get("origin") ?? request.headers.get("referer");
  if (!value) return true; // Non-browser MCP/API clients do not send an Origin header.
  try {
    const url = new URL(value);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(local && url.protocol === "http:")) return false;
    return (
      ALLOWED_HOSTS.has(url.hostname) ||
      ALLOWED_PLATFORM_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix))
    );
  } catch {
    return false;
  }
}

export async function readBoundedJson(request: Request, maxBytes: number): Promise<JsonReadResult> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > maxBytes)
    return { ok: false, status: 413, error: "Request too large" };
  if (!request.body) return { ok: false, status: 400, error: "Invalid JSON body" };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        return { ok: false, status: 413, error: "Request too large" };
      }
      chunks.push(decoder.decode(value, { stream: true }));
    }
    chunks.push(decoder.decode());
  } catch {
    return { ok: false, status: 400, error: "Could not read request" };
  }
  try {
    const value: unknown = JSON.parse(chunks.join(""));
    if (value === null) throw new Error("Null body");
    return { ok: true, value };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON body" };
  }
}

export function validateCheckoutUrl(value: string): boolean {
  if (value.length > 2048) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "jk1j1p-c5.myshopify.com" ||
        url.hostname === "shop.teagueindustries.com.au")
    );
  } catch {
    return false;
  }
}

export function parseJarvisRequest(
  input: unknown,
): { ok: true; value: JarvisRequest } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { ok: false, error: "Invalid request" };
  const body = input as Record<string, unknown>;
  const message = typeof body["message"] === "string" ? body["message"].trim() : "";
  if (!message || message.length > 800)
    return { ok: false, error: "Message must be between 1 and 800 characters" };

  const historyInput = body["history"] ?? [];
  if (!Array.isArray(historyInput) || historyInput.length > 8)
    return { ok: false, error: "History must contain at most 8 entries" };
  const history: HistoryTurn[] = [];
  for (const entry of historyInput) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry))
      return { ok: false, error: "Invalid history entry" };
    const sender = (entry as Record<string, unknown>)["sender"];
    const text = (entry as Record<string, unknown>)["text"];
    if (
      (sender !== "user" && sender !== "jarvis") ||
      typeof text !== "string" ||
      text.length === 0 ||
      text.length > 500
    )
      return { ok: false, error: "Invalid history entry" };
    history.push({ sender, text });
  }

  const cartCount = body["cartCount"] ?? 0;
  if (
    typeof cartCount !== "number" ||
    !Number.isInteger(cartCount) ||
    cartCount < 0 ||
    cartCount > 100
  )
    return { ok: false, error: "Invalid cart count" };
  const checkoutInput = body["checkoutUrl"] ?? null;
  if (checkoutInput !== null && typeof checkoutInput !== "string")
    return { ok: false, error: "Invalid checkout URL" };
  if (typeof checkoutInput === "string" && !validateCheckoutUrl(checkoutInput))
    return { ok: false, error: "Invalid checkout URL" };

  return {
    ok: true,
    value: { message, history, cartCount, checkoutUrl: checkoutInput },
  };
}
