import { useId, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  Compass,
  Droplets,
  Flame,
  Layers,
  Leaf,
  Lightbulb,
  Mail,
  MapPin,
  Minus,
  PencilRuler,
  Phone,
  Plus,
  Sprout,
  Trees,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

const PHONE = "(02) 5550 0142";
const PHONE_HREF = "tel:+61255500142";
const EMAIL = "studio@greenlinestudio.example";
const ADDRESS = "14 Wattlebird Lane, Marrowfield NSW 2999";
const MIN_AREA = 20;
const MAX_AREA = 1000;

// Focus rings: one for the light stone surfaces, one for the dark green ones.
const ringLight =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f6b2f]";
const ringDark =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a8c98a]";
const heading = "font-[family-name:var(--demo-font-heading)]";

/* ----------------------------------------------------------------------------------------------
 * Content
 * -------------------------------------------------------------------------------------------- */

type TypeId = "garden" | "courtyard" | "commercial" | "rooftop";
type FinishId = "essential" | "signature" | "estate";
type ExtraId = "water" | "kitchen" | "lighting" | "irrigation";
type Variant = "courtyard" | "planting" | "terrace" | "paving" | "plaza" | "roof";

const projectTypes = [
  { id: "garden", label: "Residential garden", note: "Front or back garden", min: 380, max: 520 },
  {
    id: "courtyard",
    label: "Courtyard or small garden",
    note: "Under about 100 m²",
    min: 650,
    max: 950,
  },
  {
    id: "commercial",
    label: "Commercial landscape",
    note: "Plazas, forecourts, campuses",
    min: 420,
    max: 640,
  },
  {
    id: "rooftop",
    label: "Rooftop or terrace",
    note: "Planters, decking, shade",
    min: 900,
    max: 1350,
  },
] as const;

const finishes = [
  {
    id: "essential",
    label: "Essential",
    note: "Durable materials and simple, hardy planting.",
    factor: 1,
  },
  {
    id: "signature",
    label: "Signature",
    note: "Natural stone, mature plants and refined detailing.",
    factor: 1.45,
  },
  {
    id: "estate",
    label: "Estate",
    note: "Bespoke stonework, advanced trees and custom joinery.",
    factor: 2.1,
  },
] as const;

const extras: readonly {
  id: ExtraId;
  label: string;
  note: string;
  icon: LucideIcon;
  min: number;
  max: number;
}[] = [
  {
    id: "water",
    label: "Water feature",
    note: "Pond, rill or fountain",
    icon: Droplets,
    min: 12000,
    max: 28000,
  },
  {
    id: "kitchen",
    label: "Outdoor kitchen",
    note: "Bench, grill and storage",
    icon: Flame,
    min: 15000,
    max: 38000,
  },
  {
    id: "lighting",
    label: "Garden lighting",
    note: "Low-voltage, zoned",
    icon: Lightbulb,
    min: 4000,
    max: 11000,
  },
  {
    id: "irrigation",
    label: "Smart irrigation",
    note: "Zoned, weather-aware",
    icon: Sprout,
    min: 3000,
    max: 9000,
  },
];

const budgetBrackets = [
  { label: "Under $25,000", below: 25000 },
  { label: "$25,000 – $60,000", below: 60000 },
  { label: "$60,000 – $120,000", below: 120000 },
  { label: "$120,000 – $250,000", below: 250000 },
  { label: "$250,000 – $500,000", below: 500000 },
  { label: "$500,000 or more", below: Number.POSITIVE_INFINITY },
] as const;
const NOT_SURE = "Not sure yet";

type Project = {
  id: string;
  name: string;
  location: string;
  area: number;
  year: number;
  scope: string;
  variant: Variant;
  plannerType: TypeId;
};

const tabs = [
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
] as const;
type TabId = (typeof tabs)[number]["id"];

const portfolio: Record<TabId, readonly Project[]> = {
  residential: [
    {
      id: "fernside",
      name: "Fernside Courtyard",
      location: "Kellybrook NSW",
      area: 64,
      year: 2025,
      scope: "Sandstone paving, shaded fern beds, a still-water basin and feature lighting.",
      variant: "courtyard",
      plannerType: "courtyard",
    },
    {
      id: "banksia",
      name: "Banksia Terrace House",
      location: "Pennant Cove NSW",
      area: 210,
      year: 2024,
      scope: "Sloping block terraced in rendered walls, native planting, steps and irrigation.",
      variant: "terrace",
      plannerType: "garden",
    },
    {
      id: "millstone",
      name: "Millstone Family Garden",
      location: "Larkspur Heights NSW",
      area: 380,
      year: 2024,
      scope: "Native meadow planting, productive beds, a timber deck and path lighting.",
      variant: "planting",
      plannerType: "garden",
    },
    {
      id: "ironbark",
      name: "Ironbark Entry Path",
      location: "Marrowfield NSW",
      area: 95,
      year: 2023,
      scope: "Granite setts, a stepped entry, clipped boundary hedging and irrigation.",
      variant: "paving",
      plannerType: "garden",
    },
  ],
  commercial: [
    {
      id: "harbourline",
      name: "Harbourline Plaza",
      location: "Ashgrove Bay NSW",
      area: 820,
      year: 2025,
      scope: "Public plaza with tree canopy, seating rings and a planted stormwater swale.",
      variant: "plaza",
      plannerType: "commercial",
    },
    {
      id: "fieldhouse",
      name: "Fieldhouse Rooftop",
      location: "Kellybrook NSW",
      area: 310,
      year: 2024,
      scope: "Rooftop planters, a timber deck, shade structure and lightweight irrigation.",
      variant: "roof",
      plannerType: "rooftop",
    },
    {
      id: "clarion",
      name: "Clarion Office Forecourt",
      location: "Marrowfield NSW",
      area: 540,
      year: 2023,
      scope: "Entry forecourt in stone paving with feature trees and wayfinding lighting.",
      variant: "paving",
      plannerType: "commercial",
    },
  ],
};

const services: readonly { title: string; text: string; icon: LucideIcon; audience: string }[] = [
  {
    title: "Garden & landscape design",
    text: "Measured site plans, concept sketches and planting schedules drawn by our in-house designers.",
    icon: PencilRuler,
    audience: "Residential & commercial",
  },
  {
    title: "Hard landscaping",
    text: "Paving, retaining walls, steps, decks and pergolas, built by our own crews.",
    icon: Layers,
    audience: "Residential & commercial",
  },
  {
    title: "Planting & soil",
    text: "Climate-suited native and exotic planting, soil repair and mature tree supply.",
    icon: Trees,
    audience: "Residential & commercial",
  },
  {
    title: "Water features",
    text: "Basins, rills and still ponds, engineered to recirculate and to stay clean.",
    icon: Droplets,
    audience: "Mostly residential",
  },
  {
    title: "Lighting & irrigation",
    text: "Low-voltage lighting and smart irrigation zoned to the planting.",
    icon: Lightbulb,
    audience: "Residential & commercial",
  },
  {
    title: "Outdoor kitchens",
    text: "Built-in benches, grills and shelter for gardens that are lived in.",
    icon: Flame,
    audience: "Mostly residential",
  },
];

const steps = [
  {
    title: "Site visit & brief",
    text: "We walk the site, measure it, test the soil and listen. Free, and about ninety minutes.",
    time: "Week 1",
  },
  {
    title: "Concept design",
    text: "Two layout options drawn as plans and sketches, with a materials and planting palette.",
    time: "Weeks 2–3",
  },
  {
    title: "Detailed design & fixed quote",
    text: "Construction drawings, a planting schedule and a line-item fixed price.",
    time: "Weeks 4–6",
  },
  {
    title: "Build",
    text: "Our crews build in stages with weekly photo updates and one point of contact.",
    time: "2–16 weeks",
  },
  {
    title: "Handover & care",
    text: "A walk-through, a care guide and a twelve-month plant guarantee.",
    time: "Final week",
  },
] as const;

/* ----------------------------------------------------------------------------------------------
 * Budget model
 * -------------------------------------------------------------------------------------------- */

const aud = (n: number) => `$${Math.round(n).toLocaleString("en-AU")}`;
const floor500 = (n: number) => Math.floor(n / 500) * 500;
const ceil500 = (n: number) => Math.ceil(n / 500) * 500;

type Estimate = {
  min: number;
  max: number;
  worksMin: number;
  worksMax: number;
  extrasMin: number;
  extrasMax: number;
};

function estimate(
  typeId: TypeId,
  area: number,
  finishId: FinishId,
  chosen: readonly ExtraId[],
): Estimate {
  const type = projectTypes.find((t) => t.id === typeId) ?? projectTypes[0];
  const finish = finishes.find((f) => f.id === finishId) ?? finishes[0];
  // Larger sites build more efficiently, down to a 25% saving.
  const sizeFactor = area <= 100 ? 1 : Math.max(0.75, 1 - (area - 100) * 0.0004);
  const worksMin = type.min * area * sizeFactor * finish.factor;
  const worksMax = type.max * area * sizeFactor * finish.factor;
  const extraScale = 1 + (finish.factor - 1) * 0.5;
  let extrasMin = 0;
  let extrasMax = 0;
  for (const e of extras) {
    if (chosen.includes(e.id)) {
      extrasMin += e.min * extraScale;
      extrasMax += e.max * extraScale;
    }
  }
  return {
    min: floor500(worksMin + extrasMin),
    max: ceil500(worksMax + extrasMax),
    worksMin,
    worksMax,
    extrasMin,
    extrasMax,
  };
}

function bracketFor(e: Estimate): string {
  const mid = (e.min + e.max) / 2;
  return budgetBrackets.find((b) => mid < b.below)?.label ?? NOT_SURE;
}

/* ----------------------------------------------------------------------------------------------
 * Illustrations (inline SVG, no external images)
 * -------------------------------------------------------------------------------------------- */

function PlanTree({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#3f6b2f" stroke="#1f3d2b" strokeWidth="1.5" />
      <circle cx={cx - r * 0.2} cy={cy - r * 0.2} r={r * 0.5} fill="#7fa35b" />
      <circle cx={cx} cy={cy} r="2" fill="#1f3d2b" />
    </g>
  );
}

const pavingTones = ["#d8d2c1", "#cbc4b0", "#bdb6a1"] as const;

function ProjectArt({ variant }: { variant: Variant }) {
  let body: ReactNode = null;
  switch (variant) {
    case "courtyard":
      body = (
        <g>
          <rect
            x="40"
            y="30"
            width="320"
            height="200"
            fill="#d8d2c1"
            stroke="#1f3d2b"
            strokeWidth="1.5"
          />
          {[80, 120, 160, 200, 240, 280, 320].map((x) => (
            <path key={x} d={`M${x} 30V230`} stroke="#b9b29d" />
          ))}
          {[70, 110, 150, 190].map((y) => (
            <path key={y} d={`M40 ${y}H360`} stroke="#b9b29d" />
          ))}
          <rect
            x="40"
            y="30"
            width="320"
            height="30"
            fill="#5d8a43"
            stroke="#1f3d2b"
            strokeWidth="1.5"
          />
          <rect
            x="40"
            y="200"
            width="320"
            height="30"
            fill="#5d8a43"
            stroke="#1f3d2b"
            strokeWidth="1.5"
          />
          <circle cx="200" cy="130" r="44" fill="#8fb3a8" stroke="#1f3d2b" strokeWidth="1.5" />
          <circle cx="200" cy="130" r="30" fill="none" stroke="#e9f1ee" strokeWidth="1.5" />
          <circle cx="200" cy="130" r="14" fill="#a9c8be" stroke="#e9f1ee" />
          <PlanTree cx={90} cy={110} r={22} />
          <PlanTree cx={310} cy={110} r={22} />
          <PlanTree cx={90} cy={165} r={16} />
          <PlanTree cx={310} cy={165} r={16} />
          <path d="M40 246H360M40 240V252M360 240V252" stroke="#1f3d2b" />
        </g>
      );
      break;
    case "planting":
      body = (
        <g>
          <circle cx="320" cy="56" r="24" fill="#f1efe9" />
          <path d="M0 160C80 110 150 150 230 120S350 120 400 140V200H0Z" fill="#c5d0b6" />
          <rect y="190" width="400" height="70" fill="#c9c2ae" />
          <path d="M0 190H400" stroke="#1f3d2b" strokeWidth="1.5" />
          <rect x="296" y="96" width="9" height="94" fill="#6b4f33" />
          <circle cx="300" cy="84" r="38" fill="#3f6b2f" />
          <circle cx="282" cy="74" r="20" fill="#5d8a43" />
          {Array.from({ length: 26 }, (_, i) => (
            <path
              key={i}
              d={`M${14 + i * 13} 190q${i % 2 ? 8 : -8} -30 ${i % 3 === 0 ? 14 : 4} -${46 + (i % 4) * 8}`}
              fill="none"
              stroke={i % 3 === 0 ? "#7fa35b" : "#3f6b2f"}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
          <ellipse cx="70" cy="178" rx="34" ry="20" fill="#1f3d2b" />
          <ellipse cx="150" cy="182" rx="26" ry="14" fill="#3f6b2f" />
          <ellipse cx="236" cy="180" rx="30" ry="16" fill="#1f3d2b" />
        </g>
      );
      break;
    case "terrace":
      body = (
        <g>
          <circle cx="60" cy="50" r="20" fill="#f1efe9" />
          <path
            d="M0 260V200H130V160H250V120H400V260Z"
            fill="#b9b29d"
            stroke="#1f3d2b"
            strokeWidth="1.5"
          />
          <path
            d="M0 200H130V190H0ZM130 160H250V150H130ZM250 120H400V110H250Z"
            fill="#5d8a43"
            stroke="#1f3d2b"
            strokeWidth="1.5"
          />
          {[225, 250].map((y) => (
            <path key={y} d={`M0 ${y}H400`} stroke="#9c957f" />
          ))}
          <path d="M65 200V260M190 160V260M325 120V260" stroke="#9c957f" />
          <circle cx="40" cy="182" r="11" fill="#3f6b2f" />
          <circle cx="92" cy="184" r="8" fill="#7fa35b" />
          <circle cx="160" cy="142" r="11" fill="#3f6b2f" />
          <circle cx="215" cy="144" r="8" fill="#7fa35b" />
          <rect x="344" y="62" width="7" height="50" fill="#6b4f33" />
          <circle cx="348" cy="56" r="26" fill="#3f6b2f" />
        </g>
      );
      break;
    case "paving":
      body = (
        <g>
          {Array.from({ length: 9 }, (_, r) =>
            Array.from({ length: 9 }, (_, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * 50 - (r % 2) * 25}
                y={r * 30}
                width="50"
                height="30"
                fill={pavingTones[(r * 2 + c) % 3]}
                stroke="#a8a18c"
              />
            )),
          )}
          <path
            d="M290 0C250 90 340 160 290 260H400V0Z"
            fill="#5d8a43"
            stroke="#1f3d2b"
            strokeWidth="1.5"
          />
          <path
            d="M330 0C300 100 380 150 340 260"
            fill="none"
            stroke="#3f6b2f"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {[18, 66, 114, 162, 210].map((y) => (
            <circle
              key={y}
              cx={300 + ((y * 7) % 40)}
              cy={y}
              r="11"
              fill="#3f6b2f"
              stroke="#1f3d2b"
            />
          ))}
          <path d="M0 240H260M0 252H260" stroke="#1f3d2b" strokeWidth="2" />
        </g>
      );
      break;
    case "plaza":
      body = (
        <g>
          <rect width="400" height="260" fill="#d8d2c1" />
          {[60, 120, 180, 240, 300, 360].map((x) => (
            <path key={x} d={`M${x} 0V260`} stroke="#c3bca8" />
          ))}
          <path d="M-10 215C120 215 150 60 410 75" fill="none" stroke="#f1efe9" strokeWidth="30" />
          <path d="M0 232H400V260H0Z" fill="#5d8a43" stroke="#1f3d2b" strokeWidth="1.5" />
          {[
            { x: 110, y: 110 },
            { x: 230, y: 150 },
            { x: 320, y: 110 },
          ].map((t) => (
            <g key={t.x}>
              <circle cx={t.x} cy={t.y} r="38" fill="none" stroke="#8d8672" strokeWidth="6" />
              <PlanTree cx={t.x} cy={t.y} r={24} />
            </g>
          ))}
          <rect x="52" y="168" width="60" height="9" fill="#6b4f33" />
          <rect x="300" y="190" width="60" height="9" fill="#6b4f33" />
          <rect x="16" y="20" width="68" height="40" fill="#1f3d2b" opacity="0.9" />
        </g>
      );
      break;
    case "roof":
      body = (
        <g>
          <rect
            x="24"
            y="24"
            width="352"
            height="212"
            fill="#b79a6b"
            stroke="#1f3d2b"
            strokeWidth="1.5"
          />
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M24 ${39 + i * 15}H376`} stroke="#9a7f52" />
          ))}
          {[0, 1, 2].map((r) =>
            [0, 1].map((c) => (
              <g key={`${r}-${c}`}>
                <rect
                  x={50 + c * 110}
                  y={44 + r * 62}
                  width="90"
                  height="34"
                  fill="#5d8a43"
                  stroke="#1f3d2b"
                  strokeWidth="1.5"
                />
                {[0, 1, 2, 3].map((k) => (
                  <circle
                    key={k}
                    cx={65 + c * 110 + k * 20}
                    cy={61 + r * 62}
                    r="7"
                    fill="#3f6b2f"
                  />
                ))}
              </g>
            )),
          )}
          <rect
            x="268"
            y="44"
            width="92"
            height="170"
            fill="none"
            stroke="#1f3d2b"
            strokeDasharray="6 4"
            strokeWidth="1.5"
          />
          <rect x="288" y="74" width="52" height="28" fill="#f1efe9" stroke="#1f3d2b" />
          <rect x="288" y="130" width="52" height="28" fill="#f1efe9" stroke="#1f3d2b" />
        </g>
      );
      break;
  }
  return (
    <svg viewBox="0 0 400 260" aria-hidden="true" className="block h-auto w-full bg-[#ebe7dc]">
      {body}
    </svg>
  );
}

function SitePlan() {
  const line = "#a8c98a";
  const trees = [
    { cx: 110, cy: 220, r: 20 },
    { cx: 160, cy: 250, r: 14 },
    { cx: 350, cy: 70, r: 22 },
    { cx: 290, cy: 80, r: 14 },
  ];
  return (
    <svg viewBox="0 0 420 320" aria-hidden="true" className="block h-auto w-full">
      <rect
        x="30"
        y="30"
        width="360"
        height="250"
        fill="none"
        stroke={line}
        strokeDasharray="8 5"
      />
      <rect
        x="60"
        y="48"
        width="200"
        height="70"
        fill="#2b5239"
        stroke="#f1efe9"
        strokeWidth="1.5"
      />
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          d={`M${60 + i * 18} 118L${78 + i * 18} 48`}
          stroke="#f1efe9"
          strokeOpacity="0.25"
        />
      ))}
      <rect x="60" y="118" width="130" height="46" fill="#3a5f46" stroke={line} />
      <path
        d="M200 118V176C200 220 280 200 330 250"
        fill="none"
        stroke="#f1efe9"
        strokeOpacity="0.7"
        strokeWidth="14"
      />
      <path d="M60 280C60 210 130 230 150 190" fill="none" stroke={line} strokeWidth="1.5" />
      <ellipse cx="320" cy="150" rx="52" ry="38" fill="#2b5239" stroke={line} strokeWidth="1.5" />
      <ellipse
        cx="320"
        cy="150"
        rx="30"
        ry="20"
        fill="#4f7d8a"
        stroke="#f1efe9"
        strokeOpacity="0.7"
      />
      {trees.map((t) => (
        <g key={`${t.cx}-${t.cy}`}>
          <circle cx={t.cx} cy={t.cy} r={t.r} fill="#7fa35b" stroke="#1f3d2b" strokeWidth="1.5" />
          <path
            d={`M${t.cx - 4} ${t.cy}H${t.cx + 4}M${t.cx} ${t.cy - 4}V${t.cy + 4}`}
            stroke="#1f3d2b"
          />
        </g>
      ))}
      <path d="M30 300H390M30 294V306M390 294V306" stroke="#f1efe9" strokeOpacity="0.7" />
      <path d="M12 30V280M6 30H18M6 280H18" stroke="#f1efe9" strokeOpacity="0.7" />
      <g transform="translate(372 52)">
        <circle r="14" fill="none" stroke="#f1efe9" strokeOpacity="0.7" />
        <path d="M0 -12L5 6L0 2L-5 6Z" fill="#f1efe9" />
      </g>
    </svg>
  );
}

/* ----------------------------------------------------------------------------------------------
 * Small layout pieces
 * -------------------------------------------------------------------------------------------- */

function SectionHead({
  id,
  number,
  eyebrow,
  title,
  intro,
  dark,
}: {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  intro?: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <p
        className={cn(
          "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em]",
          dark ? "text-[#a8c98a]" : "text-[#3f6b2f]",
        )}
      >
        <span aria-hidden="true">{number}</span>
        <span
          aria-hidden="true"
          className={cn("h-px w-10", dark ? "bg-[#a8c98a]" : "bg-[#3f6b2f]")}
        />
        {eyebrow}
      </p>
      <h3
        id={id}
        className={cn(
          heading,
          "mt-3 text-3xl font-semibold leading-tight @3xl:text-4xl",
          dark ? "text-[#f1efe9]" : "text-[#1f3d2b]",
        )}
      >
        {title}
      </h3>
      {intro ? (
        <p className={cn("mt-3", dark ? "text-[#d3ddcf]" : "text-[#44564b]")}>{intro}</p>
      ) : null}
    </div>
  );
}

type Field = "name" | "email" | "phone" | "suburb" | "message";
type Errors = Partial<Record<Field, string>>;

/* ----------------------------------------------------------------------------------------------
 * Demo
 * -------------------------------------------------------------------------------------------- */

export function LandscapingDemo({ design }: DemoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const [tab, setTab] = useState<TabId>("residential");

  const [typeId, setTypeId] = useState<TypeId>("garden");
  const [areaStr, setAreaStr] = useState("150");
  const [finishId, setFinishId] = useState<FinishId>("signature");
  const [chosen, setChosen] = useState<ExtraId[]>([]);

  const [typeOverride, setTypeOverride] = useState<string | null>(null);
  const [budgetOverride, setBudgetOverride] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const areaNum = Number.parseInt(areaStr, 10);
  const areaValid = !Number.isNaN(areaNum) && areaNum >= MIN_AREA && areaNum <= MAX_AREA;
  const plan = areaValid ? estimate(typeId, areaNum, finishId, chosen) : null;
  const typeLabel = projectTypes.find((t) => t.id === typeId)?.label ?? "";
  const finishLabel = finishes.find((f) => f.id === finishId)?.label ?? "";

  const formType = typeOverride ?? typeId;
  const formBudget = budgetOverride ?? (plan ? bracketFor(plan) : NOT_SURE);
  const prefilled = typeOverride === null && budgetOverride === null && plan !== null;

  const go = (suffix: string) =>
    document.getElementById(`${uid}-${suffix}`)?.scrollIntoView({ block: "nearest" });
  const nav = [
    { label: "Projects", target: "projects" },
    { label: "Services", target: "services" },
    { label: "Budget planner", target: "budget" },
    { label: "Process", target: "process" },
    { label: "Contact", target: "contact" },
  ] as const;

  function stepArea(delta: number) {
    const base = areaValid ? areaNum : 150;
    setAreaStr(String(Math.min(MAX_AREA, Math.max(MIN_AREA, base + delta))));
  }

  function toggleExtra(id: ExtraId) {
    setChosen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function priceSimilar(p: Project) {
    setTypeId(p.plannerType);
    setAreaStr(String(Math.min(MAX_AREA, Math.max(MIN_AREA, p.area))));
    go("budget");
  }

  function useEstimate() {
    setTypeOverride(null);
    setBudgetOverride(null);
    go("contact");
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    const target = tabs[next];
    if (!target) return;
    setTab(target.id);
    document.getElementById(`${uid}-tab-${target.id}`)?.focus();
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      next.email = "Enter an email address so we can reply.";
    const digits = phone.replace(/\D/g, "").length;
    if (phone.trim() && (digits < 8 || digits > 12)) {
      next.phone = "Enter a phone number with 8 to 12 digits, or leave it blank.";
    }
    if (!suburb.trim()) next.suburb = "Enter the suburb where the project is.";
    if (message.trim().length < 10)
      next.message = "Tell us a little about the project (at least 10 characters).";
    setErrors(next);
    const first = (["name", "email", "phone", "suburb", "message"] as const).find((f) => next[f]);
    if (first) document.getElementById(`${uid}-${first}`)?.focus();
    else setSent(true);
  }

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setSuburb("");
    setMessage("");
    setTypeOverride(null);
    setBudgetOverride(null);
    setErrors({});
    setSent(false);
  }

  const inputCls = cn(
    "mt-1.5 w-full rounded-none border border-[#6b7a6d] bg-[#fbfaf6] px-3 py-2.5 text-[#1c2a21] placeholder:text-[#5f6e63]",
    ringLight,
  );
  const labelCls = "text-xs font-semibold uppercase tracking-[0.2em] text-[#2f5a24]";
  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`${uid}-${field}-err`} className="mt-1.5 text-sm font-medium text-[#9b2c20]">
        {errors[field]}
      </p>
    ) : null;
  const describedBy = (field: Field) => (errors[field] ? `${uid}-${field}-err` : undefined);
  const solidButton = cn(
    "inline-flex items-center justify-center gap-2 border border-[#7fa35b] bg-[#7fa35b] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#12241a] hover:bg-[#92b56f] motion-safe:transition-colors",
    ringDark,
  );
  const ghostButton = cn(
    "inline-flex items-center justify-center gap-2 border border-[#a8c98a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#f1efe9] hover:bg-[#f1efe9]/10",
    ringDark,
  );
  const optionCard =
    "group flex cursor-pointer items-start gap-3 border border-[#6f9a55] p-3 text-sm has-[:checked]:border-[#a8c98a] has-[:checked]:bg-[#2b5239] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#a8c98a] motion-safe:transition-colors";
  const indicator = (round: boolean) =>
    cn(
      "mt-0.5 grid size-5 shrink-0 place-items-center border border-[#a8c98a] text-transparent group-has-[:checked]:bg-[#a8c98a] group-has-[:checked]:text-[#12241a]",
      round && "rounded-full",
    );

  const activeProjects = portfolio[tab];

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.sansHumanist, heading: demoFonts.sansGeometric }}
      className="bg-[#f1efe9] text-[#1c2a21]"
    >
      <header className="border-b border-[#cfc9ba] bg-[#f1efe9]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <p
            className={cn(
              heading,
              "flex items-center gap-2 text-base font-semibold uppercase tracking-[0.2em] text-[#1f3d2b] @xl:text-lg",
            )}
          >
            <Leaf aria-hidden="true" className="size-5 shrink-0 text-[#3f6b2f]" />
            {design.businessName}
          </p>
          <nav aria-label="Demo site sections" className="hidden items-center gap-1 @3xl:flex">
            {nav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.target)}
                className={cn(
                  "px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1f3d2b] hover:text-[#3f6b2f]",
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
              "hidden items-center gap-2 text-sm font-semibold text-[#1f3d2b] @xl:inline-flex",
              ringLight,
            )}
          >
            <Phone aria-hidden="true" className="size-4" /> {PHONE}
          </a>
        </div>
        <nav
          aria-label="Demo site sections, compact"
          className="border-t border-[#cfc9ba] @3xl:hidden"
        >
          <ul className="flex gap-1 overflow-x-auto px-3 py-1.5">
            {nav.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => go(item.target)}
                  className={cn(
                    "whitespace-nowrap px-2.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#1f3d2b]",
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
        className="relative overflow-hidden bg-[#1f3d2b] text-[#f1efe9]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(241,239,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(241,239,233,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 @3xl:grid-cols-[1.1fr_1fr] @3xl:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a8c98a]">
              Landscape design studio · Marrowfield NSW
            </p>
            <h2
              id={`${uid}-hero`}
              className={cn(
                heading,
                "mt-5 text-4xl font-semibold leading-[1.05] @xl:text-5xl @5xl:text-6xl",
              )}
            >
              Gardens drawn with the precision of a building.
            </h2>
            <p className="mt-5 max-w-xl text-lg text-[#d3ddcf]">
              Greenline designs and builds residential and commercial landscapes from measured plan
              to planted handover, with one team and one fixed price.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => go("projects")} className={solidButton}>
                View projects <ArrowRight aria-hidden="true" className="size-4" />
              </button>
              <button type="button" onClick={() => go("budget")} className={ghostButton}>
                Plan your budget
              </button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-[#a8c98a]/40 pt-5">
              {[
                ["2009", "Established"],
                ["240+", "Gardens built"],
                ["12 mo", "Plant guarantee"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-[0.7rem] uppercase tracking-[0.18em] text-[#c9d6c3]">{l}</dt>
                  <dd
                    className={cn(
                      heading,
                      "mt-1 text-2xl font-semibold text-[#a8c98a] @xl:text-3xl",
                    )}
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="border border-[#a8c98a]/50 bg-[#183225] p-3">
            <SitePlan />
            <figcaption className="mt-2 flex items-center justify-between gap-3 border-t border-[#a8c98a]/40 pt-2 text-xs uppercase tracking-[0.18em] text-[#c9d6c3]">
              <span className="flex items-center gap-2">
                <Compass aria-hidden="true" className="size-4 text-[#a8c98a]" /> Sheet 01 · Sample
                site plan
              </span>
              <span>1:100</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Projects */}
      <section
        id={`${uid}-projects`}
        aria-labelledby={`${uid}-projects-h`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-24"
      >
        <SectionHead
          id={`${uid}-projects-h`}
          number="01"
          eyebrow="Projects"
          title="Recent work, from courtyards to plazas"
          intro="Switch between residential and commercial projects. Every project below is a sample created for this demonstration."
        />
        <div role="tablist" aria-label="Project type" className="mb-8 flex flex-wrap gap-2">
          {tabs.map((t, i) => {
            const selected = tab === t.id;
            return (
              <button
                key={t.id}
                id={`${uid}-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${uid}-panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn(
                  "border px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] motion-safe:transition-colors",
                  ringLight,
                  selected
                    ? "border-[#1f3d2b] bg-[#1f3d2b] text-[#f1efe9]"
                    : "border-[#6b7a6d] text-[#1f3d2b] hover:bg-[#e3dfd3]",
                )}
              >
                {t.label}
                <span className="ml-2 font-normal opacity-80">({portfolio[t.id].length})</span>
              </button>
            );
          })}
        </div>
        <div
          id={`${uid}-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${tab}`}
          className="grid gap-6 @3xl:grid-cols-2"
        >
          {activeProjects.map((p) => (
            <article key={p.id} className="flex flex-col border border-[#cfc9ba] bg-[#fbfaf6]">
              <div className="relative">
                <ProjectArt variant={p.variant} />
                <span className="absolute left-3 top-3 bg-[#1f3d2b] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#f1efe9]">
                  Sample project
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h4 className={cn(heading, "text-xl font-semibold text-[#1f3d2b]")}>{p.name}</h4>
                <dl className="mt-3 grid grid-cols-3 gap-3 border-y border-[#cfc9ba] py-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-[#44564b]">Location</dt>
                    <dd className="mt-0.5 font-medium">{p.location}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-[#44564b]">Size</dt>
                    <dd className="mt-0.5 font-medium">{p.area.toLocaleString("en-AU")} m²</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-[#44564b]">Year</dt>
                    <dd className="mt-0.5 font-medium">{p.year}</dd>
                  </div>
                </dl>
                <p className="mt-3 flex-1 text-sm text-[#2e3f34]">
                  <strong className="font-semibold">Scope:</strong> {p.scope}
                </p>
                <button
                  type="button"
                  onClick={() => priceSimilar(p)}
                  className={cn(
                    "mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#2f5a24] underline underline-offset-4 hover:text-[#1f3d2b]",
                    ringLight,
                  )}
                >
                  Price a similar project <ArrowRight aria-hidden="true" className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Services */}
      <section
        id={`${uid}-services`}
        aria-labelledby={`${uid}-services-h`}
        className="border-y border-[#cfc9ba] bg-[#e6e2d8]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 @3xl:py-24">
          <SectionHead
            id={`${uid}-services-h`}
            number="02"
            eyebrow="Services"
            title="Design, build and care under one roof"
            intro="From the first measured drawing to the last plant in the ground, our own designers and crews do the work."
          />
          <ul className="grid gap-px border border-[#b9b29d] bg-[#b9b29d] @xl:grid-cols-2 @5xl:grid-cols-3">
            {services.map((s) => (
              <li key={s.title} className="bg-[#f1efe9] p-6">
                <s.icon aria-hidden="true" className="size-7 text-[#3f6b2f]" strokeWidth={1.5} />
                <h4 className={cn(heading, "mt-4 text-lg font-semibold text-[#1f3d2b]")}>
                  {s.title}
                </h4>
                <p className="mt-2 text-sm text-[#2e3f34]">{s.text}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#2f5a24]">
                  {s.audience}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Budget planner */}
      <section
        id={`${uid}-budget`}
        aria-labelledby={`${uid}-budget-h`}
        className="bg-[#1f3d2b] text-[#f1efe9]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 @3xl:py-24">
          <SectionHead
            dark
            id={`${uid}-budget-h`}
            number="03"
            eyebrow="Budget planner"
            title="Find a realistic range before we talk"
            intro="Choose the kind of project, its size and finish, and add any extras. The range updates as you go."
          />
          <div className="grid gap-8 @3xl:grid-cols-[1fr_340px] @5xl:grid-cols-[1fr_380px]">
            <div className="space-y-7">
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a8c98a]">
                  1. Project type
                </legend>
                <div className="mt-3 grid gap-3 @xl:grid-cols-2">
                  {projectTypes.map((t) => (
                    <label key={t.id} className={optionCard}>
                      <input
                        type="radio"
                        name={`${uid}-type`}
                        value={t.id}
                        checked={typeId === t.id}
                        onChange={() => setTypeId(t.id)}
                        className="sr-only"
                      />
                      <span aria-hidden="true" className={indicator(true)}>
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      <span>
                        <span className="block font-semibold">{t.label}</span>
                        <span className="block text-[#c9d6c3]">{t.note}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor={`${uid}-area`}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a8c98a]"
                >
                  2. Site area (m²)
                </label>
                <div className="mt-3 flex max-w-sm">
                  <button
                    type="button"
                    onClick={() => stepArea(-10)}
                    aria-label="Decrease area by 10 square metres"
                    className={cn(
                      "grid w-11 shrink-0 place-items-center border border-[#6f9a55] text-[#f1efe9] hover:bg-[#2b5239]",
                      ringDark,
                    )}
                  >
                    <Minus aria-hidden="true" className="size-4" />
                  </button>
                  <input
                    id={`${uid}-area`}
                    type="number"
                    inputMode="numeric"
                    min={MIN_AREA}
                    max={MAX_AREA}
                    value={areaStr}
                    onChange={(e) => setAreaStr(e.target.value)}
                    aria-invalid={!areaValid}
                    aria-describedby={areaValid ? undefined : `${uid}-area-err`}
                    className={cn(
                      "w-full min-w-0 border border-[#6f9a55] bg-[#183225] px-3 py-2.5 text-center text-[#f1efe9]",
                      ringDark,
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => stepArea(10)}
                    aria-label="Increase area by 10 square metres"
                    className={cn(
                      "grid w-11 shrink-0 place-items-center border border-[#6f9a55] text-[#f1efe9] hover:bg-[#2b5239]",
                      ringDark,
                    )}
                  >
                    <Plus aria-hidden="true" className="size-4" />
                  </button>
                </div>
                {areaValid ? null : (
                  <p id={`${uid}-area-err`} className="mt-2 text-sm font-medium text-[#ffb4a8]">
                    Enter an area between {MIN_AREA} and {MAX_AREA.toLocaleString("en-AU")} m².
                  </p>
                )}
                <input
                  type="range"
                  aria-label="Site area slider"
                  aria-valuetext={`${areaValid ? areaNum : MIN_AREA} square metres`}
                  min={MIN_AREA}
                  max={MAX_AREA}
                  step={5}
                  value={areaValid ? areaNum : MIN_AREA}
                  onChange={(e) => setAreaStr(e.target.value)}
                  className={cn("mt-4 block w-full accent-[#a8c98a]", ringDark)}
                />
                <div
                  className="mt-1 flex justify-between text-xs text-[#c9d6c3]"
                  aria-hidden="true"
                >
                  <span>{MIN_AREA} m²</span>
                  <span>{MAX_AREA.toLocaleString("en-AU")} m²</span>
                </div>
              </div>

              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a8c98a]">
                  3. Finish level
                </legend>
                <div className="mt-3 grid gap-3 @xl:grid-cols-3">
                  {finishes.map((f) => (
                    <label key={f.id} className={optionCard}>
                      <input
                        type="radio"
                        name={`${uid}-finish`}
                        value={f.id}
                        checked={finishId === f.id}
                        onChange={() => setFinishId(f.id)}
                        className="sr-only"
                      />
                      <span aria-hidden="true" className={indicator(true)}>
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      <span>
                        <span className="block font-semibold">{f.label}</span>
                        <span className="block text-[#c9d6c3]">{f.note}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a8c98a]">
                  4. Extras
                </legend>
                <div className="mt-3 grid gap-3 @xl:grid-cols-2">
                  {extras.map((x) => (
                    <label key={x.id} className={optionCard}>
                      <input
                        type="checkbox"
                        checked={chosen.includes(x.id)}
                        onChange={() => toggleExtra(x.id)}
                        className="sr-only"
                      />
                      <span aria-hidden="true" className={indicator(false)}>
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      <span className="flex-1">
                        <span className="block font-semibold">{x.label}</span>
                        <span className="block text-[#c9d6c3]">{x.note}</span>
                      </span>
                      <x.icon
                        aria-hidden="true"
                        className="size-5 shrink-0 text-[#a8c98a]"
                        strokeWidth={1.5}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <aside
              aria-label="Indicative cost range"
              className="h-fit border border-[#a8c98a]/60 bg-[#183225] p-6"
            >
              <p className={cn(heading, "text-lg font-semibold")}>Indicative range</p>
              <div aria-live="polite" aria-atomic="true">
                {plan ? (
                  <>
                    <p className="sr-only">
                      Indicative range for a {areaNum} square metre {typeLabel.toLowerCase()} at{" "}
                      {finishLabel} finish: {aud(plan.min)} to {aud(plan.max)} Australian dollars.
                    </p>
                    <p
                      aria-hidden="true"
                      className={cn(
                        heading,
                        "mt-3 text-3xl font-semibold leading-tight text-[#a8c98a] @xl:text-4xl",
                      )}
                    >
                      {aud(plan.min)} – {aud(plan.max)}
                    </p>
                    <dl className="mt-5 space-y-2.5 text-sm">
                      <div className="flex justify-between gap-3 border-b border-[#a8c98a]/30 pb-2.5">
                        <dt className="text-[#c9d6c3]">
                          {typeLabel}, {areaNum} m²
                        </dt>
                        <dd className="text-right">{finishLabel}</dd>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-[#a8c98a]/30 pb-2.5">
                        <dt className="text-[#c9d6c3]">Landscape works</dt>
                        <dd className="text-right">
                          {aud(floor500(plan.worksMin))} – {aud(ceil500(plan.worksMax))}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-[#a8c98a]/30 pb-2.5">
                        <dt className="text-[#c9d6c3]">Extras ({chosen.length})</dt>
                        <dd className="text-right">
                          {chosen.length
                            ? `${aud(floor500(plan.extrasMin))} – ${aud(ceil500(plan.extrasMax))}`
                            : "None selected"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-[#c9d6c3]">Per square metre</dt>
                        <dd className="text-right">
                          {aud(plan.min / areaNum)} – {aud(plan.max / areaNum)}
                        </dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-[#ffb4a8]">
                    Enter an area between {MIN_AREA} and {MAX_AREA.toLocaleString("en-AU")} m² to
                    see a range.
                  </p>
                )}
              </div>
              <p className="mt-5 border-l-2 border-[#a8c98a] pl-3 text-sm text-[#d3ddcf]">
                Indicative only. Real costs depend on access, levels, soil and council requirements,
                so this is a starting point rather than a quote. We confirm a fixed price after a
                site visit.
              </p>
              <button
                type="button"
                onClick={useEstimate}
                disabled={!plan}
                className={cn(
                  solidButton,
                  "mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                Use this in my enquiry <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </aside>
          </div>
        </div>
      </section>

      {/* Process */}
      <section
        id={`${uid}-process`}
        aria-labelledby={`${uid}-process-h`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-24"
      >
        <SectionHead
          id={`${uid}-process-h`}
          number="04"
          eyebrow="Process"
          title="Five steps from first visit to first morning coffee"
          intro="A clear sequence with a fixed price before any building starts."
        />
        <ol className="grid gap-px border border-[#b9b29d] bg-[#b9b29d] @xl:grid-cols-2 @5xl:grid-cols-5">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col bg-[#f1efe9] p-5">
              <span
                aria-hidden="true"
                className={cn(heading, "text-4xl font-semibold text-[#3f6b2f]")}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h4 className={cn(heading, "mt-3 text-lg font-semibold text-[#1f3d2b]")}>
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </h4>
              <p className="mt-2 flex-1 text-sm text-[#2e3f34]">{s.text}</p>
              <p className="mt-4 flex items-center gap-2 border-t border-[#cfc9ba] pt-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#2f5a24]">
                <Clock aria-hidden="true" className="size-3.5" /> {s.time}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Contact */}
      <section
        id={`${uid}-contact`}
        aria-labelledby={`${uid}-contact-h`}
        className="border-t border-[#cfc9ba] bg-[#e6e2d8]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 @3xl:py-24">
          <SectionHead
            id={`${uid}-contact-h`}
            number="05"
            eyebrow="Contact"
            title="Start with a site visit"
            intro="Tell us about the project and we will reply within two business days to arrange a free site visit."
          />
          <div className="grid gap-8 @3xl:grid-cols-[1fr_320px]">
            {sent ? (
              <DemoSent
                title="Enquiry received"
                onReset={reset}
                className="h-fit border border-[#3f6b2f] bg-[#fbfaf6] text-[#1c2a21]"
              />
            ) : (
              <form
                noValidate
                onSubmit={submit}
                className="grid gap-5 border border-[#b9b29d] bg-[#fbfaf6] p-5 @xl:grid-cols-2 @xl:p-8"
              >
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
                    aria-describedby={describedBy("name")}
                    className={inputCls}
                  />
                  {errorText("name")}
                </div>
                <div>
                  <label htmlFor={`${uid}-email`} className={labelCls}>
                    Email
                  </label>
                  <input
                    id={`${uid}-email`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={describedBy("email")}
                    className={inputCls}
                  />
                  {errorText("email")}
                </div>
                <div>
                  <label htmlFor={`${uid}-phone`} className={labelCls}>
                    Phone{" "}
                    <span className="font-normal normal-case tracking-normal text-[#44564b]">
                      (optional)
                    </span>
                  </label>
                  <input
                    id={`${uid}-phone`}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={describedBy("phone")}
                    className={inputCls}
                  />
                  {errorText("phone")}
                </div>
                <div>
                  <label htmlFor={`${uid}-suburb`} className={labelCls}>
                    Project suburb
                  </label>
                  <input
                    id={`${uid}-suburb`}
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    autoComplete="address-level2"
                    aria-invalid={Boolean(errors.suburb)}
                    aria-describedby={describedBy("suburb")}
                    className={inputCls}
                  />
                  {errorText("suburb")}
                </div>
                <div>
                  <label htmlFor={`${uid}-ptype`} className={labelCls}>
                    Project type
                  </label>
                  <select
                    id={`${uid}-ptype`}
                    value={formType}
                    onChange={(e) => setTypeOverride(e.target.value)}
                    aria-describedby={prefilled ? `${uid}-prefill` : undefined}
                    className={inputCls}
                  >
                    {projectTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                    <option value="other">Other or not sure</option>
                  </select>
                </div>
                <div>
                  <label htmlFor={`${uid}-budget-range`} className={labelCls}>
                    Budget range
                  </label>
                  <select
                    id={`${uid}-budget-range`}
                    value={formBudget}
                    onChange={(e) => setBudgetOverride(e.target.value)}
                    aria-describedby={prefilled ? `${uid}-prefill` : undefined}
                    className={inputCls}
                  >
                    {budgetBrackets.map((b) => (
                      <option key={b.label} value={b.label}>
                        {b.label}
                      </option>
                    ))}
                    <option value={NOT_SURE}>{NOT_SURE}</option>
                  </select>
                </div>
                {prefilled && plan ? (
                  <p
                    id={`${uid}-prefill`}
                    className="flex items-start gap-2 bg-[#e9efe2] p-3 text-sm text-[#1f3d2b] @xl:col-span-2"
                  >
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#3f6b2f]" />
                    Prefilled from your budget planner: {typeLabel}, {areaNum} m², {finishLabel}{" "}
                    finish, {aud(plan.min)} – {aud(plan.max)}. Change either field if you like.
                  </p>
                ) : null}
                <div className="@xl:col-span-2">
                  <label htmlFor={`${uid}-message`} className={labelCls}>
                    About the project
                  </label>
                  <textarea
                    id={`${uid}-message`}
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={describedBy("message")}
                    className={inputCls}
                  />
                  {errorText("message")}
                </div>
                <div className="flex flex-wrap items-center gap-4 @xl:col-span-2">
                  <button
                    type="submit"
                    className={cn(
                      solidButton,
                      "border-[#1f3d2b] bg-[#1f3d2b] text-[#f1efe9] hover:bg-[#2b5239] focus-visible:outline-[#3f6b2f]",
                    )}
                  >
                    Send enquiry
                  </button>
                  <p className="text-sm text-[#44564b]">
                    Site visits are free and carry no obligation.
                  </p>
                </div>
              </form>
            )}
            <aside
              aria-label="Studio details"
              className="h-fit space-y-5 bg-[#1f3d2b] p-6 text-[#f1efe9]"
            >
              <p className={cn(heading, "text-xl font-semibold")}>Talk to the studio</p>
              <a href={PHONE_HREF} className={cn(solidButton, "w-full")}>
                <Phone aria-hidden="true" className="size-4" /> Call {PHONE}
              </a>
              <ul className="space-y-3 text-sm text-[#d3ddcf]">
                <li className="flex items-start gap-2">
                  <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#a8c98a]" />
                  <span className="min-w-0 break-words">{EMAIL}</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#a8c98a]" />{" "}
                  {ADDRESS}
                </li>
                <li className="flex items-start gap-2">
                  <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#a8c98a]" />{" "}
                  Mon–Fri 8 am – 5 pm, Sat by appointment
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <footer className="bg-[#16301f] text-[#d3ddcf]">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-8 text-sm @3xl:grid-cols-[1fr_auto] @3xl:items-center">
          <p
            className={cn(
              heading,
              "flex items-center gap-2 text-base font-semibold uppercase tracking-[0.2em] text-[#f1efe9]",
            )}
          >
            <Trees aria-hidden="true" className="size-5 text-[#a8c98a]" />
            {design.businessName}
          </p>
          <p>
            {ADDRESS} · {PHONE}
          </p>
        </div>
      </footer>
      <DemoDisclaimer design={design} className="bg-[#16301f] text-[#f1efe9]" />
    </DemoRoot>
  );
}
