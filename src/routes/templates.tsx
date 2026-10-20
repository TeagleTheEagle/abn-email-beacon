import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, FileText, Receipt, ScrollText, LayoutTemplate, Bot } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { site } from "@/content/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/templates")({
  head: () => seo("/templates", "Business Templates", "Ready-made invoices, quotes, service agreements, website kits and AI prompt packs built for Australian ABN and GST rules."),
  component: Templates,
});

const kinds = [
  { icon: Receipt, t: "Invoices" },
  { icon: FileText, t: "Quotes" },
  { icon: ScrollText, t: "Service agreements" },
  { icon: LayoutTemplate, t: "Website kits" },
  { icon: Bot, t: "AI prompt packs" },
];

function Templates() {
  return (
    <>
      <PageHeader label="Templates" title="Ready-made for Australian business" sub="Built for Australian ABN and GST rules. Instant download, ready to use today." />
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-5 px-6 sm:grid-cols-3 lg:grid-cols-5">
        {kinds.map(({ icon: I, t }, i) => (
          <Reveal key={t} delay={i * 0.06}>
            <div className="glass glass-hover flex h-full flex-col items-center gap-4 p-6 text-center">
              <I className="h-7 w-7 text-primary-soft" aria-hidden="true" />
              <span className="text-sm">{t}</span>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-16 text-center">
        <a href={site.storeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !px-10 !py-4 !text-base">
          Visit the template store <ExternalLink className="h-4 w-4" />
        </a>
      </Reveal>
    </>
  );
}
