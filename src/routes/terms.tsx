import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/Reveal";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => seo("/terms", "Terms", "Plain-English terms for working with Teague Industries: quotes, deposits, free previews, ownership and refunds."),
  component: Terms,
});

function Terms() {
  return (
    <>
      <PageHeader label="Template: review before publishing" title="Terms" />
      <article className="mx-auto max-w-2xl space-y-8 px-6 text-muted-foreground [&_h2]:text-sm [&_h2]:text-foreground">
        <section><h2>Quotes and deposits</h2><p className="mt-3">Quotes are valid for 30 days. Larger projects may need a deposit before work starts, agreed in writing.</p></section>
        <section><h2>Free previews</h2><p className="mt-3">Previews are free with no obligation. If you don't go ahead, you owe nothing.</p></section>
        <section><h2>You own your content</h2><p className="mt-3">Your content, domain and accounts belong to you.</p></section>
        <section><h2>Refunds</h2><p className="mt-3">Refunds are handled in line with the Australian Consumer Law.</p></section>
      </article>
    </>
  );
}
