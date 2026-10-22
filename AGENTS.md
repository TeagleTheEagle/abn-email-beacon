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
- MCP server lives in src/lib/mcp (public, no auth; only public content plus lead inserts via anon client) — site has no user accounts.

- Interactive demo content lives in src/content/demos.ts and renders through DemoSite; portfolio, hero and /demo/$kind share it so previews match their full destinations. Demo bookings and bags stay local and never send leads or payments.
- Use the global sans heading style for readable content; reserve font-display for branding, and keep theme colours in src/styles.css.
- The guided Services preview builder shares the estimate calculator and service prices; all enquiry submissions use the existing lead flow to avoid duplicate pricing or delivery logic.
