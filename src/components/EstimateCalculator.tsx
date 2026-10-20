import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, CheckCircle2 } from "lucide-react";
import { services } from "@/content/services";
import { supabase } from "@/integrations/supabase/client";
import { newLeadId, notifyLead } from "@/lib/leads";
import { track } from "@/lib/analytics";

// Instant estimate on the pricing page. Prices come from src/content/services.ts, never from here.
// The point of the tool is the last step: "send me this estimate" turns a browser into an enquiry.
const businessTypes = ["Café/Restaurant", "Trades", "Beauty/Salon", "Retail", "Other"];
const builds = services.filter((s) => !s.monthly);
const carePlan = services.find((s) => s.monthly);

const schema = z.object({
  business_name: z.string().trim().min(1, "Please enter your business name").max(150),
  email: z.string().trim().email("Please enter a valid email").max(255),
});
type V = z.infer<typeof schema>;

const aud = (n: number) => `A$${n.toLocaleString("en-AU")}`;

export function EstimateCalculator() {
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [buildId, setBuildId] = useState<string>(builds[0]?.id ?? "");
  const [care, setCare] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const trapRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(schema) });

  const build = builds.find((b) => b.id === buildId) ?? builds[0];
  const estimate = useMemo(() => {
    if (!build) return null;
    const exact = build.price.startsWith("A$"); // "A$500" is fixed; "From A$1,200" is a starting point
    const oneOff = `${exact ? "" : "From "}${aud(build.fromAud)}`;
    const monthly = care && carePlan ? `${aud(carePlan.fromAud)}/month` : null;
    return { oneOff, monthly, exact, turnaround: build.turnaround ?? "Confirmed with your free preview" };
  }, [build, care]);

  const chosen = [build?.title, care ? carePlan?.title : null].filter((x): x is string => !!x);

  const onSubmit = async (v: V) => {
    if (trapRef.current?.value) { setDone(true); return; }
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
      message: `Estimate from the pricing page: ${chosen.join(" + ")} — ${summary}.`,
    });
    if (error) { setErr("Sorry, something went wrong. Please try again."); return; }
    setDone(true);
    track("generate_lead", { form: "estimate", value: build.fromAud, currency: "AUD" });
    void notifyLead(supabase, id);
  };

  if (!build || !estimate) return null;

  const pill = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-primary-soft bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"}`;

  return (
    <div className="glass p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="label">Instant estimate</p>
          <h2 className="mt-3 text-2xl">What would yours cost?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Three taps. No sign-up, nothing to pay.</p>

          <fieldset className="mt-8">
            <legend className="text-sm font-semibold">1. What kind of business?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {businessTypes.map((b) => (
                <button key={b} type="button" aria-pressed={businessType === b} className={pill(businessType === b)} onClick={() => setBusinessType(b)}>{b}</button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="text-sm font-semibold">2. What do you need?</legend>
            <div className="mt-3 grid gap-2">
              {builds.map((b) => (
                <label key={b.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${buildId === b.id ? "border-primary-soft bg-primary/10" : "border-border hover:border-muted-foreground"}`}>
                  <input type="radio" name="build" value={b.id} checked={buildId === b.id} onChange={() => setBuildId(b.id)} className="mt-1 accent-[var(--primary)]" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3"><span className="text-sm font-medium">{b.title}</span><span className="text-sm text-chrome">{b.price}</span></span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{b.short}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {carePlan && (
            <fieldset className="mt-8">
              <legend className="text-sm font-semibold">3. Want us to look after it?</legend>
              <label className={`mt-3 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${care ? "border-primary-soft bg-primary/10" : "border-border hover:border-muted-foreground"}`}>
                <input type="checkbox" checked={care} onChange={(e) => setCare(e.target.checked)} className="mt-1 accent-[var(--primary)]" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3"><span className="text-sm font-medium">{carePlan.title}</span><span className="text-sm text-chrome">{carePlan.price}{carePlan.priceNote}</span></span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{carePlan.short}</span>
                </span>
              </label>
            </fieldset>
          )}
        </div>

        <aside aria-live="polite" className="flex flex-col rounded-xl border border-primary/40 bg-surface-2/60 p-6 shadow-[var(--glow-soft)]">
          <p className="label">Your estimate</p>
          <p className="mt-4 font-display text-3xl text-chrome">{estimate.oneOff}</p>
          <p className="mt-1 text-sm text-muted-foreground">{estimate.exact ? "one-off" : "one-off, starting price"}{estimate.monthly ? ` + ${estimate.monthly}` : ""}</p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{build.title}{businessType ? ` for a ${businessType.toLowerCase()} business` : ""}</li>
            {care && carePlan && <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{carePlan.title}, billed monthly</li>}
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />Turnaround: {estimate.turnaround}</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />Free preview first. Nothing to pay until you approve it</li>
          </ul>

          {done ? (
            <p className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-background/60 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-soft" aria-hidden="true" />
              Thanks! Your estimate is on its way to Ben. We'll be in touch within 1–2 business days to start your free preview.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 grid gap-3">
              <input ref={trapRef} type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <label className="block"><span className="sr-only">Business name</span><input {...register("business_name")} aria-invalid={errors.business_name ? true : undefined} autoComplete="organization" placeholder="Business name" className="field" /></label>
              <label className="block"><span className="sr-only">Email</span><input {...register("email")} aria-invalid={errors.email ? true : undefined} type="email" autoComplete="email" placeholder="Email" className="field" /></label>
              {(errors.business_name || errors.email || err) && <p role="alert" className="text-xs text-destructive">{errors.business_name?.message || errors.email?.message || err}</p>}
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? "Sending…" : "Lock in my free preview"}</button>
              <p className="text-center text-[11px] text-muted-foreground">We email you this estimate and get started on your preview. No payment, no obligation.</p>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
