import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/FormField";
import { supabase } from "@/integrations/supabase/client";
import { newLeadId, notifyLead } from "@/lib/leads";
import { track } from "@/lib/analytics";
import type { ShowroomDesign } from "@/content/showroom";

// The message is capped below the table's 2,000 characters so the design line always fits after it.
const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  business_name: z.string().trim().min(1, "Please enter your business name").max(150),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(1600, "Please keep the message under 1,600 characters"),
});
type FormValues = z.infer<typeof schema>;

const designName = (d: ShowroomDesign) => `${d.title} (design ${d.id})`;

function prefill(designs: readonly ShowroomDesign[]) {
  const [first] = designs;
  if (!first) return "";
  if (designs.length === 1) return `I'd like a website like the ${designName(first)} demo.`;
  return `I'm comparing ${designs.map(designName).join(", ")}, and I'd like a website like one of them.`;
}

// Enquiry from the showroom: the same public.leads insert and notify-lead email as the contact
// form, with the chosen design(s) prefilled in the message and always recorded underneath it.
export function DemoEnquiryModal({
  designs,
  open,
  onOpenChange,
}: {
  designs: readonly ShowroomDesign[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const trapRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { message: "" } });

  const designKey = designs.map((d) => d.slug).join(",");
  // Each time the modal opens, start from a fresh message for the designs chosen now.
  useEffect(() => {
    if (!open) return;
    setDone(false);
    setErr(null);
    setValue("message", prefill(designs));
    // designKey stands in for `designs`, which may be a new array on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, designKey, setValue]);

  const onSubmit = async (v: FormValues) => {
    if (trapRef.current?.value) {
      setDone(true);
      return;
    }
    setErr(null);
    const id = newLeadId();
    const chosen = `Showroom design${designs.length > 1 ? "s" : ""}: ${designs.map(designName).join(", ")}`;
    const { error } = await supabase.from("leads").insert({
      id,
      name: v.name,
      business_name: v.business_name,
      email: v.email,
      phone: v.phone || null,
      needs: designs.some((d) => d.category === "ecommerce")
        ? ["Website", "Online store"]
        : ["Website"],
      message: v.message ? `${v.message}\n\n${chosen}` : chosen,
    });
    if (error) {
      setErr("Sorry, something went wrong. Please try again or email us directly.");
      return;
    }
    setDone(true);
    track("generate_lead", { form: "showroom", designs: designKey });
    void notifyLead(supabase, id);
  };

  const single = designs.length === 1 ? designs[0] : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-border bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {single ? "Want a website like this?" : "Enquire about these designs"}
          </DialogTitle>
          <DialogDescription>
            {single
              ? `We'll build a free preview of your own website based on the ${single.title} design.`
              : "We'll build a free preview of your own website based on the design you like best."}{" "}
            No deposit, no obligation.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <div role="status" className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary-soft" aria-hidden="true" />
            <p className="mt-4 text-lg font-semibold text-foreground">Thanks, we've got it.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We reply within 1–2 business days about your free preview.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
            <input
              ref={trapRef}
              type="text"
              name="company_website"
              aria-label="Company website (do not fill in)"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            {designs.length > 0 && (
              <p className="rounded-md border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                <span className="label mr-2">Design{designs.length > 1 ? "s" : ""}</span>
                {designs.map(designName).join(" · ")}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
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
                <input className="field" type="email" autoComplete="email" {...register("email")} />
              </Field>
              <Field label="Phone" error={errors.phone?.message}>
                <input className="field" type="tel" autoComplete="tel" {...register("phone")} />
              </Field>
            </div>
            <Field label="Message" error={errors.message?.message}>
              <textarea rows={4} className="field" {...register("message")} />
            </Field>
            {err && (
              <p role="alert" className="text-sm text-destructive">
                {err}
              </p>
            )}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? "Sending…" : "Get my free preview"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
