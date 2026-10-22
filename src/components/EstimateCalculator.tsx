import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoSite } from "@/components/DemoSite";
import { carePlans, services } from "@/content/services";
import { supabase } from "@/integrations/supabase/client";
import { newLeadId, notifyLead } from "@/lib/leads";
import { track } from "@/lib/analytics";

// Instant estimate on the pricing page. Prices come from src/content/services.ts, never from here.
// The point of the tool is the last step: "send me this estimate" turns a browser into an enquiry.
const businessTypes = ["Café/Restaurant", "Trades", "Beauty/Salon", "Retail", "Other"];
const builds = services.filter((s) => !s.monthly);

const schema = z.object({
  business_name: z.string().trim().min(1, "Please enter your business name").max(150),
  email: z.string().trim().email("Please enter a valid email").max(255),
});
type V = z.infer<typeof schema>;

const aud = (n: number) => `A$${n.toLocaleString("en-AU")}`;

export function EstimateCalculator({ guided = false }: { guided?: boolean }) {
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [buildId, setBuildId] = useState<string>(builds[0]?.id ?? "");
  const [careId, setCareId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const trapRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<V>({ resolver: zodResolver(schema) });

  const build = builds.find((b) => b.id === buildId) ?? builds[0];
  const carePlan = carePlans.find((p) => p.id === careId) ?? null;
  const estimate = useMemo(() => {
    if (!build) return null;
    const exact = build.price.startsWith("A$"); // "A$500" is fixed; "From A$1,200" is a starting point
    const oneOff = `${exact ? "" : "From "}${aud(build.fromAud)}`;
    const monthly = carePlan ? `${aud(carePlan.fromAud)}/month` : null;
    return {
      oneOff,
      monthly,
      exact,
      turnaround: build.turnaround ?? "Confirmed with your free preview",
    };
  }, [build, carePlan]);

  const chosen = [build?.title, carePlan?.title ?? null].filter((x): x is string => !!x);

  const onSubmit = async (v: V) => {
    if (trapRef.current?.value) {
      setDone(true);
      return;
    }
    if (!build || !estimate) return;
    setErr(null);
    const id = newLeadId();
    const summary = `${estimate.oneOff}${estimate.monthly ? ` + ${estimate.monthly}` : ""}`;
    const { error } = await supabase.from("leads").insert({
      id,
      name: v.business_name,
      business_name: v.business_name,
      email: v.email,
      business_type: businessType,
      needs: chosen,
      message: `Estimate from the ${guided ? "services" : "pricing"} page: ${chosen.join(" + ")} — ${summary}.`,
    });
    if (error) {
      setErr("Sorry, something went wrong. Please try again.");
      return;
    }
    setDone(true);
    track("generate_lead", { form: "estimate", value: build.fromAud, currency: "AUD" });
    void notifyLead(supabase, id);
  };

  if (!build || !estimate) return null;

  const demoKind =
    businessType === "Trades"
      ? "tradie"
      : businessType === "Beauty/Salon"
        ? "salon"
        : businessType === "Retail" || buildId !== "website-build"
          ? "retail"
          : "cafe";

  return (
    <div className={guided ? "border-y border-border py-8" : "glass p-6 sm:p-8"}>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="label">
            {guided ? `Your free preview · ${step + 1} / 3` : "Instant estimate"}
          </p>
          <h2 className="mt-3 text-2xl">
            {guided ? "Let’s shape your next chapter." : "What would yours cost?"}
          </h2>
          {guided && (
            <ol
              aria-label="Preview progress"
              className="mt-6 flex gap-3 text-xs text-muted-foreground"
            >
              {["Business", "Build", "Your preview"].map((label, i) => (
                <li
                  key={label}
                  aria-current={step === i ? "step" : undefined}
                  className={`flex-1 border-t-2 pt-2 ${step >= i ? "border-primary-soft text-foreground" : "border-border"}`}
                >
                  {label}
                </li>
              ))}
            </ol>
          )}

          <fieldset className="mt-8" hidden={guided && step !== 0}>
            <legend className="text-sm font-semibold">1. What kind of business?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {businessTypes.map((b) => (
                <Button
                  key={b}
                  type="button"
                  variant={businessType === b ? "default" : "outline"}
                  aria-pressed={businessType === b}
                  className="h-11"
                  onClick={() => setBusinessType(b)}
                >
                  {b}
                </Button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-8" hidden={guided && step !== 1}>
            <legend className="text-sm font-semibold">2. What do you need?</legend>
            <div className="mt-3 grid gap-2">
              {builds.map((b) => (
                <label
                  key={b.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${buildId === b.id ? "border-primary-soft bg-primary/10" : "border-border hover:border-muted-foreground"}`}
                >
                  <input
                    type="radio"
                    name="build"
                    value={b.id}
                    checked={buildId === b.id}
                    onChange={() => setBuildId(b.id)}
                    className="mt-1 accent-[var(--primary)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">{b.title}</span>
                      <span className="text-sm font-semibold text-accent-tech">{b.price}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{b.short}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-8" hidden={guided && step !== 2}>
            <legend className="text-sm font-semibold">3. Want us to look after it?</legend>
            <div className="mt-3 grid gap-2">
              {[null, ...carePlans].map((plan) => {
                const id = plan?.id ?? "none";
                const selected = (plan?.id ?? null) === careId;
                return (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${selected ? "border-primary-soft bg-primary/10" : "border-border hover:border-muted-foreground"}`}
                  >
                    <input
                      type="radio"
                      name="care"
                      value={id}
                      checked={selected}
                      onChange={() => setCareId(plan?.id ?? null)}
                      className="mt-1 accent-[var(--primary)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-3">
                        <span className="text-sm font-medium">
                          {plan?.title ?? "No thanks, I’ll look after it"}
                        </span>
                        {plan && (
                          <span className="text-sm font-semibold text-accent-tech">
                            {plan.price}
                            {plan.priceNote}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {plan?.short ?? "You can add a Care Plan later."}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          {guided && (
            <div className="mt-8 flex justify-between gap-3">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ArrowLeft /> Back
                </Button>
              ) : (
                <span />
              )}
              {step < 2 && (
                <Button
                  type="button"
                  className="h-11"
                  disabled={step === 0 && !businessType}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Continue <ArrowRight />
                </Button>
              )}
            </div>
          )}
          {guided && step < 2 && (
            <div className="mt-8 overflow-hidden rounded-lg border border-border">
              <DemoSite key={demoKind} kind={demoKind} compact />
              <p className="border-t border-border py-2 text-center text-xs text-muted-foreground">
                Illustrative concept · Not your finished preview
              </p>
            </div>
          )}
        </div>

        <aside
          aria-live="polite"
          className="flex min-w-0 flex-col border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
        >
          <p className="label">Your estimate</p>
          <p className="mt-4 text-3xl font-bold text-chrome">{estimate.oneOff}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {estimate.exact ? "one-off" : "one-off, starting price"}
            {estimate.monthly ? ` + ${estimate.monthly}` : ""}
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {build.title}
              {businessType ? ` for a ${businessType.toLowerCase()} business` : ""}
            </li>
            {carePlan && (
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {carePlan.title}, billed monthly
              </li>
            )}
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              Turnaround: {estimate.turnaround}
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              Free preview first. Nothing to pay until you approve it
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              Two in-scope revision rounds. Your site, domain and accounts.
            </li>
          </ul>
          {build.id !== "website-build" && (
            <p className="mt-4 text-xs text-muted-foreground">
              Store platform subscription and payment fees are separate; confirmed with your quote.
            </p>
          )}

          {done ? (
            <p className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-background/60 p-4 text-sm">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-primary-soft"
                aria-hidden="true"
              />
              Thanks! Your estimate is on its way to Ben. We'll be in touch within 1–2 business days
              to start your free preview.
            </p>
          ) : !guided || step === 2 ? (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 grid gap-3">
              <input
                ref={trapRef}
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <label className="block">
                <span className="sr-only">Business name</span>
                <input
                  {...register("business_name")}
                  aria-invalid={errors.business_name ? true : undefined}
                  autoComplete="organization"
                  placeholder="Business name"
                  className="field"
                />
              </label>
              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  {...register("email")}
                  aria-invalid={errors.email ? true : undefined}
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  className="field"
                />
              </label>
              {(errors.business_name || errors.email || err) && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.business_name?.message || errors.email?.message || err}
                </p>
              )}
              <Button type="submit" disabled={isSubmitting} className="h-12 w-full">
                {isSubmitting ? "Sending…" : "Get my free preview"}
                <ArrowRight />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Ben will reply within 1–2 business days. No payment, no obligation.
              </p>
            </form>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
