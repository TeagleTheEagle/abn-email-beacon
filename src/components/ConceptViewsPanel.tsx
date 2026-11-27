"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  loadConceptViewRows,
  summariseConceptViews,
  type ConceptViewSummary,
  type ConceptViewsClient,
} from "@/lib/concept-views";

type PanelState =
  { status: "loading" } | { status: "error" } | { status: "ready"; views: ConceptViewSummary[] };

/** Owner-only summary of views on the hidden /concept/ prospect pages. RLS limits reads to owners. */
export function ConceptViewsPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [state, setState] = useState<PanelState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    loadConceptViewRows(supabase as unknown as ConceptViewsClient)
      .then(({ rows, error }) => {
        if (!active) return;
        setState(
          error ? { status: "error" } : { status: "ready", views: summariseConceptViews(rows) },
        );
      })
      .catch(() => {
        if (active) setState({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <section aria-labelledby="concept-views-heading" className="glass mt-12 p-5 sm:p-6">
      <p className="label">Prospect previews</p>
      <h2 id="concept-views-heading" className="mt-3 text-xl">
        Concept page views
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Visits to the hidden /concept/ preview pages, most recently viewed first. Your own visits
        are counted too.
      </p>
      <div className="mt-5" aria-live="polite" aria-busy={state.status === "loading"}>
        {state.status === "loading" && (
          <p className="text-sm text-muted-foreground">Loading concept page views…</p>
        )}
        {state.status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            Could not load concept page views. Use Refresh to try again.
          </p>
        )}
        {state.status === "ready" && state.views.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No views yet. Once a prospect opens their preview link, it will show up here.
          </p>
        )}
        {state.status === "ready" && state.views.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="label py-2 pr-4 font-normal">
                    Concept page
                  </th>
                  <th scope="col" className="label py-2 pr-4 text-right font-normal">
                    Views
                  </th>
                  <th scope="col" className="label py-2 font-normal">
                    Last viewed
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.views.map((view) => (
                  <tr key={view.slug} className="border-b border-border last:border-b-0">
                    <td className="py-3 pr-4 font-mono text-xs sm:text-sm">{view.slug}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">{view.total}</td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(view.lastViewedAt).toLocaleString("en-AU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
