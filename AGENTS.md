<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- MCP server lives in src/lib/mcp (public, no auth; only public content plus lead inserts via anon client); account profiles stay private to their owner through database RLS.
- Register profile schema changes through the migration tool; retain the original profile migration and use additive follow-ups for grants and existing-account backfills so deployed account forms remain compatible.

- Interactive demo content lives in src/content/demos.ts and renders through DemoSite; portfolio, hero and /demo/$kind share it so previews match their full destinations. Demo bookings and bags stay local and never send leads or payments.
- Use the global sans heading style for readable content; reserve font-display for branding, and keep theme colours in src/styles.css.
- The guided Services preview builder shares the estimate calculator and service prices; all enquiry submissions use the existing lead flow to avoid duplicate pricing or delivery logic.
- Keep patched transitive dependency overrides until upstream packages adopt compatible fixed releases; this prevents known vulnerable versions returning during installs.
- Concept pages (public/concept/*.html) report views to public.concept_views; anyone may insert, only enquiry owners (is_enquiry_owner()) can read them, shown in the owner /enquiries "Concept page views" panel.
- These repository instructions are self-contained. There is no `RTK.md` dependency in this project; do not follow stale external references to one.
- Service/pricing structured offers share src/lib/service-schema.ts and current content data, so fixed, from and monthly prices remain consistent with the visible tiers.
- Product page metadata reads Shopify SEO titles with the product-name fallback; never rename products to shorten search titles.
