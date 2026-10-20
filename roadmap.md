## Direction (Ben's plan, 20 Oct 2026)
Read this first: it's where the business is heading. Lovable, Claude and Shopify all work toward it.
- **Business:** Teague Industries builds websites (A$500), Shopify stores (from A$1,200), Smart Store AI setups (from A$2,000) and Care Plans (from A$49/mo) for Australian small businesses, starting on Sydney's Lower North Shore. The hook is a free preview first: pay only if you love it.
- **Goal now:** land the first 5 paying clients through warm-network outreach, Lower North Shore direct outreach and a Flying Solo intro; Google Ads later.
- **Shop:** digital products in Shopify (templates, playbooks, prompt packs, a 48-hour audit; A$19–149), aimed at Aussie small businesses and creators. Shopify is the single source of truth for products (see CLAUDE.md).
- **Next on the site:** working checkout (below), live demo pages (/demo/cafe, /demo/tradie …), real client case studies once won (no fake testimonials), a booking link.
- **Ben's setup to-dos:** business email on the domain, Google Search Console, Google Business Profile, business phone when needed, invoicing for the A$500 builds.

## Open issues
- [x] Requested visual refresh: readable typography, visible desktop navigation, preview-led hero, early portfolio, detailed service cards, founder introduction and working interactive demos.
- [ ] Branded email remains blocked until Ben provides the address; keep Gmail meanwhile.
- [x] **Checkout fixed (20 Oct 2026):** Shopify's primary domain was www.teagueindustries.com.au (served by Lovable), so checkout links hit the site's 404 page. Primary domain is now jk1j1p-c5.myshopify.com; re-tested live: Add to cart → Checkout opens Shopify checkout with the product, A$29.00, and Shop Pay/PayPal/Google Pay/card.
- [x] Branded checkout live (20 Oct 2026): shop.teagueindustries.com.au connected in Shopify and set as primary; record present on all three nameservers; HTTPS works; cart → checkout tested on the live site. Shopify may still warn about the A-record value, but checkout works — leave the DNS as is.
- [x] Lead notification emails built (20 Oct 2026): forms call the `notify-lead` edge function after saving; it emails Ben (reply-to = enquirer) and, once a sender domain is verified, an auto-reply. Also fires from the MCP `request_free_preview` tool.
- [x] Lead emails switched on (20 Oct 2026): Resend key added, `notify-lead` deployed, live test enquiry "TEST – email check (delete me)" sent and the function returned ok — Ben to delete that test lead
- [ ] Customer auto-reply: verify teagueindustries.com.au in Resend (DNS records) and set `LEAD_FROM` secret, e.g. `Teague Industries <hello@teagueindustries.com.au>` — Ben
- [x] Google Analytics 4 wired up (20 Oct 2026): page views plus generate_lead / add_to_cart / begin_checkout events; Privacy policy updated. Off until an ID is set.
- [x] Analytics switched on (20 Oct 2026): measurement ID G-C323SX5LEQ in `.env`, tag confirmed on the live site
- [x] Site test follow-ups (20 Oct 2026): contact "Current website" accepts `mysite.com.au` (https:// added automatically); unknown product URLs return a real 404; Product structured data (price/availability) on product pages; H1 on each demo page; menu button label toggles; form fields flagged `aria-invalid` with `role="alert"` errors; shop image links labelled
- [x] /design-system reference page (20 Oct 2026): brand, type scale, colour swatches read live from styles.css, effects, demo themes, buttons, forms, surfaces, feedback. Unlisted, noindex, not in nav or sitemap.
- [x] Client journey "From first message to live site" (20 Oct 2026): four steps with timing and the 100%-ownership promise, shared by the home "Preview. Approve. Launch." section and the contact page; copy lives in `steps` in src/content/site.ts
- [x] Instant estimate calculator on /pricing (20 Oct 2026): business type → build (Website / Shopify / Smart Store) → optional Care Plan → live estimate; "Lock in my free preview" saves a lead with the choices and emails Ben. Prices come from src/content/services.ts (`fromAud`)
- [ ] Decided against for now: proposal page (build around the first real prospect), more demo industries, selling the design system as a product, social templates
- [ ] From the same test, not code changes: small label text on phones (Lovable's design choice, revisit if it bothers users); X-Frame-Options / Content-Security-Policy headers are a hosting setting in Lovable, not in this repo
- [x] Deleted the "TEST – site check (delete me)" lead from the leads table (done in Lovable, 20 Oct 2026)
- [x] Lovable Project Knowledge includes the roadmap/CLAUDE.md pointer and the Shopify rules (products in Shopify; primary domain must not be www)

## Audit follow-ups (20 Oct 2026)
- [x] Hide Lovable badge; tab title; remove legal "template" banner; store links -> /shop; remove "Most popular"; care plan price label; flag emoji
- [x] Privacy: Shopify checkout, analytics, cookies
- [x] Terms: download refunds + ABN
- [ ] Business email on own domain — Ben to set up
- [x] Starting prices
- [x] Founder photo on About page; phone number left off at Ben's request; suburbs done
- [x] Demo sites, structured data, 404 title, honeypot, WebP hero
- [ ] Nav merge, product page detail (not yet requested)

## Requested checks (20 Oct 2026)
- [x] Publishing completed by Ben; business email deferred
- [x] Both domains active; HTTPS and bare-to-www redirect checked without DNS changes
- [x] Reviewed published Privacy and Terms: business details/refund match; privacy access/tracking claims need confirmation, not legal approval
- [x] Checked growth readiness: shop buttons correct; sitemap omits shop/products; recommended Search Console then five-business-owner outreach
- [ ] Google indexing/performance verification — blocked until Ben connects Google Search Console

## Photo and wording follow-ups
- [x] Footer Shop label, internal Browse templates icon, café Demo suffix and navigation separation
- [x] Adjusted founder portrait to tighter reference crop; original clothing retained as requested
- [x] Identified deployed analytics session-id cookie and corrected Privacy disclosure (30-minute refreshed expiry)
- [x] Explained no numeric revision count is currently promised; recommended two in-scope rounds without adding a policy
- [x] Revision policy set — Ben approved two rounds; added to steps, services and FAQ copy (goes live on next publish)
- [x] Redesign /about founder section: two-column glass card, 4:5 portrait, pull quote, Caveat sign-off, fact strip, buttons (verified desktop + mobile; live on next publish)

## Site test follow-ups (20 Oct 2026)
- [x] Fade-in fix: page headers and hero now animate with CSS from first paint; Reveal only hides content that starts below the fold (live site previously showed blank headings for 4–6s until JS loaded)
- [x] Hero "Teague Industries / EST. 2026" corner label and divider aligned to the content column
- [x] Sitemap: added /shop and the invoice/quote/agreement templates product page
- [x] Templates page store button: external-link icon replaced (it links to internal /shop)
- [x] Checked, no change needed: section spacing is uniform (gaps seen in testing were unrevealed sections); "Browse templates"/footer/"View live" -> /shop is intentional; honeypot already hidden from keyboard and screen readers; no internal notes left in Templates/Privacy/Terms
- [x] Three new shop products (Launch Kit A$39, Conversion Playbook A$49, 48-Hour Audit A$149) with dark-space covers; sitemap updated with their pages
- [ ] Cover artwork for the original Invoice/Quote/Agreement templates product — not yet requested
- [x] Live interactive demo pages for café, tradie, salon and retail; local-only menu filtering, sample request/booking forms and demonstration bag.
- [ ] Optional real booking link — requires Ben's chosen booking service URL.
- [ ] Google Business Profile (service-area, Lower North Shore) — Ben to set up
