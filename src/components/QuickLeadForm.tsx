import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";
import { newLeadId, notifyLead } from "@/lib/leads";
import { track } from "@/lib/analytics";

const schema = z.object({
  business_name: z.string().trim().min(1, "Please enter your business name").max(150),
  email: z.string().trim().email("Please enter a valid email").max(255),
});
type V = z.infer<typeof schema>;

async function sendQuickLead(raw: unknown) {
  const v = schema.parse(raw);
  const id = newLeadId();
  const { error } = await supabase.from("leads").insert({
    id,
    name: v.business_name,
    business_name: v.business_name,
    email: v.email,
    needs: [],
    message: "Quick free-preview request from the home page",
  });
  if (error) throw new Error("Sorry, something went wrong. Please try again.");
  track("generate_lead", { form: "quick_preview" });
  void notifyLead(supabase, id);
}

export function QuickLeadForm() {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(schema) });

  const trapRef = useRef<HTMLInputElement>(null);
  const onSubmit = async (v: V) => {
    if (trapRef.current?.value) { setDone(true); return; }
    setErr(null);
    try { await sendQuickLead(v); setDone(true); } catch (e) { setErr((e as Error).message); }
  };

  useWebMCP({
    name: "request_free_preview",
    description: "Send a free-preview request with a business name and email, using the form at the top of the home page.",
    enabled: !done,
    inputSchema: {
      type: "object",
      properties: {
        business_name: { type: "string", description: "Business name." },
        email: { type: "string", description: "Contact email." },
      },
      required: ["business_name", "email"],
    },
    execute: (args: { business_name: string; email: string }) =>
      runWebMCPTool("request_free_preview", async () => {
        await sendQuickLead(args);
        setDone(true);
        return "Free-preview request sent.";
      }),
  });

  if (done) {
    return (
      <p className="glass flex items-center justify-center gap-2 px-6 py-4 text-sm text-foreground">
        <CheckCircle2 className="h-4 w-4 text-primary-soft" /> Thanks! We'll be in touch about your free preview.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full text-left">
<input ref={trapRef} type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="min-w-0">
          <span className="sr-only">Business name</span>
          <input {...register("business_name")} aria-invalid={errors.business_name ? true : undefined} autoComplete="organization" placeholder="Business name" className="w-full rounded-md border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary" />
        </label>
        <label className="min-w-0">
          <span className="sr-only">Email</span>
          <input {...register("email")} aria-invalid={errors.email ? true : undefined} type="email" placeholder="Email" className="w-full rounded-md border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary" />
        </label>
        <Button type="submit" disabled={isSubmitting} className="h-12 sm:col-span-2">
          {isSubmitting ? "Sending…" : "Get a free preview"}
        </Button>
      </div>
      {(errors.business_name || errors.email || err) && (
        <p className="mt-2 px-1 text-xs text-destructive">{errors.business_name?.message || errors.email?.message || err}</p>
      )}
    </form>
  );
}
