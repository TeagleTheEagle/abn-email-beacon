import { useId, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  Droplet,
  Droplets,
  Flame,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Thermometer,
  Toilet,
  Wrench,
} from "lucide-react";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

const PHONE = "(02) 5550 0147";
const EMAIL = "hello@steadfastplumbing.example";
const LICENCE = "Lic. 000000C (sample)";

const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19c3e6]";
const ringDark =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c1f3f]";
const inputClass = `mt-1 w-full rounded-md border border-[#3a5f94] bg-[#091731] px-3 py-2.5 text-sm text-[#f2f7fb] ${ring}`;
const primaryBtn = `inline-flex items-center justify-center gap-2 rounded-md bg-[#19c3e6] px-5 py-3 text-sm font-bold uppercase tracking-wide text-[#0c1f3f] hover:bg-[#5ad6f0] motion-safe:transition-colors ${ring}`;

const faults = [
  {
    id: "drain",
    label: "Blocked drain",
    icon: Droplets,
    low: 180,
    high: 420,
    blurb: "Slow sinks, gurgling gully traps and overflowing toilets, cleared and camera-checked.",
    includes: [
      "Call-out and the first 45 minutes on site",
      "CCTV camera inspection of the blocked line",
      "High-pressure jetting for roots and fat build-up",
    ],
  },
  {
    id: "tap",
    label: "Leaking tap",
    icon: Wrench,
    low: 120,
    high: 240,
    blurb: "Dripping spouts, worn washers and wobbly mixers fixed in a single visit.",
    includes: [
      "Call-out and the first 30 minutes on site",
      "Washers, O-rings and standard cartridges supplied",
      "Pressure check on the repaired fixture",
    ],
  },
  {
    id: "burst",
    label: "Burst pipe",
    icon: Droplet,
    low: 280,
    high: 650,
    blurb: "Water isolated fast, the damaged section replaced and the area checked for moisture.",
    includes: [
      "Water isolated and the leak made safe",
      "Damaged section replaced in copper or PEX",
      "Moisture reading of nearby walls and floors",
    ],
  },
  {
    id: "hot-water",
    label: "Hot water system",
    icon: Thermometer,
    low: 220,
    high: 520,
    blurb: "Electric, gas and heat-pump units diagnosed and repaired, or replaced the same day.",
    includes: [
      "Diagnosis of electric, gas or heat-pump units",
      "Thermostat, element or relief valve replacement",
      "Full replacement units quoted separately",
    ],
  },
  {
    id: "toilet",
    label: "Toilet repair",
    icon: Toilet,
    low: 150,
    high: 330,
    blurb: "Running cisterns, weak flushes and leaking pans sorted without the mess.",
    includes: [
      "Inlet valve, flush button or seal replacement",
      "Pan connector and leak check",
      "Old parts removed and disposed of",
    ],
  },
  {
    id: "gas",
    label: "Gas leak",
    icon: Flame,
    low: 240,
    high: 560,
    blurb: "Licensed gasfitters to isolate, locate and repair leaks, with compliance paperwork.",
    includes: [
      "Isolation and make-safe of the gas supply",
      "Leak detection and pressure test",
      "Compliance certificate where required",
    ],
  },
] as const;

type FaultId = (typeof faults)[number]["id"];

const urgencies = [
  {
    id: "standard",
    label: "Standard",
    note: "Booked within two business days",
    multiplier: 1,
    include: "Booked arrival window that suits you",
  },
  {
    id: "same-day",
    label: "Same day",
    note: "Book before 1 pm and we arrive today",
    multiplier: 1.35,
    include: "Same-day arrival when booked before 1 pm",
  },
  {
    id: "emergency",
    label: "After-hours emergency",
    note: "Nights, weekends and public holidays, 24/7",
    multiplier: 1.85,
    include: "Priority dispatch at any hour, any day",
  },
] as const;

type UrgencyId = (typeof urgencies)[number]["id"];

const suburbs = [
  { name: "Fernhollow", postcode: "2991", x: 150, y: 74 },
  { name: "Lanternhill", postcode: "2992", x: 118, y: 52 },
  { name: "Tidewater Heights", postcode: "2993", x: 196, y: 98 },
  { name: "Brackenmere", postcode: "2994", x: 104, y: 98 },
  { name: "Quillon Bay", postcode: "2995", x: 214, y: 58 },
  { name: "Sandpiper Flats", postcode: "2996", x: 170, y: 118 },
  { name: "Ashcombe Rise", postcode: "2997", x: 82, y: 70 },
  { name: "Corran Vale", postcode: "2998", x: 176, y: 34 },
] as const;

const trust = [
  "Licensed plumbers and gasfitters",
  "Upfront price before any work",
  "Fully stocked vans, most jobs done first visit",
  "12-month workmanship guarantee",
] as const;

const reviews = [
  {
    name: "Priya K.",
    suburb: "Fernhollow",
    job: "Burst pipe, after-hours",
    text: "Pipe burst under the kitchen sink at 11 pm. The tech was here in about 40 minutes, had the water off in two, and the final bill landed inside the estimate.",
  },
  {
    name: "Marcus T.",
    suburb: "Brackenmere",
    job: "Hot water system",
    text: "Hot water died on a Sunday. Clear price before they started, new element fitted, and they explained how to stop it happening again.",
  },
  {
    name: "Hannah W.",
    suburb: "Quillon Bay",
    job: "Blocked drain",
    text: "They showed me the camera footage of the tree roots and talked through the options with no pressure at all. Tidy, on time and polite.",
  },
] as const;

type LockField = "name" | "phone" | "suburb";
type AreaResult = { kind: "in"; name: string; postcode: string } | { kind: "out"; query: string };

const money = (n: number) => `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
const roundTo5 = (n: number) => Math.round(n / 5) * 5;

function lookupSuburb(query: string): AreaResult {
  const q = query.trim().toLowerCase();
  const hit = suburbs.find((s) => s.name.toLowerCase() === q || s.postcode === q);
  return hit
    ? { kind: "in", name: hit.name, postcode: hit.postcode }
    : { kind: "out", query: query.trim() };
}

function LogoMark() {
  return (
    <svg viewBox="0 0 40 40" className="size-10 shrink-0" aria-hidden="true">
      <path
        d="M20 2 35 8v11c0 9.5-6.3 16.4-15 19C11.3 35.4 5 28.5 5 19V8Z"
        fill="#13305e"
        stroke="#19c3e6"
        strokeWidth="2"
      />
      <path d="M20 10c3.6 4.6 6 8 6 11.5a6 6 0 0 1-12 0c0-3.5 2.4-6.9 6-11.5Z" fill="#19c3e6" />
    </svg>
  );
}

function SectionIntro({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#19c3e6]">{eyebrow}</p>
      <h3 id={id} className="mt-2 text-3xl font-bold uppercase leading-tight @3xl:text-4xl">
        {title}
      </h3>
      {children ? <p className="mt-3 text-[#c3d2e6]">{children}</p> : null}
    </div>
  );
}

function TextField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  type?: string;
  autoComplete?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[#dce7f3]">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {error ? (
        <p id={errorId} className="mt-1 flex items-center gap-1 text-xs text-[#ff9b9b]">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function HeroArt() {
  const joints = [
    [110, 190],
    [110, 118],
    [206, 118],
    [206, 56],
    [64, 150],
    [64, 40],
  ] as const;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#24497f] bg-[#0e2449] p-4 shadow-[0_30px_80px_-30px_#19c3e655]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[image:linear-gradient(#ffffff0f_1px,transparent_1px),linear-gradient(90deg,#ffffff0f_1px,transparent_1px)] bg-[size:28px_28px]"
      />
      <svg viewBox="0 0 320 220" className="relative w-full" aria-hidden="true">
        <path
          d="M16 150H64V40H140"
          fill="none"
          stroke="#2e5a94"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="140"
          y="16"
          width="36"
          height="50"
          rx="9"
          fill="#13305e"
          stroke="#2e5a94"
          strokeWidth="3"
        />
        <path
          d="M16 190H110V118H206V56H300"
          fill="none"
          stroke="#19c3e6"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {joints.map(([x, y]) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r="9"
            fill="#0c1f3f"
            stroke="#8fe3f5"
            strokeWidth="3"
          />
        ))}
        <rect x="150" y="106" width="16" height="24" rx="3" fill="#19c3e6" />
        <path d="M158 106V92M146 92H170" stroke="#f2f7fb" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M300 72c5 7 8 12 8 16a8 8 0 0 1-16 0c0-4 3-9 8-16Z"
          fill="#19c3e6"
          className="motion-safe:animate-pulse"
        />
        <path d="M110 208H206" stroke="#7fa3cf" strokeWidth="1" strokeDasharray="3 3" />
        <g fill="#7fa3cf" fontSize="9" fontFamily="ui-monospace, Consolas, monospace">
          <text x="22" y="182">
            DN100 SEWER
          </text>
          <text x="214" y="48">
            Ø20 CU
          </text>
          <text x="145" y="80">
            HWS
          </text>
          <text x="146" y="204">
            4.2 m
          </text>
        </g>
      </svg>
      <div className="relative mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#2c5288] bg-[#0c1f3f] p-3">
          <p className="flex items-center gap-1.5 text-xs text-[#a9bcd6]">
            <Clock className="size-3.5" aria-hidden="true" /> Average arrival
          </p>
          <p className="font-[family-name:var(--demo-font-heading)] text-2xl font-bold">47 min</p>
          <p className="text-[11px] text-[#a9bcd6]">Sample figure</p>
        </div>
        <div className="rounded-xl border border-[#2c5288] bg-[#0c1f3f] p-3">
          <p className="flex items-center gap-1.5 text-xs text-[#a9bcd6]">
            <Star className="size-3.5" aria-hidden="true" /> Customer rating
          </p>
          <p className="font-[family-name:var(--demo-font-heading)] text-2xl font-bold">4.9 / 5</p>
          <p className="text-[11px] text-[#a9bcd6]">312 sample reviews</p>
        </div>
      </div>
    </div>
  );
}

export function PlumbingTradesDemo({ design }: DemoProps) {
  const uid = useId();
  const servicesRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLElement>(null);
  const areaRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);

  const [callNote, setCallNote] = useState(false);
  const [faultId, setFaultId] = useState<FaultId>("drain");
  const [urgencyId, setUrgencyId] = useState<UrgencyId>("standard");
  const [senior, setSenior] = useState(false);

  const [areaQuery, setAreaQuery] = useState("");
  const [areaError, setAreaError] = useState("");
  const [areaResult, setAreaResult] = useState<AreaResult | null>(null);

  const [form, setForm] = useState({ name: "", phone: "", suburb: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<LockField, string>>>({});
  const [sent, setSent] = useState<string | null>(null);

  const fault = faults.find((f) => f.id === faultId) ?? faults[0];
  const urgency = urgencies.find((u) => u.id === urgencyId) ?? urgencies[0];
  const discount = senior ? 0.9 : 1;
  const low = roundTo5(fault.low * urgency.multiplier * discount);
  const high = roundTo5(fault.high * urgency.multiplier * discount);
  const range = `${money(low)}–${money(high)}`;

  const go = (ref: RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ block: "nearest" });

  const nav = [
    { label: "Services", ref: servicesRef },
    { label: "Instant quote", ref: quoteRef },
    { label: "Service area", ref: areaRef },
    { label: "Reviews", ref: reviewsRef },
  ];

  const runCheck = (query: string) => {
    if (!query.trim()) {
      setAreaError("Type a suburb or postcode to check.");
      setAreaResult(null);
      return;
    }
    setAreaError("");
    setAreaResult(lookupSuburb(query));
  };

  const update = (field: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Partial<Record<LockField, string>> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (form.phone.replace(/\D/g, "").length < 8)
      next.phone = "Please enter a phone number we can call back.";
    if (!form.suburb.trim()) next.suburb = "Please enter the suburb the job is in.";
    setErrors(next);
    const first = (Object.keys(next) as LockField[])[0];
    if (first) {
      const el = e.currentTarget.elements.namedItem(first);
      if (el instanceof HTMLElement) el.focus();
      return;
    }
    setSent(`Quote locked in: ${range} for ${fault.label.toLowerCase()}`);
  };

  const reset = () => {
    setSent(null);
    setForm({ name: "", phone: "", suburb: "", notes: "" });
    setErrors({});
  };

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.sansHumanist, heading: demoFonts.sansCondensed }}
      className="bg-[#0c1f3f] text-[#f2f7fb]"
    >
      {/* Emergency bar */}
      <div className="bg-[#19c3e6] text-[#0c1f3f]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 text-sm @xl:flex-row @xl:items-center @xl:justify-between">
          <p className="flex items-center gap-2 font-semibold">
            <span className="relative flex size-2.5 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex size-full rounded-full bg-[#0c1f3f] opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[#0c1f3f]" />
            </span>
            24/7 emergency line: burst pipes, gas leaks, no hot water
          </p>
          <button
            type="button"
            onClick={() => setCallNote(true)}
            className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#0c1f3f] px-3 py-1.5 font-bold text-[#f2f7fb] hover:bg-[#13305e] motion-safe:transition-colors ${ringDark}`}
          >
            <Phone className="size-4" aria-hidden="true" />
            Call {PHONE}
          </button>
        </div>
        <div aria-live="polite">
          {callNote ? (
            <p className="mx-auto max-w-6xl px-4 pb-2.5 text-xs font-semibold">
              Demo only: on a live site this button dials {PHONE}. No call was made.
            </p>
          ) : null}
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-[#24497f]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="font-[family-name:var(--demo-font-heading)] text-lg font-bold uppercase leading-tight tracking-wide">
                {design.businessName}
              </p>
              <p className="text-xs text-[#a9bcd6]">Plumbing & gas · {LICENCE}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => go(quoteRef)}
            className={`rounded-md bg-[#19c3e6] px-4 py-2 text-sm font-bold uppercase text-[#0c1f3f] hover:bg-[#5ad6f0] @3xl:order-last ${ring}`}
          >
            Get a price
          </button>
          <nav aria-label="Site sections" className="w-full overflow-x-auto @3xl:w-auto">
            <ul className="flex gap-1">
              {nav.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => go(item.ref)}
                    className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-[#dce7f3] hover:bg-[#13305e] ${ring}`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section aria-labelledby={`${uid}-hero`} className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#19c3e630,transparent_60%)]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 @3xl:grid-cols-[1.1fr_1fr] @3xl:items-center @3xl:py-16 @5xl:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#24497f] bg-[#13305e] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#8fe3f5]">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {LICENCE}
            </p>
            <h2
              id={`${uid}-hero`}
              className="mt-4 text-4xl font-bold uppercase leading-[1.05] @xl:text-5xl @5xl:text-6xl"
            >
              Burst pipe at 2 am? <span className="text-[#19c3e6]">We're already on the way.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[#c3d2e6]">
              Upfront prices, licensed technicians and a fully stocked van at your door, day or
              night, across the {suburbs.length} suburbs we cover.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => go(quoteRef)} className={primaryBtn}>
                Get an instant quote
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(areaRef)}
                className={`inline-flex items-center gap-2 rounded-md border border-[#5f86bb] px-5 py-3 text-sm font-bold uppercase tracking-wide hover:border-[#19c3e6] ${ring}`}
              >
                <MapPin className="size-4" aria-hidden="true" />
                Check your suburb
              </button>
            </div>
            <ul className="mt-8 grid gap-3 text-sm @xl:grid-cols-2">
              {trust.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[#dce7f3]">
                  <BadgeCheck
                    className="mt-0.5 size-4 shrink-0 text-[#19c3e6]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* Services */}
      <section
        ref={servicesRef}
        aria-labelledby={`${uid}-services`}
        className="border-t border-[#24497f] bg-[#0a1a36]"
      >
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionIntro
            id={`${uid}-services`}
            eyebrow="What we fix"
            title="Plumbing and gas, done once"
          >
            Every job starts with a price range you can see on this page, and a fixed price
            confirmed on site before we pick up a tool.
          </SectionIntro>
          <ul className="mt-8 grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-3">
            {faults.map((f) => {
              const Icon = f.icon;
              return (
                <li
                  key={f.id}
                  className="flex flex-col rounded-xl border border-[#24497f] bg-[#13305e] p-5"
                >
                  <span className="grid size-11 place-items-center rounded-lg bg-[#0c1f3f] text-[#19c3e6]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h4 className="mt-4 text-lg font-bold uppercase">{f.label}</h4>
                  <p className="mt-1 flex-1 text-sm text-[#c3d2e6]">{f.blurb}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#24497f] pt-4">
                    <p className="text-sm text-[#a9bcd6]">
                      From <span className="font-bold text-[#f2f7fb]">{money(f.low)}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFaultId(f.id);
                        go(quoteRef);
                      }}
                      className={`inline-flex items-center gap-1 rounded text-sm font-semibold text-[#19c3e6] hover:underline ${ring}`}
                    >
                      Price this job
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Quote estimator */}
      <section
        ref={quoteRef}
        aria-labelledby={`${uid}-quote`}
        className="border-t border-[#24497f]"
      >
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionIntro
            id={`${uid}-quote`}
            eyebrow="Instant quote estimator"
            title="Know the price before we knock"
          >
            Pick the fault and how soon you need us. The range updates as you go.
          </SectionIntro>
          <div className="mt-8 grid gap-6 @3xl:grid-cols-[1.1fr_1fr]">
            <div className="space-y-7">
              <fieldset>
                <legend className="text-sm font-bold uppercase tracking-wider text-[#8fe3f5]">
                  1. What's the problem?
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2 @xl:grid-cols-3">
                  {faults.map((f) => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        aria-pressed={f.id === faultId}
                        onClick={() => setFaultId(f.id)}
                        className={`flex items-center gap-2 rounded-lg border border-[#2c5288] bg-[#13305e] px-3 py-3 text-left text-sm font-semibold hover:border-[#19c3e6] aria-pressed:border-[#19c3e6] aria-pressed:bg-[#19c3e6] aria-pressed:text-[#0c1f3f] motion-safe:transition-colors ${ring}`}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-bold uppercase tracking-wider text-[#8fe3f5]">
                  2. How urgent is it?
                </legend>
                <div className="mt-3 grid gap-2">
                  {urgencies.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      aria-pressed={u.id === urgencyId}
                      onClick={() => setUrgencyId(u.id)}
                      className={`group flex items-center justify-between gap-3 rounded-lg border border-[#2c5288] bg-[#13305e] px-4 py-3 text-left hover:border-[#19c3e6] aria-pressed:border-[#19c3e6] aria-pressed:bg-[#0f3a5c] ${ring}`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-[#5f86bb] group-aria-pressed:border-[#19c3e6]"
                        >
                          <span className="size-2.5 rounded-full bg-[#19c3e6] opacity-0 group-aria-pressed:opacity-100" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">{u.label}</span>
                          <span className="block text-xs text-[#a9bcd6]">{u.note}</span>
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-[#8fe3f5]">
                        {u.multiplier === 1
                          ? "Base rate"
                          : `+${Math.round((u.multiplier - 1) * 100)}%`}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <button
                type="button"
                aria-pressed={senior}
                onClick={() => setSenior((s) => !s)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border border-[#2c5288] bg-[#13305e] px-4 py-3 text-left text-sm ${ring}`}
              >
                <span>
                  <span className="block font-semibold">Seniors or pensioner card</span>
                  <span className="block text-xs text-[#a9bcd6]">Takes 10% off the estimate</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`relative h-6 w-11 shrink-0 rounded-full border border-[#5f86bb] ${senior ? "bg-[#19c3e6]" : "bg-[#091731]"}`}
                >
                  <span
                    className={`absolute top-0.5 size-[18px] rounded-full bg-[#f2f7fb] motion-safe:transition-transform ${senior ? "translate-x-[21px]" : "translate-x-0.5"}`}
                  />
                </span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-[#2c5288] bg-[linear-gradient(160deg,#13305e,#0e2449)] p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8fe3f5]">
                  Estimated price range
                </p>
                <output
                  aria-live="polite"
                  className="mt-2 block font-[family-name:var(--demo-font-heading)] text-4xl font-bold @xl:text-5xl"
                >
                  {range}
                </output>
                <p className="mt-1 text-sm text-[#c3d2e6]">
                  {fault.label} · {urgency.label}
                  {senior ? " · seniors discount applied" : ""}
                </p>
                <div className="mt-5 border-t border-[#2c5288] pt-5">
                  <h4 className="text-sm font-bold uppercase tracking-wide">What this includes</h4>
                  <ul className="mt-3 space-y-2 text-sm text-[#dce7f3]">
                    {[...fault.includes, urgency.include].map((item) => (
                      <li key={item} className="flex gap-2">
                        <CircleCheck
                          className="mt-0.5 size-4 shrink-0 text-[#19c3e6]"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {fault.id === "gas" ? (
                  <p className="mt-4 flex gap-2 rounded-lg border border-[#ffc15e] bg-[#2a2410] p-3 text-sm text-[#ffe2a8]">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    Smell gas right now? Leave the building, don't use switches or flames, and call
                    from outside. If anyone feels unwell, call 000.
                  </p>
                ) : null}
                <p className="mt-4 text-xs text-[#a9bcd6]">
                  Illustrative estimate in AUD for a typical home. Your technician confirms a fixed
                  price on site before any work starts; parts beyond those listed are quoted
                  separately.
                </p>
              </div>

              <div className="rounded-2xl border border-[#2c5288] bg-[#091731] p-6">
                <h4 id={`${uid}-lock`} className="text-xl font-bold uppercase">
                  Lock in this quote
                </h4>
                <p className="mt-1 text-sm text-[#c3d2e6]">
                  We hold {range} for 7 days and call you back to book a time.
                </p>
                {sent ? (
                  <DemoSent
                    title={sent}
                    onReset={reset}
                    className="mt-4 border border-[#19c3e6] bg-[#13305e] text-[#f2f7fb]"
                  />
                ) : (
                  <form
                    noValidate
                    onSubmit={submit}
                    aria-labelledby={`${uid}-lock`}
                    className="mt-4 space-y-4"
                  >
                    <TextField
                      id={`${uid}-name`}
                      name="name"
                      label="Your name"
                      autoComplete="name"
                      value={form.name}
                      onChange={update("name")}
                      error={errors.name}
                    />
                    <div className="grid gap-4 @xl:grid-cols-2">
                      <TextField
                        id={`${uid}-phone`}
                        name="phone"
                        label="Phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={update("phone")}
                        error={errors.phone}
                      />
                      <TextField
                        id={`${uid}-suburb`}
                        name="suburb"
                        label="Job suburb"
                        value={form.suburb}
                        onChange={update("suburb")}
                        error={errors.suburb}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`${uid}-notes`}
                        className="block text-sm font-semibold text-[#dce7f3]"
                      >
                        Anything we should know? <span className="font-normal">(optional)</span>
                      </label>
                      <textarea
                        id={`${uid}-notes`}
                        rows={3}
                        value={form.notes}
                        onChange={(e) => update("notes")(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <button type="submit" className={`${primaryBtn} w-full`}>
                      Lock in {range}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service area */}
      <section
        ref={areaRef}
        aria-labelledby={`${uid}-area`}
        className="border-t border-[#24497f] bg-[#0a1a36]"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 @3xl:grid-cols-2">
          <div>
            <SectionIntro
              id={`${uid}-area`}
              eyebrow="Service area"
              title="Do we cover your street?"
            >
              Our vans are based in Fernhollow and Lanternhill, so these suburbs get our fastest
              response times.
            </SectionIntro>
            <form
              role="search"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                runCheck(areaQuery);
              }}
              className="mt-6"
            >
              <label htmlFor={`${uid}-area-q`} className="block text-sm font-semibold">
                Suburb or postcode
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id={`${uid}-area-q`}
                  value={areaQuery}
                  onChange={(e) => setAreaQuery(e.target.value)}
                  aria-invalid={areaError ? true : undefined}
                  aria-describedby={areaError ? `${uid}-area-err` : undefined}
                  className={`${inputClass} mt-0`}
                />
                <button type="submit" className={`${primaryBtn} shrink-0 px-4`}>
                  <Search className="size-4" aria-hidden="true" />
                  Check
                </button>
              </div>
              {areaError ? (
                <p id={`${uid}-area-err`} className="mt-1 text-xs text-[#ff9b9b]">
                  {areaError}
                </p>
              ) : null}
            </form>
            <div aria-live="polite" className="mt-4">
              {areaResult?.kind === "in" ? (
                <div className="flex items-start gap-3 rounded-xl border border-[#19c3e6] bg-[#0f3a5c] p-4">
                  <CircleCheck
                    className="mt-0.5 size-5 shrink-0 text-[#19c3e6]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-bold">
                      We cover {areaResult.name} ({areaResult.postcode})
                    </p>
                    <p className="text-sm text-[#c3d2e6]">
                      Typical emergency arrival in 45 to 60 minutes (sample figure).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, suburb: areaResult.name }));
                        go(quoteRef);
                      }}
                      className={`mt-2 inline-flex items-center gap-1 rounded text-sm font-semibold text-[#19c3e6] hover:underline ${ring}`}
                    >
                      Price a job in {areaResult.name}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : areaResult?.kind === "out" ? (
                <div className="flex items-start gap-3 rounded-xl border border-[#ffc15e] bg-[#2a2410] p-4">
                  <CircleX className="mt-0.5 size-5 shrink-0 text-[#ffc15e]" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-[#ffe2a8]">Outside our area</p>
                    <p className="text-sm text-[#ffe2a8]">
                      "{areaResult.query}" isn't on our regular run. Call {PHONE} and we'll point
                      you to a trusted local plumber.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#a9bcd6]">
              Try:
              {["Fernhollow", "2994", "Ember Downs"].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setAreaQuery(example);
                    runCheck(example);
                  }}
                  className={`rounded-full border border-[#2c5288] px-3 py-1 text-[#dce7f3] hover:border-[#19c3e6] ${ring}`}
                >
                  {example}
                </button>
              ))}
            </p>
          </div>

          <div className="rounded-2xl border border-[#24497f] bg-[#13305e] p-6">
            <svg viewBox="0 0 300 150" className="w-full" aria-hidden="true">
              <rect width="300" height="150" rx="12" fill="#0c1f3f" />
              <path d="M0 128c60-12 90 16 150 6s110-20 150-8v24H0Z" fill="#0f3a5c" />
              <circle
                cx="150"
                cy="74"
                r="66"
                fill="#19c3e60d"
                stroke="#19c3e6"
                strokeOpacity="0.5"
                strokeDasharray="4 4"
              />
              <circle
                cx="150"
                cy="74"
                r="36"
                fill="#19c3e614"
                stroke="#19c3e6"
                strokeOpacity="0.35"
              />
              {suburbs.map((s) => (
                <circle key={s.name} cx={s.x} cy={s.y} r="4" fill="#19c3e6" />
              ))}
              <rect x="143" y="67" width="14" height="14" rx="3" fill="#f2f7fb" />
            </svg>
            <h4 className="mt-5 text-lg font-bold uppercase">Suburbs we cover</h4>
            <ul className="mt-3 grid gap-2 text-sm @xl:grid-cols-2">
              {suburbs.map((s) => (
                <li key={s.name} className="flex items-center gap-2">
                  <CircleCheck className="size-4 shrink-0 text-[#19c3e6]" aria-hidden="true" />
                  <span>{s.name}</span>
                  <span className="text-xs text-[#a9bcd6]">{s.postcode}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[#a9bcd6]">
              Suburbs and postcodes are fictional sample data.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section
        ref={reviewsRef}
        aria-labelledby={`${uid}-reviews`}
        className="border-t border-[#24497f]"
      >
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
            <SectionIntro
              id={`${uid}-reviews`}
              eyebrow="Reviews"
              title="Trusted at 2 am and 2 pm"
            />
            <div className="flex items-center gap-3">
              <span className="flex text-[#ffc15e]" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-5 fill-current" />
                ))}
              </span>
              <p className="text-sm text-[#c3d2e6]">4.9 average from 312 sample reviews</p>
            </div>
          </div>
          <ul className="mt-8 grid gap-4 @3xl:grid-cols-3">
            {reviews.map((r) => (
              <li
                key={r.name}
                className="flex flex-col rounded-xl border border-[#24497f] bg-[#13305e] p-5"
              >
                <p className="flex text-[#ffc15e]">
                  <span className="sr-only">5 out of 5 stars</span>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="size-4 fill-current" aria-hidden="true" />
                  ))}
                </p>
                <blockquote className="mt-3 flex-1 text-sm text-[#dce7f3]">"{r.text}"</blockquote>
                <div className="mt-4 flex items-end justify-between gap-2 border-t border-[#24497f] pt-3">
                  <p className="text-sm">
                    <span className="font-bold">{r.name}</span>
                    <span className="block text-xs text-[#a9bcd6]">
                      {r.suburb} · {r.job}
                    </span>
                  </p>
                  <span className="rounded-full border border-[#5f86bb] px-2 py-0.5 text-[11px] text-[#c3d2e6]">
                    Sample review
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#24497f] bg-[#081530]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm @xl:grid-cols-2 @5xl:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark />
              <p className="font-[family-name:var(--demo-font-heading)] font-bold uppercase">
                {design.businessName}
              </p>
            </div>
            <p className="mt-3 text-[#a9bcd6]">{LICENCE}</p>
            <p className="text-[#a9bcd6]">ABN 00 000 000 000 (sample)</p>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wide">Hours</h4>
            <dl className="mt-2 space-y-1 text-[#c3d2e6]">
              <div className="flex justify-between gap-4">
                <dt>Office, Mon–Fri</dt>
                <dd>7 am – 5 pm</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Saturday</dt>
                <dd>8 am – 12 pm</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Emergency line</dt>
                <dd className="font-semibold text-[#19c3e6]">24/7</dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wide">Depot</h4>
            <address className="mt-2 not-italic text-[#c3d2e6]">
              Unit 4, 18 Coppersmith Lane
              <br />
              Fernhollow NSW 2991
            </address>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-wide">Contact</h4>
            <p className="mt-2 flex items-center gap-2 text-[#c3d2e6]">
              <Phone className="size-4 text-[#19c3e6]" aria-hidden="true" />
              {PHONE}
            </p>
            <p className="mt-1 text-[#c3d2e6]">{EMAIL}</p>
          </div>
        </div>
      </footer>
      <DemoDisclaimer design={design} className="bg-[#081530] text-[#dce7f3]" />
    </DemoRoot>
  );
}
