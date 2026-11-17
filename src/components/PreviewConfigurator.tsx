"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Coffee,
  MessageSquareText,
  ShoppingBag,
  Sparkles,
  Store,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import { demos, type DemoKind } from "@/content/demos";

const INDUSTRY_OPTIONS = [
  { id: "tradie", label: "Tradie / Services", icon: Wrench, demoKind: "tradie" },
  { id: "hospitality", label: "Hospitality / Cafe", icon: Coffee, demoKind: "cafe" },
  { id: "retail", label: "Boutique / Retail", icon: Store, demoKind: "retail" },
  // The salon demo is the service-led professional concept available in demos.ts.
  { id: "professional", label: "Professional", icon: BriefcaseBusiness, demoKind: "salon" },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon; demoKind: DemoKind }[];

const GOAL_OPTIONS = [
  { id: "enquiries", label: "More enquiries", icon: MessageSquareText },
  { id: "bookings", label: "Online bookings", icon: CalendarDays },
  { id: "shop", label: "Digital shop", icon: ShoppingBag },
  { id: "brand", label: "Brand refresh", icon: Sparkles },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[];

const STEP_CONTENT: Record<Step, { title: string; description: string }> = {
  1: {
    title: "Step 1: Choose your industry",
    description: "Start with the kind of business you run.",
  },
  2: {
    title: "Step 2: Choose your goal",
    description: "Pick the outcome you want your new website to support.",
  },
  3: {
    title: "Step 3: Instant Concept",
    description: "Your matched concept is ready to explore.",
  },
};

type Step = 1 | 2 | 3;
type IndustryId = (typeof INDUSTRY_OPTIONS)[number]["id"];
type GoalId = (typeof GOAL_OPTIONS)[number]["id"];
type IndustryOption = (typeof INDUSTRY_OPTIONS)[number];
type GoalOption = (typeof GOAL_OPTIONS)[number];

export function PreviewConfigurator() {
  const [step, setStep] = useState<Step>(1);
  const [industryId, setIndustryId] = useState<IndustryId | null>(null);
  const [goalId, setGoalId] = useState<GoalId | null>(null);
  const industry = INDUSTRY_OPTIONS.find((option) => option.id === industryId);
  const goal = GOAL_OPTIONS.find((option) => option.id === goalId);

  const chooseIndustry = (id: IndustryId) => {
    setIndustryId(id);
    setGoalId(null);
    setStep(2);
  };
  const chooseGoal = (id: GoalId) => {
    setGoalId(id);
    setStep(3);
  };

  return (
    <section
      aria-labelledby="preview-configurator-title"
      className="border-y border-border bg-surface/40 px-6 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="label">Instant preview configurator</p>
          <h2 id="preview-configurator-title" className="mt-4 text-4xl sm:text-5xl">
            {STEP_CONTENT[step].title}
          </h2>
          <p className="mt-4 text-muted-foreground">{STEP_CONTENT[step].description}</p>
        </div>
        <div aria-live="polite">
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {INDUSTRY_OPTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={label}
                  onClick={() => chooseIndustry(id)}
                  className="glass glass-hover group flex min-h-44 flex-col items-center justify-center gap-5 p-6 text-center"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-foreground">{label}</span>
                  <ArrowRight className="h-4 w-4 text-primary-soft" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {GOAL_OPTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={label}
                    onClick={() => chooseGoal(id)}
                    className="glass glass-hover group flex min-h-44 flex-col items-center justify-center gap-5 p-6 text-center"
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <span className="font-semibold text-foreground">{label}</span>
                    <ArrowRight className="h-4 w-4 text-primary-soft" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <BackButton onClick={() => setStep(1)}>Back to industry</BackButton>
            </div>
          )}
          {step === 3 && industry && goal && (
            <InstantConcept
              industry={industry}
              goal={goal}
              onChangeIndustry={() => setStep(1)}
              onChangeGoal={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function InstantConcept({
  industry,
  goal,
  onChangeIndustry,
  onChangeGoal,
}: {
  industry: IndustryOption;
  goal: GoalOption;
  onChangeIndustry: () => void;
  onChangeGoal: () => void;
}) {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const demo = demos[industry.demoKind];
  const selection = `${industry.label} · ${goal.label}`;

  return (
    <div>
      <article className="glass overflow-hidden lg:grid lg:grid-cols-2">
        <img
          src={demo.imageSmall}
          alt={`${demo.name} demo preview`}
          width={640}
          height={400}
          loading="lazy"
          className="h-full min-h-64 w-full object-cover"
        />
        <div className="flex flex-col p-6 sm:p-8">
          <p className="label">{demo.category} concept</p>
          <h3 className="mt-3 text-3xl">{demo.name}</h3>
          <p className="mt-3 text-xl text-primary-soft">{demo.title}</p>
          <p className="mt-3 text-sm text-muted-foreground">{demo.body}</p>
          <p className="mt-5 text-sm text-muted-foreground">
            Matched to <strong className="text-foreground">{selection}</strong>. Explore the
            concept, then ask us to tailor it to your business.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={`/demo/${industry.demoKind}`} className="btn-primary">
              Try interactive demo <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Button type="button" variant="outline" size="lg" onClick={() => setShowLeadForm(true)}>
              Get your custom preview
            </Button>
          </div>
        </div>
      </article>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="ghost" onClick={onChangeIndustry}>
          <ArrowLeft aria-hidden="true" /> Change industry
        </Button>
        <Button type="button" variant="ghost" onClick={onChangeGoal}>
          <ArrowLeft aria-hidden="true" /> Change goal
        </Button>
      </div>
      {showLeadForm && (
        <div
          role="region"
          aria-labelledby="custom-preview-title"
          className="glass animate-rise mx-auto mt-8 max-w-2xl p-6 sm:p-8"
        >
          <h3 id="custom-preview-title" className="text-2xl">
            Get your custom preview
          </h3>
          <p className="mb-6 mt-2 text-sm text-muted-foreground">
            {selection} · {demo.name}. Tell us where to send your personalised preview.
          </p>
          <QuickLeadForm
            source="Preview configurator"
            submitText="Send my custom preview request"
            successText="Thanks! Ben will be in touch within 1–2 business days."
            message={`Instant preview configurator: ${selection} · ${demo.name}`}
          />
        </div>
      )}
    </div>
  );
}

function BackButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <div className="mt-8 text-center">
      <Button type="button" variant="outline" onClick={onClick}>
        <ArrowLeft aria-hidden="true" /> {children}
      </Button>
    </div>
  );
}
