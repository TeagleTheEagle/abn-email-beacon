import { Check } from "lucide-react";
import type { ProductDetails } from "@/lib/shopify";

// The product page's specification sheet, filled from the product's detail fields in Shopify.
// Rows with nothing in them are left out, so a half-filled product still looks finished.
export function ProductSpecs({ details }: { details: ProductDetails }) {
  const rows = [
    ["Who it's for", details.audience],
    ["Format", details.format],
    ["What you need", details.requirements],
    ["Delivery", details.delivery],
    ["Licence", details.licence],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  if (rows.length === 0 && details.includes.length === 0) return null;

  return (
    <section aria-labelledby="product-specs" className="mt-10">
      <h2 id="product-specs" className="label">
        Specification
      </h2>
      <dl className="mt-4 divide-y divide-border border-y border-border">
        {details.includes.length > 0 && (
          <SpecRow k="What's inside">
            <ul className="space-y-1.5">
              {details.includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-tech" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </SpecRow>
        )}
        {rows.map(([k, v]) => (
          <SpecRow key={k} k={k}>
            {v}
          </SpecRow>
        ))}
      </dl>
    </section>
  );
}

function SpecRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[104px_minmax(0,1fr)] items-baseline gap-4 py-3 text-sm sm:grid-cols-[132px_minmax(0,1fr)]">
      <dt className="label !text-[9px]">{k}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
