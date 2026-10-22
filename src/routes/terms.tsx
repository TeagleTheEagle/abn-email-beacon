import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/Reveal";
import { seo } from "@/lib/seo";
import { site } from "@/content/site";

export const Route = createFileRoute("/terms")({
  head: () =>
    seo(
      "/terms",
      "Terms",
      "Plain-English terms for working with Teague Industries: quotes, deposits, free previews, ownership and refunds.",
    ),
  component: Terms,
});

function Terms() {
  return (
    <>
      <PageHeader label="Legal" title="Terms" sub="Last updated 20 October 2026" />
      <article className="mx-auto max-w-2xl space-y-8 px-6 text-muted-foreground [&_h2]:text-sm [&_h2]:text-foreground">
        <section>
          <h2>Quotes and deposits</h2>
          <p className="mt-3">
            Quotes are valid for 30 days. Larger projects may need a deposit before work starts,
            agreed in writing.
          </p>
        </section>
        <section>
          <h2>Free previews</h2>
          <p className="mt-3">
            Previews are free with no obligation. If you don't go ahead, you owe nothing.
          </p>
        </section>
        <section>
          <h2>Revisions</h2>
          <p className="mt-3">
            Every website and store build includes two rounds of revisions: text, image and layout
            changes within the agreed scope. Anything beyond that, or a change of scope, is quoted
            and agreed in writing before we start it.
          </p>
        </section>
        <section>
          <h2>Care Plan</h2>
          <p className="mt-3">
            The Care Plan is a month-to-month service billed monthly, with no fixed term. It covers
            the items listed on our pricing page; larger changes are quoted separately. You can stop
            it at any time by emailing us, and it ends at the close of the current billing month.
          </p>
        </section>
        <section>
          <h2>You own your content</h2>
          <p className="mt-3">Your content, domain and accounts belong to you.</p>
        </section>
        <section>
          <h2>Services refunds</h2>
          <p className="mt-3">
            Refunds for website, store and care-plan services are handled in line with the
            Australian Consumer Law.
          </p>
        </section>
        <section>
          <h2>Digital templates and downloads</h2>
          <p className="mt-3">
            Because templates are instant digital downloads, we don't offer refunds for change of
            mind. If a file is faulty, won't open, or isn't as described, email us at{" "}
            <a className="text-primary-soft" href={`mailto:${site.email}`}>
              {site.email}
            </a>{" "}
            within 30 days and we'll send a replacement or a full refund. This doesn't limit your
            rights under the Australian Consumer Law.
          </p>
        </section>
        <section>
          <h2>Prices and GST</h2>
          <p className="mt-3">
            All prices are in Australian dollars. Teague Industries is not registered for GST, so no
            GST is charged.
          </p>
        </section>
        <section>
          <h2>Who we are</h2>
          <p className="mt-3">These terms are provided by Teague Industries, ABN {site.abn}.</p>
        </section>
      </article>
    </>
  );
}
