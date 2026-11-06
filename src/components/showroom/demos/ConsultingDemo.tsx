import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Cog,
  Compass,
  Database,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

const PHONE = "(02) 5550 0142";
const PHONE_HREF = "tel:+61255500142";
const EMAIL = "hello@meridianadvisory.example";
const ADDRESS = "Level 9, 48 Kestrel Lane, Harbourside NSW 2000";

const ringLight =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f4fb0]";
const ringDark =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8fb2f5]";
const display = "font-[family-name:var(--demo-font-heading)]";

type AreaId = "strategy" | "operations" | "finance" | "digital" | "people" | "risk";

type PracticeArea = {
  id: AreaId;
  name: string;
  icon: LucideIcon;
  line: string;
  detail: string;
  engagements: readonly string[];
  typical: string;
};

const practiceAreas: readonly PracticeArea[] = [
  {
    id: "strategy",
    name: "Strategy",
    icon: Compass,
    line: "Where to play, and how to win there.",
    detail:
      "We help leadership teams choose a direction, test it against the market and turn it into a plan the whole organisation can follow.",
    engagements: [
      "Corporate and growth strategy",
      "Market entry and portfolio review",
      "Board strategy days",
    ],
    typical: "Typically 8 to 12 weeks",
  },
  {
    id: "operations",
    name: "Operations",
    icon: Cog,
    line: "Fewer hand-offs, faster delivery, lower cost to serve.",
    detail:
      "From the shop floor to the service desk, we map how work really flows, remove the waste and set up the routines that keep the gains.",
    engagements: [
      "Operating model design",
      "Supply chain and logistics",
      "Process and cost improvement",
    ],
    typical: "Typically 10 to 16 weeks",
  },
  {
    id: "finance",
    name: "Finance & capital",
    icon: Landmark,
    line: "Sharper numbers behind every big decision.",
    detail:
      "We build the models, funding cases and reporting that boards and lenders rely on, and help finance teams become partners to the business.",
    engagements: [
      "Capital allocation and funding",
      "Financial planning and modelling",
      "Due diligence support",
    ],
    typical: "Typically 6 to 10 weeks",
  },
  {
    id: "digital",
    name: "Digital & data",
    icon: Database,
    line: "Technology choices that pay for themselves.",
    detail:
      "We cut through vendor noise to set data foundations, pick platforms and sequence the change so new tools are actually used.",
    engagements: [
      "Data strategy and governance",
      "Technology selection",
      "Analytics and reporting",
    ],
    typical: "Typically 8 to 14 weeks",
  },
  {
    id: "people",
    name: "People & culture",
    icon: Users,
    line: "Organisations that people want to stay in.",
    detail:
      "We work on structure, leadership and capability so strategy survives contact with the day-to-day, from restructures to engagement turnarounds.",
    engagements: ["Organisation design", "Leadership and capability", "Change and transition"],
    typical: "Typically 8 to 12 weeks",
  },
  {
    id: "risk",
    name: "Risk & compliance",
    icon: ShieldCheck,
    line: "Confidence that you are covered, without the paperwork pile.",
    detail:
      "We assess risk honestly, build practical controls and prepare teams for audits and regulators, so compliance becomes routine, not a scramble.",
    engagements: [
      "Risk frameworks and controls",
      "Audit and regulator readiness",
      "Governance reviews",
    ],
    typical: "Typically 6 to 12 weeks",
  },
];

type CaseStudy = {
  id: string;
  areas: readonly AreaId[];
  sector: string;
  title: string;
  challenge: string;
  approach: string;
  results: readonly { value: string; label: string }[];
  kind: "line" | "bars";
  metric: string;
  series: readonly number[];
  chartLabel: string;
};

const caseStudies: readonly CaseStudy[] = [
  {
    id: "logistics",
    areas: ["operations", "digital"],
    sector: "Regional logistics group",
    title: "Getting orders out of the door faster",
    challenge:
      "Orders waited days between booking and dispatch because four depots ran four different processes on four systems.",
    approach:
      "We mapped the end-to-end flow, standardised the dispatch routine and moved all depots onto a single order view in one quarter.",
    results: [
      { value: "-42%", label: "order-to-dispatch time" },
      { value: "$3.1M", label: "annual cost saving" },
      { value: "14 wks", label: "to full rollout" },
    ],
    kind: "line",
    metric: "Order-to-dispatch time, index (start = 100)",
    series: [100, 94, 81, 70, 62, 58],
    chartLabel: "Line chart falling from 100 to 58 over six quarters.",
  },
  {
    id: "manufacturer",
    areas: ["strategy", "finance"],
    sector: "Mid-sized manufacturer",
    title: "A growth plan the lenders could back",
    challenge:
      "Demand was growing, but margins were thin and the board had no agreed view of which markets and products deserved capital.",
    approach:
      "We ranked products by contribution, built a three-year investment model and prepared the funding case for the bank.",
    results: [
      { value: "+8 pts", label: "EBITDA margin" },
      { value: "$18M", label: "funding secured" },
      { value: "3", label: "new markets entered" },
    ],
    kind: "bars",
    metric: "EBITDA margin, % by half-year",
    series: [11, 12, 14, 15, 17, 19],
    chartLabel: "Bar chart rising from 11 percent to 19 percent over six periods.",
  },
  {
    id: "health",
    areas: ["people", "risk"],
    sector: "Community health network",
    title: "Keeping staff and passing the audit",
    challenge:
      "High turnover and thin documentation left the network exposed at its next accreditation audit.",
    approach:
      "We redesigned rosters and team structures, trained leaders and put simple, owned controls in place for every audit area.",
    results: [
      { value: "-86%", label: "audit findings" },
      { value: "24% to 13%", label: "staff turnover" },
      { value: "9 mths", label: "start to finish" },
    ],
    kind: "bars",
    metric: "Open audit findings, count by quarter",
    series: [42, 35, 27, 18, 11, 6],
    chartLabel: "Bar chart falling from 42 findings to 6 over six quarters.",
  },
];

const approachSteps = [
  {
    name: "Diagnose",
    time: "Weeks 1 to 2",
    text: "We listen first: interviews, data and site visits to find the real problem, not just the stated one.",
  },
  {
    name: "Design",
    time: "Weeks 3 to 5",
    text: "Options are tested with your team and costed, so you choose a path with the trade-offs in plain view.",
  },
  {
    name: "Deliver",
    time: "Weeks 6 to 12",
    text: "We work alongside your people to put the plan in place, with a weekly rhythm and visible progress.",
  },
  {
    name: "Embed",
    time: "After handover",
    text: "Owners, measures and routines are set so results hold once we step back, with a review at 90 days.",
  },
] as const;

const team = [
  {
    name: "Dr Imogen Hale",
    initials: "IH",
    role: "Managing Partner",
    focus: "Strategy and board advisory",
    tone: "#0f2a4a",
    bio: "Twenty years advising boards on growth and portfolio decisions.",
  },
  {
    name: "Rahul Menon",
    initials: "RM",
    role: "Partner",
    focus: "Finance and capital",
    tone: "#1f4fb0",
    bio: "Former CFO who now builds funding cases and financial models for mid-sized firms.",
  },
  {
    name: "Chloe Nguyen",
    initials: "CN",
    role: "Director",
    focus: "Digital and data",
    tone: "#334e7a",
    bio: "Leads data foundations and platform selection, with a bias for practical rollouts.",
  },
  {
    name: "Tom Aldridge",
    initials: "TA",
    role: "Director",
    focus: "People and risk",
    tone: "#25476f",
    bio: "Specialises in organisation design, regulator readiness and change that sticks.",
  },
] as const;

const insights = [
  {
    id: "stall",
    tag: "Operations",
    time: "6 min read",
    title: "Why operating-model reviews stall at month four",
    summary:
      "Most reviews lose momentum when design ends and ownership is unclear. Name the owners in week one and agree what stops, not just what starts.",
  },
  {
    id: "capital",
    tag: "Finance & capital",
    time: "8 min read",
    title: "A board-ready view of capital allocation",
    summary:
      "Boards decide better when every proposal is scored the same way. A one-page template for comparing returns, risk and strategic fit.",
  },
  {
    id: "data",
    tag: "Digital & data",
    time: "7 min read",
    title: "Data foundations before AI: a sequencing guide",
    summary:
      "New tools disappoint when the data underneath is unreliable. Fix definitions, ownership and quality first, then choose the use cases.",
  },
] as const;

const sizes = ["1 to 19 people", "20 to 199 people", "200 to 999 people", "1,000 or more"] as const;
const timeframes = [
  "Within a month",
  "In 1 to 3 months",
  "In 3 to 6 months",
  "Just exploring for now",
] as const;
const budgets = [
  "Under $50,000",
  "$50,000 to $150,000",
  "$150,000 to $400,000",
  "$400,000 or more",
  "Not sure yet",
] as const;

const stepLabels = ["Your needs", "Your business", "Your details", "Review"] as const;
const LAST_STEP = stepLabels.length - 1;

type Field = "areas" | "size" | "timeframe" | "budget" | "name" | "company" | "email" | "phone";
type Errors = Partial<Record<Field, string>>;

const areaName = (id: AreaId) => practiceAreas.find((a) => a.id === id)?.name ?? id;

function Meridian({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" className={className}>
      <g fill="none" stroke="#5b8def" strokeWidth="1">
        <circle cx="200" cy="200" r="170" strokeOpacity="0.5" />
        <circle cx="200" cy="200" r="120" strokeOpacity="0.35" />
        <circle cx="200" cy="200" r="70" strokeOpacity="0.5" />
        <ellipse cx="200" cy="200" rx="60" ry="170" strokeOpacity="0.35" />
        <ellipse cx="200" cy="200" rx="115" ry="170" strokeOpacity="0.22" />
        <path d="M30 200 H370 M200 30 V370" strokeOpacity="0.4" />
        <path d="M80 80 L320 320" strokeOpacity="0.15" strokeDasharray="4 6" />
      </g>
      <circle cx="200" cy="200" r="6" fill="#5b8def" />
      <circle cx="290" cy="112" r="4" fill="#e2e8f0" />
      <circle cx="120" cy="290" r="4" fill="#e2e8f0" />
      <path d="M200 200 L290 112" stroke="#e2e8f0" strokeOpacity="0.6" strokeWidth="1.5" />
    </svg>
  );
}

function MiniChart({ study }: { study: CaseStudy }) {
  const width = 240;
  const height = 100;
  const left = 8;
  const base = 84;
  const top = 8;
  const max = Math.max(...study.series, 1);
  const n = study.series.length;
  const slot = (width - left * 2) / n;
  const y = (v: number) => base - (v / max) * (base - top);
  const x = (i: number) => left + slot * i + slot / 2;
  const points = study.series.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const lastIndex = n - 1;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={study.chartLabel}
      className="h-auto w-full"
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={left}
          x2={width - left}
          y1={base - f * (base - top)}
          y2={base - f * (base - top)}
          stroke="#cbd5e1"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
      ))}
      <line x1={left} x2={width - left} y1={base} y2={base} stroke="#94a3b8" strokeWidth="1" />
      {study.kind === "bars" ? (
        study.series.map((v, i) => (
          <rect
            key={`bar-${i}-${v}`}
            x={x(i) - slot * 0.3}
            y={y(v)}
            width={slot * 0.6}
            height={base - y(v)}
            rx="2"
            fill={i === lastIndex ? "#0f2a4a" : "#1f4fb0"}
            fillOpacity={i === lastIndex ? 1 : 0.55}
          />
        ))
      ) : (
        <>
          <polygon
            points={`${x(0)},${base} ${points} ${x(lastIndex)},${base}`}
            fill="#1f4fb0"
            fillOpacity="0.12"
          />
          <polyline
            points={points}
            fill="none"
            stroke="#1f4fb0"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {study.series.map((v, i) => (
            <circle
              key={`pt-${i}-${v}`}
              cx={x(i)}
              cy={y(v)}
              r={i === lastIndex ? 4.5 : 2.5}
              fill={i === lastIndex ? "#0f2a4a" : "#1f4fb0"}
            />
          ))}
        </>
      )}
      {study.series.map((v, i) => (
        <text
          key={`lbl-${i}-${v}`}
          x={x(i)}
          y={height - 3}
          textAnchor="middle"
          fontSize="8"
          fill="#475569"
        >
          {`P${i + 1}`}
        </text>
      ))}
    </svg>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="mb-8 max-w-2xl @3xl:mb-12">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#1f4fb0]">{eyebrow}</p>
      <h3
        id={id}
        className={cn(
          display,
          "mt-2 text-3xl font-normal leading-tight text-[#0f2a4a] @3xl:text-4xl",
        )}
      >
        {title}
      </h3>
      <span aria-hidden="true" className="mt-4 block h-0.5 w-12 bg-[#1f4fb0]" />
      {intro ? <p className="mt-4 text-[#475569]">{intro}</p> : null}
    </div>
  );
}

const choiceLabel =
  "flex cursor-pointer items-start gap-3 rounded-lg border border-slate-300 bg-white p-3 text-sm text-[#1e293b] hover:border-[#1f4fb0] has-[:checked]:border-[#1f4fb0] has-[:checked]:bg-[#e8effc] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#1f4fb0]";

function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  errorId,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  error: string | undefined;
  errorId: string;
}) {
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="text-sm font-semibold text-[#0f2a4a]">{legend}</legend>
      <div className="mt-2 grid gap-2 @xl:grid-cols-2">
        {options.map((o) => (
          <label key={o} className={choiceLabel}>
            <input
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
              aria-invalid={Boolean(error)}
              className="mt-0.5 size-4 shrink-0 accent-[#1f4fb0]"
            />
            {o}
          </label>
        ))}
      </div>
      {error ? (
        <p id={errorId} className="mt-2 text-sm font-medium text-[#b42318]">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function ConsultingDemo({ design }: DemoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const areasRef = useRef<HTMLElement>(null);
  const casesRef = useRef<HTMLElement>(null);
  const approachRef = useRef<HTMLElement>(null);
  const teamRef = useRef<HTMLElement>(null);
  const consultRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const focusHeading = useRef(false);
  const focusError = useRef(false);

  const [openAreas, setOpenAreas] = useState<AreaId[]>(["strategy"]);
  const [filter, setFilter] = useState<AreaId | "all">("all");
  const [openInsights, setOpenInsights] = useState<string[]>([]);

  const [step, setStep] = useState(0);
  const [areas, setAreas] = useState<AreaId[]>([]);
  const [size, setSize] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const go = (ref: RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ block: "nearest" });
  const nav = [
    { label: "Practice areas", ref: areasRef },
    { label: "Case studies", ref: casesRef },
    { label: "Approach", ref: approachRef },
    { label: "Team", ref: teamRef },
    { label: "Consultation", ref: consultRef },
  ] as const;
  const filters: readonly { id: AreaId | "all"; name: string }[] = [
    { id: "all", name: "All areas" },
    ...practiceAreas,
  ];

  const visibleCases = caseStudies.filter((c) => filter === "all" || c.areas.includes(filter));
  const selectedAreas = practiceAreas.filter((a) => areas.includes(a.id));
  const allAreasOpen = openAreas.length === practiceAreas.length;
  const currentLabel = stepLabels[step] ?? stepLabels[0];

  useEffect(() => {
    if (focusHeading.current) {
      focusHeading.current = false;
      headingRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (focusError.current) {
      focusError.current = false;
      formRef.current?.querySelector<HTMLElement>("input[aria-invalid='true']")?.focus();
    }
  }, [errors]);

  const toggleArea = (id: AreaId) =>
    setOpenAreas((cur) => (cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]));
  const toggleInsight = (id: string) =>
    setOpenInsights((cur) => (cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]));
  const toggleSelected = (id: AreaId) =>
    setAreas((cur) => (cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]));

  function requestFor(id: AreaId) {
    if (sent) reset();
    setAreas((cur) => (cur.includes(id) ? cur : [...cur, id]));
    setErrors({});
    go(consultRef);
  }

  function validate(forStep: number): Errors {
    const next: Errors = {};
    if (forStep === 0 && areas.length === 0)
      next.areas = "Choose at least one area you would like help with.";
    if (forStep === 1) {
      if (!size) next.size = "Choose the size of your organisation.";
      if (!timeframe) next.timeframe = "Choose when you would like to start.";
      if (!budget) next.budget = "Choose a budget band, or 'Not sure yet'.";
    }
    if (forStep === 2) {
      if (!name.trim()) next.name = "Enter your name.";
      if (!company.trim()) next.company = "Enter your organisation's name.";
      if (!/^\S+@\S+\.\S+$/.test(email.trim()))
        next.email = "Enter a valid email address, like name@company.example.";
      const digits = phone.replace(/\D/g, "");
      if (phone.trim() && (digits.length < 8 || digits.length > 11))
        next.phone = "Enter a valid Australian phone number, or leave this blank.";
    }
    return next;
  }

  function goToStep(n: number) {
    focusHeading.current = true;
    setErrors({});
    setStep(n);
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(step);
    if (Object.keys(found).length > 0) {
      focusError.current = true;
      setErrors(found);
      return;
    }
    if (step < LAST_STEP) {
      goToStep(step + 1);
      return;
    }
    setSent(true);
  }

  function reset() {
    setStep(0);
    setAreas([]);
    setSize("");
    setTimeframe("");
    setBudget("");
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setMessage("");
    setErrors({});
    setSent(false);
  }

  const errorCount = Object.keys(errors).length;
  const inputCls = cn(
    "mt-1.5 w-full rounded-md border border-slate-400 bg-white px-3 py-2.5 text-[#1e293b] placeholder:text-slate-500 aria-[invalid=true]:border-[#b42318]",
    ringLight,
  );
  const labelCls = "text-sm font-semibold text-[#0f2a4a]";
  const errId = (f: Field) => `${uid}-${f}-err`;
  const errorText = (f: Field) =>
    errors[f] ? (
      <p id={errId(f)} className="mt-1.5 text-sm font-medium text-[#b42318]">
        {errors[f]}
      </p>
    ) : null;
  const described = (f: Field) => (errors[f] ? errId(f) : undefined);
  const primaryBtn = cn(
    "inline-flex items-center justify-center gap-2 rounded-md bg-[#1f4fb0] px-5 py-3 text-sm font-semibold text-white hover:bg-[#173f8f] motion-safe:transition-colors",
    ringLight,
  );
  const lightBtn = cn(
    "inline-flex items-center justify-center gap-2 rounded-md bg-[#5b8def] px-5 py-3 text-sm font-semibold text-[#0f2a4a] hover:bg-[#7ba2f2] motion-safe:transition-colors",
    ringDark,
  );
  const outlineBtn = cn(
    "inline-flex items-center justify-center gap-2 rounded-md border border-slate-400 bg-white px-5 py-3 text-sm font-semibold text-[#0f2a4a] hover:border-[#1f4fb0]",
    ringLight,
  );

  const reviewGroups = [
    {
      title: "What you need",
      target: 0,
      rows: [["Practice areas", selectedAreas.map((a) => a.name).join(", ")]],
    },
    {
      title: "Your business",
      target: 1,
      rows: [
        ["Size", size],
        ["Start", timeframe],
        ["Budget", budget],
      ],
    },
    {
      title: "Your details",
      target: 2,
      rows: [
        ["Name", name],
        ["Organisation", company],
        ["Email", email],
        ["Phone", phone.trim() || "Not provided"],
        ["Notes", message.trim() || "None"],
      ],
    },
  ] as const;

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.sansHumanist, heading: demoFonts.serifBook }}
      className="bg-[#f4f6f9] text-[#1e293b]"
    >
      <header className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <p className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" aria-hidden="true" className="size-7 shrink-0">
              <circle cx="16" cy="16" r="14" fill="#0f2a4a" />
              <ellipse
                cx="16"
                cy="16"
                rx="6"
                ry="14"
                fill="none"
                stroke="#5b8def"
                strokeWidth="1.5"
              />
              <path d="M2 16 H30" stroke="#5b8def" strokeWidth="1.5" />
            </svg>
            <span className={cn(display, "text-xl text-[#0f2a4a]")}>{design.businessName}</span>
          </p>
          <nav aria-label="Demo site sections" className="hidden items-center gap-1 @3xl:flex">
            {nav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.ref)}
                className={cn(
                  "rounded px-3 py-2 text-sm font-medium text-[#334155] hover:text-[#1f4fb0]",
                  ringLight,
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <a
            href={PHONE_HREF}
            className={cn(
              "hidden items-center gap-2 rounded text-sm font-semibold text-[#1f4fb0] @xl:inline-flex",
              ringLight,
            )}
          >
            <Phone aria-hidden="true" className="size-4" /> {PHONE}
          </a>
        </div>
        <nav
          aria-label="Demo site sections, compact"
          className="border-t border-slate-200 @3xl:hidden"
        >
          <ul className="flex gap-1 overflow-x-auto px-3 py-1.5">
            {nav.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => go(item.ref)}
                  className={cn(
                    "whitespace-nowrap rounded px-2.5 py-1.5 text-sm text-[#334155]",
                    ringLight,
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Hero */}
      <section
        aria-labelledby={`${uid}-hero`}
        className="relative overflow-hidden bg-[#0f2a4a] text-[#e2e8f0]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(91,141,239,0.22),transparent_55%),linear-gradient(160deg,#143358,#0f2a4a_60%,#0a1f38)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 @3xl:grid-cols-[1.3fr_1fr] @3xl:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5b8def]">
              Independent business advisory
            </p>
            <h2
              id={`${uid}-hero`}
              className={cn(
                display,
                "mt-4 text-4xl font-normal leading-[1.08] text-white @xl:text-5xl @5xl:text-6xl",
              )}
            >
              Clear advice for the decisions that shape your business.
            </h2>
            <p className="mt-5 max-w-xl text-lg text-[#cbd5e1]">
              {design.businessName} works with Australian leadership teams on strategy, operations,
              finance, technology and people, and stays until the results hold.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => go(consultRef)} className={lightBtn}>
                Request a consultation <ArrowRight aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => go(casesRef)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-md border border-[#5b8def] px-5 py-3 text-sm font-semibold text-white hover:bg-white/10",
                  ringDark,
                )}
              >
                See case studies
              </button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/20 pt-6">
              {[
                ["180+", "Sample engagements"],
                ["12", "Industries served"],
                ["26", "Advisers"],
              ].map(([v, l]) => (
                <div key={l} className="flex flex-col-reverse">
                  <dt className="mt-1 text-xs uppercase tracking-wider text-[#cbd5e1]">{l}</dt>
                  <dd className={cn(display, "text-3xl text-[#5b8def] @xl:text-4xl")}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-[#b8c4d6]">
              Figures are sample content for this demonstration.
            </p>
          </div>
          <Meridian className="mx-auto hidden size-full max-h-[22rem] max-w-sm @3xl:block" />
        </div>
      </section>

      {/* Practice areas */}
      <section
        ref={areasRef}
        aria-labelledby={`${uid}-areas`}
        className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20"
      >
        <SectionHeading
          id={`${uid}-areas`}
          eyebrow="Practice areas"
          title="Six disciplines, one joined-up team"
          intro="Open any area to see what we do, the typical engagements and how long they run."
        />
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setOpenAreas(allAreasOpen ? [] : practiceAreas.map((a) => a.id))}
            className={cn(
              "rounded text-sm font-semibold text-[#1f4fb0] underline underline-offset-4",
              ringLight,
            )}
          >
            {allAreasOpen ? "Close all areas" : "Open all areas"}
          </button>
        </div>
        <ul className="grid items-start gap-4 @xl:grid-cols-2 @5xl:grid-cols-3">
          {practiceAreas.map((a) => {
            const isOpen = openAreas.includes(a.id);
            const Icon = a.icon;
            return (
              <li
                key={a.id}
                className={cn(
                  "rounded-lg border bg-white shadow-sm",
                  isOpen ? "border-[#1f4fb0]" : "border-slate-300",
                )}
              >
                <h4 className="m-0 font-normal">
                  <button
                    id={`${uid}-area-${a.id}`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-area-panel-${a.id}`}
                    onClick={() => toggleArea(a.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg p-5 text-left hover:bg-slate-50",
                      ringLight,
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#0f2a4a] text-[#5b8def]">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn(display, "block text-xl text-[#0f2a4a]")}>{a.name}</span>
                      <span className="mt-1 block text-sm text-[#475569]">{a.line}</span>
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "mt-1 size-5 shrink-0 text-[#1f4fb0] motion-safe:transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                </h4>
                <div
                  id={`${uid}-area-panel-${a.id}`}
                  role="region"
                  aria-labelledby={`${uid}-area-${a.id}`}
                  hidden={!isOpen}
                  className="border-t border-slate-200 px-5 pb-5 pt-4"
                >
                  <p className="text-sm text-[#1e293b]">{a.detail}</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-[#334155]">
                    {a.engagements.map((en) => (
                      <li key={en} className="flex items-start gap-2">
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-[#1f4fb0]"
                        />{" "}
                        {en}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#475569]">
                    <Clock aria-hidden="true" className="size-3.5" /> {a.typical}
                  </p>
                  <button
                    type="button"
                    onClick={() => requestFor(a.id)}
                    className={cn("mt-4 w-full", primaryBtn)}
                  >
                    Request help with {a.name.toLowerCase()}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Case studies */}
      <section
        ref={casesRef}
        aria-labelledby={`${uid}-cases`}
        className="border-y border-slate-300 bg-white"
      >
        <div className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20">
          <SectionHeading
            id={`${uid}-cases`}
            eyebrow="Case studies"
            title="Results, shown plainly"
            intro="Three illustrative case studies. Filter by practice area to see the work closest to your own challenge."
          />
          <div
            role="group"
            aria-label="Filter case studies by practice area"
            className="flex flex-wrap gap-2"
          >
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium motion-safe:transition-colors",
                  ringLight,
                  filter === f.id
                    ? "border-[#1f4fb0] bg-[#1f4fb0] text-white"
                    : "border-slate-400 bg-white text-[#1e293b] hover:border-[#1f4fb0]",
                )}
              >
                {f.name}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="mt-4 text-sm text-[#475569]">
            Showing {visibleCases.length} of {caseStudies.length} illustrative case studies
            {filter === "all" ? "." : ` for ${areaName(filter).toLowerCase()}.`}
          </p>
          <div className="mt-6 grid gap-6 @5xl:grid-cols-3">
            {visibleCases.map((c) => (
              <article
                key={c.id}
                aria-labelledby={`${uid}-case-${c.id}`}
                className="flex flex-col rounded-lg border border-slate-300 bg-[#f4f6f9] p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[#0f2a4a] px-2 py-0.5 text-xs font-semibold text-white">
                    Illustrative case study
                  </span>
                  {c.areas.map((a) => (
                    <span
                      key={a}
                      className="rounded border border-slate-400 px-2 py-0.5 text-xs text-[#334155]"
                    >
                      {areaName(a)}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#475569]">
                  {c.sector}
                </p>
                <h4
                  id={`${uid}-case-${c.id}`}
                  className={cn(display, "mt-1 text-xl font-normal text-[#0f2a4a]")}
                >
                  {c.title}
                </h4>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-[#0f2a4a]">Challenge</dt>
                    <dd className="mt-0.5 text-[#334155]">{c.challenge}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#0f2a4a]">Approach</dt>
                    <dd className="mt-0.5 text-[#334155]">{c.approach}</dd>
                  </div>
                </dl>
                <figure className="mt-4 rounded-md border border-slate-300 bg-white p-3">
                  <MiniChart study={c} />
                  <figcaption className="mt-1 text-xs text-[#475569]">{c.metric}</figcaption>
                </figure>
                <p className="mt-4 text-sm font-semibold text-[#0f2a4a]">Result</p>
                <ul className="mt-1 grid grid-cols-3 gap-2">
                  {c.results.map((r) => (
                    <li key={r.label} className="rounded-md bg-[#0f2a4a] px-2 py-2.5 text-center">
                      <span
                        className={cn(
                          display,
                          "block text-lg leading-tight text-[#5b8def] @xl:text-xl",
                        )}
                      >
                        {r.value}
                      </span>
                      <span className="mt-1 block text-[0.7rem] leading-snug text-[#d5deec]">
                        {r.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-[#475569]">
                  Invented for this demonstration. Not a real client.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section
        ref={approachRef}
        aria-labelledby={`${uid}-approach`}
        className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20"
      >
        <SectionHeading
          id={`${uid}-approach`}
          eyebrow="Our approach"
          title="Four steps, no surprises"
          intro="Every engagement follows the same shape, so you always know where you are and what comes next."
        />
        <ol className="grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
          {approachSteps.map((s, i) => (
            <li key={s.name} className="relative rounded-lg border border-slate-300 bg-white p-5">
              <span
                className={cn(
                  display,
                  "grid size-10 place-items-center rounded-full bg-[#0f2a4a] text-lg text-[#5b8def]",
                )}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <h4 className={cn(display, "mt-4 text-xl font-normal text-[#0f2a4a]")}>
                <span className="sr-only">Step {i + 1}: </span>
                {s.name}
              </h4>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#1f4fb0]">
                {s.time}
              </p>
              <p className="mt-3 text-sm text-[#334155]">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Team */}
      <section
        ref={teamRef}
        aria-labelledby={`${uid}-team`}
        className="border-y border-slate-300 bg-white"
      >
        <div className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20">
          <SectionHeading
            id={`${uid}-team`}
            eyebrow="Team"
            title="The people you will work with"
            intro="Partners stay involved from the first conversation to the last review."
          />
          <ul className="grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
            {team.map((t) => (
              <li key={t.name} className="rounded-lg border border-slate-300 bg-[#f4f6f9] p-5">
                <div
                  aria-hidden="true"
                  className={cn(
                    display,
                    "grid size-16 place-items-center rounded-full text-xl text-white",
                  )}
                  style={{ backgroundColor: t.tone }}
                >
                  {t.initials}
                </div>
                <h4 className={cn(display, "mt-4 text-xl font-normal text-[#0f2a4a]")}>{t.name}</h4>
                <p className="text-sm font-semibold text-[#1f4fb0]">{t.role}</p>
                <p className="text-sm text-[#475569]">{t.focus}</p>
                <p className="mt-3 text-sm text-[#334155]">{t.bio}</p>
                <span className="mt-4 inline-block rounded border border-slate-400 px-2 py-0.5 text-xs text-[#334155]">
                  Sample profile
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Insights */}
      <section
        aria-labelledby={`${uid}-insights`}
        className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20"
      >
        <SectionHeading
          id={`${uid}-insights`}
          eyebrow="Insights"
          title="Thinking worth your time"
        />
        <div className="grid items-start gap-4 @3xl:grid-cols-3">
          {insights.map((a) => {
            const isOpen = openInsights.includes(a.id);
            return (
              <article
                key={a.id}
                aria-labelledby={`${uid}-ins-${a.id}`}
                className="rounded-lg border border-slate-300 bg-white p-5"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded bg-[#e8effc] px-2 py-0.5 font-semibold text-[#173f8f]">
                    {a.tag}
                  </span>
                  <span className="text-[#475569]">{a.time}</span>
                </div>
                <h4
                  id={`${uid}-ins-${a.id}`}
                  className={cn(display, "mt-4 text-xl font-normal leading-snug text-[#0f2a4a]")}
                >
                  {a.title}
                </h4>
                <p
                  id={`${uid}-ins-sum-${a.id}`}
                  hidden={!isOpen}
                  className="mt-3 text-sm text-[#334155]"
                >
                  {a.summary}
                </p>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`${uid}-ins-sum-${a.id}`}
                  onClick={() => toggleInsight(a.id)}
                  className={cn(
                    "mt-4 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-[#1f4fb0]",
                    ringLight,
                  )}
                >
                  {isOpen ? "Hide summary" : "Read the summary"}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-4 motion-safe:transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <p className="mt-3 text-xs text-[#475569]">Sample article</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Consultation */}
      <section
        ref={consultRef}
        aria-labelledby={`${uid}-consult`}
        className="bg-[#0f2a4a] text-[#e2e8f0]"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 @3xl:py-20 @5xl:grid-cols-[320px_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5b8def]">
              Consultation
            </p>
            <h3
              id={`${uid}-consult`}
              className={cn(
                display,
                "mt-2 text-3xl font-normal leading-tight text-white @3xl:text-4xl",
              )}
            >
              Start with a conversation
            </h3>
            <p className="mt-4 text-[#cbd5e1]">
              Tell us what you are working on in four short steps. A partner replies within one
              business day to arrange a free 30-minute introductory call.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#e2e8f0]">
              <li className="flex items-center gap-3">
                <Phone aria-hidden="true" className="size-4 shrink-0 text-[#5b8def]" />
                <a
                  href={PHONE_HREF}
                  className={cn("rounded underline underline-offset-4", ringDark)}
                >
                  {PHONE}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail aria-hidden="true" className="size-4 shrink-0 text-[#5b8def]" /> {EMAIL}
              </li>
              <li className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#5b8def]" />{" "}
                {ADDRESS}
              </li>
              <li className="flex items-center gap-3">
                <Clock aria-hidden="true" className="size-4 shrink-0 text-[#5b8def]" /> Mon to Fri,
                8:30 am to 5:30 pm
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-white p-5 text-[#1e293b] shadow-xl @xl:p-8">
            {sent ? (
              <DemoSent
                title="Consultation request received"
                onReset={reset}
                className="bg-[#e8effc] text-[#0f2a4a]"
              />
            ) : (
              <form ref={formRef} noValidate onSubmit={submit} aria-label="Consultation request">
                <p className="sr-only" aria-live="polite">
                  Step {step + 1} of {stepLabels.length}: {currentLabel}
                </p>
                <div
                  role="progressbar"
                  aria-label="Consultation request progress"
                  aria-valuemin={1}
                  aria-valuemax={stepLabels.length}
                  aria-valuenow={step + 1}
                  aria-valuetext={`Step ${step + 1} of ${stepLabels.length}: ${currentLabel}`}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
                >
                  <div
                    className="h-full rounded-full bg-[#1f4fb0] motion-safe:transition-all"
                    style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}
                  />
                </div>
                <ol className="mt-3 grid grid-cols-4 gap-2">
                  {stepLabels.map((l, i) => (
                    <li
                      key={l}
                      aria-current={i === step ? "step" : undefined}
                      className="flex flex-col items-start gap-1 @xl:flex-row @xl:items-center @xl:gap-2"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                          i < step && "border-[#1f4fb0] bg-[#1f4fb0] text-white",
                          i === step && "border-[#0f2a4a] bg-[#0f2a4a] text-white",
                          i > step && "border-slate-400 bg-white text-[#475569]",
                        )}
                      >
                        {i < step ? <Check className="size-3.5" /> : i + 1}
                      </span>
                      <span
                        className={cn(
                          "text-xs @xl:text-sm",
                          i === step ? "font-semibold text-[#0f2a4a]" : "text-[#475569]",
                        )}
                      >
                        <span className="sr-only">Step {i + 1}: </span>
                        {l}
                        {i < step ? <span className="sr-only"> (completed)</span> : null}
                      </span>
                    </li>
                  ))}
                </ol>

                <h4
                  ref={headingRef}
                  tabIndex={-1}
                  className={cn(display, "mt-6 text-2xl font-normal text-[#0f2a4a]", ringLight)}
                >
                  {step === 0 ? "What do you need help with?" : null}
                  {step === 1 ? "Tell us about your business" : null}
                  {step === 2 ? "How can we reach you?" : null}
                  {step === 3 ? "Review and send" : null}
                </h4>
                <p className="mt-1 text-sm text-[#475569]">
                  Step {step + 1} of {stepLabels.length}
                  {step === 0 ? ". Choose as many as apply." : null}
                  {step === 3 ? ". Check the details, then send your request." : null}
                </p>

                {errorCount > 0 ? (
                  <div
                    role="alert"
                    className="mt-4 rounded-md border border-[#b42318] bg-[#fef3f2] px-3 py-2 text-sm font-medium text-[#912018]"
                  >
                    {errorCount === 1
                      ? "There is 1 thing to fix before you continue."
                      : `There are ${errorCount} things to fix before you continue.`}
                  </div>
                ) : null}

                {step === 0 ? (
                  <fieldset className="mt-4" aria-describedby={described("areas")}>
                    <legend className="sr-only">Practice areas</legend>
                    <div className="grid gap-2 @xl:grid-cols-2">
                      {practiceAreas.map((a) => {
                        const Icon = a.icon;
                        return (
                          <label key={a.id} className={choiceLabel}>
                            <input
                              type="checkbox"
                              checked={areas.includes(a.id)}
                              onChange={() => toggleSelected(a.id)}
                              aria-invalid={Boolean(errors.areas)}
                              aria-describedby={described("areas")}
                              className="mt-0.5 size-4 shrink-0 accent-[#1f4fb0]"
                            />
                            <span>
                              <span className="flex items-center gap-2 font-semibold text-[#0f2a4a]">
                                <Icon aria-hidden="true" className="size-4 text-[#1f4fb0]" />{" "}
                                {a.name}
                              </span>
                              <span className="mt-0.5 block text-[#475569]">{a.line}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errorText("areas")}
                  </fieldset>
                ) : null}

                {step === 1 ? (
                  <div className="mt-4 space-y-6">
                    <ChoiceGroup
                      legend="Organisation size"
                      name={`${uid}-size`}
                      options={sizes}
                      value={size}
                      onChange={setSize}
                      error={errors.size}
                      errorId={errId("size")}
                    />
                    <ChoiceGroup
                      legend="When would you like to start?"
                      name={`${uid}-time`}
                      options={timeframes}
                      value={timeframe}
                      onChange={setTimeframe}
                      error={errors.timeframe}
                      errorId={errId("timeframe")}
                    />
                    <ChoiceGroup
                      legend="Budget band"
                      name={`${uid}-budget`}
                      options={budgets}
                      value={budget}
                      onChange={setBudget}
                      error={errors.budget}
                      errorId={errId("budget")}
                    />
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="mt-4 grid gap-4 @xl:grid-cols-2">
                    <div>
                      <label htmlFor={`${uid}-name`} className={labelCls}>
                        Your name
                      </label>
                      <input
                        id={`${uid}-name`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={described("name")}
                        className={inputCls}
                      />
                      {errorText("name")}
                    </div>
                    <div>
                      <label htmlFor={`${uid}-company`} className={labelCls}>
                        Organisation
                      </label>
                      <input
                        id={`${uid}-company`}
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        autoComplete="organization"
                        aria-invalid={Boolean(errors.company)}
                        aria-describedby={described("company")}
                        className={inputCls}
                      />
                      {errorText("company")}
                    </div>
                    <div>
                      <label htmlFor={`${uid}-email`} className={labelCls}>
                        Work email
                      </label>
                      <input
                        id={`${uid}-email`}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={described("email")}
                        className={inputCls}
                      />
                      {errorText("email")}
                    </div>
                    <div>
                      <label htmlFor={`${uid}-phone`} className={labelCls}>
                        Phone <span className="font-normal text-[#475569]">(optional)</span>
                      </label>
                      <input
                        id={`${uid}-phone`}
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={described("phone")}
                        className={inputCls}
                      />
                      {errorText("phone")}
                    </div>
                    <div className="@xl:col-span-2">
                      <label htmlFor={`${uid}-message`} className={labelCls}>
                        Anything we should know?{" "}
                        <span className="font-normal text-[#475569]">(optional)</span>
                      </label>
                      <textarea
                        id={`${uid}-message`}
                        rows={4}
                        maxLength={600}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="mt-4 space-y-3">
                    {reviewGroups.map((g) => (
                      <section
                        key={g.title}
                        aria-label={g.title}
                        className="rounded-lg border border-slate-300 bg-[#f4f6f9] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-[#0f2a4a]">{g.title}</p>
                          <button
                            type="button"
                            onClick={() => goToStep(g.target)}
                            className={cn(
                              "rounded text-sm font-semibold text-[#1f4fb0] underline underline-offset-4",
                              ringLight,
                            )}
                          >
                            Edit<span className="sr-only"> {g.title.toLowerCase()}</span>
                          </button>
                        </div>
                        <dl className="mt-2 space-y-1.5 text-sm">
                          {g.rows.map(([k, v]) => (
                            <div
                              key={k}
                              className="grid gap-0.5 @xl:grid-cols-[8rem_1fr] @xl:gap-3"
                            >
                              <dt className="text-[#475569]">{k}</dt>
                              <dd className="break-words">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    ))}
                    <p className="text-sm text-[#475569]">
                      Nothing is sent anywhere in this demonstration. In a real site, a partner
                      would reply within one business day.
                    </p>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                  {step > 0 ? (
                    <button
                      key="back"
                      type="button"
                      onClick={() => goToStep(step - 1)}
                      className={outlineBtn}
                    >
                      <ArrowLeft aria-hidden="true" className="size-4" /> Back
                    </button>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  {step < LAST_STEP ? (
                    <button key="next" type="submit" className={primaryBtn}>
                      Next <ArrowRight aria-hidden="true" className="size-4" />
                    </button>
                  ) : (
                    <button key="send" type="submit" className={primaryBtn}>
                      Send request <Check aria-hidden="true" className="size-4" />
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-300 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm text-[#334155] @3xl:grid-cols-3">
          <div>
            <p className={cn(display, "text-xl text-[#0f2a4a]")}>{design.businessName}</p>
            <p className="mt-2">Independent business advisory for Australian organisations.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0f2a4a]">
              Practice areas
            </p>
            <p className="mt-2">{practiceAreas.map((a) => a.name).join(" · ")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0f2a4a]">
              Visit or call
            </p>
            <p className="mt-2 flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#1f4fb0]" />{" "}
              {ADDRESS}
            </p>
            <p className="mt-1">
              <a
                href={PHONE_HREF}
                className={cn("rounded underline underline-offset-4", ringLight)}
              >
                {PHONE}
              </a>{" "}
              · {EMAIL}
            </p>
          </div>
        </div>
      </footer>
      <DemoDisclaimer design={design} className="bg-white text-[#334155]" />
    </DemoRoot>
  );
}
