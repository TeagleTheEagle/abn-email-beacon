# Teague Industries roadmap

**Current as of:** 17 November 2026
**Local only:** The reliability work below is not committed, pushed, deployed or applied to production.

Historical notes are preserved in `docs/archive/roadmap-2026-11-17.md`. Historical claims in that archive were not all reverified.

## Implemented and verified locally

- Notification lifecycle handler, idempotency, independent recipient state and owner-visible retry workflow.
- Cart success/failure results, failure alerts, expired-cart recovery, serialised mutations and success-only add-to-cart events.
- Password verification, Google-only setup flow, sign-out failures and late-profile protection.
- Real mobile JARVIS opening/focus, one mobile action system and safe-area/page padding.
- Product-specific delivery/support wording and two actual conversion-playbook preview pages.
- Request validation, precise origins, shared production limiter code, enquiry database throttle and mode-aware AI environment loading.
- Owner-only enquiry pipeline and source/stage analytics without contact details in analytics payloads.
- Lazy showroom implementations with loading/error states.
- CI typecheck, tests, lint and production build steps.

See `PROJECT_CONTEXT.md` for implementation boundaries and `docs/OPERATIONS.md` for the operational checklist.

## Prepared, awaiting deployment or external approval

1. **Database and functions:** Review deployed schema, apply migrations `0004`–`0006`, deploy `notify-lead`, assign the owner UUID and configure/observe retry scheduling.
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

- Production schema parity and multi-connection concurrency. Fresh/upgrade PGlite execution, RLS/grants, data retention and sequential claim/counter checks passed; a real Supabase test environment remains unverified.
- Real email arrival, provider idempotency behaviour, scheduler runs and production retry concurrency.
- Real Supabase authentication/provider/account-deletion journeys.
- Real Shopify writes, stock rejection, checkout completion or file delivery.
- Full mobile browser, keyboard, screen-reader, text-zoom and reduced-motion experience.
- Live sitemap/404/SEO state after these local changes.
- Whether production AI/hosting spending and rate-limit settings are enabled.

## Superseded or deliberately unchanged

- The old route-tree conflict is superseded; current route generation and production build run.
- Original profile migrations/backfills and dependency overrides remain intact.
- `/templates` remains available but was removed from shared navigation to reduce overlap with `/shop`; no URL redirect is needed.
- No major redesign, new paid tool, automatic customer messaging, fake testimonials or invented outcomes were added.
- No deploy, push, production migration, real enquiry/message, order, charge, DNS change or real account deletion was performed.
