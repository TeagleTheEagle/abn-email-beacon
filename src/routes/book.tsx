import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CalendarClock, CheckCircle2, Phone } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { Field } from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/content/site";
import { seo } from "@/lib/seo";
import { newLeadId, notifyLead } from "@/lib/leads";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/book")({
  head: () =>
    seo(
      "/book",
      "Book a Call",
      "Book a free 15-minute call with Teague Industries to talk through your website or online store. No sales pitch, no obligation.",
    ),
  component: Book,
});

const times = ["Morning", "Afternoon", "Evening (after 5pm)", "Any time"];

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  business_name: z.string().trim().min(1, "Please enter your business name").max(150),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(8, "Please enter a number we can call").max(30),
  time: z.string().min(1, "Please choose a time"),
  topic: z.string().trim().max(1500).optional(),
});
type FormValues = z.infer<typeof schema>;

function Book() {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { time: "" } });

  const trapRef = useRef<HTMLInputElement>(null);
  const onSubmit = async (v: FormValues) => {
    if (trapRef.current?.value) {
      setDone(true);
      return;
    }
    setErr(null);
    const id = newLeadId();
    const { error } = await supabase.from("leads").insert({
      id,
      name: v.name,
      business_name: v.business_name,
      email: v.email,
      phone: v.phone,
      needs: ["Call request"],
      message: [`Call request. Best time: ${v.time}.`, v.topic].filter(Boolean).join("\n\n"),
    });
    if (error) {
      setErr("Sorry, something went wrong. Please try again or email us directly.");
      return;
    }
    setDone(true);
    track("generate_lead", { form: "book_call" });
    void notifyLead(supabase, id);
  };

  return (
    <>
      <PageHeader
        label="Book a call"
        title="Book a 15-minute call"
        sub="Talk through your website or store with Ben before you decide anything. No sales pitch, no obligation."
      />
      <div className="mx-auto grid max-w-5xl gap-8 px-6 lg:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <div className="glass p-6 sm:p-10">
            {site.bookingUrl && !done && (
              <div className="mb-8 border-b border-border pb-8">
                <p className="text-sm text-muted-foreground">
                  Pick a time that suits you in the calendar.
                </p>
                <a
                  href={site.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-4"
                >
                  Choose a time <ArrowRight className="h-4 w-4" />
                </a>
                <p className="mt-6 text-sm text-muted-foreground">
                  Or leave your number below and we'll call you.
                </p>
              </div>
            )}
            {done ? (
              <div className="py-16 text-center" role="status">
                <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
                <p className="mt-6 text-lg">
                  Thanks! We'll confirm a time with you within 1–2 business days.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-5 sm:grid-cols-2"
                noValidate
              >
                <input
                  ref={trapRef}
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                <Field label="Name *" error={errors.name?.message}>
                  <input className="field" autoComplete="name" {...register("name")} />
                </Field>
                <Field label="Business name *" error={errors.business_name?.message}>
                  <input
                    className="field"
                    autoComplete="organization"
                    {...register("business_name")}
                  />
                </Field>
                <Field label="Email *" error={errors.email?.message}>
                  <input
                    type="email"
                    className="field"
                    autoComplete="email"
                    {...register("email")}
                  />
                </Field>
                <Field label="Phone *" error={errors.phone?.message}>
                  <input type="tel" className="field" autoComplete="tel" {...register("phone")} />
                </Field>
                <Field
                  label="Best time to call *"
                  error={errors.time?.message}
                  className="sm:col-span-2"
                >
                  <select className="field" {...register("time")}>
                    <option value="">Select…</option>
                    {times.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="What would you like to talk about? (optional)"
                  error={errors.topic?.message}
                  className="sm:col-span-2"
                >
                  <textarea
                    rows={4}
                    className="field"
                    placeholder="e.g. a new website for my café, or fixing the one I have"
                    {...register("topic")}
                  />
                </Field>
                {err && <p className="text-sm text-destructive sm:col-span-2">{err}</p>}
                <button type="submit" disabled={isSubmitting} className="btn-primary sm:col-span-2">
                  {isSubmitting ? "Sending…" : "Request my call"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass space-y-6 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-1 h-5 w-5 text-primary-soft" aria-hidden="true" />
              <div>
                <p className="label">How it works</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tell us when suits you. We'll confirm a time by email, then Ben calls you on the
                  number you give.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-primary-soft" aria-hidden="true" />
              <div>
                <p className="label">On the call</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  What your business needs, what it would cost, and whether a free preview is the
                  right next step.
                </p>
              </div>
            </div>
          </div>
          <div className="glass mt-6 p-6 sm:p-8">
            <p className="label">Rather skip the call?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Send a short brief and we'll build your free preview straight away.
            </p>
            <Link to="/contact" className="btn-chrome mt-5">
              Get a free preview
            </Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}
