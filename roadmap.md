## Direction (Ben's plan, 20 Oct 2026)
Read this first: it's where the business is heading. Lovable, Claude and Shopify all work toward it.
- **Business:** Teague Industries builds websites (A$500), Shopify stores (from A$1,200), Smart Store AI setups (from A$2,000) and Care Plans (from A$49/mo) for Australian small businesses, starting on Sydney's Lower North Shore. The hook is a free preview first: pay only if you love it.
- **Goal now:** land the first 5 paying clients through warm-network outreach, Lower North Shore direct outreach and a Flying Solo intro; Google Ads later.
- **Shop:** digital products in Shopify (templates, playbooks, prompt packs, a 48-hour audit; A$19–149), aimed at Aussie small businesses and creators. Shopify is the single source of truth for products (see CLAUDE.md).
- **Next on the site:** working checkout (below), live demo pages (/demo/cafe, /demo/tradie …), real client case studies once won (no fake testimonials), a booking link.
- **Ben's setup to-dos:** business email on the domain, Google Search Console, Google Business Profile, business phone when needed, invoicing for the A$500 builds.

## Open issues
- [ ] **Checkout broken (found 20 Oct 2026):** Shopify's primary domain is www.teagueindustries.com.au, which Lovable serves, so checkout links go to the site's 404 page. Fix in Shopify → Settings → Domains: make jk1j1p-c5.myshopify.com primary (quick), or connect shop.teagueindustries.com.au (CNAME `shop` → `shops.myshopify.com`) and make that primary (branded). Ben to do; then re-test checkout.
- [ ] Delete the "TEST – site check (delete me)" lead (sitecheck@example.com) from the leads table — Ben

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
- [ ] Live demo pages (/demo/cafe, /demo/tradie, …), booking link — not yet requested
- [ ] Google Business Profile (service-area, Lower North Shore) — Ben to set up
