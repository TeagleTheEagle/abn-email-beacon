"use client";

import { useState } from "react";
import { ArrowRight, Check, Zap, ShoppingBag, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import { services } from "@/content/services";
import { demos } from "@/content/demos";

const INDUSTRY_OPTIONS = [
  { id: "tradie", label: "Tradies & Services", icon: Zap, demoKind: "tradie" },
  { id: "cafe", label: "Café & Hospitality", icon: Users, demoKind: "cafe" },
  { id: "salon", label: "Salon & Wellness", icon: Sparkles, demoKind: "salon" },
  { id: "retail", label: "Online Store", icon: ShoppingBag, demoKind: "retail" },
  { id: "professional", label: "Professional Services", icon: Users, demoKind: "consulting" },
] as const;

const GOAL_OPTIONS = [
  { id: "leads", label: "Instant Lead Capture", icon: Zap, services: ["website-build"] },
  {
    id: "shopify",
    label: "Shopify Store & Checkout",
    icon: ShoppingBag,
    services: ["shopify-store", "smart-store"],
  },
  { id: "bookings", label: "Service Bookings", icon: Users, services: ["website-build"] },
  { id: "ai", label: "Smart AI Assistance", icon: Sparkles, services: ["smart-store"] },
] as const;

type Step = 1 | 2 | 3;
type IndustryId = (typeof INDUSTRY_OPTIONS)[number]["id"];
type GoalId = (typeof GOAL_OPTIONS)[number]["id"];

interface Recommendation {
  title: string;
  price: string;
  priceNote?: string | undefined;
  inclusions: string[];
  demoUrl: string;
  leadNeeds: string[];
  leadNote: string;
}

function getRecommendation(industry: IndustryId, goal: GoalId): Recommendation {
  const industryOption = INDUSTRY_OPTIONS.find((o) => o.id === industry);
  const goalOption = GOAL_OPTIONS.find((o) => o.id === goal);

  const isStore = goal === "shopify";
  const primaryService = services.find(
    (s) => s.id === (isStore ? "shopify-store" : "website-build"),
  );

  const basePrice = primaryService?.price ?? (isStore ? "From A$1,200" : "A$500");
  const demoKind = industryOption?.demoKind ?? "tradie";
  const demo = demos[demoKind as keyof typeof demos];

  const inclusions = [
    "Custom domain & HTTPS",
    "Mobile-optimised speed",
    "Search-ready SEO structure",
    "2 revision rounds included",
    "100% ownership — your content, domain & accounts",
  ];

  let leadNeeds = ["Website"];
  let leadNote = `Configurator: ${industryOption?.label} / ${goalOption?.label}`;

  if (isStore) {
    leadNeeds = ["Website", "Online store"];
    leadNote = `Configurator: ${industryOption?.label} / ${goalOption?.label} (Store)`;
  } else if (goal === "bookings") {
    leadNeeds = ["Website", "Booking system"];
    leadNote = `Configurator: ${industryOption?.label} / ${goalOption?.label} (Bookings)`;
  } else if (goal === "ai") {
    leadNeeds = ["Website", "Smart Store"];
    leadNote = `Configurator: ${industryOption?.label} / ${goalOption?.label} (AI)`;
  }

  return {
    title: isStore ? "Online Store Setup" : "Custom Website Build",
    price: basePrice,
    priceNote: primaryService?.priceNote,
    inclusions,
    demoUrl: `/demo/${demoKind}`,
    leadNeeds,
    leadNote,
  };
}

export function PreviewConfigurator() {
  const [step, setStep] = useState<Step>(1);
  const [industry, setIndustry] = useState<IndustryId | null>(null);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const handleIndustrySelect = (id: IndustryId) => {
    setIndustry(id);
    setStep(2);
  };

  const handleGoalSelect = (id: GoalId) => {
    setGoal(id);
    if (industry) {
      const rec = getRecommendation(industry, id);
      setRecommendation(rec);
      setStep(3);
    }
  };

  const handleBack = (toStep: Step) => {
    setStep(toStep);
  };

  const handleGeneratePreview = () => {
    setShowLeadForm(true);
  };

  if (step === 1) {
    return (
      <section className="border-y border-border bg-surface/40 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="label">Build your preview</p>
            <h2 className="mt-4 text-4xl sm:text-5xl">See your website before you commit</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Answer 2 quick questions and we'll show you an interactive prototype tailored to your
              industry — plus the exact price and what's included.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {INDUSTRY_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleIndustrySelect(id)}
                className="glass glass-hover group relative h-full flex flex-col items-center gap-4 p-6 text-left transition-all"
              >
                <div className="relative grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <p className="text-base font-semibold text-foreground">{label}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (step === 2) {
    return (
      <section className="border-y border-border bg-surface/40 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="label">Step 2 of 3</p>
            <h2 className="mt-4 text-4xl sm:text-5xl">What's your main goal?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Choose the outcome that matters most for your business right now.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GOAL_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleGoalSelect(id)}
                className="glass glass-hover group relative h-full flex flex-col items-center gap-4 p-6 text-left transition-all"
              >
                <div className="relative grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <p className="text-base font-semibold text-foreground">{label}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => handleBack(1)} className="h-11">
              Back to industry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Step 3: Recommendation
  if (!recommendation) return null;

  return (
    <section className="border-y border-border bg-surface/40 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="label">Step 3 of 3 — Your recommendation</p>
          <h2 className="mt-4 text-4xl sm:text-5xl">Here's what we'd build for you</h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="glass glass-hover p-8">
            <div className="flex items-center gap-2">
              <span className="label">Recommended build</span>
              <span className="inline-flex items-center rounded-[2px] border border-primary/40 bg-primary/10 px-2.5 py-1 !text-[9px] !text-primary">
                {recommendation.title}
              </span>
            </div>
            <h3 className="mt-4 text-3xl sm:text-4xl">{recommendation.price}</h3>
            {recommendation.priceNote && (
              <p className="mt-1 text-sm text-muted-foreground">{recommendation.priceNote}</p>
            )}
            <p className="mt-6 text-muted-foreground">
              Based on your selection:{" "}
              <strong>{INDUSTRY_OPTIONS.find((o) => o.id === industry)?.label}</strong>
              with a focus on <strong>{GOAL_OPTIONS.find((o) => o.id === goal)?.label}</strong>.
            </p>
            <ul className="mt-8 space-y-4" role="list">
              {recommendation.inclusions.map((item) => (
                <li key={item} className="flex gap-3 text-base">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-primary-soft" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" onClick={handleGeneratePreview} className="h-12 !px-8">
                <a href="#preview-form">
                  Generate Free Preview <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12">
                <a href={recommendation.demoUrl}>
                  View Interactive Demo <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
          <div className="glass glass-hover p-8">
            <p className="label mb-4">Free preview includes</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "A working, clickable prototype of your homepage",
                "Your business name, colours & imagery applied",
                "Mobile & desktop views ready to explore",
                "Delivered within 1–2 business days",
                "Zero obligation — only pay if you approve",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-soft" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted-foreground">
              Two rounds of revisions included. Written quotes valid 30 days. You own everything.
            </p>
          </div>
        </div>
        {showLeadForm && (
          <div
            id="preview-form"
            className="mt-10 glass glass-hover p-8 animate-rise"
            role="region"
            aria-labelledby="preview-form-title"
          >
            <h3 id="preview-form-title" className="text-2xl">
              Request your free preview
            </h3>
            <p className="mt-2 text-muted-foreground">
              We'll build and send your personalised preview for{" "}
              <strong>{INDUSTRY_OPTIONS.find((o) => o.id === industry)?.label}</strong>
              focused on <strong>{GOAL_OPTIONS.find((o) => o.id === goal)?.label}</strong>.
            </p>
            <QuickLeadForm
              onSuccess={() => {
                setShowLeadForm(false);
                setStep(1);
                setIndustry(null);
                setGoal(null);
                setRecommendation(null);
              }}
              submitText="Send my free preview request"
              successText="Your free preview request has been sent! Ben will be in touch within 1–2 business days."
              message={`Configurator: ${INDUSTRY_OPTIONS.find((o) => o.id === industry)?.label} / ${GOAL_OPTIONS.find((o) => o.id === goal)?.label}`}
            />
          </div>
        )}
      </div>
    </section>
  );
}
