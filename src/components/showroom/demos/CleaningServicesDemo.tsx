import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  Clock,
  Home,
  Leaf,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

const PHONE = "(02) 5550 0142";
const PHONE_HREF = "tel:+61255500142";
const EMAIL = "bookings@clearwaterclean.example";
const ADDRESS = "14 Brightwater Parade, Marlow Bay NSW";

const SERVICE_AREA = [
  "Marlow Bay",
  "Wattle Heights",
  "Ashgrove Park",
  "Kinross Point",
  "Lindenfield",
  "Harbourview",
  "Tern Cove",
  "Bellbird Rise",
  "Stonebridge",
  "Calderbrook",
] as const;

const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a6ebd]";
const ringLight =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const display = "font-[family-name:var(--demo-font-heading)]";

/* ----------------------------- pricing model ----------------------------- */

type TierId = "standard" | "deep" | "lease";
type PropertyId = "apartment" | "house" | "office";
type FrequencyId = "once" | "fortnightly" | "weekly";
type ExtraId = "oven" | "fridge" | "windows" | "carpet" | "pet";

type Tier = {
  id: TierId;
  name: string;
  blurb: string;
  bestFor: string;
  base: number;
  bed: number;
  bath: number;
  living: number;
  inclusions: readonly string[];
};

const TIERS: Record<TierId, Tier> = {
  standard: {
    id: "standard",
    name: "Standard",
    blurb: "The regular reset that keeps a home or office feeling fresh.",
    bestFor: "Weekly and fortnightly upkeep",
    base: 70,
    bed: 25,
    bath: 35,
    living: 20,
    inclusions: [
      "Dust and wipe all reachable surfaces",
      "Vacuum and mop all floors",
      "Kitchen benches, sink and splashback",
      "Bathrooms scrubbed and sanitised",
      "Beds made and bins emptied",
    ],
  },
  deep: {
    id: "deep",
    name: "Deep",
    blurb: "Everything in Standard, plus the places that get missed.",
    bestFor: "A first visit or a seasonal refresh",
    base: 120,
    bed: 40,
    bath: 55,
    living: 32,
    inclusions: [
      "Everything in Standard",
      "Skirting boards, doors and light switches",
      "Inside the microwave and range hood",
      "Tile grout and shower screens descaled",
      "Cobwebs, vents and window sills",
    ],
  },
  lease: {
    id: "lease",
    name: "End-of-lease",
    blurb: "Agent-ready, with a re-clean promise if the inspection finds a miss.",
    bestFor: "Bond-back and sale-ready handovers",
    base: 180,
    bed: 55,
    bath: 75,
    living: 45,
    inclusions: [
      "Everything in Deep",
      "Inside every cupboard, drawer and wardrobe",
      "Oven, stovetop and rangehood degreased",
      "Interior windows, tracks and blinds",
      "Free re-clean within 72 hours",
    ],
  },
};
const TIER_LIST: readonly Tier[] = [TIERS.standard, TIERS.deep, TIERS.lease];

const PROPERTIES: Record<
  PropertyId,
  { name: string; uplift: number; bed: string; bath: string; living: string; bedHint: string }
> = {
  apartment: {
    name: "Apartment",
    uplift: 0,
    bed: "Bedrooms",
    bath: "Bathrooms",
    living: "Living areas",
    bedHint: "0 for a studio",
  },
  house: {
    name: "House",
    uplift: 0.15,
    bed: "Bedrooms",
    bath: "Bathrooms",
    living: "Living areas",
    bedHint: "Includes stairs and hallways",
  },
  office: {
    name: "Office",
    uplift: 0.1,
    bed: "Offices & meeting rooms",
    bath: "Bathrooms",
    living: "Open-plan areas",
    bedHint: "Private offices and boardrooms",
  },
};
const PROPERTY_LIST: readonly PropertyId[] = ["apartment", "house", "office"];

const FREQUENCIES: Record<FrequencyId, { name: string; discount: number; note: string }> = {
  once: { name: "One-off", discount: 0, note: "Book when you need it" },
  fortnightly: { name: "Fortnightly", discount: 0.1, note: "Save 10% every visit" },
  weekly: { name: "Weekly", discount: 0.15, note: "Save 15% every visit" },
};
const FREQUENCY_LIST: readonly FrequencyId[] = ["once", "fortnightly", "weekly"];

const EXTRAS: readonly { id: ExtraId; name: string; hint: string; price: number }[] = [
  { id: "oven", name: "Oven deep clean", hint: "Racks, glass and cavity degreased", price: 45 },
  { id: "fridge", name: "Inside the fridge", hint: "Shelves out, wiped and dried", price: 35 },
  { id: "windows", name: "Interior windows", hint: "Glass, tracks and sills", price: 60 },
  {
    id: "carpet",
    name: "Carpet steam clean",
    hint: "Charged per carpeted room (bedrooms plus living areas)",
    price: 25,
  },
  { id: "pet", name: "Pet hair treatment", hint: "Furniture, skirting and floors", price: 30 },
];

const LIMITS = {
  bedrooms: { min: 0, max: 8 },
  bathrooms: { min: 1, max: 6 },
  living: { min: 0, max: 4 },
} as const;

type Line = { key: string; label: string; detail: string; amount: number };

type Inputs = {
  tier: TierId;
  property: PropertyId;
  frequency: FrequencyId;
  bedrooms: number;
  bathrooms: number;
  living: number;
  extras: Record<ExtraId, boolean>;
};

type Estimate = {
  lines: Line[];
  extraLines: Line[];
  discountRate: number;
  discount: number;
  cleanSubtotal: number;
  perVisit: number;
  total: number;
  gst: number;
  frequency: FrequencyId;
};

function aud(n: number): string {
  const body = `$${Math.abs(n).toLocaleString("en-AU")}`;
  return n < 0 ? `−${body}` : body;
}

function calcEstimate(input: Inputs): Estimate {
  const tier = TIERS[input.tier];
  const prop = PROPERTIES[input.property];
  // End-of-lease cleans are always a single visit.
  const frequency: FrequencyId = input.tier === "lease" ? "once" : input.frequency;
  const lines: Line[] = [
    { key: "base", label: `${tier.name} clean`, detail: "Base visit", amount: tier.base },
  ];
  if (input.bedrooms > 0) {
    lines.push({
      key: "bed",
      label: prop.bed,
      detail: `${input.bedrooms} × ${aud(tier.bed)}`,
      amount: input.bedrooms * tier.bed,
    });
  }
  lines.push({
    key: "bath",
    label: prop.bath,
    detail: `${input.bathrooms} × ${aud(tier.bath)}`,
    amount: input.bathrooms * tier.bath,
  });
  if (input.living > 0) {
    lines.push({
      key: "living",
      label: prop.living,
      detail: `${input.living} × ${aud(tier.living)}`,
      amount: input.living * tier.living,
    });
  }
  const roomsTotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const uplift = Math.round(roomsTotal * prop.uplift);
  if (uplift > 0) {
    lines.push({
      key: "uplift",
      label: `${prop.name} allowance`,
      detail: `+${Math.round(prop.uplift * 100)}%`,
      amount: uplift,
    });
  }
  const cleanSubtotal = roomsTotal + uplift;
  const discountRate = FREQUENCIES[frequency].discount;
  const discount = Math.round(cleanSubtotal * discountRate);

  const extraLines: Line[] = [];
  const carpetRooms = Math.max(1, input.bedrooms + input.living);
  for (const extra of EXTRAS) {
    if (!input.extras[extra.id]) continue;
    const isCarpet = extra.id === "carpet";
    extraLines.push({
      key: extra.id,
      label: extra.name,
      detail: isCarpet ? `${carpetRooms} × ${aud(extra.price)}` : "",
      amount: isCarpet ? carpetRooms * extra.price : extra.price,
    });
  }
  const extrasTotal = extraLines.reduce((sum, l) => sum + l.amount, 0);
  const total = cleanSubtotal - discount + extrasTotal;
  return {
    lines,
    extraLines,
    discountRate,
    discount,
    cleanSubtotal,
    perVisit: cleanSubtotal - discount,
    total,
    gst: Math.round(total / 11),
    frequency,
  };
}

const NO_EXTRAS: Record<ExtraId, boolean> = {
  oven: false,
  fridge: false,
  windows: false,
  carpet: false,
  pet: false,
};

function fromPrice(tier: TierId): number {
  return calcEstimate({
    tier,
    property: "apartment",
    frequency: "once",
    bedrooms: LIMITS.bedrooms.min,
    bathrooms: LIMITS.bathrooms.min,
    living: LIMITS.living.min,
    extras: NO_EXTRAS,
  }).total;
}

/* ------------------------------- content -------------------------------- */

const trust = [
  {
    icon: ShieldCheck,
    title: "Fully insured",
    text: "$20 million public liability cover on every visit.",
  },
  {
    icon: BadgeCheck,
    title: "Police-checked",
    text: "Every cleaner is checked and ID-verified before their first job.",
  },
  {
    icon: ThumbsUp,
    title: "Satisfaction guarantee",
    text: "Not happy? Tell us within 24 hours and we'll re-clean it free.",
  },
] as const;

type Task = { text: string; from: 0 | 1 | 2 };
const TIER_RANK: Record<TierId, number> = { standard: 0, deep: 1, lease: 2 };

const rooms: readonly { id: string; name: string; tasks: readonly Task[] }[] = [
  {
    id: "kitchen",
    name: "Kitchen",
    tasks: [
      { text: "Benchtops, sink and tapware wiped and polished", from: 0 },
      { text: "Stovetop and splashback degreased", from: 0 },
      { text: "Outside of appliances and cupboard fronts", from: 0 },
      { text: "Floors vacuumed and mopped", from: 0 },
      { text: "Inside the microwave and rangehood filter", from: 1 },
      { text: "Inside the oven, racks and glass", from: 2 },
      { text: "Inside every cupboard and drawer", from: 2 },
    ],
  },
  {
    id: "bathrooms",
    name: "Bathrooms",
    tasks: [
      { text: "Toilet, basin and vanity cleaned and sanitised", from: 0 },
      { text: "Shower and bath scrubbed", from: 0 },
      { text: "Mirrors and chrome polished streak-free", from: 0 },
      { text: "Floors mopped", from: 0 },
      { text: "Tile grout scrubbed and shower screen descaled", from: 1 },
      { text: "Exhaust fan covers and vents wiped", from: 1 },
      { text: "Inside vanity cupboards and cabinets", from: 2 },
    ],
  },
  {
    id: "bedrooms",
    name: "Bedrooms",
    tasks: [
      { text: "Beds made (linen changed if left out)", from: 0 },
      { text: "Surfaces dusted and wiped", from: 0 },
      { text: "Floors vacuumed", from: 0 },
      { text: "Bedside tables, doors and light switches", from: 1 },
      { text: "Skirting boards and window sills", from: 1 },
      { text: "Inside wardrobes, shelves and drawers", from: 2 },
    ],
  },
  {
    id: "living",
    name: "Living areas",
    tasks: [
      { text: "Surfaces dusted and wiped", from: 0 },
      { text: "Sofas and cushions vacuumed", from: 0 },
      { text: "Floors vacuumed and mopped", from: 0 },
      { text: "Skirting boards, doors and light switches", from: 1 },
      { text: "Ceiling fans, vents and cobwebs", from: 1 },
      { text: "Interior windows, tracks and blinds", from: 2 },
    ],
  },
  {
    id: "entry",
    name: "Entry & laundry",
    tasks: [
      { text: "Entry floors and doormats", from: 0 },
      { text: "Laundry sink and benchtops wiped", from: 0 },
      { text: "Bins emptied and relined", from: 0 },
      { text: "Front door and internal glass", from: 1 },
      { text: "Inside laundry cupboards and dryer lint trap", from: 2 },
      { text: "Garage and balcony swept", from: 2 },
    ],
  },
];

const faqs = [
  {
    id: "supplies",
    q: "Do I need to supply anything?",
    a: "No. Our cleaners bring their own plant-based products, microfibre cloths and vacuums. If you prefer us to use your products or have allergies, note it in your booking and we'll follow it.",
  },
  {
    id: "home",
    q: "Do I need to be home?",
    a: "Not at all. Many clients leave a key safe code or building access instructions. You'll get a text when the team arrives and another when they leave.",
  },
  {
    id: "same",
    q: "Will I get the same cleaner each time?",
    a: "For fortnightly and weekly bookings we assign a regular team wherever we can, so they learn your home and your preferences.",
  },
  {
    id: "lease",
    q: "What does the end-of-lease guarantee cover?",
    a: "If your property manager's inspection finds a missed spot, tell us within 72 hours and we'll return to re-clean it at no charge. We follow the standard agent checklist.",
  },
  {
    id: "cancel",
    q: "What if I need to reschedule or cancel?",
    a: "Change or cancel free of charge up to 24 hours before your clean. Inside 24 hours a 50% call-out fee applies, because the team's day is already planned.",
  },
  {
    id: "price",
    q: "Is the estimate the final price?",
    a: "It's firm for typical homes. If the property is far dirtier or larger than described, we'll tell you before we start, never after. All prices include GST.",
  },
] as const;

const reviews = [
  {
    name: "Priya N.",
    place: "Wattle Heights",
    stars: 5,
    text: "I priced the clean in two minutes, booked online and came home to a spotless flat. The team even straightened the cushions.",
  },
  {
    name: "Marcus T.",
    place: "Kinross Point",
    stars: 5,
    text: "Our end-of-lease clean passed inspection first time and the full bond came back. Worth every dollar.",
  },
  {
    name: "Elena & Sam",
    place: "Lindenfield",
    stars: 4,
    text: "Weekly cleans have given us our weekends back. Same friendly crew every time and the discount is a nice touch.",
  },
] as const;

/* ------------------------------ illustrations ---------------------------- */

function SparkleShape({
  x,
  y,
  s,
  className,
}: {
  x: number;
  y: number;
  s: number;
  className: string;
}) {
  return (
    <path
      d="M0 -12 Q0 0 12 0 Q0 0 0 12 Q0 0 -12 0 Q0 0 0 -12Z"
      transform={`translate(${x} ${y}) scale(${s})`}
      className={className}
    />
  );
}

function SparkleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-16 -16 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <SparkleShape x={-3} y={2} s={1.1} className="fill-[#0a6ebd]" />
      <SparkleShape x={9} y={-9} s={0.5} className="fill-[#5cb3ea]" />
    </svg>
  );
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 360" aria-hidden="true" className="h-auto w-full">
      <circle cx="210" cy="190" r="165" fill="#c4e0f4" />
      <circle cx="210" cy="190" r="120" fill="#aed3ef" />
      {/* house */}
      <path
        d="M90 200 L210 100 L330 200 V300 H90 Z"
        fill="#ffffff"
        stroke="#0f2b40"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M72 206 L210 90 L348 206"
        fill="none"
        stroke="#0a6ebd"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="188" y="226" width="44" height="74" rx="4" fill="#0a6ebd" />
      <circle cx="224" cy="264" r="3" fill="#ffffff" />
      <rect
        x="116"
        y="216"
        width="48"
        height="48"
        rx="4"
        fill="#dcecf8"
        stroke="#0f2b40"
        strokeWidth="3"
      />
      <path d="M140 216 V264 M116 240 H164" stroke="#0f2b40" strokeWidth="2" />
      <rect
        x="256"
        y="216"
        width="48"
        height="48"
        rx="4"
        fill="#dcecf8"
        stroke="#0f2b40"
        strokeWidth="3"
      />
      <path d="M280 216 V264 M256 240 H304" stroke="#0f2b40" strokeWidth="2" />
      <path
        d="M122 258 L134 222 M262 258 L274 222"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="210" cy="156" r="14" fill="#dcecf8" stroke="#0f2b40" strokeWidth="3" />
      <path d="M70 300 H350" stroke="#0f2b40" strokeWidth="4" strokeLinecap="round" />
      {/* spray bottle */}
      <g transform="translate(300 214)">
        <rect
          x="0"
          y="40"
          width="64"
          height="90"
          rx="14"
          fill="#ffffff"
          stroke="#0f2b40"
          strokeWidth="4"
        />
        <rect x="8" y="78" width="48" height="44" rx="8" fill="#5cb3ea" />
        <rect
          x="14"
          y="20"
          width="36"
          height="24"
          rx="4"
          fill="#0a6ebd"
          stroke="#0f2b40"
          strokeWidth="4"
        />
        <path
          d="M14 26 H-12 Q-20 26 -20 34 V40 H14"
          fill="#0a6ebd"
          stroke="#0f2b40"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M50 30 Q58 40 54 64"
          fill="none"
          stroke="#0f2b40"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="-34" cy="34" r="4" fill="#0a6ebd" />
        <circle cx="-48" cy="26" r="3" fill="#0a6ebd" />
        <circle cx="-44" cy="44" r="2.5" fill="#0a6ebd" />
      </g>
      {/* sparkles & bubbles */}
      <SparkleShape x={96} y={110} s={1.6} className="fill-[#0a6ebd]" />
      <SparkleShape x={330} y={120} s={1} className="fill-[#0a6ebd]" />
      <SparkleShape x={150} y={190} s={0.7} className="fill-[#ffffff]" />
      <SparkleShape x={52} y={196} s={0.9} className="fill-[#0a6ebd]" />
      <circle cx="368" cy="176" r="9" fill="none" stroke="#0a6ebd" strokeWidth="3" />
      <circle cx="388" cy="152" r="5" fill="none" stroke="#0a6ebd" strokeWidth="3" />
      <circle cx="46" cy="262" r="8" fill="none" stroke="#0a6ebd" strokeWidth="3" />
    </svg>
  );
}

function SprayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("size-10", className)}>
      <rect
        x="18"
        y="20"
        width="20"
        height="24"
        rx="5"
        fill="#ffffff"
        stroke="#0f2b40"
        strokeWidth="2.5"
      />
      <rect x="22" y="30" width="12" height="9" rx="2" fill="#5cb3ea" />
      <rect
        x="22"
        y="10"
        width="12"
        height="9"
        rx="2"
        fill="#0a6ebd"
        stroke="#0f2b40"
        strokeWidth="2.5"
      />
      <path
        d="M22 13 H10 V18 H22"
        fill="#0a6ebd"
        stroke="#0f2b40"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="5" cy="14" r="1.8" fill="#0a6ebd" />
      <circle cx="3" cy="20" r="1.5" fill="#0a6ebd" />
    </svg>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <p className="flex gap-0.5" role="img" aria-label={`${count} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={cn("size-5", n <= count ? "fill-[#e8a317] text-[#e8a317]" : "text-[#6b8aa0]")}
        />
      ))}
    </p>
  );
}

function SectionTitle({
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
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-sm font-semibold tracking-wide text-[#075a9c] uppercase">{eyebrow}</p>
      <h3
        id={id}
        className={cn(
          display,
          "mt-2 text-3xl leading-tight font-bold text-[#0f2b40] @3xl:text-4xl",
        )}
      >
        {title}
      </h3>
      {intro ? <p className="mt-3 text-lg text-[#3f5f77]">{intro}</p> : null}
    </div>
  );
}

function Stepper({
  uid,
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  uid: string;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const btn = cn(
    "grid size-11 shrink-0 place-items-center rounded-full border border-[#6b8aa0] bg-white text-[#0f2b40] hover:bg-[#dcecf8] disabled:cursor-not-allowed disabled:opacity-40",
    ring,
  );
  return (
    <div
      role="group"
      aria-labelledby={`${uid}-label`}
      className="flex items-center justify-between gap-3 rounded-xl border border-[#b9d4e8] bg-white p-3"
    >
      <div className="min-w-0">
        <p id={`${uid}-label`} className="font-semibold text-[#0f2b40]">
          {label}
        </p>
        <p className="text-sm text-[#3f5f77]">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          disabled={value <= min}
          aria-label={`Fewer: ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <span className="w-7 text-center text-xl font-bold text-[#0f2b40] tabular-nums">
          {value}
        </span>
        <button
          type="button"
          className={btn}
          disabled={value >= max}
          aria-label={`More: ${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}

function ChoiceCard({
  name,
  checked,
  disabled,
  onSelect,
  children,
}: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "relative flex min-h-14 cursor-pointer flex-col justify-center rounded-xl border border-[#6b8aa0] bg-white px-4 py-3 text-[#0f2b40] hover:bg-[#f2f8fc]",
        "has-[:checked]:border-[#0a6ebd] has-[:checked]:bg-[#eaf4fc] has-[:checked]:ring-2 has-[:checked]:ring-[#0a6ebd]",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#0a6ebd]",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled ?? false}
        onChange={onSelect}
        className="sr-only"
      />
      {children}
    </label>
  );
}

type Field = "name" | "email" | "phone" | "suburb" | "date";
type Errors = Partial<Record<Field, string>>;

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/* -------------------------------- component ------------------------------ */

export function CleaningServicesDemo({ design }: DemoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const tiersRef = useRef<HTMLElement>(null);
  const estimateRef = useRef<HTMLElement>(null);
  const includedRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const bookRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Estimator
  const [tier, setTier] = useState<TierId>("standard");
  const [property, setProperty] = useState<PropertyId>("apartment");
  const [frequency, setFrequency] = useState<FrequencyId>("once");
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [living, setLiving] = useState(1);
  const [extras, setExtras] = useState<Record<ExtraId, boolean>>(NO_EXTRAS);

  // Checklist & FAQs
  const [roomIdx, setRoomIdx] = useState(0);
  const [checklistTier, setChecklistTier] = useState<TierId>("standard");
  const [openFaq, setOpenFaq] = useState<string[]>(["supplies"]);

  // Booking form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const est = calcEstimate({ tier, property, frequency, bedrooms, bathrooms, living, extras });
  const prop = PROPERTIES[property];
  const tierData = TIERS[tier];
  const isRecurring = est.frequency !== "once";
  const selectedExtras = est.extraLines.map((l) => l.label);
  const summary = `${tierData.name} clean · ${prop.name} · ${bedrooms} ${prop.bed.toLowerCase()}, ${bathrooms} bathroom${bathrooms === 1 ? "" : "s"}, ${living} ${prop.living.toLowerCase()} · ${FREQUENCIES[est.frequency].name}`;
  const errorCount = Object.keys(errors).length;

  const go = (ref: RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ block: "nearest" });
  const nav = [
    { label: "Services", ref: tiersRef },
    { label: "Price estimator", ref: estimateRef },
    { label: "What's included", ref: includedRef },
    { label: "FAQs", ref: faqRef },
    { label: "Reviews", ref: reviewsRef },
    { label: "Book", ref: bookRef },
  ] as const;

  function chooseTier(id: TierId) {
    setTier(id);
    setChecklistTier(id);
    go(estimateRef);
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % rooms.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + rooms.length) % rooms.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = rooms.length - 1;
    else return;
    e.preventDefault();
    setRoomIdx(next);
    tabRefs.current[next]?.focus();
  }

  const toggleFaq = (id: string) =>
    setOpenFaq((cur) => (cur.includes(id) ? cur.filter((f) => f !== id) : [...cur, id]));

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = "Enter an email address so we can confirm.";
    }
    const digits = phone.replace(/\D/g, "");
    if (phone.trim() && (digits.length < 8 || digits.length > 11)) {
      next.phone = "Enter a phone number with 8 to 11 digits, or leave it blank.";
    }
    if (!suburb) next.suburb = "Choose your suburb so we can check your area.";
    if (!date) next.date = "Choose your preferred date.";
    else if (date < todayIso()) next.date = "Choose a date from today onwards.";
    setErrors(next);
    const order: Field[] = ["name", "email", "phone", "suburb", "date"];
    const firstBad = order.find((f) => next[f]);
    if (firstBad) {
      document.getElementById(`${uid}-${firstBad}`)?.focus();
      return;
    }
    setSent(true);
  }

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setSuburb("");
    setDate("");
    setNotes("");
    setErrors({});
    setSent(false);
  }

  const input = cn(
    "mt-1.5 w-full rounded-lg border border-[#6b8aa0] bg-white px-3 py-2.5 text-[#0f2b40] [color-scheme:light] placeholder:text-[#4f6e84] aria-[invalid=true]:border-[#b3261e]",
    ring,
  );
  const labelCls = "text-sm font-semibold text-[#0f2b40]";
  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`${uid}-${field}-err`} className="mt-1.5 text-sm font-medium text-[#a8201a]">
        {errors[field]}
      </p>
    ) : null;
  const describedBy = (field: Field) => (errors[field] ? `${uid}-${field}-err` : undefined);
  const primaryButton = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0a6ebd] px-6 py-3 font-semibold text-white hover:bg-[#075a9c] motion-safe:transition-colors",
    ring,
  );
  const ghostButton = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[#0a6ebd] bg-white px-6 py-3 font-semibold text-[#075a9c] hover:bg-[#dcecf8] motion-safe:transition-colors",
    ring,
  );

  const activeRoom = rooms[roomIdx] ?? rooms[0];
  const rank = TIER_RANK[checklistTier];
  const includedCount = activeRoom ? activeRoom.tasks.filter((t) => t.from <= rank).length : 0;

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.sansHumanist, heading: demoFonts.sansRounded }}
      className="bg-[#f2f8fc] text-[#0f2b40]"
    >
      <header className="border-b border-[#b9d4e8] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <p
            className={cn(
              display,
              "flex items-center gap-2 text-lg font-bold text-[#0f2b40] @xl:text-xl",
            )}
          >
            <SparkleMark />
            {design.businessName}
          </p>
          <nav aria-label="Demo site sections" className="hidden items-center gap-1 @5xl:flex">
            {nav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.ref)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium text-[#0f2b40] hover:bg-[#dcecf8]",
                  ring,
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <a
            href={PHONE_HREF}
            className={cn(
              "hidden items-center gap-2 rounded-full bg-[#0a6ebd] px-4 py-2 text-sm font-semibold text-white hover:bg-[#075a9c] @xl:inline-flex",
              ring,
            )}
          >
            <Phone aria-hidden="true" className="size-4" /> {PHONE}
          </a>
        </div>
        <nav
          aria-label="Demo site sections, compact"
          className="border-t border-[#dcecf8] @5xl:hidden"
        >
          <ul className="flex gap-1 overflow-x-auto px-3 py-1.5">
            {nav.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => go(item.ref)}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-[#0f2b40]",
                    ring,
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
      <section aria-labelledby={`${uid}-hero`} className="relative overflow-hidden bg-[#dcecf8]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.85),transparent_45%),radial-gradient(circle_at_0%_100%,rgba(92,179,234,0.35),transparent_50%)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 @3xl:grid-cols-[1.1fr_0.9fr] @3xl:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#075a9c]">
              <Sparkles aria-hidden="true" className="size-4" /> Marlow Bay &amp; surrounds · Since
              2012
            </p>
            <h2
              id={`${uid}-hero`}
              className={cn(
                display,
                "mt-4 text-4xl leading-[1.05] font-bold text-[#0f2b40] @xl:text-5xl @5xl:text-6xl",
              )}
            >
              A spotless space, with the price up front.
            </h2>
            <p className="mt-5 max-w-xl text-lg text-[#264a63]">
              Home and office cleaning from vetted, insured local teams. Build your quote in under a
              minute, then book the day that suits you.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => go(estimateRef)} className={primaryButton}>
                Get an instant price
              </button>
              <button type="button" onClick={() => go(bookRef)} className={ghostButton}>
                Request a booking
              </button>
            </div>
            <ul className="mt-8 grid gap-3 @xl:grid-cols-3">
              {trust.map((t) => (
                <li key={t.title} className="rounded-xl bg-white/90 p-3 shadow-sm">
                  <t.icon aria-hidden="true" className="size-6 text-[#0a6ebd]" />
                  <p className="mt-1.5 font-bold text-[#0f2b40]">{t.title}</p>
                  <p className="text-sm text-[#3f5f77]">{t.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-sm @3xl:max-w-none">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Service tiers */}
      <section
        ref={tiersRef}
        aria-labelledby={`${uid}-tiers`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-tiers`}
          eyebrow="Service tiers"
          title="Pick the clean that fits"
          intro="From-prices are for a studio apartment with one bathroom and rise with the size of your property. All prices include GST."
        />
        <div className="grid gap-6 @3xl:grid-cols-3">
          {TIER_LIST.map((t) => {
            const featured = t.id === "deep";
            return (
              <article
                key={t.id}
                aria-labelledby={`${uid}-tier-${t.id}`}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6",
                  featured
                    ? "border-[#075a9c] bg-[#075a9c] text-white shadow-xl"
                    : "border-[#b9d4e8] bg-white text-[#0f2b40]",
                )}
              >
                {featured ? (
                  <p className="absolute -top-3 left-6 rounded-full bg-[#ffd166] px-3 py-0.5 text-xs font-bold text-[#0f2b40]">
                    Most booked
                  </p>
                ) : null}
                <h4 id={`${uid}-tier-${t.id}`} className={cn(display, "text-2xl font-bold")}>
                  {t.name}
                </h4>
                <p className={cn("mt-1 text-sm", featured ? "text-[#dcecf8]" : "text-[#3f5f77]")}>
                  {t.blurb}
                </p>
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className={cn("text-sm", featured ? "text-[#dcecf8]" : "text-[#3f5f77]")}>
                    from
                  </span>
                  <span className={cn(display, "text-4xl font-bold")}>{aud(fromPrice(t.id))}</span>
                </p>
                <p
                  className={cn(
                    "mt-1 text-sm font-medium",
                    featured ? "text-white" : "text-[#075a9c]",
                  )}
                >
                  {t.bestFor}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                  {t.inclusions.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          featured ? "text-[#ffd166]" : "text-[#0a6ebd]",
                        )}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => chooseTier(t.id)}
                  className={cn(
                    "mt-6 inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 font-semibold motion-safe:transition-colors",
                    featured
                      ? cn("bg-white text-[#075a9c] hover:bg-[#dcecf8]", ringLight)
                      : cn("bg-[#0a6ebd] text-white hover:bg-[#075a9c]", ring),
                  )}
                >
                  Price a {t.name.toLowerCase()} clean
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Price estimator */}
      <section
        ref={estimateRef}
        aria-labelledby={`${uid}-estimate`}
        className="border-y border-[#b9d4e8] bg-[#dcecf8]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <SprayIcon className="mx-auto size-14" />
            <p className="mt-2 text-sm font-semibold tracking-wide text-[#075a9c] uppercase">
              Price estimator
            </p>
            <h3
              id={`${uid}-estimate`}
              className={cn(display, "mt-2 text-3xl leading-tight font-bold @3xl:text-4xl")}
            >
              Know the price before you call
            </h3>
            <p className="mt-3 text-lg text-[#264a63]">
              Set your rooms, tier and how often you'd like us. The breakdown updates as you go.
            </p>
          </div>
          <div className="grid gap-8 @3xl:grid-cols-[1fr_340px] @5xl:grid-cols-[1fr_390px]">
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-2 text-lg font-bold">1. Property type</legend>
                <div className="grid gap-3 @xl:grid-cols-3">
                  {PROPERTY_LIST.map((id) => (
                    <ChoiceCard
                      key={id}
                      name={`${uid}-property`}
                      checked={property === id}
                      onSelect={() => setProperty(id)}
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        {id === "office" ? (
                          <Building2 aria-hidden="true" className="size-5 text-[#075a9c]" />
                        ) : (
                          <Home aria-hidden="true" className="size-5 text-[#075a9c]" />
                        )}
                        {PROPERTIES[id].name}
                      </span>
                      <span className="text-sm text-[#3f5f77]">
                        {PROPERTIES[id].uplift > 0
                          ? `+${Math.round(PROPERTIES[id].uplift * 100)}% allowance`
                          : "No allowance"}
                      </span>
                    </ChoiceCard>
                  ))}
                </div>
              </fieldset>

              <div role="group" aria-labelledby={`${uid}-rooms-h`}>
                <p id={`${uid}-rooms-h`} className="mb-2 text-lg font-bold">
                  2. Rooms
                </p>
                <div className="grid gap-3 @xl:grid-cols-3 @3xl:grid-cols-1 @5xl:grid-cols-3">
                  <Stepper
                    uid={`${uid}-bed`}
                    label={prop.bed}
                    hint={prop.bedHint}
                    value={bedrooms}
                    min={LIMITS.bedrooms.min}
                    max={LIMITS.bedrooms.max}
                    onChange={setBedrooms}
                  />
                  <Stepper
                    uid={`${uid}-bath`}
                    label={prop.bath}
                    hint="Including ensuites"
                    value={bathrooms}
                    min={LIMITS.bathrooms.min}
                    max={LIMITS.bathrooms.max}
                    onChange={setBathrooms}
                  />
                  <Stepper
                    uid={`${uid}-living`}
                    label={prop.living}
                    hint="Lounge, dining, study"
                    value={living}
                    min={LIMITS.living.min}
                    max={LIMITS.living.max}
                    onChange={setLiving}
                  />
                </div>
              </div>

              <fieldset>
                <legend className="mb-2 text-lg font-bold">3. Service tier</legend>
                <div className="grid gap-3 @xl:grid-cols-3">
                  {TIER_LIST.map((t) => (
                    <ChoiceCard
                      key={t.id}
                      name={`${uid}-tier`}
                      checked={tier === t.id}
                      onSelect={() => {
                        setTier(t.id);
                        setChecklistTier(t.id);
                      }}
                    >
                      <span className="font-semibold">{t.name}</span>
                      <span className="text-sm text-[#3f5f77]">from {aud(fromPrice(t.id))}</span>
                    </ChoiceCard>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-lg font-bold">4. How often?</legend>
                <div className="grid gap-3 @xl:grid-cols-3">
                  {FREQUENCY_LIST.map((id) => (
                    <ChoiceCard
                      key={id}
                      name={`${uid}-freq`}
                      checked={est.frequency === id}
                      disabled={tier === "lease" && id !== "once"}
                      onSelect={() => setFrequency(id)}
                    >
                      <span className="font-semibold">{FREQUENCIES[id].name}</span>
                      <span className="text-sm text-[#3f5f77]">{FREQUENCIES[id].note}</span>
                    </ChoiceCard>
                  ))}
                </div>
                {tier === "lease" ? (
                  <p className="mt-2 text-sm text-[#264a63]">
                    End-of-lease cleans are a single visit, so regular-visit discounts don't apply.
                  </p>
                ) : null}
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-lg font-bold">5. Extras</legend>
                <div className="grid gap-3 @xl:grid-cols-2">
                  {EXTRAS.map((x) => (
                    <label
                      key={x.id}
                      htmlFor={`${uid}-extra-${x.id}`}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border border-[#6b8aa0] bg-white p-3 hover:bg-[#f2f8fc]",
                        "has-[:checked]:border-[#0a6ebd] has-[:checked]:bg-[#eaf4fc]",
                        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#0a6ebd]",
                      )}
                    >
                      <input
                        id={`${uid}-extra-${x.id}`}
                        type="checkbox"
                        checked={extras[x.id]}
                        onChange={(e) => setExtras((cur) => ({ ...cur, [x.id]: e.target.checked }))}
                        className="mt-1 size-5 shrink-0 accent-[#0a6ebd]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex justify-between gap-2 font-semibold">
                          {x.name}
                          <span className="text-[#075a9c]">
                            {x.id === "carpet" ? `${aud(x.price)}/room` : `+${aud(x.price)}`}
                          </span>
                        </span>
                        <span className="block text-sm text-[#3f5f77]">{x.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <aside
              aria-label="Your estimate"
              className="h-fit rounded-2xl border border-[#b9d4e8] bg-white p-5 shadow-lg @xl:p-6"
            >
              <p className={cn(display, "text-2xl font-bold")}>Your estimate</p>
              <p className="mt-1 text-sm text-[#3f5f77]">{summary}</p>
              <dl className="mt-4 space-y-2.5 text-sm">
                {est.lines.map((l) => (
                  <div key={l.key} className="flex justify-between gap-3">
                    <dt>
                      {l.label}
                      {l.detail ? <span className="block text-[#3f5f77]">{l.detail}</span> : null}
                    </dt>
                    <dd className="font-semibold tabular-nums">{aud(l.amount)}</dd>
                  </div>
                ))}
                {est.discount > 0 ? (
                  <div className="flex justify-between gap-3 rounded-lg bg-[#e3f6e8] px-2 py-1.5 text-[#14532d]">
                    <dt>
                      {FREQUENCIES[est.frequency].name} discount
                      <span className="block">
                        −{Math.round(est.discountRate * 100)}% of cleaning
                      </span>
                    </dt>
                    <dd className="font-bold tabular-nums">{aud(-est.discount)}</dd>
                  </div>
                ) : null}
                {est.extraLines.map((l) => (
                  <div
                    key={l.key}
                    className="flex justify-between gap-3 border-t border-[#dcecf8] pt-2.5"
                  >
                    <dt>
                      {l.label}
                      <span className="block text-[#3f5f77]">{l.detail || "Extra"}</span>
                    </dt>
                    <dd className="font-semibold tabular-nums">{aud(l.amount)}</dd>
                  </div>
                ))}
              </dl>
              <div
                aria-live="polite"
                aria-atomic="true"
                className="mt-4 border-t-2 border-[#0f2b40] pt-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-bold">{isRecurring ? "First clean" : "Estimated total"}</p>
                  <p className={cn(display, "text-4xl font-bold text-[#075a9c] tabular-nums")}>
                    {aud(est.total)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-[#3f5f77]">Includes GST of {aud(est.gst)}.</p>
                {isRecurring ? (
                  <p className="mt-2 rounded-lg bg-[#eaf4fc] px-3 py-2 text-sm font-medium text-[#0f2b40]">
                    Then {aud(est.perVisit)} each{" "}
                    {est.frequency === "weekly" ? "week" : "fortnight"}.
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => go(bookRef)}
                className={cn(primaryButton, "mt-5 w-full")}
              >
                Book this clean
              </button>
              <p className="mt-3 text-xs text-[#3f5f77]">
                An estimate for typical properties. We confirm the final price before your first
                visit.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section
        ref={includedRef}
        aria-labelledby={`${uid}-included`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-included`}
          eyebrow="What's included"
          title="Room by room, nothing vague"
          intro="Choose a tier, then a room, to see exactly what's on the checklist."
        />
        <div className="rounded-2xl border border-[#b9d4e8] bg-white p-4 @xl:p-6">
          <div role="group" aria-label="Checklist tier" className="flex flex-wrap gap-2">
            {TIER_LIST.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={checklistTier === t.id}
                onClick={() => setChecklistTier(t.id)}
                className={cn(
                  "min-h-11 rounded-full border px-4 py-2 text-sm font-semibold motion-safe:transition-colors",
                  ring,
                  checklistTier === t.id
                    ? "border-[#0a6ebd] bg-[#0a6ebd] text-white"
                    : "border-[#6b8aa0] bg-white text-[#0f2b40] hover:bg-[#dcecf8]",
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div
            role="tablist"
            aria-label="Rooms"
            className="mt-5 flex gap-1 overflow-x-auto border-b border-[#b9d4e8]"
          >
            {rooms.map((r, i) => {
              const selected = i === roomIdx;
              return (
                <button
                  key={r.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`${uid}-tab-${r.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${uid}-tabpanel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setRoomIdx(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={cn(
                    "-mb-px min-h-11 rounded-t-lg border-b-4 px-4 py-2 font-semibold whitespace-nowrap",
                    ring,
                    selected
                      ? "border-[#0a6ebd] bg-[#eaf4fc] text-[#075a9c]"
                      : "border-transparent text-[#264a63] hover:bg-[#f2f8fc]",
                  )}
                >
                  {r.name}
                </button>
              );
            })}
          </div>
          {activeRoom ? (
            <div
              id={`${uid}-tabpanel`}
              role="tabpanel"
              aria-labelledby={`${uid}-tab-${activeRoom.id}`}
              className="pt-5"
            >
              <p className="text-sm text-[#3f5f77]" aria-live="polite">
                {includedCount} of {activeRoom.tasks.length} tasks in the{" "}
                {activeRoom.name.toLowerCase()} are part of a{" "}
                {TIERS[checklistTier].name.toLowerCase()} clean.
              </p>
              <ul className="mt-3 grid gap-2 @3xl:grid-cols-2">
                {activeRoom.tasks.map((task) => {
                  const included = task.from <= rank;
                  const addedIn = TIER_LIST[task.from];
                  return (
                    <li
                      key={task.text}
                      className={cn(
                        "flex items-start gap-3 rounded-lg px-3 py-2.5",
                        included
                          ? "bg-[#eaf4fc]"
                          : "border border-dashed border-[#6b8aa0] bg-white",
                      )}
                    >
                      {included ? (
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 size-5 shrink-0 text-[#075a9c]"
                        />
                      ) : (
                        <Plus
                          aria-hidden="true"
                          className="mt-0.5 size-5 shrink-0 text-[#4f6e84]"
                        />
                      )}
                      <span className={included ? "text-[#0f2b40]" : "text-[#3f5f77]"}>
                        <span className="sr-only">
                          {included ? "Included: " : "Not included: "}
                        </span>
                        {task.text}
                        {!included && addedIn ? (
                          <span className="ml-2 inline-block rounded-full bg-[#dcecf8] px-2 py-0.5 text-xs font-semibold text-[#0f2b40]">
                            Added in {addedIn.name}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* Peace of mind */}
      <section aria-labelledby={`${uid}-trust`} className="border-y border-[#b9d4e8] bg-[#dcecf8]">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <SectionTitle
            id={`${uid}-trust`}
            eyebrow="Insured & police-checked"
            title="People you can leave your keys with"
          />
          <ul className="grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "$20M public liability",
                text: "Cover for your property and contents on every visit.",
              },
              {
                icon: BadgeCheck,
                title: "Police-checked team",
                text: "National police checks, renewed every two years, plus ID verification.",
              },
              {
                icon: Leaf,
                title: "Plant-based products",
                text: "Gentle on pets, kids and the stormwater drain.",
              },
              {
                icon: Clock,
                title: "On time, every time",
                text: "A text on arrival and departure, with a 30-minute arrival window.",
              },
            ].map((item) => (
              <li key={item.title} className="rounded-2xl bg-white p-5">
                <item.icon aria-hidden="true" className="size-7 text-[#0a6ebd]" />
                <p className={cn(display, "mt-3 text-lg font-bold")}>{item.title}</p>
                <p className="mt-1 text-sm text-[#3f5f77]">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQs */}
      <section
        ref={faqRef}
        aria-labelledby={`${uid}-faq`}
        className="mx-auto max-w-3xl px-5 py-16 @3xl:py-20"
      >
        <SectionTitle id={`${uid}-faq`} eyebrow="FAQs" title="Good questions" />
        <ul className="space-y-3">
          {faqs.map((f) => {
            const isOpen = openFaq.includes(f.id);
            return (
              <li key={f.id} className="rounded-xl border border-[#b9d4e8] bg-white">
                <h4 className="m-0">
                  <button
                    id={`${uid}-faq-${f.id}`}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-faq-panel-${f.id}`}
                    onClick={() => toggleFaq(f.id)}
                    className={cn(
                      "flex min-h-14 w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left font-semibold hover:bg-[#f2f8fc]",
                      ring,
                    )}
                  >
                    {f.q}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-5 shrink-0 text-[#075a9c] motion-safe:transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                </h4>
                <div
                  id={`${uid}-faq-panel-${f.id}`}
                  role="region"
                  aria-labelledby={`${uid}-faq-${f.id}`}
                  hidden={!isOpen}
                  className="px-4 pb-4 text-[#264a63]"
                >
                  {f.a}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Reviews */}
      <section
        ref={reviewsRef}
        aria-labelledby={`${uid}-reviews`}
        className="border-y border-[#b9d4e8] bg-white"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20">
          <SectionTitle
            id={`${uid}-reviews`}
            eyebrow="Reviews"
            title="Kind words from clean homes"
          />
          <div className="grid gap-6 @3xl:grid-cols-3">
            {reviews.map((r) => (
              <figure
                key={r.name}
                className="flex flex-col rounded-2xl border border-[#b9d4e8] bg-[#f2f8fc] p-6"
              >
                <Stars count={r.stars} />
                <blockquote className="mt-3 flex-1 text-[#0f2b40]">“{r.text}”</blockquote>
                <figcaption className="mt-5">
                  <span className="block font-bold">{r.name}</span>
                  <span className="block text-sm text-[#3f5f77]">{r.place}</span>
                  <span className="mt-2 inline-block rounded-full bg-[#dcecf8] px-2.5 py-0.5 text-xs font-semibold text-[#0f2b40]">
                    Sample review
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Book */}
      <section
        ref={bookRef}
        aria-labelledby={`${uid}-book`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-book`}
          eyebrow="Book"
          title="Request your booking"
          intro="We'll confirm your time and final price within one business day. Nothing is charged until the clean is done."
        />
        {sent ? (
          <DemoSent
            title="Booking request received"
            onReset={reset}
            className="mx-auto max-w-xl border border-[#b9d4e8] bg-white text-[#0f2b40]"
          />
        ) : (
          <form
            noValidate
            onSubmit={submit}
            className="grid gap-6 rounded-2xl border border-[#b9d4e8] bg-white p-5 @xl:p-8 @3xl:grid-cols-[1fr_320px]"
          >
            <div className="grid gap-5 @xl:grid-cols-2">
              {errorCount > 0 ? (
                <p
                  role="alert"
                  className="rounded-lg border border-[#b3261e] bg-[#fdecea] px-3 py-2 text-sm font-medium text-[#7a1712] @xl:col-span-2"
                >
                  Please fix the {errorCount === 1 ? "field" : "fields"} marked below.
                </p>
              ) : null}
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
                  className={input}
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
                  className={input}
                />
                {errorText("email")}
              </div>
              <div>
                <label htmlFor={`${uid}-phone`} className={labelCls}>
                  Phone <span className="font-normal text-[#3f5f77]">(optional)</span>
                </label>
                <input
                  id={`${uid}-phone`}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={describedBy("phone")}
                  className={input}
                />
                {errorText("phone")}
              </div>
              <div>
                <label htmlFor={`${uid}-suburb`} className={labelCls}>
                  Suburb
                </label>
                <select
                  id={`${uid}-suburb`}
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  aria-invalid={Boolean(errors.suburb)}
                  aria-describedby={describedBy("suburb")}
                  className={input}
                >
                  <option value="">Choose your suburb</option>
                  {SERVICE_AREA.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errorText("suburb")}
              </div>
              <div className="@xl:col-span-2">
                <label htmlFor={`${uid}-date`} className={labelCls}>
                  Preferred date
                </label>
                <input
                  id={`${uid}-date`}
                  type="date"
                  min={todayIso()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={describedBy("date")}
                  className={input}
                />
                {errorText("date")}
              </div>
              <div className="@xl:col-span-2">
                <label htmlFor={`${uid}-notes`} className={labelCls}>
                  Notes{" "}
                  <span className="font-normal text-[#3f5f77]">
                    (access, pets, products to avoid)
                  </span>
                </label>
                <textarea
                  id={`${uid}-notes`}
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={input}
                />
              </div>
            </div>
            <div className="flex h-fit flex-col gap-4 rounded-xl bg-[#eaf4fc] p-5">
              <p className={cn(display, "text-xl font-bold")}>Your estimate</p>
              <p className="text-sm text-[#264a63]">{summary}</p>
              {selectedExtras.length > 0 ? (
                <p className="text-sm text-[#264a63]">Extras: {selectedExtras.join(", ")}</p>
              ) : null}
              <div aria-live="polite" aria-atomic="true">
                <p className="text-sm text-[#3f5f77]">
                  {isRecurring ? "First clean" : "Estimated total"}
                </p>
                <p className={cn(display, "text-4xl font-bold text-[#075a9c] tabular-nums")}>
                  {aud(est.total)}
                </p>
                {isRecurring ? (
                  <p className="text-sm text-[#264a63]">
                    Then {aud(est.perVisit)} per visit, after your{" "}
                    {Math.round(est.discountRate * 100)}% discount.
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => go(estimateRef)}
                className={cn(
                  "text-left text-sm font-semibold text-[#075a9c] underline underline-offset-4",
                  ring,
                )}
              >
                Change my estimate
              </button>
              <button type="submit" className={primaryButton}>
                Send booking request
              </button>
              <p className="text-xs text-[#3f5f77]">This demonstration form stays on this page.</p>
            </div>
          </form>
        )}
        <div className="mt-10 grid gap-6 @3xl:grid-cols-2">
          <div className="rounded-2xl border border-[#b9d4e8] bg-white p-6">
            <h4 className={cn(display, "text-xl font-bold")}>Our service area</h4>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SERVICE_AREA.map((s) => (
                <li key={s} className="rounded-full bg-[#dcecf8] px-3 py-1 text-sm font-medium">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-[#075a9c] p-6 text-white">
            <h4 className={cn(display, "text-xl font-bold")}>Prefer to talk it through?</h4>
            <p className="mt-2 text-[#eaf4fc]">
              Our friendly office team answers 7 am to 6 pm, Monday to Saturday.
            </p>
            <a
              href={PHONE_HREF}
              className={cn(
                "mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-[#075a9c] hover:bg-[#dcecf8]",
                ringLight,
              )}
            >
              <Phone aria-hidden="true" className="size-4" /> Call {PHONE}
            </a>
            <p className="mt-4 flex items-center gap-2 text-sm text-[#eaf4fc]">
              <Mail aria-hidden="true" className="size-4" /> {EMAIL}
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-[#0f2b40] text-[#dcecf8]">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm @3xl:grid-cols-3">
          <div>
            <p className={cn(display, "text-lg font-bold text-white")}>{design.businessName}</p>
            <p className="mt-2">Insured, police-checked home and office cleaning since 2012.</p>
          </div>
          <div>
            <p className="font-bold text-white">Hours</p>
            <p className="mt-2">Office Mon–Sat 7 am – 6 pm</p>
            <p>Cleans run 7 days, by arrangement</p>
          </div>
          <div>
            <p className="font-bold text-white">Contact</p>
            <p className="mt-2 flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> {ADDRESS}
            </p>
            <p>
              {PHONE} · {EMAIL}
            </p>
          </div>
        </div>
      </footer>
      <DemoDisclaimer design={design} className="bg-[#0b2234] text-white" />
    </DemoRoot>
  );
}
