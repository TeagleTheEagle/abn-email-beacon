---
name: ship-and-check
description: Ship changes to the Teague Industries website and check the site actually works. Use this whenever the user wants to commit, push, ship, deploy or publish changes in this repo ("commit and push", "push to main", "ship it", "send it to Lovable"), asks whether the live site is up to date with the code ("are both up to date", "did my changes go live", "is teagueindustries.com.au on the latest version"), or wants the site tested ("test the site", "check every page", "take screenshots", "does it work on mobile", "any broken links or console errors", "why is the page blank/slow"). Works against localhost:8080 or the live site.
---

# Ship and check

This repo is the Teague Industries site (see CLAUDE.md). It is connected to Lovable: a push to `main` syncs into the Lovable editor, but **nothing goes live until the user clicks Publish → Update in Lovable**. The live site is https://www.teagueindustries.com.au (also https://abn-email-beacon.lovable.app).

There are three jobs. Do the ones the request asks for:

| Request                                                | Do                                           |
| ------------------------------------------------------ | -------------------------------------------- |
| "commit and push", "ship it"                           | 1. Ship, then offer 2 once they've published |
| "is the live site up to date?", "are both up to date?" | 2. Verify live (and check git is pushed)     |
| "test the site", "check mobile", "broken links?"       | 3. Site check                                |
| "ship it and check it"                                 | 1 → (user publishes) → 2 → 3 against live    |

Scripts are in `.claude/skills/ship-and-check/scripts/`. They need Node 22+ and Chrome or Edge (set `CHROME_PATH` if it's somewhere unusual). Write their output to the session scratchpad, not the repo.

## 1. Ship: commit and push to `main`

`main` must always build, because Lovable builds from it, and its history must never be rewritten, because that destroys the user's Lovable history.

1. **See what's there.** `git status --short` and `git diff --stat`. If there is nothing to commit and nothing unpushed, say so plainly and offer to verify the live site instead.
2. **Review the diff.** Leave out secrets (`.env`), build output (`.output/`, `.wrangler/`, already ignored), scratch files and `package-lock.json` (untracked on purpose; `bun.lock` is the real lockfile). Stage files by name rather than `git add -A`, so nothing unexpected sneaks in.
3. **Check it works** before it reaches Lovable:
   - `npx tsc --noEmit`
   - `npm test`
   - `npm run build` if code changed (skip for docs-only changes). It catches build failures that the dev server hides.
   - `npm run lint` must report 0 errors (warnings in `src/components/ui` are fine). The repo was fully Prettier-formatted on 22 Oct 2026, but Lovable doesn't format its commits, so after pulling run `npm run format` and include any reformatted files in your commit. Generated files (`src/integrations/supabase`, `.lovable`, `AGENTS.md`, `routeTree.gen.ts`) are in `.prettierignore` and stay as Lovable writes them.

   If something fails, fix it or tell the user. Don't push a broken `main`.

4. **Commit** with a plain-language summary line, plus a short body explaining why. End the message with the attribution lines this session's instructions specify. If the change completes something in `roadmap.md`, tick it off in the same commit, since the repo tracks the user's requests there.
5. **Sync, then push.** Run `git fetch origin main`. If Lovable has pushed new commits, run `git pull --rebase origin main`. That only replays your new, unpushed commits on top of theirs, which is safe. If it conflicts, stop and explain. Then `git push origin main`. Never use `--force`, and never amend, rebase or squash commits that are already on GitHub.
6. **Tell the user** the commit hash and what's in it. Make clear it's on GitHub and in Lovable but **not live until they click Publish → Update** in Lovable, and offer to check the live site once they have.

## 2. Verify the live site matches the code

```sh
node .claude/skills/ship-and-check/scripts/compare-live.mjs
# other domain:  --live https://abn-email-beacon.lovable.app
# some pages:    --pages about,contact
```

It fetches every sitemap page from the local dev server and the live site. It compares their visible text, CSS classes, inline styles and links, and prints ✓ for a match or the differing lines for each page. The header warns if you have uncommitted or unpushed work, which would make local differ for reasons that aren't about publishing.

- It needs the dev server on `localhost:8080` serving the commit you're checking. If the server isn't running, start it in the background (`npm run dev`) and wait for its `Local:` line.
- Run `git fetch` and confirm `main...origin/main` is in sync, so you also know GitHub has the code.
- **Interpreting it:** all ✓ means live is running this code. If pages differ and the `+ local` lines match recent commits, the user hasn't published yet. If the `- live` lines show things that aren't in the repo, someone changed the site in Lovable without that change reaching git. Fetch, and tell the user.
- **`/shop` and `/product/…` render Shopify data on the server.** If a Shopify request is slow, often during a cold start, one fetch can come back without the product cards and look like a big difference. Re-run that page with `--pages shop` before concluding anything.
- **Blind spots:** it reads server-rendered HTML. A change that only touches `src/styles.css` (a new keyframe, a colour token) won't show. For those, find the stylesheet in the live page's `<head>` (`/assets/styles-*.css`), fetch it, and grep for the new rule. The cart drawer and other client-only UI aren't compared either.
- "Both" can mean local + GitHub, or both domains. Cover both readings unless it's obvious.

## 3. Site check (read-only)

```sh
node .claude/skills/ship-and-check/scripts/site-check.mjs --base http://localhost:8080 --out <scratchpad>/site-check-local
node .claude/skills/ship-and-check/scripts/site-check.mjs --base https://www.teagueindustries.com.au --out <scratchpad>/site-check-live
# options: --pages about,contact   --external (also check outside links)   --no-full (skip full-page shots)
```

For every page in that site's `sitemap.xml`, at desktop (1440×900) and phone (390×844), it records:

- the HTTP status
- how long the main heading takes to become visible (flagged over 2.5s or never)
- console errors and exceptions
- failed requests
- text that never becomes visible even after scrolling
- sideways overflow on phones

It saves top-of-page and full-page screenshots, checks that an unknown URL returns the 404 page, and checks every internal link, including `#anchors`. A whole-site run takes about 2–3 minutes; give the command a 10-minute timeout. It writes `report.md` and `report.json` and prints the report.

Then:

1. Read the report. Open screenshots with the Read tool: always the home page (desktop and phone), plus every page with a problem. Look for things a script can't judge: overlapping or misaligned elements, cut-off text, odd gaps, images missing.
2. Before calling something a bug, rule out known noise:
   - **The live server can take about 4s on its first request** (a hosting cold start), then about 0.5s after that. The "Server response" column shows this, and a slow heading caused by it is labelled as server time. Re-check that page before blaming the page itself.
   - **Localhost is slower than production.** The dev server compiles on demand and injects CSS late, so heading times are pessimistic and the hero can blink. Judge "slow to appear" on the live site.
   - **`/__l5e/assets-v1/…` images 404 on localhost.** Those are Lovable-hosted uploads such as the founder photo. The script already lists them as a note, not a problem.
   - **The fixed nav bar shows up part-way down full-page screenshots.** That's a capture artefact.
   - **Big gaps in a full-page screenshot** usually mean scroll-triggered sections hadn't faded in, not a layout bug. Check the per-page "never became visible" result.
3. Fix real problems if the user wants. Then re-run just the affected pages with `--pages`.

**Stay read-only.** The scripts only load pages and scroll. Don't extend them to click, type, submit forms or use the cart. The forms write real leads into the production Supabase table, and the cart and checkout use the real Shopify store. Only test those if the user explicitly asks, and get their OK before anything that submits data or starts a checkout. Every live-site run also counts as visits in the site's analytics, so run against live when asked or after a publish, not in a loop.

## Reporting back

The user runs the business and isn't necessarily a developer, so keep it short and plain:

- **Shipped:** the commit hash and a one-line summary, plus the Publish → Update reminder.
- **Live vs code:** up to date or not, and which pages differ.
- **Site check:** a table of pages (✓ or the problem), the real problems with a suggested fix for each, and the known noise kept separate.
- **Not tested:** forms, cart and checkout, mobile menu, FAQ expanding (anything that needs a click).
