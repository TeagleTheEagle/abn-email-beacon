import { steps } from "@/content/site";

// "From first message to live site": numbered steps joined by a line. Stacks vertically on phones
// (and always, when `vertical`), runs left to right on wider screens.
export function ProjectJourney({ vertical = false }: { vertical?: boolean }) {
  return (
    <ol className={`relative grid gap-8 ${vertical ? "" : "md:grid-cols-4 md:gap-6"}`}>
      {!vertical && <div aria-hidden="true" className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent md:block" />}
      {steps.map((step, i) => (
        <li key={step.n} className="relative flex gap-4 md:block">
          <div className="flex shrink-0 flex-col items-center md:items-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/50 bg-background font-display text-[11px] text-primary-soft shadow-[var(--glow)]">
              {step.n}
            </span>
            {(vertical || i < steps.length - 1) && <span aria-hidden="true" className={`mt-2 w-px flex-1 bg-gradient-to-b from-primary/50 to-transparent md:hidden ${i === steps.length - 1 ? "hidden" : ""}`} />}
          </div>
          <div className="pb-2 md:pt-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary-soft">{step.when}</p>
            <h3 className="mt-1 text-base">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
