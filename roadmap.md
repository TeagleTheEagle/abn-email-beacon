## Direction (Ben's plan, 20 Oct 2026)

Read this first: it's where the business is heading. Lovable, Claude and Shopify all work toward it.

- **Business:** Teague Industries builds websites (A$500), Shopify stores (from A$1,200), Smart Store AI setups (from A$2,000) and Care Plans (from A$49/mo) for Australian small businesses, starting on Sydney's Lower North Shore. The hook is a free preview first: pay only if you love it.
- **Goal now:** land the first 5 paying clients through warm-network outreach, Lower North Shore direct outreach and a Flying Solo intro; Google Ads later.
- **Shop:** digital products in Shopify (templates, playbooks, prompt packs, a 48-hour audit; A$19–149), aimed at Aussie small businesses and creators. Shopify is the single source of truth for products (see CLAUDE.md).
- **Next on the site:** working checkout (below), live demo pages (/demo/cafe, /demo/tradie …), real client case studies once won (no fake testimonials), a booking link.
- **Ben's setup to-dos:** business email on the domain, Google Search Console, Google Business Profile, business phone when needed, invoicing for the A$500 builds.

## Open issues

- [x] Approved 23 Oct attention fixes: patched vulnerable transitive packages and replaced checkout provider branding. All 10 tests pass, build OK, cart-to-branded-checkout verified without ordering, MCP catalog extraction passes, and dependency scan reports no known vulnerabilities. Home-screen support stays manifest-only; offline use was not requested. Real-phone installation and Google indexing still need external verification.
- [x] Ben's 100%-off checkout test discount: unlimited uses (Ben's request, code kept private). Shopify set an end date of 22 Oct 2027.
- [x] Add a guided free-preview builder on Services and replace visitor-facing Shopify branding with Websites and Stores; preserve store and checkout connections. Provider identity remains in Privacy; technical URLs stay intact. Two store product names updated live.
- [x] Remove AI-made positioning from service descriptions while keeping actual automation inclusions clear. Live goods do not claim AI-made; the genuine AI prompt product still describes its purpose.
- [x] Requested visual refresh: readable typography, visible desktop navigation, preview-led hero, early portfolio, detailed service cards, founder introduction and working interactive demos.
- [x] Branded email set up (22 Oct 2026): benteague@teagueindustries.com.au is now the public contact address in src/content/site.ts (footer, contact page, structured data, MCP). Lead notifications still go to Gmail until `LEAD_NOTIFY_TO` is set in Lovable Cloud
- [x] **Checkout fixed (20 Oct 2026):** Shopify's primary domain was www.teagueindustries.com.au (served by Lovable), so checkout links hit the site's 404 page. Primary domain is now jk1j1p-c5.myshopify.com; re-tested live: Add to cart → Checkout opens Shopify checkout with the product, A$29.00, and Shop Pay/PayPal/Google Pay/card.
- [x] Branded checkout live (20 Oct 2026): shop.teagueindustries.com.au connected in Shopify and set as primary; record present on all three nameservers; HTTPS works; cart → checkout tested on the live site. Shopify may still warn about the A-record value, but checkout works — leave the DNS as is.
- [x] Lead notification emails built (20 Oct 2026): forms call the `notify-lead` edge function after saving; it emails Ben (reply-to = enquirer) and, once a sender domain is verified, an auto-reply. Also fires from the MCP `request_free_preview` tool.
- [x] Lead emails switched on (20 Oct 2026): Resend key added, `notify-lead` deployed, live test enquiry "TEST – email check (delete me)" sent and the function returned ok — Ben to delete that test lead
- [ ] Customer auto-reply: verify teagueindustries.com.au in Resend (DNS records) and set `LEAD_FROM` secret to `Teague Industries <benteague@teagueindustries.com.au>` — Ben
- [x] Google Analytics 4 wired up (20 Oct 2026): page views plus generate_lead / add_to_cart / begin_checkout events; Privacy policy updated. Off until an ID is set.
- [x] Analytics switched on (20 Oct 2026): measurement ID G-C323SX5LEQ in `.env`, tag confirmed on the live site
- [x] Site test follow-ups (20 Oct 2026): contact "Current website" accepts `mysite.com.au` (https:// added automatically); unknown product URLs return a real 404; Product structured data (price/availability) on product pages; H1 on each demo page; menu button label toggles; form fields flagged `aria-invalid` with `role="alert"` errors; shop image links labelled
- [x] /design-system reference page (20 Oct 2026): brand, type scale, colour swatches read live from styles.css, effects, demo themes, buttons, forms, surfaces, feedback. Unlisted, noindex, not in nav or sitemap.
- [x] Client journey "From first message to live site" (20 Oct 2026): four steps with timing and the 100%-ownership promise, shared by the home "Preview. Approve. Launch." section and the contact page; copy lives in `steps` in src/content/site.ts
- [x] Instant estimate calculator on /pricing (20 Oct 2026): business type → build (Website / Shopify / Smart Store) → optional Care Plan → live estimate; "Lock in my free preview" saves a lead with the choices and emails Ben. Prices come from src/content/services.ts (`fromAud`)
- [x] Second audit fixes (20 Oct 2026): demo booking/request forms now scroll into view and focus when opened (they existed but were off-screen); primary blue darkened to #2a74dc so white button text passes WCAG AA (4.5:1); inline text links underlined; phone menu rebuilt on the Sheet (Escape closes, focus trapped, page scroll locked); contact fields get ids, aria-required and linked error text; per-service alt text; demo images converted to 1024px WebP (500 KB → 190 KB) with the hero preview fetched first; first shop image loads eagerly; Inter 800 weight dropped; skip link; "Last updated" on Privacy and Terms; duplicate "Coming soon" label on Work fixed
- [x] Third audit fixes (21 Oct 2026): fonts self-hosted from /public/fonts (no render-blocking Google Fonts request, Inter preloaded); demo images get 640px variants with srcset/sizes; Shopify images requested at slot size via the CDN `width` param with srcset; underline rule widened to the footer and all inline-link-coloured links; salon demo date placeholder; Privacy now lists the home and pricing forms; Terms gained Revisions and Care Plan sections
- [ ] **Ben to confirm the Care Plan clause now in Terms**: month-to-month, billed monthly, stop any time by email, ends at the close of the billing month. Change it if that's not the policy you want
- [x] Security + cache headers set in src/start.ts (X-Frame-Options, CSP frame-ancestors, Permissions-Policy, Referrer-Policy, nosniff; HTML gets a 5-minute shared cache). A script CSP is deliberately not set (inline hydration/analytics scripts). Verify on the live site after publish; cold-start TTFB is still the host's
- [ ] Unused JavaScript (~197 KB) is framework/router code; not actionable without changing the stack
- [ ] Audit claims checked and not true: analytics sends ~3 requests per visit, not 130; FAQPage and LocalBusiness-style (ProfessionalService) JSON-LD are already on the home page
- [ ] Decided against for now: proposal page (build around the first real prospect), more demo industries, selling the design system as a product, social templates
- [ ] From the same test, not code changes: small label text on phones (Lovable's design choice, revisit if it bothers users); X-Frame-Options / Content-Security-Policy headers are a hosting setting in Lovable, not in this repo
- [x] Deleted the "TEST – site check (delete me)" lead from the leads table (done in Lovable, 20 Oct 2026)
- [x] Lovable Project Knowledge includes the roadmap/CLAUDE.md pointer and the Shopify rules (products in Shopify; primary domain must not be www)

## Audit follow-ups (20 Oct 2026)

- [x] Hide Lovable badge; tab title; remove legal "template" banner; store links -> /shop; remove "Most popular"; care plan price label; flag emoji
- [x] Privacy: Shopify checkout, analytics, cookies
- [x] Terms: download refunds + ABN
- [x] Business email on own domain — benteague@teagueindustries.com.au (22 Oct 2026)
- [x] Starting prices
- [x] Founder photo on About page; phone number left off at Ben's request; suburbs done
- [x] Demo sites, structured data, 404 title, honeypot, WebP hero
- [ ] Nav merge, product page detail (not yet requested)

## Requested checks (20 Oct 2026)

- [x] Publishing completed by Ben; business email deferred
- [x] Both domains active; HTTPS and bare-to-www redirect checked without DNS changes
- [x] Reviewed published Privacy and Terms: business details/refund match; privacy access/tracking claims need confirmation, not legal approval
- [x] Checked growth readiness: shop buttons correct; sitemap omits shop/products; recommended Search Console then five-business-owner outreach
- [x] Google Search Console connected by Ben (22 Oct 2026): property verified, sitemap submitted, indexing requested for home, services, pricing and shop. Check indexing status in a week

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

## Site check follow-ups (22 Oct 2026)

- [x] Care Plan price note now reads "/month" everywhere (calculator showed "A$49/ month" while the FAQ said "A$49/month")
- [ ] Store Setup and Smart Store Setup share the retail demo photo on /services — Ben to say if he wants a different image for one of them
- [x] Shop and product pages cache the Shopify answer on the server for 60s (22 Oct 2026, `src/lib/ttl-cache.ts`): repeat visits render without waiting on Shopify; empty or failed answers are never kept, and the cart is never cached. Product edits in Shopify can take up to a minute to show
- [ ] Lovable's hosting replaces the 5-minute HTML cache header from src/start.ts with no-cache. Hosting setting, nothing to change in the repo

## Wording (22 Oct 2026)

- [x] "Small business" dropped from all visitor-facing copy (page titles, descriptions, About, MCP description): the audience is now "businesses of every size" / "all businesses", so outreach never reads as sizing anyone up

## Visual refresh (22 Oct 2026)

Ben asked for every item on the eye-catching list. Done in code:

- [x] Product covers on the home page (four from the shop, read from Shopify with a 1.5s cap so the page never waits)
- [x] Prices solid, bold and warm everywhere (new `Price` component; `--accent-warm` token for prices, ticks and the free-preview badge)
- [x] Off-white "Preview. Approve. Launch." band (`band-light` utility remaps the tokens; one per page)
- [x] Hero: moving glow, free-preview badge, preview cycles Café → Trades → Salon → Retail and scrolls on its own until touched (stands in for a video)
- [x] Secondary text lightened (`--muted-foreground`), page headers trimmed, wordmark larger
- [x] Phone headline sized to keep "Websites and Stores." on one line
- [x] Services photos varied (Smart Store now shows the templates store)
- [x] Before/after section on the home page (dated café page built in markup next to the demo)
- [x] "Works with" row (Google Maps, Google Business Profile, Instagram, PayPal, Apple Pay, Google Pay) as text, no logos
- [x] Cards lift on hover and press on tap (`glass-hover`)
- [x] Sticky "Get a free preview" bar on phones after scrolling past the hero (not on contact or demo pages)
- [x] About page: four number facts replace the icon cards
- [ ] Real logos in the "Works with" row need brand assets and permission — Ben to decide
- [ ] A real 15-second phone recording of a demo site would beat the auto-playing preview — Ben to record or ask Claude to produce one

## Industrial-tech direction (22 Oct 2026)

Ben's brief: premium industrial-tech, "advanced technology company" not "online store". 70% industrial design, 20% futuristic tech, 10% subtle HUD. The brief assumed physical products (materials, dimensions, account menus); applied to what Teague actually sells.

- [x] Palette: near-black #05070A, graphite #10151B, titanium #C4CDD6, one cyan accent #54D9FF (buttons have near-black text). Amber accent retired; off-white band removed
- [x] Typography: tighter, larger headings; Michroma technical labels ("TEAGUE INDUSTRIES / BUILT IN SYDNEY / EST. 2026", "01 / FEATURED", "SERVICE 01")
- [x] Hero: full-screen, faint grid, slow scan line, corner marks on the preview, coordinates label
- [x] Oversized featured product (the 48-hour audit) with a specification sheet and hover callouts; scroll-driven scale where supported
- [x] "Under the hood" engineering-detail section: zoomed demo crop beside a spec list
- [x] Cards: small radii, thin borders, illumination on hover instead of shadows; numbered sections with a hairline that grows in
- [x] Nav turns into a blurred graphite bar on scroll
- [ ] Not done, by design: materials/dimensions specs, search and account icons (no accounts exist), a full-screen product video (needs footage), a "lifestyle" photo band (needs real photography)
- [ ] Demo screenshots (café, trades, salon, retail) are light-themed by nature; only the shop covers follow the dark studio look

## Two outside reviews (22 Oct 2026)

Ben pasted a ChatGPT review and a Gemini review. Claims were checked against the code first; several were wrong (the hero already defaulted to the café, not retail). Fixed now:

- [x] Shop added to the main navigation
- [x] Home page reordered: packages, engineering, smart store, before/after, work, process, founder, then the audit (now introduced as "Already have a website?"), shop, FAQs
- [x] Hero sub-copy states the A$500 and A$1,200 prices and the audience
- [x] Before/after is a realistic dated page (no visitor counter or "nephew" joke) and both sides are labelled illustrative concepts
- [x] "Nothing render-blocking" narrowed to "optimised images and self-hosted fonts"; engineering crop now uses the salon demo so the café isn't on screen five times
- [x] Trades and salon demos no longer share the "A little expertise goes a long way" heading (DemoSite reads `itemsTitle` from demos.ts)
- [x] "Café Website Starter Kit (Demo)" renamed "Café Website (Demo)" so it isn't confused with shop kits; founding-clients card highlighted
- [x] Services H1 is "Websites and online stores built to win more customers"; home page says "No GST is charged" (pricing page keeps the full explanation)
- [x] Pricing page differs from Services: "Why A$500?" box and the money-related FAQs, reused from the shared list
- [x] Contact step 01 no longer says "two fields" beside an eight-field form; email link on Contact sized so it stays on one line
- [x] Footer: duplicate "Templates store → Shop" line removed
- [x] Shop header no longer calls everything an instant download; cards show "Instant download" or "Delivered in 48 hours"
- [x] About page lists the Lower North Shore suburbs

Ben's decisions (not done):

- [x] Google Search Console: verified and sitemap submitted by Ben (22 Oct 2026)
- [ ] Footer slogan "PEOPLE | TECHNOLOGY | A BRIGHTER TOMORROW": Gemini wants something local and plain. Brand call; note the audience rule (no "small businesses")
- [ ] "We" vs "I": company voice on steps/FAQs, Ben's voice on About and the founder section. Consistent enough as a pattern; change only if Ben wants first person everywhere
- [ ] Scope caps for store tiers (e.g. "up to 25 products loaded, CSV import for more") and measurable promises per package; needs Ben's numbers
- [ ] Ongoing costs (hosting, domain renewal, platform plan) spelled out beside the prices; needs Ben's hosting setup
- [ ] What the free preview includes (homepage concept or full build) and exactly when payment is due; FAQ says "only pay if you go ahead", Ben to confirm the detail
- [ ] Product pages: who it's for, contents, actual previews, file format, software needed, licence. Needs real screenshots of the files and Ben to set format in Shopify
- [ ] Shop line-up: both reviews say the creator products (media kit, bio-link kit, Solo Hustle OS) sit oddly next to products for business owners. Options: hide them, move them to a separate collection, or replace with local-business toolkits
- [ ] Move the A$149 audit onto Services/Pricing as an entry-level diagnostic (it is already featured on the home page)
- [ ] New products suggested by both reviews: industry website starter kits (DIY, with the A$500 build as the done-for-you upgrade), Google Business Profile & review kit, enquiry tracker spreadsheet, quote-to-cash SMS/email script vault, local SEO playbook. All test prices, no demand evidence
- [ ] New services suggested: business email setup, booking system setup, missed-call text-back, quote/invoice chaser automation, Google Maps & review engine, website fix sprint (implement the audit's findings), product listing pack, a second Care Plan tier around A$149/mo
- [ ] Testimonials and case studies once real clients launch (permission-based)
- [ ] Measuring the buying journey: page views, preview requests, add-to-cart and begin-checkout are already tracked in GA4; completed purchases need GA4 connected in the Shopify checkout settings (Ben, in Shopify admin)
- [ ] Not taken up: "Most popular" badge on Pricing (Ben had it removed earlier); replacing the space/rocket cover art (Ben chose it); midnight-navy palette (the industrial-tech brief is newer)

## Ben approved the review decisions (22 Oct 2026)

Done on the site:

- [x] Store tiers capped: "Up to 25 products loaded and formatted (bulk CSV import for larger catalogues)"
- [x] Two Care Plans: Essentials A$49/month (hosting, SSL, daily backups, uptime and security checks, two small edits a month, monthly report, priority support) and Local Growth A$149/month (Essentials plus missed-call text-back, a monthly Google Business Profile update, automated review requests, monthly lead report). Side by side on Services and Pricing; the calculator offers both
- [x] Eight fixed-scope add-ons with launch test prices on Services and Pricing: 48-Hour Audit A$149 (credited), Website Fix Sprint from A$299, Business Email Setup A$199, Booking System Setup A$349, Enquiry & Quote Follow-up A$399, Missed-Call Text-Back A$299 + A$79/month, Google Business Profile & Reviews A$299, Product Listing Pack A$249. Data in `addOns` in services.ts; the MCP list_services tool returns them too
- [x] New FAQs: what the free preview includes, when you pay, what the ongoing costs are (also on the Pricing page). **Ben to confirm the wording matches how he actually works**, especially hosting without a Care Plan and the "home page and key pages" preview scope
- [x] Footer slogan is now "FAST, HONEST WEBSITES AND STORES FOR AUSTRALIAN BUSINESSES"
- [x] Creator products hidden: TikTok Bio-Link Kit, Creator Media Kit and Solo Hustle OS set to Draft in Shopify (not deleted; flip back to Active to restore). Removed from the sitemap
- [ ] Not reversed: "Most popular" badge, cover art, navy palette (Ben's earlier choices stand)

Next: the first three digital products (Tradie Website Starter Kit, Google Business Profile & Review Kit, Enquiry Tracker) as real files, with draft Shopify products. Shopify's upload tool opens a file picker on Ben's side, so Ben attaches each file in the Digital Products app and sets the product to Active.

## First three digital products (22 Oct 2026)

Built as real files in `products/` (git-ignored; on Ben's machine only) and created in Shopify as **Draft** products with description, price and a dark-studio cover:

| Product                                                                                                               | Price | Shopify handle (draft)             | Zip to attach                                   |
| --------------------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------- | ----------------------------------------------- |
| Tradie Website Starter Kit (one-page HTML/CSS site, setup guide PDF)                                                  | A$99  | tradie-website-starter-kit         | products/Tradie-Website-Starter-Kit.zip         |
| Google Business Profile & Review Kit (guide PDF, 10 request scripts, response templates, A5 counter sign; Word files) | A$39  | google-business-profile-review-kit | products/Google-Business-Profile-Review-Kit.zip |
| Small Business Enquiry Tracker (Excel/Google Sheets workbook with dashboard)                                          | A$49  | small-business-enquiry-tracker     | products/Small-Business-Enquiry-Tracker.zip     |

- [x] **Ben, per product (two minutes):** Shopify admin → Apps → Digital Products → open the product → attach the zip from `products/`; then Products → open it → Status: Active → Save. Shopify's upload tool can only open a file picker on Ben's side, so Claude can't attach the files
- [x] All three Active and published to the Online Store and Lovable channels (22 Oct 2026); pages added to `public/sitemap.xml`
- [ ] Ben to open each file once before selling it (the Word templates and the spreadsheet especially) and say if any wording should change; Claude regenerates them from source
- [ ] Next batch when these show sales: industry social media kits, café menu & QR kit, pricing/estimate calculator, client onboarding kit, brand essentials kit, local SEO playbook, quote-to-cash script vault

## Ben approved the three reversals (22 Oct 2026)

- [x] "Most popular" badge back on the Website Build card on Pricing (solid cyan button, highlighted border)
- [x] Palette moved from near-black to midnight navy (#070C17 background, #0E1626 surfaces); cyan accent and titanium labels unchanged; manifest and theme colour updated
- [x] Cover art replaced: all nine shop products now have consistent covers in the site's style (navy studio background, faint grid, corner marks, a clean UI mock-up of what the product is). The AI "space" art is removed from the products. Generated from `covers2.js` in Claude's scratchpad; PNGs kept in `products/covers/`
- [ ] Second batch of digital products stays parked until the first three show sales, as both reviews advised

## Outreach: first five clients (24 Oct 2026)

- [x] Prospect list: 16 Lower North Shore businesses with no website (cafés, barbers, nail salons, dry cleaner, alterations, one electrician), each verified open on Google Maps, with a ready-to-send message per business. Lives in `outreach/` on Ben's machine, deliberately untracked (other businesses' contact details)
- [x] Free previews pre-built for the three strongest prospects so the first message carries a link: `/preview/frank-and-michael`, `/preview/lil-lane-eatery`, `/preview/birdwood-cafe`. Content in `src/content/previews.ts`, page in `src/components/ClientPreview.tsx`; noindex, no nav or footer, not in the sitemap. Photos are placeholders until the client supplies theirs
- [ ] Ben to send the messages (email, DM or walk-in; Google lists phones, not emails) and name whoever says yes; Claude builds that preview next
- [ ] When a preview is approved: swap in the client's photos, confirm services, prices and hours, connect their domain and launch
