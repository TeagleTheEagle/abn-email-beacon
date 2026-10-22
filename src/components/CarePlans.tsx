import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Price } from "@/components/Price";
import { carePlans } from "@/content/services";

// The two Care Plan tiers side by side. Shown on Services and Pricing; the data lives in services.ts.
export function CarePlans() {
  return (
    <section aria-labelledby="care-plans">
      <p className="label">Care Plans</p>
      <h2 id="care-plans" className="mt-3 text-2xl sm:text-3xl">
        Looked after, month to month.
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Both plans are billed monthly with no fixed term. Stop any time by email.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {carePlans.map((plan, i) => (
          <div
            key={plan.id}
            className={`glass glass-hover flex h-full flex-col p-7 ${i === 1 ? "border-primary/40" : ""}`}
          >
            <p className="label !text-[9px]">Plan 0{i + 1}</p>
            <h3 className="mt-3 text-xl">{plan.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{plan.short}</p>
            <Price price={plan.price} monthly className="mt-5" />
            <ul className="mt-6 flex-1 space-y-3">
              {plan.included.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-tech" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted-foreground">For: {plan.whoFor}</p>
            <Link to="/contact" className="btn-chrome mt-6">
              Ask about this plan
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
