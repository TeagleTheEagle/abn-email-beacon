# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing site + shop for **Teague Industries** (Sydney-based studio selling websites, Shopify stores and AI tools to Australian small businesses). Production domain is `https://www.teagueindustries.com.au`; also published at `https://abn-email-beacon.lovable.app`. There are no user accounts — the only database write is lead/enquiry inserts.

**This repo is connected to Lovable.** Every push to `main` syncs into the Lovable editor, and Lovable commits straight back here. Never force-push, rebase, amend or squash commits that are already pushed (it destroys the user's Lovable history), and keep `main` in a working state. `roadmap.md` tracks the user's outstanding requests and audit follow-ups.

## Commands

```sh
npm run dev            # vite dev server
npm run build          # production build (nitro, Cloudflare target)
npm run lint           # eslint (prettier runs as an eslint rule)
npm run format         # prettier --write
npm test               # vitest run (jsdom)
npx vitest run src/test/app-routing.test.tsx   # single file
npx vitest run -t "matches a page"              # single test by name
npx tsc --noEmit       # type check (no script for it)
```

`bun.lock` is the committed lockfile (Lovable uses bun; `bunfig.toml` enforces a 24h minimum package release age). `package-lock.json` is untracked local output.

## Stack

TanStack Start (React 19, SSR) + TanStack Router file-based routing + React Query, Tailwind v4, shadcn/ui (new-york, in `src/components/ui`), zustand, react-hook-form + zod, Supabase (Lovable Cloud), Shopify Storefront API. Path alias `@/` → `src/`. TypeScript is strict with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `noPropertyAccessFromIndexSignature` — index-signature access must use bracket syntax (e.g. `import.meta.env['VITE_SUPABASE_URL']`).

## Architecture

**Build config.** `vite.config.ts` uses `@lovable.dev/vite-tanstack-config`, which already bundles tanstackStart, React, Tailwind, tsconfig paths, nitro, env injection and the `@` alias — do not add those plugins manually or the app breaks with duplicates. The server entry is redirected to `src/server.ts`, an SSR wrapper that converts h3-swallowed 500s into an HTML error page. `src/start.ts` registers request middleware (error page + CSRF protection for server functions + security/cache headers) and the Supabase auth-attacher function middleware; because the file exists, Start's default CSRF middleware is *not* auto-installed, so keep it there. Fonts are self-hosted from `public/fonts` with `@font-face` in `styles.css` (don't re-add the Google Fonts stylesheet). Demo images have 640px and 1024px WebP variants (`image`/`imageSmall` in `src/content/demos.ts`); Shopify images go through `shopifyImage(url, width)` so the CDN resizes them.

**Routing.** Files in `src/routes/` (see `src/routes/README.md` for conventions). `__root.tsx` is the only layout: it renders `SiteNav`, `<Outlet />`, `SiteFooter`, the toaster, and runs `useCartSync`. `src/routeTree.gen.ts` is generated — never edit it. Each page sets its `<head>` via `head: () => seo(path, title, description)` from `src/lib/seo.ts` (title suffix, OG/Twitter tags, canonical URL). When adding a public page, also add it to `public/sitemap.xml` and to `nav` in `src/content/site.ts` if it belongs in the menu. `/design-system` is an unlisted, `noindex` reference page showing the live tokens and components; keep it in step when adding a utility or component, and keep it out of the nav and sitemap.

**Content as data.** Business copy lives in `src/content/` and is shared by pages *and* the MCP server: `site.ts` (contact details, ABN, nav, process steps, FAQs), `services.ts` (service tiers and prices), `projects.ts` (portfolio cards). Change prices/FAQs here, not in JSX. Prices are AUD and the business is not GST-registered.

**Shop.** `src/lib/shopify.ts` is the Shopify Storefront API client (public storefront token, store `jk1j1p-c5.myshopify.com`) with product queries and cart mutations. `src/stores/cartStore.ts` is a persisted zustand store (`localStorage` key `shopify-cart`) that mirrors a Shopify cart; checkout always goes through the cart's `checkoutUrl` (with `channel=online_store` appended) — never construct checkout URLs manually. `useCartSync` clears the local cart when Shopify reports it gone (e.g. after checkout). Routes: `/shop`, `/product/$handle`.

**Shopify store (shared source of truth for products).** Products, prices, descriptions, cover images and collections live in the Shopify store ("Teague Industries", `jk1j1p-c5`), never in code. The site reads them live, so a product change shows on localhost and the live site without a code change or publish. Three parties edit the store: the user in the Shopify admin, Lovable's Shopify integration, and Claude via the claude.ai Shopify connector (Admin API: products, collections, discounts, inventory, reading orders). Domains, payments and checkout settings can only be changed by the user in the Shopify admin. When a product is added or its handle changes, add or update its `/product/<handle>` URL in `public/sitemap.xml`. Shopify builds checkout links on the store's *primary domain*, so that must never be `www.teagueindustries.com.au` (Lovable serves it, and checkout would 404); use the myshopify domain or a `shop.` subdomain pointed at Shopify.

**Leads / Supabase.** The single table is `public.leads` (schema in `drizzle/migrations/0000_migration.sql`; `drizzle/schema.ts` is intentionally blank). RLS allows anon INSERT only, with length checks mirroring the zod schemas. Forms (`QuickLeadForm`, `/contact`) insert directly via the browser client `@/integrations/supabase/client` and include a hidden honeypot input. Files in `src/integrations/supabase/` are generated by Lovable — don't edit them. `client.server.ts` (service role, bypasses RLS) must only be imported inside server handlers or other `*.server.ts` modules. Env vars come from `.env` (`VITE_SUPABASE_*` for the client, `SUPABASE_*` for server).

**Lead notifications.** Forms (and the MCP `request_free_preview` tool) insert with a client-generated `id` from `src/lib/leads.ts`, then call the `notify-lead` edge function (`supabase/functions/notify-lead`, `verify_jwt = false`) with that id. The function re-reads the lead with the service role and emails the owner via Resend (`RESEND_API_KEY`, optional `LEAD_NOTIFY_TO`, `LEAD_FROM` secrets in Lovable Cloud); an auto-reply to the enquirer only goes out when `LEAD_FROM` is a verified sender. Notification failure never fails the form.

**Analytics.** Google Analytics 4 via `src/lib/analytics.ts`; loads only when `VITE_GA_MEASUREMENT_ID` is set in `.env`. `__root.tsx` sends `page_view` on load and client navigations; forms send `generate_lead`, the product page `add_to_cart`, the cart drawer `begin_checkout`. Keep the Privacy page's tracking section in step with what's loaded.

**Agent interfaces (two separate ones).**
- *Remote MCP server* at `/mcp`, defined in `src/lib/mcp/` (`index.ts` registers tools from `tools/`). Public, no auth; tools may only read public content (`src/content`, Shopify) or insert leads via the anon client in `src/lib/mcp/supabase.ts`. `src/routes/mcp.ts`, `src/routes/[.well-known]/oauth-protected-resource.ts` and `.lovable/mcp/manifest.json` are regenerated by `mcpPlugin()` from `@lovable.dev/mcp-js` — edit the tool definitions, not those files. (The local `vite.config.ts` may skip `mcpPlugin()` on Windows, in which case those generated files won't refresh locally.)
- *In-page WebMCP tools* registered with `useWebMCP` from `use-webmcp-tool` (e.g. `request_free_preview` in `QuickLeadForm.tsx`), with execution wrapped in `runWebMCPTool` from `src/lib/webmcp-telemetry.ts`.

**Styling.** Dark "space/chrome" theme. Design tokens are in `src/styles.css` (`@theme inline`), along with custom Tailwind v4 utilities used throughout: `glass`, `glass-hover`, `text-chrome`, `btn-primary`, `btn-chrome`, `field`, `label`, `font-display`, `font-hand`, `chrome-line`. Reuse these rather than re-creating styles. `--primary` (#2a74dc) is the darkest-acceptable blue for white button text (4.5:1); don't lighten it without changing button text colour. Links inside `p`/`li` are underlined by a base rule so colour is never the only cue. The phone menu and cart are Radix `Sheet`s (Escape, focus trap, scroll lock come for free); don't hand-roll overlays. `Reveal`/`PageHeader` in `src/components/Reveal.tsx` provide the standard page header and scroll-in animation. Uploaded images may be Lovable asset descriptors (`*.asset.json`) — import the JSON and use its `url`.

## Testing

Vitest with jsdom, setup in `src/test/setup.ts` (stubs `scrollTo`/`matchMedia`), tests matched by `src/**/*.{test,spec}.{ts,tsx}`. The existing routing test matches routes via `router.matchRoutes` without rendering, because loaders may need network access and jsdom doesn't load stylesheets.
