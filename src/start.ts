import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

// Security headers on every response, and a short shared cache for HTML pages. Script-level CSP is
// deliberately not set: hydration, analytics and Lovable's tooling all use inline scripts.
const headersMiddleware = createMiddleware().server(async ({ next, request }) => {
  const result = await next();
  // Rebuild the response so its headers are mutable (fetch-style responses can be immutable).
  const res = new Response(result.response.body, result.response);
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Content-Type-Options", "nosniff");
  const isHtml = (res.headers.get("content-type") ?? "").includes("text/html");
  if (request.method === "GET" && res.status === 200 && isHtml && !res.headers.has("cache-control")) {
    // Pages are the same for everyone (no accounts; the cart lives in the browser), so an edge cache of a
    // few minutes is safe. Browsers still revalidate every time.
    res.headers.set("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
  }
  return { ...result, response: res };
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware, headersMiddleware],
}));
