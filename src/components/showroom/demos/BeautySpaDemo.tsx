import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flower2,
  Gift,
  Hand,
  Mail,
  MapPin,
  Phone,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

const PHONE = "(02) 5550 0168";
const PHONE_HREF = "tel:+61255500168";
const EMAIL = "hello@maisonbloom.example";
const ADDRESS = "7 Camellia Arcade, Rosewyn Park NSW";

const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e4a45]";
const display = "font-[family-name:var(--demo-font-heading)]";

const categories = [
  {
    id: "face",
    label: "Face",
    icon: Sparkles,
    blurb: "Facials and skin treatments with clean, results-led products.",
  },
  {
    id: "body",
    label: "Body",
    icon: Flower2,
    blurb: "Massage, scrubs and wraps for a long, slow exhale.",
  },
  {
    id: "nails",
    label: "Nails",
    icon: Hand,
    blurb: "Manicures and pedicures in a quiet, light-filled studio.",
  },
  {
    id: "hair",
    label: "Hair",
    icon: Scissors,
    blurb: "Cuts, colour and blow-dries from our senior stylists.",
  },
] as const;

const treatments = [
  {
    id: "facial",
    cat: "face",
    name: "Bloom Signature Facial",
    detail: "Double cleanse, enzyme peel, lymphatic massage and a hydrating mask.",
    mins: 60,
    price: 145,
  },
  {
    id: "glow",
    cat: "face",
    name: "Express Glow",
    detail: "A thirty-minute lift before an event or after a long week.",
    mins: 30,
    price: 75,
  },
  {
    id: "brow",
    cat: "face",
    name: "Brow & Lash Edit",
    detail: "Brow shape and tint with a nourishing lash lift.",
    mins: 45,
    price: 95,
  },
  {
    id: "massage",
    cat: "body",
    name: "Rose Quartz Massage",
    detail: "Full-body relaxation massage with warm botanical oils.",
    mins: 60,
    price: 140,
  },
  {
    id: "deep",
    cat: "body",
    name: "Deep Tissue Massage",
    detail: "Focused pressure for shoulders, back and legs.",
    mins: 75,
    price: 165,
  },
  {
    id: "wrap",
    cat: "body",
    name: "Salt Scrub & Body Wrap",
    detail: "Exfoliation, a warm cocoon wrap and a scalp massage.",
    mins: 90,
    price: 190,
  },
  {
    id: "mani",
    cat: "nails",
    name: "Gel Manicure",
    detail: "Shape, cuticle care and long-wear gel colour.",
    mins: 45,
    price: 65,
  },
  {
    id: "pedi",
    cat: "nails",
    name: "Spa Pedicure",
    detail: "Warm soak, sugar scrub, foot massage and polish.",
    mins: 60,
    price: 85,
  },
  {
    id: "art",
    cat: "nails",
    name: "Hand-painted Nail Art",
    detail: "Fine detail on up to ten nails, added to any manicure.",
    mins: 20,
    price: 25,
  },
  {
    id: "cut",
    cat: "hair",
    name: "Cut & Blow-dry",
    detail: "Consultation, wash, precision cut and finish.",
    mins: 60,
    price: 110,
  },
  {
    id: "balayage",
    cat: "hair",
    name: "Soft Balayage",
    detail: "Hand-painted colour with a gloss and blow-dry.",
    mins: 150,
    price: 280,
  },
  {
    id: "blowdry",
    cat: "hair",
    name: "Signature Blow-dry",
    detail: "Wash and a smooth, voluminous finish.",
    mins: 45,
    price: 65,
  },
] as const;

const packages = [
  {
    id: "ritual",
    name: "Glow Ritual",
    price: 195,
    mins: 90,
    featured: false,
    items: ["Bloom Signature Facial", "Brow shape and tint", "Herbal tea in the garden lounge"],
  },
  {
    id: "bloomday",
    name: "The Bloom Day",
    price: 345,
    mins: 210,
    featured: true,
    items: [
      "Rose Quartz Massage",
      "Bloom Signature Facial",
      "Spa Pedicure",
      "Light lunch and sparkling",
    ],
  },
  {
    id: "bridal",
    name: "Bridal Edit",
    price: 420,
    mins: 180,
    featured: false,
    items: ["Trial hair and make-up", "Express Glow facial", "Gel Manicure", "Day-of touch-up kit"],
  },
] as const;

const groups = [
  ...categories.map((c) => ({ id: c.id, label: c.label })),
  { id: "packages", label: "Packages" },
] as const;

const bookable = [
  ...treatments.map((t) => ({
    id: t.id,
    group: t.cat as string,
    name: t.name,
    mins: t.mins,
    price: t.price,
  })),
  ...packages.map((p) => ({
    id: p.id,
    group: "packages",
    name: p.name,
    mins: p.mins,
    price: p.price,
  })),
];

const days = [
  { id: "tue", short: "Tue", long: "Tuesday", open: 540, close: 1080 },
  { id: "wed", short: "Wed", long: "Wednesday", open: 540, close: 1080 },
  { id: "thu", short: "Thu", long: "Thursday", open: 540, close: 1200 },
  { id: "fri", short: "Fri", long: "Friday", open: 540, close: 1080 },
  { id: "sat", short: "Sat", long: "Saturday", open: 510, close: 1020 },
  { id: "sun", short: "Sun", long: "Sunday", open: 600, close: 960 },
] as const;

const steps = ["Treatment", "Day & time", "Your details", "Confirm"] as const;
const vouchers = [50, 100, 150, 250] as const;

const reviews = [
  {
    name: "Olivia M.",
    text: "The Signature Facial is the most relaxed I've felt all year, and my skin looked rested for a week.",
  },
  {
    name: "Grace L.",
    text: "I booked a Bloom Day for Mum's birthday. The team made her feel so looked after, she's already planning the next one.",
  },
  {
    name: "Hannah P.",
    text: "Finally a balayage that grows out softly. Calm room, lovely people and worth every minute in the chair.",
  },
] as const;

type Field = "treatment" | "day" | "time" | "name" | "phone" | "email";
type Errors = Partial<Record<Field, string>>;

function formatTime(total: number) {
  const h24 = Math.floor(total / 60);
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(total % 60).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
}

function formatMins(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} hr${m ? ` ${m} min` : ""}` : `${m} min`;
}

// A fixed pattern of "taken" appointments so the book looks lived-in without a server.
function isTaken(dayId: string, start: number) {
  let n = start / 30;
  for (const ch of dayId) n += ch.charCodeAt(0);
  return n % 4 === 0;
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
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8e4a45]">{eyebrow}</p>
      <h3 id={id} className="mt-3 text-3xl font-normal leading-tight text-[#4a3b38] @3xl:text-4xl">
        {title}
      </h3>
      <span aria-hidden="true" className="mx-auto mt-4 block h-px w-16 bg-[#c98b86]" />
      {intro ? <p className="mt-4 text-[#6b5450]">{intro}</p> : null}
    </div>
  );
}

function BloomArch({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 240 320" aria-hidden="true" className="h-full w-full">
      <defs>
        <linearGradient id={`${uid}-arch`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dfd9" />
          <stop offset="1" stopColor="#e6bfb7" />
        </linearGradient>
        <radialGradient id={`${uid}-petal`} cx="0.5" cy="0.85" r="0.9">
          <stop offset="0" stopColor="#b9706a" />
          <stop offset="1" stopColor="#f5d6d0" />
        </radialGradient>
      </defs>
      <path d="M20 320 V130 A100 100 0 0 1 220 130 V320 Z" fill={`url(#${uid}-arch)`} />
      <path
        d="M34 320 V134 A86 86 0 0 1 206 134 V320"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.8"
      />
      <path d="M120 304 C 116 256 126 214 120 168" stroke="#7b8a68" strokeWidth="3" fill="none" />
      <path d="M120 246 C 90 236 76 210 78 192 C 100 198 118 220 120 246 Z" fill="#9aa886" />
      <path d="M121 222 C 152 216 166 190 163 174 C 142 182 126 202 121 222 Z" fill="#87976f" />
      <g transform="translate(120 140)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="-28"
            rx="19"
            ry="32"
            transform={`rotate(${a})`}
            fill={`url(#${uid}-petal)`}
            opacity="0.9"
          />
        ))}
        {[22, 67, 112, 157, 202, 247, 292, 337].map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="-17"
            rx="12"
            ry="20"
            transform={`rotate(${a})`}
            fill="#ebbab3"
          />
        ))}
        <circle r="10" fill="#c98b86" />
      </g>
      <g fill="#c98b86" opacity="0.6">
        <circle cx="54" cy="96" r="3" />
        <circle cx="190" cy="80" r="2" />
        <circle cx="200" cy="230" r="3" />
      </g>
    </svg>
  );
}

export function BeautySpaDemo({ design }: DemoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const treatmentsRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const bookingRef = useRef<HTMLElement>(null);
  const visitRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const stepMoved = useRef(false);

  const [tab, setTab] = useState(0);
  const [voucher, setVoucher] = useState<number>(100);
  const [step, setStep] = useState(0);
  const [group, setGroup] = useState<string>("face");
  const [choiceId, setChoiceId] = useState("");
  const [dayId, setDayId] = useState("");
  const [time, setTime] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [firstVisit, setFirstVisit] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const activeCat = categories[tab] ?? categories[0];
  const choice = bookable.find((b) => b.id === choiceId);
  const day = days.find((d) => d.id === dayId);
  const slots: number[] = [];
  if (day && choice) {
    for (let t = day.open; t + choice.mins <= day.close; t += 30) slots.push(t);
  }

  useEffect(() => {
    if (stepMoved.current) stepHeadingRef.current?.focus();
  }, [step]);

  const go = (ref: RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ block: "nearest" });

  const nav = [
    { label: "Treatments", ref: treatmentsRef },
    { label: "Pricing", ref: pricingRef },
    { label: "Booking", ref: bookingRef },
    { label: "Visit us", ref: visitRef },
  ] as const;

  function moveTo(next: number) {
    stepMoved.current = true;
    setStep(next);
  }

  function startBooking(id: string, groupId: string) {
    setChoiceId(id);
    setGroup(groupId);
    setTime(null);
    setErrors({});
    setSent(false);
    stepMoved.current = false;
    setStep(0);
    go(bookingRef);
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    const last = categories.length - 1;
    const keys: Record<string, number> = {
      ArrowRight: tab === last ? 0 : tab + 1,
      ArrowLeft: tab === 0 ? last : tab - 1,
      Home: 0,
      End: last,
    };
    const next = keys[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setTab(next);
    tabRefs.current[next]?.focus();
  }

  function validate(current: number): Errors {
    const next: Errors = {};
    if (current === 0 && !choice) next.treatment = "Choose a treatment to continue.";
    if (current === 1) {
      if (!day) next.day = "Choose a day.";
      else if (time === null) next.time = "Choose a time.";
    }
    if (current === 2) {
      if (!name.trim()) next.name = "Enter your name.";
      if (phone.replace(/\D/g, "").length < 8)
        next.phone = "Enter a mobile number so we can confirm.";
      if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim()))
        next.email = "Check the email address.";
    }
    return next;
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (step < steps.length - 1) moveTo(step + 1);
    else setSent(true);
  }

  function reset() {
    setChoiceId("");
    setGroup("face");
    setDayId("");
    setTime(null);
    setName("");
    setPhone("");
    setEmail("");
    setFirstVisit(false);
    setNotes("");
    setErrors({});
    stepMoved.current = false;
    setStep(0);
    setSent(false);
  }

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm motion-safe:transition-colors",
      ring,
      active
        ? "border-[#4a3b38] bg-[#4a3b38] text-[#faf6f1]"
        : "border-[#e2cfc8] bg-[#fffdfa] text-[#4a3b38] hover:border-[#8e4a45]",
    );
  const input = cn(
    "mt-1.5 w-full rounded-xl border border-[#e2cfc8] bg-[#fffdfa] px-4 py-2.5 text-[#4a3b38] placeholder:text-[#8f7a75]",
    ring,
  );
  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`${uid}-${field}-err`} className="mt-1.5 text-sm text-[#a3322a]">
        {errors[field]}
      </p>
    ) : null;
  const describedBy = (field: Field) => (errors[field] ? `${uid}-${field}-err` : undefined);
  const primary = cn(
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#8e4a45] px-6 py-3 font-semibold text-white hover:bg-[#7a3d39] motion-safe:transition-colors",
    ring,
  );
  const secondary = cn(
    "inline-flex items-center justify-center gap-2 rounded-full border border-[#8e4a45] px-6 py-3 font-semibold text-[#8e4a45] hover:bg-[#f3e6e1]",
    ring,
  );

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.sansGeometric, heading: demoFonts.serifBook }}
      className="bg-[#faf6f1] text-[#4a3b38]"
    >
      <header className="border-b border-[#eadbd5] bg-[#faf6f1]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f3e6e1] text-[#8e4a45]"
            >
              <Flower2 className="size-4" />
            </span>
            <p className={cn(display, "truncate text-base text-[#4a3b38] @xl:text-xl")}>
              {design.businessName}
            </p>
          </div>
          <nav aria-label="Demo site sections" className="hidden items-center gap-1 @3xl:flex">
            {nav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.ref)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm text-[#6b5450] hover:text-[#8e4a45]",
                  ring,
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => go(bookingRef)}
            className={cn(primary, "shrink-0 px-4 py-2 text-sm")}
          >
            Book
          </button>
        </div>
        <nav
          aria-label="Demo site sections, compact"
          className="border-t border-[#eadbd5] @3xl:hidden"
        >
          <ul className="flex flex-wrap justify-between gap-1 px-3 py-1.5">
            {nav.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => go(item.ref)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs text-[#6b5450]",
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
      <section aria-labelledby={`${uid}-hero`} className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(201,139,134,0.32),transparent_45%),radial-gradient(circle_at_5%_95%,rgba(234,205,186,0.7),transparent_50%),linear-gradient(180deg,#fbf7f2,#f5e9e3)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(rgba(142,74,69,0.09)_1px,transparent_1px)] bg-[size:18px_18px]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 @3xl:grid-cols-[1.25fr_1fr] @3xl:py-20">
          <div className="text-center @3xl:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8e4a45]">
              Day spa · Salon · Rosewyn Park
            </p>
            <h2
              id={`${uid}-hero`}
              className="mt-5 text-4xl font-normal leading-[1.1] text-[#4a3b38] @xl:text-5xl @5xl:text-6xl"
            >
              Slow beauty, <em className="text-[#8e4a45]">beautifully</em> done.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-[#6b5450] @3xl:mx-0">
              Facials, massage, nails and hair in a calm cream-and-blush house, with time set aside
              for you and nobody waiting at the door.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 @3xl:justify-start">
              <button type="button" onClick={() => go(bookingRef)} className={primary}>
                Book a treatment
              </button>
              <button type="button" onClick={() => go(treatmentsRef)} className={secondary}>
                View treatments
              </button>
            </div>
            <p className="mt-8 flex items-center justify-center gap-2 text-sm text-[#6b5450] @3xl:justify-start">
              <span className="flex" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-4 fill-[#c98b86] text-[#c98b86]" />
                ))}
              </span>
              Loved by regulars since 2016
            </p>
          </div>
          <div className="mx-auto w-52 @xl:w-64 @5xl:w-72">
            <BloomArch uid={uid} />
          </div>
        </div>
      </section>

      {/* Treatments */}
      <section
        ref={treatmentsRef}
        aria-labelledby={`${uid}-treatments`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-treatments`}
          eyebrow="Treatments"
          title="The treatment menu"
          intro="Choose a category to see what's on the menu. Every treatment begins with a short consultation."
        />
        <div
          role="tablist"
          aria-label="Treatment categories"
          className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-[#eadbd5] bg-[#f3e6e1] p-1"
        >
          {categories.map((c, i) => (
            <button
              key={c.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${uid}-tab-${c.id}`}
              role="tab"
              type="button"
              aria-selected={tab === i}
              aria-controls={`${uid}-panel-${c.id}`}
              tabIndex={tab === i ? 0 : -1}
              onClick={() => setTab(i)}
              onKeyDown={onTabKey}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm motion-safe:transition-colors @xl:px-5",
                ring,
                tab === i
                  ? "bg-[#fffdfa] font-semibold text-[#8e4a45] shadow-sm"
                  : "text-[#6b5450] hover:text-[#4a3b38]",
              )}
            >
              <c.icon aria-hidden="true" className="hidden size-4 @xl:block" />
              {c.label}
            </button>
          ))}
        </div>
        <div
          id={`${uid}-panel-${activeCat.id}`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${activeCat.id}`}
          tabIndex={0}
          className={cn("mt-8 rounded-3xl", ring)}
        >
          <p className="mb-6 text-center text-[#6b5450]">{activeCat.blurb}</p>
          <div className="grid gap-4 @3xl:grid-cols-3">
            {treatments
              .filter((t) => t.cat === activeCat.id)
              .map((t) => (
                <article
                  key={t.id}
                  className="flex flex-col rounded-3xl border border-[#eadbd5] bg-[#fffdfa] p-6 shadow-[0_10px_30px_-20px_rgba(74,59,56,0.35)]"
                >
                  <h4 className="text-xl font-normal text-[#4a3b38]">{t.name}</h4>
                  <p className="mt-2 flex-1 text-sm text-[#6b5450]">{t.detail}</p>
                  <div className="mt-5 flex items-end justify-between border-t border-[#f0e2dc] pt-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-[#6b5450]">
                      <Clock aria-hidden="true" className="size-4" />
                      {formatMins(t.mins)}
                    </span>
                    <span className={cn(display, "text-2xl text-[#8e4a45]")}>${t.price}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => startBooking(t.id, t.cat)}
                    className={cn(secondary, "mt-4 py-2 text-sm")}
                  >
                    Book this<span className="sr-only">: {t.name}</span>
                  </button>
                </article>
              ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingRef} aria-labelledby={`${uid}-pricing`} className="bg-[#f3e6e1]">
        <div className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20">
          <SectionTitle
            id={`${uid}-pricing`}
            eyebrow="Pricing"
            title="Rituals & packages"
            intro="Our most-booked combinations, priced together so the whole afternoon is taken care of."
          />
          <div className="grid gap-5 @3xl:grid-cols-3 @3xl:items-center">
            {packages.map((p) => (
              <article
                key={p.id}
                className={cn(
                  "relative flex flex-col rounded-3xl border p-7",
                  p.featured
                    ? "border-[#c98b86] bg-[linear-gradient(170deg,#fffdfa,#f2d6cf)] shadow-[0_20px_40px_-24px_rgba(142,74,69,0.6)] @3xl:py-10"
                    : "border-[#e2cfc8] bg-[#fffdfa]",
                )}
              >
                {p.featured ? (
                  <p className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#8e4a45] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                    Most loved
                  </p>
                ) : null}
                <h4 className="text-2xl font-normal text-[#4a3b38]">{p.name}</h4>
                <p className="mt-1 text-sm text-[#6b5450]">{formatMins(p.mins)}</p>
                <p className={cn(display, "mt-4 text-4xl text-[#8e4a45]")}>${p.price}</p>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                  {p.items.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#8e4a45]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => startBooking(p.id, "packages")}
                  className={cn(p.featured ? primary : secondary, "mt-6")}
                >
                  Book {p.name}
                </button>
              </article>
            ))}
          </div>

          <div className="mt-12 grid items-center gap-6 overflow-hidden rounded-3xl bg-[#4a3b38] p-6 text-[#faf6f1] @xl:p-8 @3xl:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#f2cfc9]">
                <Gift aria-hidden="true" className="size-4" /> Gift vouchers
              </p>
              <p className={cn(display, "mt-3 text-2xl @xl:text-3xl")}>
                Give someone an afternoon to themselves.
              </p>
              <p className="mt-2 text-sm text-[#eadbd5]">
                Valid for 12 months on any treatment. Buy in the salon or call us.
              </p>
              <div role="group" aria-label="Voucher value" className="mt-5 flex flex-wrap gap-2">
                {vouchers.map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={voucher === v}
                    onClick={() => setVoucher(v)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2cfc9]",
                      voucher === v
                        ? "border-[#f2cfc9] bg-[#f2cfc9] text-[#4a3b38]"
                        : "border-[#8f7a75] text-[#faf6f1] hover:border-[#f2cfc9]",
                    )}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>
            <div
              aria-hidden="true"
              className="relative mx-auto aspect-[1.6] w-full max-w-xs rounded-2xl bg-[linear-gradient(135deg,#f6dfd9,#d9a39c)] p-5 text-[#4a3b38] shadow-xl motion-safe:transition-transform motion-safe:hover:-rotate-1"
            >
              <div className="absolute inset-2 rounded-xl border border-white/70" />
              <p className={cn(display, "text-lg")}>Maison Bloom</p>
              <p className="text-[0.65rem] uppercase tracking-[0.3em]">Gift voucher</p>
              <p className={cn(display, "absolute bottom-4 right-5 text-4xl")}>${voucher}</p>
              <Flower2 className="absolute bottom-4 left-5 size-6 text-[#8e4a45]" />
            </div>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section
        ref={bookingRef}
        aria-labelledby={`${uid}-booking`}
        className="mx-auto max-w-4xl px-5 py-16 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-booking`}
          eyebrow="Booking"
          title="Book your visit"
          intro="Four short steps. We'll text to confirm your appointment."
        />
        {sent ? (
          <DemoSent
            title="Booking request received"
            onReset={reset}
            className="border border-[#e2cfc8] bg-[#fffdfa] text-[#4a3b38]"
          />
        ) : (
          <div className="rounded-3xl border border-[#eadbd5] bg-[#fffdfa] p-5 shadow-[0_20px_50px_-30px_rgba(74,59,56,0.45)] @xl:p-8">
            <ol aria-label="Booking steps" className="grid grid-cols-4 gap-2">
              {steps.map((label, i) => (
                <li
                  key={label}
                  aria-current={step === i ? "step" : undefined}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-full border text-sm font-semibold",
                      i < step && "border-[#8e4a45] bg-[#8e4a45] text-white",
                      i === step && "border-[#8e4a45] bg-[#f3e6e1] text-[#8e4a45]",
                      i > step && "border-[#e2cfc8] text-[#6b5450]",
                    )}
                  >
                    {i < step ? <Check aria-hidden="true" className="size-4" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-[0.7rem] leading-tight @xl:text-xs",
                      i === step ? "font-semibold text-[#4a3b38]" : "text-[#6b5450]",
                    )}
                  >
                    {label}
                    {i < step ? <span className="sr-only"> (done)</span> : null}
                  </span>
                </li>
              ))}
            </ol>

            <form noValidate onSubmit={submit} className="mt-8">
              <h4
                ref={stepHeadingRef}
                tabIndex={-1}
                className="text-2xl font-normal text-[#4a3b38] focus:outline-none"
              >
                Step {step + 1}: {steps[step]}
              </h4>

              {step === 0 ? (
                <div className="mt-5">
                  <div role="group" aria-label="Filter treatments" className="flex flex-wrap gap-2">
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        aria-pressed={group === g.id}
                        onClick={() => setGroup(g.id)}
                        className={cn(chip(group === g.id), "px-3 py-1.5 text-xs")}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                  <fieldset className="mt-5" aria-describedby={describedBy("treatment")}>
                    <legend className="text-sm font-semibold text-[#4a3b38]">
                      Choose a treatment
                    </legend>
                    <div className="mt-3 grid gap-2 @xl:grid-cols-2">
                      {bookable
                        .filter((b) => b.group === group)
                        .map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            aria-pressed={choiceId === b.id}
                            onClick={() => {
                              setChoiceId(b.id);
                              setTime(null);
                              setErrors({});
                            }}
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left motion-safe:transition-colors",
                              ring,
                              choiceId === b.id
                                ? "border-[#8e4a45] bg-[#f3e6e1]"
                                : "border-[#eadbd5] hover:border-[#c98b86]",
                            )}
                          >
                            <span>
                              <span className="block font-semibold">{b.name}</span>
                              <span className="text-sm text-[#6b5450]">{formatMins(b.mins)}</span>
                            </span>
                            <span className={cn(display, "text-lg text-[#8e4a45]")}>
                              ${b.price}
                            </span>
                          </button>
                        ))}
                    </div>
                  </fieldset>
                  {choice && choice.group !== group ? (
                    <p className="mt-3 text-sm text-[#6b5450]">Selected: {choice.name}</p>
                  ) : null}
                  {errorText("treatment")}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="mt-5 space-y-6">
                  <p className="text-sm text-[#6b5450]">
                    {choice?.name} · {choice ? formatMins(choice.mins) : ""}
                  </p>
                  <fieldset aria-describedby={describedBy("day")}>
                    <legend className="text-sm font-semibold">Day</legend>
                    <div className="mt-3 grid grid-cols-3 gap-2 @xl:grid-cols-6">
                      {days.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          aria-pressed={dayId === d.id}
                          onClick={() => {
                            setDayId(d.id);
                            setTime(null);
                            setErrors({});
                          }}
                          className={cn(chip(dayId === d.id), "rounded-xl")}
                        >
                          {d.short}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-[#6b5450]">Closed Mondays.</p>
                    {errorText("day")}
                  </fieldset>
                  <fieldset aria-describedby={describedBy("time")}>
                    <legend className="text-sm font-semibold">Time</legend>
                    {day ? (
                      <div className="mt-3 grid grid-cols-3 gap-2 @xl:grid-cols-5">
                        {slots.map((t) => {
                          const taken = isTaken(day.id, t);
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={taken}
                              aria-pressed={time === t}
                              onClick={() => {
                                setTime(t);
                                setErrors({});
                              }}
                              className={cn(
                                chip(time === t),
                                "rounded-xl px-2 disabled:cursor-not-allowed disabled:border-[#f0e2dc] disabled:bg-transparent disabled:text-[#b3a29d] disabled:line-through",
                              )}
                            >
                              {formatTime(t)}
                              {taken ? <span className="sr-only"> (taken)</span> : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[#6b5450]">
                        Choose a day to see available times.
                      </p>
                    )}
                    {errorText("time")}
                  </fieldset>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="mt-5 grid gap-4 @xl:grid-cols-2">
                  <div>
                    <label htmlFor={`${uid}-name`} className="text-sm font-semibold">
                      Full name
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
                    <label htmlFor={`${uid}-phone`} className="text-sm font-semibold">
                      Mobile
                    </label>
                    <input
                      id={`${uid}-phone`}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      placeholder="04xx xxx xxx"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={describedBy("phone")}
                      className={input}
                    />
                    {errorText("phone")}
                  </div>
                  <div className="@xl:col-span-2">
                    <label htmlFor={`${uid}-email`} className="text-sm font-semibold">
                      Email <span className="font-normal text-[#6b5450]">(optional)</span>
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
                  <div className="@xl:col-span-2">
                    <label htmlFor={`${uid}-notes`} className="text-sm font-semibold">
                      Allergies or sensitivities{" "}
                      <span className="font-normal text-[#6b5450]">(optional)</span>
                    </label>
                    <textarea
                      id={`${uid}-notes`}
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={input}
                    />
                  </div>
                  <label
                    htmlFor={`${uid}-first`}
                    className="flex items-center gap-3 text-sm @xl:col-span-2"
                  >
                    <input
                      id={`${uid}-first`}
                      type="checkbox"
                      checked={firstVisit}
                      onChange={(e) => setFirstVisit(e.target.checked)}
                      className={cn("size-4 accent-[#8e4a45]", ring)}
                    />
                    This is my first visit to {design.businessName}
                  </label>
                </div>
              ) : null}

              {step === 3 ? (
                <dl className="mt-5 divide-y divide-[#f0e2dc] rounded-2xl border border-[#eadbd5] bg-[#faf6f1] px-5 text-sm">
                  {[
                    ["Treatment", choice?.name ?? ""],
                    ["When", day && time !== null ? `${day.long}, ${formatTime(time)}` : ""],
                    ["Duration", choice ? formatMins(choice.mins) : ""],
                    ["Name", name],
                    ["Mobile", phone],
                    ["Email", email || "Not given"],
                    ["First visit", firstVisit ? "Yes, we'll allow extra time" : "No"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3">
                      <dt className="text-[#6b5450]">{k}</dt>
                      <dd className="text-right font-semibold">{v}</dd>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-4 py-4">
                    <dt className="text-[#6b5450]">Price, paid in salon</dt>
                    <dd className={cn(display, "text-3xl text-[#8e4a45]")}>
                      ${choice?.price ?? 0}
                    </dd>
                  </div>
                </dl>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0e2dc] pt-6">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setErrors({});
                      moveTo(step - 1);
                    }}
                    className={secondary}
                  >
                    <ChevronLeft aria-hidden="true" className="size-4" /> Back
                  </button>
                ) : (
                  <span />
                )}
                <button type="submit" className={primary}>
                  {step === steps.length - 1 ? "Request booking" : "Continue"}
                  {step < steps.length - 1 ? (
                    <ChevronRight aria-hidden="true" className="size-4" />
                  ) : null}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* Reviews */}
      <section
        aria-labelledby={`${uid}-reviews`}
        className="bg-[linear-gradient(180deg,#faf6f1,#f3e6e1)]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20">
          <SectionTitle id={`${uid}-reviews`} eyebrow="Reviews" title="Kind words" />
          <div className="grid gap-5 @3xl:grid-cols-3">
            {reviews.map((r) => (
              <figure
                key={r.name}
                className="flex flex-col rounded-3xl border border-[#eadbd5] bg-[#fffdfa] p-6"
              >
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className="size-4 fill-[#c98b86] text-[#c98b86]"
                    />
                  ))}
                  <span className="sr-only">Rated 5 out of 5</span>
                </div>
                <blockquote className={cn(display, "mt-4 flex-1 text-lg italic leading-relaxed")}>
                  “{r.text}”
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#8e4a45]">{r.name}</span>
                  <span className="rounded-full bg-[#f3e6e1] px-2.5 py-0.5 text-xs text-[#6b5450]">
                    Sample review
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Visit us */}
      <section
        ref={visitRef}
        aria-labelledby={`${uid}-visit`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-visit`}
          eyebrow="Visit us"
          title="Find the house with the pink door"
        />
        <div className="grid gap-6 @3xl:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-[#eadbd5] bg-[#fffdfa]">
            <svg viewBox="0 0 400 190" aria-hidden="true" className="h-48 w-full bg-[#f6efe8]">
              <g stroke="#ffffff" strokeWidth="16" fill="none" strokeLinecap="round">
                <path d="M-10 70 C 120 60 260 90 410 70" />
                <path d="M140 -10 C 150 80 130 140 150 200" />
              </g>
              <circle cx="300" cy="150" r="40" fill="#e3ead9" />
              <circle cx="60" cy="150" r="26" fill="#e3ead9" />
              <rect x="180" y="96" width="64" height="40" rx="10" fill="#f3e6e1" stroke="#c98b86" />
              <circle cx="212" cy="84" r="11" fill="#8e4a45" />
              <path d="M212 96 L205 86 H219 Z" fill="#8e4a45" />
              <text x="250" y="60" fill="#6b5450" fontSize="11" letterSpacing="2">
                CAMELLIA ARCADE
              </text>
            </svg>
            <div className="space-y-3 p-6 text-sm">
              <p className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#8e4a45]" />
                {ADDRESS}. Free parking behind the arcade.
              </p>
              <a
                href={PHONE_HREF}
                className={cn("flex w-fit items-center gap-3 rounded hover:text-[#8e4a45]", ring)}
              >
                <Phone aria-hidden="true" className="size-4 shrink-0 text-[#8e4a45]" />
                {PHONE}
              </a>
              <p className="flex items-center gap-3">
                <Mail aria-hidden="true" className="size-4 shrink-0 text-[#8e4a45]" />
                {EMAIL}
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-[#eadbd5] bg-[#f3e6e1] p-6 @xl:p-8">
            <h4 className="text-2xl font-normal">Opening hours</h4>
            <dl className="mt-4 divide-y divide-[#e2cfc8] text-sm">
              <div className="flex justify-between py-2.5">
                <dt>Monday</dt>
                <dd className="text-[#6b5450]">Closed</dd>
              </div>
              {days.map((d) => (
                <div key={d.id} className="flex justify-between py-2.5">
                  <dt>{d.long}</dt>
                  <dd className="font-semibold">
                    {formatTime(d.open)} – {formatTime(d.close)}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-[#6b5450]">
              Please arrive ten minutes early for your consultation.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#eadbd5] bg-[#4a3b38] text-[#f3e6e1]">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm @3xl:grid-cols-3">
          <div>
            <p className={cn(display, "text-xl text-[#faf6f1]")}>{design.businessName}</p>
            <p className="mt-2 text-[#eadbd5]">Facials, massage, nails and hair, taken slowly.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f2cfc9]">
              Hours
            </p>
            <p className="mt-2">Tue–Fri 9 am – 6 pm (Thu till 8 pm)</p>
            <p>Sat 8:30 am – 5 pm · Sun 10 am – 4 pm</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f2cfc9]">
              Visit
            </p>
            <p className="mt-2">{ADDRESS}</p>
            <p>
              {PHONE} · {EMAIL}
            </p>
          </div>
        </div>
      </footer>
      <DemoDisclaimer design={design} className="bg-[#4a3b38] text-[#f3e6e1]" />
    </DemoRoot>
  );
}
