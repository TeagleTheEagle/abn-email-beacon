import { createFileRoute } from "@tanstack/react-router";
import { cloneElement, isValidElement, useId, useRef, useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Mail, MapPin } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { ProjectJourney } from "@/components/ProjectJourney";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/content/site";
import { seo } from "@/lib/seo";
import { newLeadId, notifyLead } from "@/lib/leads";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/contact")({
  head: () => seo("/contact", "Get a Free Preview", "Tell us about your business and we'll build a free preview of your new website or store — no obligation."),
  component: Contact,
});

const businessTypes = ["Café/Restaurant", "Trades", "Beauty/Salon", "Retail", "Other"];
const needOptions = ["Website", "Shopify store", "AI features", "Not sure"];

// People type "mysite.com.au"; add the https:// for them rather than rejecting it.
function normaliseWebsite(value: string | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  const url = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    return new URL(url).hostname.includes(".") ? url : null;
  } catch {
    return null;
  }
}

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  business_name: z.string().trim().min(1, "Please enter your business name").max(150),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(30).optional(),
  business_type: z.string().optional(),
  needs: z.array(z.string()),
  current_website: z
    .string()
    .trim()
    .max(255)
    .optional()
    .refine((v) => !v || normaliseWebsite(v) !== null, "Please enter your website address, e.g. mysite.com.au"),
  message: z.string().trim().max(2000).optional(),
});
type FormValues = z.infer<typeof schema>;

function Contact() {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { needs: [] },
  });

  const trapRef = useRef<HTMLInputElement>(null);
  const onSubmit = async (v: FormValues) => {
    if (trapRef.current?.value) { setDone(true); return; }
    setErr(null);
    const id = newLeadId();
    const { error } = await supabase.from("leads").insert({
      id,
      name: v.name,
      business_name: v.business_name,
      email: v.email,
      phone: v.phone || null,
      business_type: v.business_type || null,
      needs: v.needs ?? [],
      current_website: normaliseWebsite(v.current_website),
      message: v.message || null,
    });
    if (error) {
      setErr("Sorry, something went wrong. Please try again or email us directly.");
      return;
    }
    setDone(true);
    track("generate_lead", { form: "contact" });
    void notifyLead(supabase, id);
  };

  return (
    <>
      <PageHeader label="Contact" title="Get a free preview" sub="Tell us a little about your business. No cost, no obligation." />
      <div className="mx-auto grid max-w-5xl gap-8 px-6 lg:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <div className="glass p-6 sm:p-10">
            {done ? (
              <div className="py-16 text-center" role="status">
                <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
                <p className="mt-6 text-lg">Thanks! We'll be in touch within 1–2 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2" noValidate>
<input ref={trapRef} type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <Field label="Name *" error={errors.name?.message}><input className="field" autoComplete="name" {...register("name")} /></Field>
                <Field label="Business name *" error={errors.business_name?.message}><input className="field" {...register("business_name")} autoComplete="organization" /></Field>
                <Field label="Email *" error={errors.email?.message}><input type="email" className="field" autoComplete="email" {...register("email")} /></Field>
                <Field label="Phone" error={errors.phone?.message}><input type="tel" className="field" autoComplete="tel" {...register("phone")} /></Field>
                <Field label="Business type" className="sm:col-span-2">
                  <select className="field" {...register("business_type")} defaultValue="">
                    <option value="">Select…</option>
                    {businessTypes.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
                <fieldset className="sm:col-span-2">
                  <legend className="label mb-3">What you need</legend>
                  <div className="flex flex-wrap gap-3">
                    {needOptions.map((n) => (
                      <label key={n} className="flex cursor-pointer items-center gap-2 rounded-full border border-input px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/15">
                        <input type="checkbox" value={n} className="accent-primary" {...register("needs")} /> {n}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field label="Current website (optional)" error={errors.current_website?.message} className="sm:col-span-2">
                  <input type="text" inputMode="url" autoComplete="url" placeholder="mysite.com.au" className="field" {...register("current_website")} />
                </Field>
                <Field label="Message" error={errors.message?.message} className="sm:col-span-2">
                  <textarea rows={5} className="field" {...register("message")} />
                </Field>
                {err && <p className="text-sm text-destructive sm:col-span-2">{err}</p>}
                <button type="submit" disabled={isSubmitting} className="btn-primary sm:col-span-2">
                  {isSubmitting ? "Sending…" : "Get my free preview"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass space-y-6 p-8">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 text-primary-soft" aria-hidden="true" />
              <div><p className="label">Email</p><a href={`mailto:${site.email}`} className="mt-1 block break-all hover:text-primary-soft">{site.email}</a></div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-primary-soft" aria-hidden="true" />
              <div><p className="label">Location</p><p className="mt-1">{site.location}</p></div>
            </div>
            <p className="text-sm text-muted-foreground">ABN: {site.abn}</p>
          </div>
          <div className="glass mt-6 p-8">
            <p className="label">What happens next</p>
            <h2 className="mt-3 text-lg">From first message to live site</h2>
            <div className="mt-6">
              <ProjectJourney vertical />
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}

function Field({ label, error, className = "", children }: { label: string; error?: string | undefined; className?: string; children: React.ReactNode }) {
  const id = useId();
  const required = label.trim().endsWith("*");
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="label mb-2 block">{label}</span>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<Record<string, unknown>>, { id, "aria-invalid": error ? true : undefined, "aria-required": required || undefined, "aria-describedby": error ? `${id}-error` : undefined })
        : children}
      {error && <span id={`${id}-error`} role="alert" className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
