# Teague Industries — current project context

**Reviewed:** 17 November 2026
**Branch:** `main`
**Committed baseline:** `55d600aa6f8d92dc6ff15a228113c6e4b4eb8911` (`55d600a`).
**Current work:** The audit remediation and documentation updates described below are local and uncommitted. Nothing from this remediation session has been committed, pushed, deployed or applied to production.

## Current architecture

- TanStack Start/React with file-based routes. The authenticated pathless layout is `src/routes/_authenticated/route.tsx`; the account screen is `/_authenticated/account.tsx` at `/account`.
- Supabase Auth and Postgres. Existing profile migrations and existing-account backfills are retained. Profile RLS remains owner-only.
- Shopify is the product source of truth. Storefront cart IDs and checkout URLs come from Shopify; no manual checkout URL construction.
- Lovable owns generated Supabase integration files and synchronises `main`. Do not rewrite published history.
- Shared business content remains in `src/content/`. Main-site theme tokens remain in `src/styles.css`.
- Public MCP tools expose public content and permitted enquiry submissions only. Demo forms, bookings and bags are local demonstrations.

## Superseded information

The old route-tree conflict described in earlier notes is not the current state. Route generation, TypeScript and a production build have run successfully. The previous `_layout.tsx` instructions and claims that no accounts exist are obsolete.

The earlier roadmap mixed completed work, historical claims and open tasks. It is archived at `docs/archive/roadmap-2026-11-17.md`; entries in that archive were not all reverified.

## Committed baseline and current local work

The committed baseline already includes:

- Separate owner/customer notification state, atomic claim hooks, stale leases, bounded retries, explicit unknown outcomes and stable Resend idempotency keys.
- Additive migrations `0004`–`0008` for notification state, shared abuse controls, an owner-only enquiry workflow, serialised submission rate limiting and owner-membership documentation. Repository history is not evidence that every migration is deployed.
- Explicit cart operation results, accessible failures, expired-cart recovery, serialised mutations, checkout refresh and success-only analytics.
- Current-password verification before password updates, Google-only password setup, sign-out errors and stale-profile isolation.
- A working mobile JARVIS event/focus contract and one coordinated responsive mobile action bar.
- Product-specific delivery wording, no lifetime-update badge, and a labelled two-page preview from the actual conversion playbook PDF.
- Precise origin parsing, bounded JARVIS requests/responses, shared production rate limiting, database-enforced enquiry throttling and mode-aware environment loading.
- Lazy showroom implementations with loading/error states and off-screen unmounting.
- An owner-only enquiry pipeline at `/enquiries` with source, assignment, manual stages, follow-up dates, notes, notification status/retry and overdue filters.

The uncommitted audit remediation adds:

- One mobile JARVIS entry point below the `sm` breakpoint, safe-area-aware panel spacing, Escape/focus restoration and chat closure on pathname changes.
- Database-side stage/overdue filtering and deterministic 50-row pagination with exact totals, so matching enquiries older than the newest 200 remain reachable.
- Optimistic enquiry updates keyed by both `id` and the loaded `updated_at`; only exactly one matching returned row is reported as a successful save. Zero-row, stale, inaccessible and ambiguous updates retain the user's entries and show an error.
- An explicit remote origin allowlist for `www.teagueindustries.com.au`, `teagueindustries.com.au` and `abn-email-beacon.lovable.app`, plus loopback HTTP development origins. Unrelated Lovable tenants and unverified preview hosts are rejected before payload parsing. Requests with neither Origin nor Referer remain supported for non-browser MCP/API clients; origin validation is not authentication or rate limiting.
- Dynamic numbered-migration discovery in `scripts/verify-migrations.mjs`, with an assertion proving `0008_document_owner_memberships.sql` is executed rather than silently omitted.
- A PowerShell `pi` wrapper in the user's active profile, preserving `asi`, forwarding arguments through the installed CLI, entering only `C:\Users\jonny\abn-email-beacon`, restoring the caller's directory and preserving the native exit code where practical.

## Verification boundaries

Final local checks on 17 November 2026 for the current uncommitted tree:

- `npx --yes bun x tsc --noEmit` — passed with 0 errors.
- `npx --yes bun run test` — 215/215 tests passed across 34 files.
- `npx --yes bun run lint` — 0 errors; 16 Fast Refresh warnings in shared UI/helper exports.
- `npx --yes bun run build` — production client, SSR and Nitro Cloudflare-module builds passed. The main client entry is 502.50 kB (156.71 kB gzip); the schema chunk is 304.64 kB (80.39 kB gzip). Existing Vite/Nitro configuration warnings remain unchanged.
- `npx --yes bun audit` — 0 vulnerabilities across 694 packages. Security overrides and `bun.lock` remain authoritative.
- Local browser checks — all 37 sitemap pages returned 200 at 1440 px and 390 px; 90 internal links passed and an unknown route returned 404. Three initial timing/heading findings were rechecked: both product pages cleared and the remaining About delay was associated with local server response time. These development timings are not production performance measurements.
- Chromium JARVIS checks — nine focused scenarios passed at 320, 390, 768 and 1440 px, including focus, Escape, one mobile entry, action-bar spacing, keyboard-sized resizing, signed-out enquiry gating and navigation close. A separate 20 route/viewport matrix passed with no reported horizontal overflow, page exceptions or console errors.
- SEO — all 37 sitemap pages had their expected production canonical and no `noindex`; `/design-system` remained outside the sitemap with `noindex, nofollow`.
- Local MCP — initialization, four-tool listing and `list_services`, `list_faqs` and `list_products` succeeded. `request_free_preview` was not called.
- Local API rejection checks — unrelated origin/invalid JSON 403, approved-origin malformed JSON 400, missing deletion authentication 401 and oversized JARVIS body 413. No paid AI call or account deletion occurred.
- Built public assets — zero matches for the configured Gemini key, Shopify client ID or Shopify client secret across 123 JS/CSS/HTML/JSON files. This targeted scan is not a general secret-scanning certification. Public Supabase configuration was intentionally excluded from the private-value set.
- Cold-cache production preview — the local Wrangler worker rendered home and recorded 72 same-origin requests, including 60 scripts and one stylesheet, with 780,263 encoded bytes reported by CDP. The main and schema chunks were both loaded. This is evidence for a future measured optimisation task, not a reason to alter Lovable's bundling plugins speculatively.
- PowerShell — a fresh profile load reported Pi 1.5.2, exit code 0, one `pi` function, preserved `asi`, and identical before/after directory `C:\Users\jonny`.

Unit and component tests use mocks for Supabase, Resend, Shopify mutations and analytics. Pagination/save coverage uses local fixtures, not an authenticated production owner session. These tests do not prove real email arrival, account provider configuration, attached Shopify files, payment fulfilment, production query performance or production access policies.

`node scripts/verify-migrations.mjs` passed fresh and upgrade execution through `0008`, data retention, profile/enquiry RLS, owner grants, protected delivery fields, legacy state, transition handling, claims and counter smoke checks. PGlite calls are sequential, not proof of multi-connection production concurrency. The fresh `npx --yes bun run test:postgres` attempt was blocked by `ECONNREFUSED 127.0.0.1:5432`; no real PostgreSQL service was available. Historical PostgreSQL results in `docs/OPERATIONS.md` are not current-session evidence.

Actual Safari/iOS safe-area behaviour, physical mobile keyboards, screen readers and Safari were not verified. Chromium viewport resizing only simulates a keyboard-sized viewport.

Evidence is under `C:\Users\jonny\.codex\visualizations\2026\11\17\audit-remediation-verification`. See `docs/OPERATIONS.md` for release checks and recovery, and `roadmap.md` for ordered open work.

## External dependencies requiring approval or evidence

- Inspect production schema, deployed migration history and backup/recovery evidence read-only before any migration; apply only reviewed missing migrations through the actual deployed state.
- Require explicit selection of one verified owner identity, verify that account, and grant only its UUID membership in `owner_memberships`. No owner UUID is assumed or hard-coded and both candidate addresses must not be granted by default.
- Verify owner and authenticated non-owner `/enquiries` access, including pagination and stale/zero-row saves, with authorised test data.
- Configure and verify the retry scheduler, Resend sender, owner notifications, customer confirmations, provider idempotency and provider spending limits.
- Verify Google OAuth, email signup/recovery and account deletion with authorised test accounts.
- Verify each Shopify Digital Products attachment and complete one authorised controlled fulfilment test.
- Configure Shopify purchase analytics without duplicate events.
- Supply an approved calendar URL and availability to replace the call-request fallback.
- Keep the existing Gmail contact until an approved domain mailbox is verified. Transactional sender configuration is separate.
- Supply permission-based client screenshots, problem/delivered/outcome evidence and testimonials before adding real client claims.

No real customer enquiries/messages, email sends, orders, checkout starts, charges, account provisioning/deletion, DNS changes, deployments or production migrations were performed.
