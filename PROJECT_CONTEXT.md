# Teague Industries — current project context

**Reviewed:** 17 November 2026
**Branch:** `main`
**Status:** Reliability changes are implemented locally. They have not been committed, pushed, deployed, or applied to production by this review.

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

## Implemented in the current local work

- Separate owner/customer notification state, atomic claim hooks, stale leases, bounded retries, explicit unknown outcomes and stable Resend idempotency keys.
- Additive migrations `0004`–`0006` for notification state, shared abuse controls and an owner-only enquiry workflow.
- Explicit cart operation results, accessible failures, expired-cart recovery, serialised mutations, checkout refresh and success-only analytics.
- Current-password verification before password updates, Google-only password setup, sign-out errors and stale-profile isolation.
- A working mobile JARVIS event/focus contract and one coordinated responsive mobile action bar.
- Product-specific delivery wording, no lifetime-update badge, and a labelled two-page preview from the actual conversion playbook PDF.
- Precise origin parsing, bounded JARVIS requests/responses, shared production rate limiting, database-enforced enquiry throttling and mode-aware environment loading.
- Lazy showroom implementations with loading/error states and off-screen unmounting.
- An owner-only enquiry pipeline at `/enquiries` with source, assignment, manual stages, follow-up dates, notes, notification status/retry and overdue filters.

## Verification boundaries

Final local checks on 17 November 2026:

- `npx --yes bun x tsc --noEmit` — passed with 0 errors.
- `npx --yes bun run test` — 184/184 tests passed across 34 files.
- `npx --yes bun run lint` — 0 errors; 16 Fast Refresh warnings in shared UI/helper exports.
- `npx --yes bun run build` — production client, SSR and Nitro builds passed.
- `npx --yes bun audit` — 0 vulnerabilities across 694 packages.
- Local HTTP checks — all 37 sitemap URLs returned 200; a nonexistent route returned 404; home canonical and checked private-preview noindex were present.
- Chromium checks — 320 px keyboard menu/chat, 390 px chat, 768 px layout, desktop product preview and audit wording completed without page errors. A pre-hydration shortcut tap did not open chat; after hydration it did.

Unit and component tests use mocks for Supabase, Resend, Shopify mutations and analytics. They prove local logic and UI behaviour only. They do not prove real email arrival, account provider configuration, attached Shopify files, payment fulfilment or production access policies.

An isolated PGlite run executed fresh and upgrade migrations, data retention, profile/enquiry RLS, owner grants, protected delivery fields, legacy state, transition handling, claims and counter smoke checks. Its calls are sequential, not proof of multi-connection production concurrency. A real Supabase test environment was not available.

A production build with harmless sentinel values for private key names produced zero sentinel matches in public assets.

See `docs/OPERATIONS.md` for release checks and recovery, and `roadmap.md` for ordered open work.

## External dependencies requiring approval or evidence

- Apply migrations and deploy the notification function through Lovable after reviewing production schema.
- Assign the owner account in `owner_memberships`; no owner UUID is assumed or hard-coded.
- Configure and verify the retry scheduler, Resend sender and provider spending limits.
- Verify Google OAuth, email signup/recovery and account deletion with authorised test accounts.
- Verify each Shopify Digital Products attachment and complete one authorised controlled fulfilment test.
- Configure Shopify purchase analytics without duplicate events.
- Supply an approved calendar URL and availability to replace the call-request fallback.
- Keep the existing Gmail contact until an approved domain mailbox is verified. Transactional sender configuration is separate.
- Supply permission-based client screenshots, problem/delivered/outcome evidence and testimonials before adding real client claims.

No real customer messages, orders, charges, account deletions, DNS changes, deployments or production migrations were performed.
