# Teague Industries website

Marketing site, interactive demos, digital shop and client accounts for Teague Industries.

- Production: https://www.teagueindustries.com.au
- Lovable project: https://lovable.dev/projects/3558f9ce-cbe6-4a1a-b3ba-cff533474cd4
- Stack: TanStack Start, React, TypeScript, Supabase, Shopify, Tailwind and Lovable

## Local development

Use the committed `bun.lock` in Lovable/CI and locally. If Bun is not installed globally, invoke it through `npx --yes bun`.

```sh
npx --yes bun install
npx --yes bun run dev
```

Do not commit `.env`, real customer exports or the ignored `products/` files. Never put service-role, Resend or Google AI private keys in browser values.

## Checks

```sh
npx --yes bun x tsc --noEmit
npx --yes bun run test
npx --yes bun run lint
npx --yes bun run build
npx --yes bun audit
```

CI uses the equivalent Bun commands and installs with `bun install --frozen-lockfile`.

## Project guides

- `CLAUDE.md` — architecture and implementation constraints
- `AGENTS.md` — repository/Lovable rules; self-contained, with no `RTK.md` dependency
- `PROJECT_CONTEXT.md` — verified current state and superseded notes
- `roadmap.md` — ordered open work and external dependencies
- `docs/OPERATIONS.md` — setup, release, fulfilment and recovery checklist
- `docs/CLIENT_EVIDENCE.md` — evidence required before publishing client claims
- `supabase/functions/notify-lead/README.md` — notification delivery, retry and scheduler setup

Do not rewrite published Git history. Pushing `main` synchronises with Lovable, but local changes are not deployed fixes until separately applied and verified.
