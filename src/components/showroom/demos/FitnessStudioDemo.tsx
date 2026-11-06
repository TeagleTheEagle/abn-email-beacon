import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import {
  CalendarCheck,
  Check,
  Clock,
  Dumbbell,
  Flame,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

const PHONE = "(02) 5550 0142";
const PHONE_HREF = "tel:+61255500142";
const EMAIL = "train@forgeathletic.example";
const ADDRESS = "Unit 4, 18 Anvil Street, Ironbark Point NSW";
const TERM_WEEKS = 12;
const TERM_DISCOUNT = 0.1;

const LIME = "#d4ff00";
const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4ff00]";
const display = "font-[family-name:var(--demo-font-heading)]";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
const INTENSITIES = ["Low", "Medium", "High"] as const;

type Day = (typeof DAYS)[number];
type Intensity = (typeof INTENSITIES)[number];
type DayFilter = Day | "All";
type IntensityFilter = Intensity | "All";

type ClassItem = {
  id: string;
  day: Day;
  time: string;
  name: string;
  trainer: string;
  minutes: number;
  spots: number;
  intensity: Intensity;
};

type RawClass = readonly [Day, string, string, string, number, number, Intensity];

const rawClasses: readonly RawClass[] = [
  ["Mon", "6:00 am", "Barbell Foundations", "Marcus", 60, 6, "Medium"],
  ["Mon", "12:15 pm", "Express HIIT", "Tess", 30, 9, "High"],
  ["Mon", "6:00 pm", "Mobility Flow", "Priya", 45, 12, "Low"],
  ["Mon", "7:00 pm", "Boxing Conditioning", "Tess", 45, 6, "Medium"],
  ["Tue", "6:00 am", "Boxing Burn", "Tess", 45, 4, "High"],
  ["Tue", "9:30 am", "Strength Basics", "Marcus", 60, 10, "Medium"],
  ["Tue", "5:45 pm", "Engine Room", "Dani", 45, 7, "High"],
  ["Tue", "7:00 pm", "Restore & Stretch", "Priya", 45, 14, "Low"],
  ["Wed", "6:00 am", "Kettlebell Complex", "Marcus", 45, 0, "Medium"],
  ["Wed", "12:15 pm", "Pilates Core", "Priya", 45, 8, "Low"],
  ["Wed", "6:15 pm", "Hybrid Intervals", "Dani", 50, 5, "High"],
  ["Wed", "7:15 pm", "Kettlebell Basics", "Marcus", 45, 7, "Medium"],
  ["Thu", "6:00 am", "Power Hour", "Marcus", 60, 3, "High"],
  ["Thu", "9:30 am", "Gentle Strength", "Priya", 45, 11, "Low"],
  ["Thu", "5:30 pm", "Boxing Basics", "Tess", 45, 10, "Medium"],
  ["Thu", "7:00 pm", "Engine Room", "Dani", 45, 8, "High"],
  ["Fri", "6:00 am", "Express HIIT", "Tess", 30, 6, "High"],
  ["Fri", "12:15 pm", "Lunch Lift", "Marcus", 45, 9, "Medium"],
  ["Fri", "5:00 pm", "Friday Flow", "Priya", 45, 13, "Low"],
  ["Sat", "7:30 am", "Saturday Engine", "Dani", 60, 8, "High"],
  ["Sat", "9:00 am", "Strength Lab", "Marcus", 60, 5, "Medium"],
  ["Sat", "10:30 am", "Mobility Reset", "Priya", 45, 15, "Low"],
  ["Sun", "8:00 am", "Run Club Conditioning", "Dani", 50, 12, "Medium"],
  ["Sun", "9:30 am", "Easy Sunday Stretch", "Priya", 45, 16, "Low"],
  ["Sun", "11:00 am", "Sunday Sweat", "Tess", 45, 8, "High"],
];

const classes: readonly ClassItem[] = rawClasses.map(
  ([day, time, name, trainer, minutes, spots, intensity], i) => ({
    id: `c${i}`,
    day,
    time,
    name,
    trainer,
    minutes,
    spots,
    intensity,
  }),
);

function dayName(day: Day): string {
  const idx = DAYS.indexOf(day);
  return DAY_NAMES[idx] ?? day;
}

const trainers = [
  {
    initials: "MO",
    name: "Marcus Oyelaran",
    role: "Head of strength",
    specialities: ["Powerlifting", "Barbell technique", "Kettlebells"],
    bio: "Twelve years coaching first-time lifters into confident, injury-free strength.",
  },
  {
    initials: "TN",
    name: "Tess Nakamura",
    role: "Boxing & HIIT coach",
    specialities: ["Boxing conditioning", "HIIT", "Fat loss"],
    bio: "Former amateur boxer who runs the loudest, fastest sessions on the timetable.",
  },
  {
    initials: "PV",
    name: "Priya Venkataraman",
    role: "Mobility & Pilates",
    specialities: ["Mobility", "Mat Pilates", "Return from injury"],
    bio: "Exercise physiologist focused on moving well first, then moving heavy.",
  },
  {
    initials: "DK",
    name: "Dani Kowalczyk",
    role: "Endurance & hybrid",
    specialities: ["Hybrid training", "Run technique", "Engine building"],
    bio: "Marathon runner who builds the aerobic base behind every strong athlete.",
  },
] as const;

const tiers = [
  {
    id: "foundation",
    name: "Foundation",
    weekly: 24,
    blurb: "Two classes a week to build the habit.",
    perks: [
      "2 classes per week",
      "Open gym 5:45 am to 9 pm",
      "Locker and shower access",
      "Free induction session",
    ],
    popular: false,
  },
  {
    id: "athlete",
    name: "Athlete",
    weekly: 34,
    blurb: "Unlimited classes for people who train most days.",
    perks: [
      "Unlimited classes",
      "Open gym 5:45 am to 9 pm",
      "Programme review each term",
      "Bring a friend, once a month",
    ],
    popular: true,
  },
  {
    id: "elite",
    name: "Elite",
    weekly: 52,
    blurb: "Classes plus coaching built around your goal.",
    perks: [
      "Unlimited classes",
      "Fortnightly 1:1 session with a coach",
      "Personal programme in the app",
      "Priority booking, 7 days ahead",
    ],
    popular: false,
  },
] as const;

const goals = [
  { value: "strength", label: "Build strength" },
  { value: "fat-loss", label: "Lose fat" },
  { value: "fitness", label: "Improve fitness" },
  { value: "mobility", label: "Move better" },
] as const;

const reviews = [
  {
    name: "Chloe M.",
    detail: "Member for 14 months",
    text: "I came in unable to do a single push-up. Marcus got me to a 60 kg deadlift in the first term without ever making me feel behind.",
  },
  {
    name: "Ben R.",
    detail: "Athlete member",
    text: "The 6 am boxing class is the best part of my week. The classes are small, the coaches know your name, and the timetable is easy to plan around.",
  },
  {
    name: "Aisha K.",
    detail: "Elite member",
    text: "Priya rebuilt my knee confidence after surgery and Dani's engine sessions did the rest. I'm fitter at 41 than I was at 30.",
  },
] as const;

type Field = "name" | "email" | "phone" | "day" | "goal";
type Errors = Partial<Record<Field, string>>;

function Kettlebell({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
      <path
        d="M40 46 C34 18 86 18 80 46"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M60 36 C22 36 14 66 20 84 C26 104 44 110 60 110 C76 110 94 104 100 84 C106 66 98 36 60 36 Z"
        fill="currentColor"
      />
      <circle cx="60" cy="78" r="14" fill="#0d0d0d" opacity="0.85" />
    </svg>
  );
}

function Barbell({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 80" aria-hidden="true" className={className}>
      <rect x="10" y="36" width="300" height="8" rx="3" fill="currentColor" opacity="0.7" />
      <rect x="40" y="6" width="14" height="68" rx="3" fill="currentColor" />
      <rect x="58" y="14" width="10" height="52" rx="3" fill="currentColor" opacity="0.8" />
      <rect x="266" y="6" width="14" height="68" rx="3" fill="currentColor" />
      <rect x="252" y="14" width="10" height="52" rx="3" fill="currentColor" opacity="0.8" />
      <rect x="20" y="30" width="16" height="20" rx="2" fill="currentColor" />
      <rect x="284" y="30" width="16" height="20" rx="2" fill="currentColor" />
    </svg>
  );
}

function Avatar({ initials, variant, uid }: { initials: string; variant: number; uid: string }) {
  const angle = [-20, 18, -45, 40][variant % 4] ?? 0;
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="size-24 shrink-0">
      <defs>
        <clipPath id={`${uid}-av-${variant}`}>
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>
      <circle cx="60" cy="60" r="58" fill="#262626" />
      <g clipPath={`url(#${uid}-av-${variant})`}>
        <rect
          x="-20"
          y="46"
          width="160"
          height="22"
          fill={LIME}
          transform={`rotate(${angle} 60 60)`}
        />
        <path d="M20 120 C20 88 40 78 60 78 C80 78 100 88 100 120 Z" fill="#3a3a3a" />
        <circle cx="60" cy="48" r="20" fill="#4a4a4a" />
      </g>
      <circle cx="60" cy="60" r="58" fill="none" stroke={LIME} strokeWidth="2" />
      <text
        x="60"
        y="68"
        textAnchor="middle"
        fontSize="30"
        fontWeight="700"
        fill="#f5f5f5"
        stroke="#0d0d0d"
        strokeWidth="5"
        paintOrder="stroke"
        style={{ fontFamily: "var(--demo-font-heading)" }}
      >
        {initials}
      </text>
    </svg>
  );
}

function IntensityBadge({ level }: { level: Intensity }) {
  const filled = INTENSITIES.indexOf(level) + 1;
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#f5f5f5]">
      <span aria-hidden="true" className="flex items-end gap-0.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={cn("w-1.5 rounded-sm", n <= filled ? "bg-[#d4ff00]" : "bg-[#4d4d4d]")}
            style={{ height: `${6 + n * 4}px` }}
          />
        ))}
      </span>
      {level}
    </span>
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
    <div className="mb-8 max-w-2xl @3xl:mb-10">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4ff00]">{eyebrow}</p>
      <h3
        id={id}
        className={cn(
          display,
          "mt-2 text-4xl font-normal uppercase leading-none tracking-wide text-[#f5f5f5] @3xl:text-6xl",
        )}
      >
        {title}
      </h3>
      {intro ? <p className="mt-4 text-[#b8b8b8]">{intro}</p> : null}
    </div>
  );
}

export function FitnessStudioDemo({ design }: DemoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const timetableRef = useRef<HTMLElement>(null);
  const trainersRef = useRef<HTMLElement>(null);
  const plansRef = useRef<HTMLElement>(null);
  const trialRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);

  const [dayFilter, setDayFilter] = useState<DayFilter>("All");
  const [intensityFilter, setIntensityFilter] = useState<IntensityFilter>("All");
  const [booked, setBooked] = useState<string[]>([]);

  const [term, setTerm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [prefDay, setPrefDay] = useState("");
  const [goal, setGoal] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const visible = classes.filter(
    (c) =>
      (dayFilter === "All" || c.day === dayFilter) &&
      (intensityFilter === "All" || c.intensity === intensityFilter),
  );
  const filtersActive = dayFilter !== "All" || intensityFilter !== "All";
  const bookedClasses = booked
    .map((id) => classes.find((c) => c.id === id))
    .filter((c): c is ClassItem => c !== undefined);
  const bookedMinutes = bookedClasses.reduce((sum, c) => sum + c.minutes, 0);

  const go = (ref: RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ block: "nearest" });
  const nav = [
    { label: "Timetable", ref: timetableRef },
    { label: "Trainers", ref: trainersRef },
    { label: "Memberships", ref: plansRef },
    { label: "Free trial", ref: trialRef },
    { label: "Reviews", ref: reviewsRef },
  ] as const;

  const toggleBooking = (id: string) =>
    setBooked((cur) => (cur.includes(id) ? cur.filter((b) => b !== id) : [...cur, id]));

  const clearFilters = () => {
    setDayFilter("All");
    setIntensityFilter("All");
  };

  const price = (weekly: number) => {
    if (!term) return { perWeek: weekly, note: "Billed weekly. Cancel with 14 days' notice." };
    const total = Math.round(weekly * TERM_WEEKS * (1 - TERM_DISCOUNT));
    return {
      perWeek: Math.round((total / TERM_WEEKS) * 100) / 100,
      note: `$${total} billed once for ${TERM_WEEKS} weeks.`,
    };
  };

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    const digits = phone.replace(/\D/g, "");
    if (!name.trim()) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      next.email = "Enter an email address, like name@example.com.";
    if (digits.length < 8 || digits.length > 11)
      next.phone = "Enter a phone number we can text, 8 to 11 digits.";
    if (!prefDay) next.day = "Choose the day you'd like to try a class.";
    if (!goal) next.goal = "Choose the goal closest to yours.";
    setErrors(next);
    const order: Field[] = ["name", "email", "phone", "day", "goal"];
    const first = order.find((f) => next[f] !== undefined);
    if (first) {
      const target = document.getElementById(
        first === "goal" ? `${uid}-goal-0` : `${uid}-${first}`,
      );
      target?.focus();
      return;
    }
    setSent(true);
  }

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setPrefDay("");
    setGoal("");
    setErrors({});
    setSent(false);
  }

  const pill = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-wider motion-safe:transition-colors",
      ring,
      active
        ? "border-[#d4ff00] bg-[#d4ff00] text-black"
        : "border-[#707070] text-[#f5f5f5] hover:border-[#d4ff00] hover:text-[#d4ff00]",
    );
  const input = cn(
    "mt-1.5 w-full rounded-md border border-[#707070] bg-[#0d0d0d] px-3 py-2.5 text-[#f5f5f5] [color-scheme:dark] placeholder:text-[#8f8f8f]",
    ring,
  );
  const labelCls = "text-xs font-bold uppercase tracking-[0.2em] text-[#d4ff00]";
  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`${uid}-${field}-err`} className="mt-1.5 text-sm text-[#ff9b92]">
        {errors[field]}
      </p>
    ) : null;
  const describedBy = (field: Field) => (errors[field] ? `${uid}-${field}-err` : undefined);
  const limeButton = cn(
    "inline-flex items-center justify-center gap-2 rounded-md bg-[#d4ff00] px-6 py-3 text-sm font-bold uppercase tracking-wider text-black hover:bg-[#e6ff66] motion-safe:transition-colors",
    ring,
  );
  const ghostButton = cn(
    "inline-flex items-center justify-center gap-2 rounded-md border border-[#d4ff00] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#d4ff00] hover:bg-[#d4ff00]/10",
    ring,
  );

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.sansCondensed, heading: demoFonts.display }}
      className="bg-[#0d0d0d] text-[#f5f5f5]"
    >
      <header className="border-b border-[#2a2a2a] bg-[#0d0d0d]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <p
            className={cn(
              display,
              "flex items-center gap-2 text-xl uppercase tracking-wider text-[#f5f5f5] @xl:text-2xl",
            )}
          >
            <Dumbbell aria-hidden="true" className="size-6 text-[#d4ff00]" />
            {design.businessName}
          </p>
          <nav aria-label="Demo site sections" className="hidden items-center gap-1 @3xl:flex">
            {nav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.ref)}
                className={cn(
                  "rounded px-3 py-2 text-sm font-bold uppercase tracking-wider text-[#d0d0d0] hover:text-[#d4ff00]",
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
              "hidden items-center gap-2 text-sm font-bold text-[#d4ff00] @xl:inline-flex",
              ring,
            )}
          >
            <Phone aria-hidden="true" className="size-4" /> {PHONE}
          </a>
        </div>
        <nav
          aria-label="Demo site sections, compact"
          className="border-t border-[#2a2a2a] @3xl:hidden"
        >
          <ul className="flex flex-wrap gap-1 px-3 py-1.5">
            {nav.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => go(item.ref)}
                  className={cn(
                    "whitespace-nowrap rounded px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#d0d0d0]",
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
      <section
        aria-labelledby={`${uid}-hero`}
        className="relative overflow-hidden border-b border-[#2a2a2a]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_10%,rgba(212,255,0,0.16),transparent_55%),linear-gradient(160deg,#141414,#0d0d0d_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 top-0 h-full w-40 skew-x-[-18deg] bg-[#d4ff00]/10"
        />
        <div
          aria-hidden="true"
          className="absolute -right-4 top-0 h-full w-10 skew-x-[-18deg] bg-[#d4ff00]/20"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 @3xl:grid-cols-[1.4fr_1fr] @3xl:py-24">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[#d4ff00]">
              <Flame aria-hidden="true" className="size-4" /> Ironbark Point · Open 5:45 am
            </p>
            <h2
              id={`${uid}-hero`}
              className={cn(
                display,
                "mt-4 text-5xl font-normal uppercase leading-[0.95] tracking-wide @xl:text-7xl @5xl:text-8xl",
              )}
            >
              Forge a <span className="text-[#d4ff00]">stronger</span> week.
            </h2>
            <p className="mt-6 max-w-xl text-lg text-[#d0d0d0]">
              Small-group classes, honest coaching and a timetable you can filter to fit your day.
              Try us free for seven days.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => go(trialRef)} className={limeButton}>
                Claim free trial pass
              </button>
              <button type="button" onClick={() => go(timetableRef)} className={ghostButton}>
                See the timetable
              </button>
            </div>
          </div>
          <div aria-hidden="true" className="relative hidden @3xl:block">
            <Kettlebell className="mx-auto w-56 text-[#d4ff00] @5xl:w-64" />
            <Barbell className="mx-auto mt-6 w-full max-w-xs text-[#f5f5f5]" />
          </div>
        </div>
        <dl className="relative mx-auto grid max-w-6xl grid-cols-2 gap-px border-t border-[#2a2a2a] bg-[#2a2a2a] @3xl:grid-cols-4">
          {[
            [String(classes.length), "Classes a week"],
            [String(trainers.length), "Specialist coaches"],
            ["12", "People max per class"],
            ["7 days", "Free trial pass"],
          ].map(([v, l]) => (
            <div key={l} className="bg-[#0d0d0d] px-5 py-5">
              <dd className={cn(display, "text-3xl text-[#d4ff00] @xl:text-4xl")}>{v}</dd>
              <dt className="mt-1 text-xs font-bold uppercase tracking-wider text-[#b8b8b8]">
                {l}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Timetable */}
      <section
        ref={timetableRef}
        aria-labelledby={`${uid}-timetable`}
        className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-timetable`}
          eyebrow="Weekly timetable"
          title="Find your class"
          intro="Filter by day and intensity, then tap Book to hold a spot. Bookings are kept on this page only."
        />
        <div className="grid gap-6 @5xl:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <div className="space-y-4 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4 @xl:p-5">
              <div role="group" aria-labelledby={`${uid}-day-label`}>
                <p id={`${uid}-day-label`} className={labelCls}>
                  Day
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["All", ...DAYS] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={dayFilter === d}
                      onClick={() => setDayFilter(d)}
                      className={pill(dayFilter === d)}
                    >
                      {d === "All" ? "All days" : d}
                    </button>
                  ))}
                </div>
              </div>
              <div role="group" aria-labelledby={`${uid}-int-label`}>
                <p id={`${uid}-int-label`} className={labelCls}>
                  Intensity
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["All", ...INTENSITIES] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      aria-pressed={intensityFilter === lvl}
                      onClick={() => setIntensityFilter(lvl)}
                      className={pill(intensityFilter === lvl)}
                    >
                      {lvl === "All" ? "Any intensity" : lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p
                role="status"
                aria-live="polite"
                className="text-sm font-bold uppercase tracking-wider text-[#f5f5f5]"
              >
                Showing {visible.length} of {classes.length} classes
              </p>
              {filtersActive ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={cn(
                    "rounded text-sm text-[#d4ff00] underline underline-offset-4",
                    ring,
                  )}
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            {visible.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-[#707070] p-8 text-center">
                <p className={cn(display, "text-2xl uppercase tracking-wide")}>No classes match</p>
                <p className="mx-auto mt-2 max-w-sm text-[#b8b8b8]">
                  There are no{" "}
                  {intensityFilter === "All" ? "" : `${intensityFilter.toLowerCase()}-intensity `}
                  classes{dayFilter === "All" ? "" : ` on ${dayName(dayFilter)}`}. Try another day
                  or intensity.
                </p>
                <button type="button" onClick={clearFilters} className={cn(limeButton, "mt-5")}>
                  Show all classes
                </button>
              </div>
            ) : (
              <>
                <div
                  aria-hidden="true"
                  className="mt-4 hidden grid-cols-[6.5rem_1fr_5rem_7rem_6.5rem_6.5rem] gap-4 px-4 pb-2 text-xs font-bold uppercase tracking-wider text-[#b8b8b8] @3xl:grid"
                >
                  <span>Time</span>
                  <span>Class</span>
                  <span>Length</span>
                  <span>Spots</span>
                  <span>Intensity</span>
                  <span />
                </div>
                <ul className="mt-4 space-y-3 @3xl:mt-0">
                  {visible.map((c) => {
                    const isBooked = booked.includes(c.id);
                    const left = Math.max(0, c.spots - (isBooked ? 1 : 0));
                    const full = c.spots === 0;
                    return (
                      <li
                        key={c.id}
                        className={cn(
                          "grid grid-cols-2 items-center gap-x-4 gap-y-3 rounded-lg border bg-[#1a1a1a] p-4 @3xl:grid-cols-[6.5rem_1fr_5rem_7rem_6.5rem_6.5rem] @3xl:gap-y-0",
                          isBooked ? "border-[#d4ff00]" : "border-[#2a2a2a]",
                        )}
                      >
                        <p className="text-sm">
                          <span className="block text-xs font-bold uppercase tracking-wider text-[#d4ff00]">
                            {c.day}
                          </span>
                          <span className="font-bold">{c.time}</span>
                        </p>
                        <div className="col-start-2 row-start-1 justify-self-end @3xl:hidden">
                          <IntensityBadge level={c.intensity} />
                        </div>
                        <div className="col-span-2 @3xl:col-span-1">
                          <p
                            className={cn(display, "text-xl uppercase leading-tight tracking-wide")}
                          >
                            {c.name}
                          </p>
                          <p className="text-sm text-[#b8b8b8]">with {c.trainer}</p>
                        </div>
                        <p className="flex items-center gap-1.5 text-sm text-[#d0d0d0]">
                          <Clock aria-hidden="true" className="size-3.5 text-[#d4ff00]" />
                          {c.minutes} min
                        </p>
                        <p
                          className={cn(
                            "text-sm font-bold @3xl:font-normal",
                            full
                              ? "text-[#ff9b92]"
                              : left <= 3
                                ? "text-[#d4ff00]"
                                : "text-[#d0d0d0]",
                          )}
                        >
                          {full
                            ? "Class full"
                            : left === 0
                              ? "You have the last spot"
                              : `${left} spot${left === 1 ? "" : "s"} left`}
                        </p>
                        <div className="hidden @3xl:block">
                          <IntensityBadge level={c.intensity} />
                        </div>
                        <button
                          type="button"
                          aria-pressed={full ? undefined : isBooked}
                          disabled={full}
                          onClick={() => toggleBooking(c.id)}
                          className={cn(
                            "col-span-2 inline-flex items-center justify-center gap-1.5 rounded-md border px-4 py-2 text-sm font-bold uppercase tracking-wider @3xl:col-span-1",
                            ring,
                            full
                              ? "cursor-not-allowed border-[#4d4d4d] text-[#8f8f8f]"
                              : isBooked
                                ? "border-[#d4ff00] bg-[#d4ff00] text-black"
                                : "border-[#d4ff00] text-[#d4ff00] hover:bg-[#d4ff00]/10",
                          )}
                        >
                          {isBooked ? <Check aria-hidden="true" className="size-4" /> : null}
                          {full ? "Full" : isBooked ? "Booked" : "Book"}
                          <span className="sr-only">
                            {" "}
                            {c.name}, {dayName(c.day)} {c.time}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>

          <aside
            aria-labelledby={`${uid}-mine`}
            className="h-fit rounded-lg border border-[#d4ff00]/60 bg-[#1a1a1a] p-5 @5xl:order-last"
          >
            <h4
              id={`${uid}-mine`}
              className={cn(
                display,
                "flex items-center gap-2 text-2xl font-normal uppercase tracking-wide",
              )}
            >
              <CalendarCheck aria-hidden="true" className="size-5 text-[#d4ff00]" /> My bookings
            </h4>
            <div aria-live="polite">
              <p className="mt-2 text-sm text-[#b8b8b8]">
                {bookedClasses.length === 0
                  ? "Nothing booked yet. Choose a class to hold your spot."
                  : `${bookedClasses.length} class${bookedClasses.length === 1 ? "" : "es"} · ${bookedMinutes} minutes of training`}
              </p>
              {bookedClasses.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {bookedClasses.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-start justify-between gap-2 rounded-md bg-[#0d0d0d] px-3 py-2 text-sm"
                    >
                      <span>
                        <span className="block font-bold">{c.name}</span>
                        <span className="text-[#b8b8b8]">
                          {c.day} {c.time} · {c.trainer}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleBooking(c.id)}
                        aria-label={`Cancel booking: ${c.name}, ${dayName(c.day)} ${c.time}`}
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded text-[#d0d0d0] hover:text-[#d4ff00]",
                          ring,
                        )}
                      >
                        <X aria-hidden="true" className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {bookedClasses.length > 0 ? (
              <button
                type="button"
                onClick={() => setBooked([])}
                className={cn(
                  "mt-4 rounded text-sm text-[#d4ff00] underline underline-offset-4",
                  ring,
                )}
              >
                Clear all bookings
              </button>
            ) : null}
            <p className="mt-4 border-t border-[#2a2a2a] pt-3 text-xs text-[#b8b8b8]">
              Demonstration only. No booking is made and nothing is saved.
            </p>
          </aside>
        </div>
      </section>

      {/* Trainers */}
      <section
        ref={trainersRef}
        aria-labelledby={`${uid}-trainers`}
        className="border-y border-[#2a2a2a] bg-[#141414]"
      >
        <div className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20">
          <SectionTitle
            id={`${uid}-trainers`}
            eyebrow="The coaches"
            title="Train with specialists"
            intro="Every class is led by a coach who lives the discipline they teach."
          />
          <ul className="grid gap-5 @xl:grid-cols-2 @5xl:grid-cols-4">
            {trainers.map((t, i) => (
              <li
                key={t.name}
                className="flex flex-col rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-5"
              >
                <Avatar initials={t.initials} variant={i} uid={uid} />
                <h4 className={cn(display, "mt-4 text-2xl font-normal uppercase tracking-wide")}>
                  {t.name}
                </h4>
                <p className="text-sm font-bold uppercase tracking-wider text-[#d4ff00]">
                  {t.role}
                </p>
                <p className="mt-3 flex-1 text-sm text-[#d0d0d0]">{t.bio}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`${t.name}, specialities`}>
                  {t.specialities.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-[#707070] px-2.5 py-0.5 text-xs text-[#f5f5f5]"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-[#b8b8b8]">
                  <span className="rounded border border-[#4d4d4d] px-2 py-0.5">
                    Sample profile
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Memberships */}
      <section
        ref={plansRef}
        aria-labelledby={`${uid}-plans`}
        className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-plans`}
          eyebrow="Memberships"
          title="Pick your pace"
          intro="No joining fee. Switch tiers any time, and your first seven days are free."
        />
        <div role="group" aria-labelledby={`${uid}-billing`} className="mb-8">
          <p id={`${uid}-billing`} className={labelCls}>
            Billing
          </p>
          <div className="mt-2 inline-flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={!term}
              onClick={() => setTerm(false)}
              className={pill(!term)}
            >
              Pay weekly
            </button>
            <button
              type="button"
              aria-pressed={term}
              onClick={() => setTerm(true)}
              className={pill(term)}
            >
              {TERM_WEEKS}-week term · save {Math.round(TERM_DISCOUNT * 100)}%
            </button>
          </div>
          <p role="status" aria-live="polite" className="mt-3 text-sm text-[#b8b8b8]">
            {term
              ? `Showing ${TERM_WEEKS}-week term prices, paid upfront.`
              : "Showing weekly prices, paid week by week."}
          </p>
        </div>
        <ul className="grid gap-5 @3xl:grid-cols-3">
          {tiers.map((t) => {
            const p = price(t.weekly);
            return (
              <li
                key={t.id}
                className={cn(
                  "relative flex flex-col rounded-lg border bg-[#1a1a1a] p-6",
                  t.popular ? "border-[#d4ff00]" : "border-[#2a2a2a]",
                )}
              >
                {t.popular ? (
                  <p className="absolute -top-3 left-6 rounded-full bg-[#d4ff00] px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-black">
                    Most popular
                  </p>
                ) : null}
                <h4 className={cn(display, "text-3xl font-normal uppercase tracking-wide")}>
                  {t.name}
                </h4>
                <p className="mt-1 text-sm text-[#b8b8b8]">{t.blurb}</p>
                <p className="mt-5 flex items-baseline gap-1">
                  <span className={cn(display, "text-5xl text-[#d4ff00]")}>
                    ${Number.isInteger(p.perWeek) ? p.perWeek : p.perWeek.toFixed(2)}
                  </span>
                  <span className="text-sm text-[#d0d0d0]">AUD / week</span>
                </p>
                <p className="mt-1 text-sm text-[#b8b8b8]">{p.note}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {t.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#d4ff00]" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(trialRef)}
                  className={cn(t.popular ? limeButton : ghostButton, "mt-6 w-full")}
                >
                  Try {t.name} free
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Trial pass */}
      <section
        ref={trialRef}
        aria-labelledby={`${uid}-trial`}
        className="border-y border-[#2a2a2a] bg-[#141414]"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 @3xl:grid-cols-[1fr_1.2fr] @3xl:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4ff00]">
              Free trial pass
            </p>
            <h3
              id={`${uid}-trial`}
              className={cn(
                display,
                "mt-2 text-4xl font-normal uppercase leading-none tracking-wide @3xl:text-6xl",
              )}
            >
              Seven days. <span className="text-[#d4ff00]">On us.</span>
            </h3>
            <p className="mt-5 text-[#d0d0d0]">
              Try any class and the open gym for seven days. A coach will message you to confirm
              your first session.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Users aria-hidden="true" className="size-5 text-[#d4ff00]" /> Classes capped at 12
                people
              </li>
              <li className="flex items-center gap-3">
                <Dumbbell aria-hidden="true" className="size-5 text-[#d4ff00]" /> Free induction
                with a coach
              </li>
              <li className="flex items-center gap-3">
                <Check aria-hidden="true" className="size-5 text-[#d4ff00]" /> No card and no
                obligation
              </li>
            </ul>
          </div>
          {sent ? (
            <DemoSent
              title="Trial pass request received"
              onReset={reset}
              className="h-fit border border-[#d4ff00]/60 bg-[#1a1a1a] text-[#f5f5f5]"
            />
          ) : (
            <form
              noValidate
              onSubmit={submit}
              aria-label="Free trial pass request"
              className="grid gap-5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-5 @xl:grid-cols-2 @xl:p-8"
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
                  Mobile
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
                <label htmlFor={`${uid}-day`} className={labelCls}>
                  Preferred class day
                </label>
                <select
                  id={`${uid}-day`}
                  value={prefDay}
                  onChange={(e) => setPrefDay(e.target.value)}
                  aria-invalid={Boolean(errors.day)}
                  aria-describedby={describedBy("day")}
                  className={input}
                >
                  <option value="">Choose a day</option>
                  {DAY_NAMES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  <option value="Any">Any day</option>
                </select>
                {errorText("day")}
              </div>
              <fieldset className="@xl:col-span-2" aria-describedby={describedBy("goal")}>
                <legend className={labelCls}>Your main goal</legend>
                <div className="mt-2 grid gap-2 @xl:grid-cols-2">
                  {goals.map((g, i) => (
                    <label
                      key={g.value}
                      htmlFor={`${uid}-goal-${i}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#d4ff00]",
                        goal === g.value ? "border-[#d4ff00] bg-[#d4ff00]/10" : "border-[#707070]",
                      )}
                    >
                      <input
                        id={`${uid}-goal-${i}`}
                        type="radio"
                        name={`${uid}-goal`}
                        value={g.value}
                        checked={goal === g.value}
                        onChange={() => setGoal(g.value)}
                        aria-invalid={Boolean(errors.goal)}
                        className="size-4 accent-[#d4ff00]"
                      />
                      {g.label}
                    </label>
                  ))}
                </div>
                {errorText("goal")}
              </fieldset>
              <div className="@xl:col-span-2">
                <button type="submit" className={cn(limeButton, "w-full @xl:w-auto")}>
                  Request my free pass
                </button>
                <p className="mt-3 text-xs text-[#b8b8b8]">
                  Demonstration form. Nothing is sent or stored.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section
        ref={reviewsRef}
        aria-labelledby={`${uid}-reviews`}
        className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20"
      >
        <SectionTitle id={`${uid}-reviews`} eyebrow="Reviews" title="Straight from the floor" />
        <ul className="grid gap-5 @3xl:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.name}>
              <figure className="flex h-full flex-col rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-6">
                <p className="flex gap-0.5 text-[#d4ff00]">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} aria-hidden="true" className="size-4 fill-current" />
                  ))}
                  <span className="sr-only">5 out of 5 stars</span>
                </p>
                <blockquote className="mt-4 flex-1 text-[#f5f5f5]">“{r.text}”</blockquote>
                <figcaption className="mt-5">
                  <span className="block font-bold">{r.name}</span>
                  <span className="block text-sm text-[#b8b8b8]">{r.detail}</span>
                  <span className="mt-2 inline-block rounded border border-[#4d4d4d] px-2 py-0.5 text-xs text-[#b8b8b8]">
                    Sample review
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-[#2a2a2a] bg-[#080808]">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm text-[#b8b8b8] @3xl:grid-cols-3">
          <div>
            <p className={cn(display, "text-xl uppercase tracking-wider text-[#f5f5f5]")}>
              {design.businessName}
            </p>
            <p className="mt-2">Small-group classes and personal training.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4ff00]">Hours</p>
            <p className="mt-2">Mon–Fri 5:45 am – 8:30 pm</p>
            <p>Sat 7:00 am – 1 pm · Sun 7:30 am – 12 pm</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4ff00]">Find us</p>
            <p className="mt-2 flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#d4ff00]" />{" "}
              {ADDRESS}
            </p>
            <p className="mt-1 flex items-center gap-2">
              <Phone aria-hidden="true" className="size-4 shrink-0 text-[#d4ff00]" />
              <a href={PHONE_HREF} className={cn("rounded underline underline-offset-4", ring)}>
                {PHONE}
              </a>
            </p>
            <p className="mt-1 flex items-center gap-2">
              <Mail aria-hidden="true" className="size-4 shrink-0 text-[#d4ff00]" /> {EMAIL}
            </p>
          </div>
        </div>
      </footer>
      <DemoDisclaimer design={design} className="bg-[#080808] text-[#f5f5f5]" />
    </DemoRoot>
  );
}
