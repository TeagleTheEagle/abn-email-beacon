"use client";

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { notifyLead, updateLeadWorkflow, checkEnquiryOwner } from "@/lib/leads";
import { track } from "@/lib/analytics";
import {
  ENQUIRY_PAGE_SIZE,
  ENQUIRY_STAGES,
  LEAD_SOURCES,
  isFollowUpOverdue,
  loadEnquiryPage,
  type EnquiryClient,
  type EnquiryStage,
  type LeadSource,
  type PipelineLead,
} from "@/lib/enquiry-pipeline";
import { Button } from "@/components/ui/button";

const leadSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  business_name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  business_type: z.string().nullable().optional(),
  current_website: z.string().nullable().optional(),
  needs: z.array(z.string()).optional(),
  message: z.string().nullable().optional(),
  source: z.enum(LEAD_SOURCES),
  assigned_owner_id: z.string().uuid().nullable(),
  stage: z.enum(ENQUIRY_STAGES),
  next_follow_up_at: z.string().nullable(),
  notes: z.string().nullable(),
  owner_notification_status: z.string(),
  customer_confirmation_status: z.string(),
  owner_notification_attempts: z.number().int(),
  customer_confirmation_attempts: z.number().int(),
});
const parsedLeads = z.array(leadSchema);

export function EnquiryPipeline() {
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState<"loading" | "owner" | "denied">("loading");
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [stage, setStage] = useState<EnquiryStage | "all">("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!user) {
      setAccess("denied");
      setLeads([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setAccess((current) => (current === "owner" ? "owner" : "loading"));
    setLoading(true);
    setLeads([]);
    setTotal(0);
    setError(null);
    const load = async () => {
      let membership;
      try {
        membership = await checkEnquiryOwner(supabase, user.id);
      } catch {
        if (active) {
          setAccess("denied");
          setLoading(false);
        }
        return;
      }
      if (!active) return;
      if (membership.error || !membership.isOwner) {
        setAccess("denied");
        setLeads([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      try {
        const result = await loadEnquiryPage(
          supabase as unknown as EnquiryClient,
          { overdueOnly, stage },
          page,
          new Date(),
        );
        if (!active) return;
        if (result.error) {
          setError("Could not load enquiries. Please try again.");
          setAccess("owner");
          setLoading(false);
          return;
        }
        const parsed = parsedLeads.safeParse(result.data);
        if (!parsed.success || result.count === null) {
          setError(
            "Enquiry data could not be read. Regenerate the Lovable database types and retry.",
          );
          setAccess("owner");
          setLoading(false);
          return;
        }
        const pageCount = Math.max(1, Math.ceil(result.count / ENQUIRY_PAGE_SIZE));
        if (page >= pageCount) {
          setPage(pageCount - 1);
          return;
        }
        setLeads(parsed.data);
        setTotal(result.count);
        setAccess("owner");
        setLoading(false);
      } catch {
        if (active) {
          setError("Could not load enquiries. Please try again.");
          setAccess("owner");
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [user, authLoading, version, overdueOnly, stage, page]);

  if (access === "loading" || authLoading)
    return <p className="px-6 py-24 text-center text-muted-foreground">Loading enquiries…</p>;
  if (access === "denied")
    return (
      <section className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl">Owner access required</h1>
        <p className="mt-3 text-muted-foreground">
          This account cannot view the enquiry pipeline. Customer enquiries remain private.
        </p>
        <Link to="/account" className="btn-chrome mt-6">
          Back to account
        </Link>
      </section>
    );

  const pageCount = Math.max(1, Math.ceil(total / ENQUIRY_PAGE_SIZE));
  const first = total === 0 ? 0 : page * ENQUIRY_PAGE_SIZE + 1;
  const last = Math.min((page + 1) * ENQUIRY_PAGE_SIZE, total);
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <Link to="/account" className="inline-flex items-center gap-2 text-sm text-primary-soft">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Account
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Owner workspace</p>
          <h1 className="mt-3 text-3xl sm:text-4xl">Enquiry pipeline</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Paid is a manual status, not verified payment data. No customer messages are sent when
            stages change.
          </p>
        </div>
        <Button variant="outline" onClick={() => setVersion((value) => value + 1)}>
          <RefreshCw aria-hidden="true" /> Refresh
        </Button>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-border py-4">
        <label className="text-sm">
          <span className="mr-2">Stage</span>
          <select
            value={stage}
            onChange={(event) => {
              setStage(event.target.value as EnquiryStage | "all");
              setPage(0);
            }}
            className="field inline-block w-auto"
          >
            <option value="all">All stages</option>
            {ENQUIRY_STAGES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(event) => {
              setOverdueOnly(event.target.checked);
              setPage(0);
            }}
            className="accent-[var(--primary)]"
          />
          Overdue follow-ups only
        </label>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {loading ? "Loading matching enquiries…" : `Showing ${first}–${last} of ${total}`}
        </p>
      </div>
      {error && (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {error}
        </p>
      )}
      {!loading && !error && leads.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No enquiries match these filters.</p>
      ) : (
        <div className="mt-8 space-y-5" aria-busy={loading}>
          {leads.map((lead) => (
            <PipelineCard
              key={lead.id}
              lead={lead}
              ownerId={user?.id ?? ""}
              onChanged={() => setVersion((value) => value + 1)}
            />
          ))}
        </div>
      )}
      {!loading && total > ENQUIRY_PAGE_SIZE && (
        <nav
          className="mt-8 flex flex-wrap items-center justify-between gap-3"
          aria-label="Enquiry pages"
        >
          <Button
            variant="outline"
            onClick={() => setPage((value) => value - 1)}
            disabled={page === 0}
          >
            Previous page
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {pageCount}
          </p>
          <Button
            variant="outline"
            onClick={() => setPage((value) => value + 1)}
            disabled={page + 1 >= pageCount}
          >
            Next page
          </Button>
        </nav>
      )}
    </div>
  );
}

function PipelineCard({
  lead,
  ownerId,
  onChanged,
}: {
  lead: PipelineLead;
  ownerId: string;
  onChanged: () => void;
}) {
  const [stage, setStage] = useState<EnquiryStage>(lead.stage);
  const [followUp, setFollowUp] = useState(lead.next_follow_up_at?.slice(0, 10) ?? "");
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const assignedToOwner = lead.assigned_owner_id === ownerId;
  const needsNotificationReview = [
    lead.owner_notification_status,
    lead.customer_confirmation_status,
  ].some((status) => status === "failed" || status === "unknown");

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data, error: updateError } = await updateLeadWorkflow(
        supabase,
        lead.id,
        {
          stage,
          assigned_owner_id: lead.assigned_owner_id ?? ownerId,
          next_follow_up_at: followUp ? `${followUp}T00:00:00.000Z` : null,
          notes: notes.trim() || null,
        },
        lead.updated_at,
      );
      if (updateError || data?.id !== lead.id) {
        setError(
          "Could not save the enquiry changes. Refresh and try again; your entries are retained.",
        );
      } else {
        if (lead.stage !== stage)
          track("enquiry_stage_changed", { previous_stage: lead.stage, next_stage: stage });
        onChanged();
      }
    } catch {
      setError(
        "Could not save the enquiry changes. Refresh and try again; your entries are retained.",
      );
    } finally {
      setSaving(false);
    }
  };

  const retryNotifications = async () => {
    setRetrying(true);
    setError(null);
    const result = await notifyLead(supabase, lead.id, lead.email);
    if (!result.success)
      setError("The notification could not be sent. Its failure state is retained.");
    onChanged();
    setRetrying(false);
  };

  return (
    <article className="glass p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label !text-primary-soft">{lead.source}</span>
            <span className="rounded-sm border border-border px-2 py-0.5 text-xs">
              {lead.stage}
            </span>
            {isFollowUpOverdue(lead, new Date()) && (
              <span className="text-xs text-destructive">Follow-up overdue</span>
            )}
          </div>
          <h2 className="mt-3 text-xl">{lead.business_name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{lead.name}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href={`mailto:${lead.email}`} className="text-primary-soft">
              {lead.email}
            </a>
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="text-primary-soft">
                {lead.phone}
              </a>
            )}
          </div>
          {lead.message && (
            <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{lead.message}</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Received {new Date(lead.created_at).toLocaleString("en-AU")} · Updated{" "}
            {new Date(lead.updated_at).toLocaleString("en-AU")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {lead.assigned_owner_id
              ? assignedToOwner
                ? "Assigned to this owner account"
                : "Assigned to another owner account"
              : "Unassigned · saving will assign this enquiry to you"}
          </p>
          <div className="mt-4 rounded-md border border-border bg-background/50 p-3 text-xs">
            <p>
              Owner notification: <strong>{lead.owner_notification_status}</strong> ({" "}
              {lead.owner_notification_attempts} attempts)
            </p>
            <p className="mt-1">
              Customer confirmation: <strong>{lead.customer_confirmation_status}</strong> ({" "}
              {lead.customer_confirmation_attempts} attempts)
            </p>
            {needsNotificationReview && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={retryNotifications}
                disabled={retrying}
              >
                {retrying ? "Retrying…" : "Retry notification"}
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="label">Current stage</span>
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value as EnquiryStage)}
              className="field mt-2"
            >
              {ENQUIRY_STAGES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="label">Next follow-up date</span>
            <input
              type="date"
              value={followUp}
              onChange={(event) => setFollowUp(event.target.value)}
              className="field mt-2"
            />
          </label>
          <label className="block text-sm">
            <span className="label">Private notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={5000}
              rows={4}
              className="field mt-2 resize-y"
            />
          </label>
          <Button onClick={save} disabled={saving} className="w-full">
            <Save aria-hidden="true" /> {saving ? "Saving…" : "Save workflow"}
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
    </article>
  );
}
