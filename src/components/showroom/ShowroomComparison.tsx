import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Columns3, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoryLabel, MAX_COMPARE, type ShowroomDesign } from "@/content/showroom";

const rows: { label: string; value: (d: ShowroomDesign) => ReactNode }[] = [
  { label: "Industry", value: (d) => `${d.industry} · ${categoryLabel(d.category)}` },
  { label: "Style", value: (d) => d.styleTags.join(", ") },
  {
    label: "Included sections",
    value: (d) => (
      <ul className="space-y-1">
        {d.sections.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    ),
  },
  {
    label: "Interactive features",
    value: (d) => (
      <ul className="space-y-1">
        <li className="font-medium text-foreground">{d.interactiveWidget}</li>
        {d.includedFeatures.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    ),
  },
];

// Floats at the bottom of /demos while 1–3 designs are shortlisted; "Compare" opens them side by side.
export function ShowroomComparison({
  designs,
  onRemove,
  onClear,
  onEnquire,
}: {
  designs: readonly ShowroomDesign[];
  onRemove: (slug: string) => void;
  onClear: () => void;
  onEnquire: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (designs.length === 0) return null;

  return (
    <>
      <section
        aria-label="Shortlisted designs"
        className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-3xl rounded-xl border border-border bg-surface/95 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="label mr-1 shrink-0" aria-live="polite">
            {designs.length}/{MAX_COMPARE} shortlisted
          </p>
          <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
            {designs.map((d) => (
              <li
                key={d.slug}
                className="flex items-center gap-1 rounded-full border border-border bg-background/60 py-1 pl-3 pr-1 text-xs text-foreground"
              >
                {d.title}
                <button
                  type="button"
                  onClick={() => onRemove(d.slug)}
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label={`Remove ${d.title} from the shortlist`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="px-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-primary !px-4 !py-2 !text-xs"
            >
              <Columns3 className="h-4 w-4" aria-hidden="true" /> Compare
            </button>
          </div>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto border-border bg-surface sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Compare designs</DialogTitle>
            <DialogDescription>
              Side by side: what each design includes. Every business shown is fictional.
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[36rem] table-fixed border-collapse text-left text-sm">
              <caption className="sr-only">Comparison of the shortlisted website designs</caption>
              <thead>
                <tr>
                  <td className="w-36" />
                  {designs.map((d) => (
                    <th key={d.slug} scope="col" className="px-3 pb-3 align-bottom">
                      <span
                        className="mb-2 block h-1.5 w-10 rounded-full"
                        style={{ background: d.accentColor }}
                        aria-hidden="true"
                      />
                      <span className="label block">Design {d.id}</span>
                      <span className="mt-1 block text-base font-semibold text-foreground">
                        {d.title}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-border">
                    <th
                      scope="row"
                      className="py-3 pr-3 align-top text-xs font-semibold text-silver"
                    >
                      {row.label}
                    </th>
                    {designs.map((d) => (
                      <td key={d.slug} className="px-3 py-3 align-top text-muted-foreground">
                        {row.value(d)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-border">
                  <td />
                  {designs.map((d) => (
                    <td key={d.slug} className="px-3 py-3">
                      <Link
                        to="/demos/$slug"
                        params={{ slug: d.slug }}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary-soft hover:underline"
                      >
                        View live demo <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="btn-primary w-full sm:w-auto sm:justify-self-end"
            onClick={() => {
              setOpen(false);
              onEnquire();
            }}
          >
            Enquire About Selected Designs <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
