# Teague Industries roadmap

**Current as of:** 27 November 2026
**State:** Everything is committed and synced; migrations through `0010` (concept views) are applied to Lovable Cloud, `notify-lead` is deployed, and owner access is granted. 15 hidden concept pages live under `/concept/` and report views.

## Open now (waiting on Ben)

- Booking link (Calendly/Cal.com) to replace the `/book` request form.
- Business mailbox + verified Resend sender (`LEAD_FROM`) for customer auto-replies.
- Attach the 4 product ZIPs in Shopify Digital Products, then one test purchase.
- Real client results/testimonials with permission.

## Website audit improvements (27 November 2026)

- [x] 1. Account-page icons, spacing, landmarks and private metadata (signed-in screens covered by existing component tests; real account/recovery session unavailable).
- [x] 2. Quick-form per-field accessible errors, independently linked to each input.
- [x] 3. Configurator scroll and input focus, respecting reduced motion.
- [x] 4. Comparison tray clearance at 640/1024/1280 px and dialog focus restoration.
- [x] 5. Services builder missing-business validation and clearing after selection.
- [x] 6. Desktop menu wrapping; checked 800/1024/1280/1440 px signed out.
- [x] 7. Hero decorative scan stays behind copy; inspected at 1440 px.
- [x] 8. Single empty-cart message; verified through the opened cart.
- [x] 9. Editorial titles/descriptions shortened; product metadata now reads Shopify SEO title. All live products currently have null SEO titles, so their required name fallback still exceeds 60 characters for long names. Products were not changed.
- [x] 10. Services/pricing offer catalog from shared service/care tiers; fixed/from/monthly prices distinguished. Pricing FAQ schema uses exactly its visible FAQ subset. JSON parsed in browser and tests.
- [x] 11. Earth image reduced from 156,750 to 65,854 bytes, phone variant 27,110 bytes; founder 600×900, 42,082 bytes, lazy. Original photos preserved. Further JavaScript splitting deferred as a separate structural change: JARVIS is 1,444 lines and showroom demos already use lazy boundaries; current preview cold-home loads measured 16 script requests before/after (not comparable to historical production counts).
- [x] 12. Checked report-only warnings across home, services, shop, product, demos, fine-dining, about, contact, auth, signed-out enquiries, concept and JARVIS. Full CSP deliberately NOT enforced: observed script evaluation, Google Analytics collect requests to www.google.com and Tag Manager image beacons would be blocked. Signed-in enquiries and all assistant API interactions remain unverified.
- [x] Verification: 232/232 tests across 38 files, preview automatic typecheck/build OK, project-code lint 0 errors/16 existing warnings, browser central flows passed without runtime errors. `npm run lint` traversing the whole checkout timed out twice (120/600s); explicitly scoped project-code lint passed. Manual build/typecheck were not run because the Lovable harness performs them.

Protected files unchanged: concept HTML, robots, sitemap, preview route, prices/products, migrations and generated integration files. No real leads, emails, checkout writes or account mutations submitted; changes need publishing to reach the live site.

Historical notes are preserved in `docs/archive/roadmap-2026-11-17.md`. Historical claims in that archive were not all reverified.

## Implemented and verified locally

- Concept-page view tracking (done 27 Nov 2026): the 15 `/concept/` pages post `{slug}` to `public.concept_views`; the owner-only `/enquiries` page shows a "Concept page views" panel with totals and last-viewed time per page, newest first. The `qa-test` slug is hidden from the panel (rows kept). Owner's own visits are counted. Verified with unit/component tests only; not yet checked with a real signed-in owner session.
- Notification lifecycle handler, idempotency, independent recipient state and owner-visible retry workflow.
- Cart success/failure results, failure alerts, expired-cart recovery, serialised mutations and success-only add-to-cart events.
- Password verification, Google-only setup flow, sign-out failures and late-profile protection.
- Real mobile JARVIS opening/focus, one mobile action system and safe-area/page padding.
- Product-specific delivery/support wording and two actual conversion-playbook preview pages.
- Request validation, precise origins, shared production limiter code, enquiry database throttle and mode-aware AI environment loading.
- Owner-only enquiry pipeline and source/stage analytics without contact details in analytics payloads.
- Lazy showroom implementations with loading/error states.
- CI typecheck, tests, lint, production build and real PostgreSQL concurrency steps.
- Uncommitted remediation: single-entry mobile JARVIS layout with navigation/focus fixes; database-side enquiry filtering/pagination; confirmed optimistic enquiry saves; exact remote-origin allowlist; and dynamic migration coverage through `0008`.
- Fresh remediation verification: TypeScript passed, 215 tests passed, lint reported 0 errors/16 known warnings, production build passed, Bun audit found 0 vulnerabilities in 694 packages, and isolated PGlite passed through `0008`. Real PostgreSQL remains blocked locally by `ECONNREFUSED 127.0.0.1:5432`.
- Fresh read-only local browser verification: 37 sitemap pages at desktop/mobile, 90 internal links, unknown-route 404, production canonicals/noindex, nine focused JARVIS scenarios and a 20-combination route/viewport matrix. No form, cart, checkout or account mutation was exercised.

See `PROJECT_CONTEXT.md` for implementation boundaries and `docs/OPERATIONS.md` for the operational checklist.

## Prepared, awaiting deployment or external approval

1. **Database and functions:** With authorised read-only access, inspect actual production schema, deployed migration history and backup/recovery evidence first. Repository history runs through `0008_document_owner_memberships.sql`; do not infer which migrations are deployed from filenames alone. Apply only reviewed missing additive migrations, deploy `notify-lead`, explicitly select and verify one owner identity before granting only that UUID, and configure/observe retry scheduling.
2. **Email:** Verify owner notifications and customer confirmations with authorised test enquiries. A verified `LEAD_FROM` remains required for customer confirmations. AI-assistant enquiries keep their existing no-confirmation behaviour where documented.
3. **Accounts:** Test signup/confirmation, Google sign-in, recovery, password change, profile editing, sign-out and deletion with authorised test accounts.
4. **Fulfilment:** Verify every Shopify Digital Products attachment and run one authorised controlled purchase/download test. The renamed tracker attachment remains specifically unverified.
5. **Analytics:** Configure Shopify purchase measurement and verify no duplicate purchase events. Local tests cover event calls, not GA4 or Shopify receipt.
6. **Provider controls:** Enable hosting/WAF and Google AI spending limits; confirm the configured Gemini model against official provider documentation before enabling paid calls.

## Blocked by missing information or assets

- **Calendar:** `site.bookingUrl` is empty. Supply an approved Calendly/Cal.com/Google appointment URL, timezone and actual availability. Until then `/book` clearly requests a time without confirming it.
- **Business mailbox:** The source currently uses `benteaguey6@gmail.com`. Keep it until an approved domain mailbox is verified for receipt and sending. Public contact and Resend sender configuration are separate.
- **Real project evidence:** No approved client outcomes/testimonials were supplied. Existing portfolio items distinguish the internal store and fictional demos. Use `docs/CLIENT_EVIDENCE.md` before adding client claims.
- **More product previews:** Supply or approve the current file/version for each product. Only the conversion playbook currently has actual local pages wired into its product route.

## Not yet verified

- Production schema parity and multi-connection concurrency. Fresh/upgrade PGlite execution through `0008`, RLS/grants, data retention and sequential claim/counter checks passed. The current real-PostgreSQL attempt failed to connect at `127.0.0.1:5432`; earlier reported PostgreSQL success is historical, not fresh evidence.
- Real owner and authenticated non-owner enquiry access, production query performance and confirmed saves under real sessions. Current pagination/save proof is mocked/component coverage.
- Real email arrival, provider idempotency behaviour, scheduler runs and production retry concurrency.
- Real Supabase authentication/provider/account-deletion journeys.
- Real Shopify writes, stock rejection, checkout completion or file delivery.
- Full Safari/iOS safe-area behaviour, physical mobile keyboards, screen readers, text-zoom and reduced-motion experience. Chromium keyboard-sized viewport resizing is only a simulation.
- Browser regression automation in CI; the current real-browser evidence is local Chromium only.
- Notification/scheduler operational monitoring and alerting for failed/unknown deliveries, retry backlog and missed scheduler runs.
- Live sitemap/404/SEO and post-release interactions after an approved deployment of these local changes.
- Whether production AI/hosting spending and rate-limit settings are enabled.

## Prioritised next-feature plan

### 1. Approved booking calendar — small, approximately 0.5–1 day after inputs arrive

- **Benefit:** Visitors can choose a genuinely available time instead of only requesting a call.
- **Dependencies:** An approved `site.bookingUrl`, explicit timezone, real availability and permission to embed or link the provider. `/book` currently requests a time without confirming availability; do not represent it as a confirmed booking.
- **Acceptance:** The approved provider opens at the correct URL and timezone; available slots come from the real calendar; fallback contact remains available; mobile/desktop layout and keyboard/focus behaviour pass; no duplicate enquiry is created and no booking is represented as confirmed until the provider confirms it.

### 2. Owner enquiry workflow — medium, approximately 1–2 days

- **Benefit:** Ben can find, assign and follow up the right enquiry as the dataset grows beyond one page.
- **Dependencies:** The new database-side pagination, verified owner membership, deployed supporting migrations and authorised owner/non-owner test accounts.
- **Acceptance:** Database-side search covers all permitted records; stage/overdue/search combinations retain exact totals and deterministic pages; assignment offers only valid authorised owners; follow-up visibility is clear; non-owners receive no enquiry data; saves still reject stale or zero-row updates; analytics contains no contact details.

### 3. Verified product previews and fulfilment evidence — medium/large, approximately 2–5 days depending on product count and access

- **Benefit:** Every digital-product promise is supported by the actual file and delivery journey.
- **Dependencies:** Approved current files/versions and previews for every product, Shopify admin/Digital Products evidence and explicit authorisation for controlled test purchase/download journeys.
- **Acceptance:** Each product's preview matches the approved current file; attachment filename/version and public handle are recorded; advertised delivery wording matches reality; an authorised controlled purchase delivers the correct file to the test customer; analytics records at most one purchase. Metadata, a local ZIP or a checkout URL alone is not fulfilment evidence.

### 4. Genuine client case studies/testimonials — small/medium, approximately 1–2 days after evidence is approved

- **Benefit:** Real delivery evidence can replace or complement fictional demonstrations without overstating outcomes.
- **Dependencies:** Every item in `docs/CLIENT_EVIDENCE.md`, including written permission, approved identity/screenshots, actual scope and sourced measurement windows for any claimed outcome.
- **Acceptance:** Each published card distinguishes client work from internal projects/demos, uses only approved wording/images, links to the approved destination, and includes no invented testimonial, revenue, conversion or delivery claim. Items lacking evidence remain unpublished.

### 5. Browser regression coverage in CI — medium, approximately 1–2 days

- **Benefit:** Responsive navigation, authentication screens and JARVIS behaviour are checked on every proposed change rather than only during audits.
- **Dependencies:** A pinned CI-compatible Chromium runtime and promotion of the local read-only harness into a stable one-active-tab suite with artefact storage.
- **Acceptance:** CI covers 320/390/768/1440 px policy, focus/Escape/restoration, navigation close, horizontal overflow, console/request failures and signed-out enquiry gating. Tests never submit enquiries, use real carts/checkout, delete accounts or call paid AI; failures retain screenshots/results.

### 6. Notification and operational-health monitoring — medium, approximately 2–4 days

- **Benefit:** Failed/unknown deliveries and scheduler failures become visible before customers or leads are lost.
- **Dependencies:** Authorised logging/monitoring access, an approved alert destination, deployed delivery-state schema/function and scheduler, plus a retention/redaction policy.
- **Acceptance:** Controlled failures produce actionable alerts with a correlation ID and no unnecessary customer PII; failed/unknown states and retry attempts are visible; stale processing claims and missed scheduler heartbeats alert; recovery links to `docs/OPERATIONS.md`; provider idempotency prevents duplicate confirmed sends.

## Measured maintenance follow-up

- A cold-cache local production-preview home load recorded 72 same-origin requests and 60 scripts, including the 502.50 kB main entry and 304.64 kB schema chunk. Profile and propose module/lazy-loading boundaries as a separate change with before/after route-level measurements; do not alter Lovable's supplied Vite/Nitro plugins merely to silence warnings.
- Review the 16 Fast Refresh warnings separately from customer features. No broad refactor or blanket suppression is justified by the current evidence.

## Superseded or deliberately unchanged

- The old route-tree conflict is superseded; current route generation and production build run.
- Original profile migrations/backfills and dependency overrides remain intact.
- `/templates` remains available but was removed from shared navigation to reduce overlap with `/shop`; no URL redirect is needed.
- No major redesign, new paid tool, automatic customer messaging, fake testimonials or invented outcomes were added.
- No deploy, push, production migration, real enquiry/message, order, charge, DNS change or real account deletion was performed.
