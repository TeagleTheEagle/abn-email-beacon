import { ArrowRight, Check } from "lucide-react";
import { addOns } from "@/content/services";

const audit = addOns.find((a) => a.id === "audit");

// The A$149 audit as the first step for businesses that already have a site: smaller than a build,
// and credited against one. Price and wording come from the "audit" add-on in services.ts.
export function AuditOffer() {
  if (!audit) return null;
  return (
    <section
      aria-labelledby="audit-offer"
      className="glass corner-marks grid gap-8 p-8 sm:p-10 md:grid-cols-[1.2fr_1fr] md:items-center"
    >
      <div>
        <p className="label">Already have a website?</p>
        <h2 id="audit-offer" className="mt-3 text-2xl sm:text-3xl">
          Start with the {audit.title}.
        </h2>
        <p className="mt-4 text-muted-foreground">
          {audit.summary} Find out what's costing you customers before you spend on a rebuild.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          {audit.included.map((item) => (
            <li key={item} className="flex gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-tech" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-border pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
        <p className="label !text-[9px]">Entry price</p>
        <p className="mt-2 text-4xl font-bold text-accent-tech">{audit.price}</p>
        {audit.note && <p className="mt-3 text-sm text-muted-foreground">{audit.note}</p>}
        {audit.href && (
          <a href={audit.href} className="btn-primary mt-6">
            Get the audit <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </section>
  );
}
