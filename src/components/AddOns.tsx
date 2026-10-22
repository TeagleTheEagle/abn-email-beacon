import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { addOns } from "@/content/services";

// Fixed-scope add-ons as a specification list: one row per job, with the deliverable and the price.
export function AddOns() {
  return (
    <section aria-labelledby="add-ons">
      <p className="label">Fixed-scope add-ons</p>
      <h2 id="add-ons" className="mt-3 text-2xl sm:text-3xl">
        One job, one price, done.
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Add any of these to a build, or buy them on their own for a site you already have. Each one
        is a defined deliverable, quoted up front.
      </p>
      <div className="mt-8 divide-y divide-border border-y border-border">
        {addOns.map((a, i) => (
          <div
            key={a.id}
            className="grid gap-3 py-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto] md:items-start md:gap-8"
          >
            <div>
              <p className="label !text-[9px]">{String(i + 1).padStart(2, "0")} / Add-on</p>
              <h3 className="mt-2 text-base">{a.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a.summary}</p>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {a.included.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-tech" aria-hidden="true" />
                  {item}
                </li>
              ))}
              {a.note && <li className="pl-6 text-xs">{a.note}</li>}
            </ul>
            <div className="md:text-right">
              <p className="text-lg font-bold text-accent-tech">{a.price}</p>
              {a.href ? (
                <a
                  href={a.href}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-primary-soft"
                >
                  Buy the audit <ArrowRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <Link
                  to="/contact"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-primary-soft"
                >
                  Ask about this <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
