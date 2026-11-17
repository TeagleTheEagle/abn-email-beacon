// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { loadEnv } from "vite";

// Lovable's dev-only asset proxy (serves `/__l5e/assets-v1/*` uploads, e.g. the founder photo on
// /about, on localhost) reads LOVABLE_PREVIEW_HOST from process.env, but Vite only exposes VITE_*
// values from .env, so lift it ourselves. Lovable's own sandbox already sets it, hence `??=`.
export default defineConfig(({ mode }) => {
  const rawEnv = loadEnv(mode, process.cwd(), "");
  process.env["LOVABLE_PREVIEW_HOST"] ??=
    rawEnv["LOVABLE_PREVIEW_HOST"] || "www.teagueindustries.com.au";
  // Deployment-provided values win. .env supplies missing local values for the selected Vite mode.
  for (const key of ["GEMINI_API_KEY", "GOOGLE_API_KEY"] as const) {
    if (!process.env[key] && rawEnv[key]) process.env[key] = rawEnv[key];
  }

  return {
    tanstackStart: {
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      // nitro/vite builds from this
      server: { entry: "server" },
    },
    plugins: process.platform === "win32" ? [] : [mcpPlugin()],
  };
});
