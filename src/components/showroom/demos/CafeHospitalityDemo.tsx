import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  CalendarDays,
  Clock,
  Coffee,
  Croissant,
  Heart,
  Leaf,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Star,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

// Ember & Oat Café: warm terracotta and espresso, a filterable menu and a table request modal.
// Text colours are darkened terracotta (#8f4325 / #a9532f) so they clear 4.5:1 on the cream.

const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f4325]";
const btnPrimary = `inline-flex items-center justify-center gap-2 rounded-full bg-[#a9532f] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-8px_rgba(143,67,37,0.8)] hover:bg-[#8f4325] motion-safe:transition-colors ${ring}`;
const btnGhost = `inline-flex items-center justify-center gap-2 rounded-full border border-[#8f4325] px-5 py-2.5 text-sm font-semibold text-[#8f4325] hover:bg-[#ead8c6] motion-safe:transition-colors ${ring}`;
const inputClass = `w-full rounded-lg border bg-white px-3 py-2.5 text-[#3b2a22] [color-scheme:light] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8f4325]`;

const categories = [
  { id: "all", label: "All" },
  { id: "coffee", label: "Coffee" },
  { id: "kitchen", label: "Kitchen" },
  { id: "bakery", label: "Bakery" },
] as const;
type CategoryId = (typeof categories)[number]["id"];

const dietary = [
  { id: "V", label: "Vegetarian" },
  { id: "VG", label: "Vegan" },
  { id: "GF", label: "Gluten-free" },
] as const;
type DietId = (typeof dietary)[number]["id"];

type MenuItem = {
  name: string;
  category: Exclude<CategoryId, "all">;
  price: number;
  description: string;
  tags: readonly DietId[];
  favourite?: boolean;
};

const menu: readonly MenuItem[] = [
  {
    name: "Espresso",
    category: "coffee",
    price: 4.2,
    description: "Ember house blend: cocoa, stone fruit and a long caramel finish.",
    tags: ["VG", "GF"],
  },
  {
    name: "Flat white",
    category: "coffee",
    price: 5.2,
    description: "Double ristretto, silky milk from a dairy two valleys over.",
    tags: ["V", "GF"],
    favourite: true,
  },
  {
    name: "Oat latte",
    category: "coffee",
    price: 5.9,
    description: "House blend with toasted oat milk. Our most-ordered cup.",
    tags: ["VG", "GF"],
  },
  {
    name: "Long black",
    category: "coffee",
    price: 4.8,
    description: "Two shots pulled over hot water, crema left whole.",
    tags: ["VG", "GF"],
  },
  {
    name: "Batch brew filter",
    category: "coffee",
    price: 5.5,
    description: "A rotating single origin, roasted light for sweetness.",
    tags: ["VG", "GF"],
  },
  {
    name: "Iced spiced chai",
    category: "coffee",
    price: 6.5,
    description: "Chai steeped overnight with cardamom, ginger and black pepper.",
    tags: ["V", "GF"],
  },
  {
    name: "Ember breakfast plate",
    category: "kitchen",
    price: 24,
    description: "Free-range eggs, smoked bacon, roast tomato, greens and sourdough.",
    tags: [],
    favourite: true,
  },
  {
    name: "Smashed pumpkin on rye",
    category: "kitchen",
    price: 19,
    description: "Whipped feta, chilli honey, toasted pepitas and mint.",
    tags: ["V"],
  },
  {
    name: "Shakshuka",
    category: "kitchen",
    price: 22,
    description: "Eggs baked in spiced tomato with labneh and warm flatbread.",
    tags: ["V"],
  },
  {
    name: "Miso mushroom bowl",
    category: "kitchen",
    price: 21,
    description: "Brown rice, roasted mushrooms, greens, pickled ginger, sesame.",
    tags: ["VG", "GF"],
  },
  {
    name: "Oat & chia porridge",
    category: "kitchen",
    price: 16,
    description: "Poached pear, maple, toasted coconut and a spoon of tahini.",
    tags: ["VG"],
  },
  {
    name: "Slow-roast lamb toastie",
    category: "kitchen",
    price: 18,
    description: "Pulled lamb, pickled onion and aged cheddar on house sourdough.",
    tags: [],
  },
  {
    name: "Charred corn fritters",
    category: "kitchen",
    price: 21,
    description: "Smashed avocado, lime, herb salad and smoky tomato relish.",
    tags: ["V", "GF"],
  },
  {
    name: "Brown butter croissant",
    category: "bakery",
    price: 6.5,
    description: "Laminated over three days. Out of the oven at 6 am.",
    tags: ["V"],
    favourite: true,
  },
  {
    name: "Cardamom knot",
    category: "bakery",
    price: 7,
    description: "Swedish-style bun with cardamom sugar and a sticky glaze.",
    tags: ["V"],
  },
  {
    name: "Flourless orange cake",
    category: "bakery",
    price: 8,
    description: "Whole boiled oranges and almond meal, with crème fraîche.",
    tags: ["V", "GF"],
  },
  {
    name: "Pistachio & raspberry friand",
    category: "bakery",
    price: 6.8,
    description: "Brown butter, pistachio and a tart raspberry centre.",
    tags: ["V", "GF"],
  },
  {
    name: "Date & oat slice",
    category: "bakery",
    price: 6,
    description: "Chewy, not too sweet, and made without any dairy.",
    tags: ["VG"],
  },
  {
    name: "Sourdough loaf",
    category: "bakery",
    price: 11,
    description: "Long-fermented white or seeded rye, to take home.",
    tags: ["VG"],
  },
];

const timeSlots = [
  "7:00 am",
  "7:30 am",
  "8:00 am",
  "8:30 am",
  "9:00 am",
  "9:30 am",
  "10:00 am",
  "10:30 am",
  "11:00 am",
  "11:30 am",
  "12:00 pm",
  "12:30 pm",
  "1:00 pm",
  "1:30 pm",
  "2:00 pm",
] as const;
const quickSlots = ["8:00 am", "9:30 am", "11:00 am", "12:30 pm", "1:30 pm"] as const;

const reviews = [
  {
    name: "Priya K.",
    text: "The brown butter croissant is worth the walk alone. Friendly team, and they remembered my order by the second visit.",
  },
  {
    name: "Declan M.",
    text: "Booked the courtyard for a birthday brunch of ten. The table was ready, the dog got a water bowl and the shakshuka was excellent.",
  },
  {
    name: "Sophie T.",
    text: "Finally a café that takes gluten-free seriously. The orange cake is a staple now, and the oat latte is the best in the area.",
  },
] as const;

const hours = [
  { day: "Monday to Friday", time: "6:30 am – 3:00 pm" },
  { day: "Saturday", time: "7:00 am – 3:00 pm" },
  { day: "Sunday", time: "7:30 am – 2:00 pm" },
  { day: "Public holidays", time: "8:00 am – 1:00 pm" },
] as const;

type Reservation = {
  date: string;
  time: string;
  party: string;
  name: string;
  phone: string;
  requests: string;
};
type ReservationErrors = Partial<Record<keyof Reservation, string>>;
const emptyReservation: Reservation = {
  date: "",
  time: "",
  party: "2",
  name: "",
  phone: "",
  requests: "",
};

function todayIso() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function validate(form: Reservation): ReservationErrors {
  const errors: ReservationErrors = {};
  if (!form.date) errors.date = "Choose a date.";
  else if (form.date < todayIso()) errors.date = "Choose today or a later date.";
  if (!form.time) errors.time = "Choose a time.";
  if (form.name.trim().length < 2) errors.name = "Enter the name for the booking.";
  const digits = form.phone.replace(/\D/g, "");
  if (!digits) errors.phone = "Enter a phone number so we can confirm.";
  else if (digits.length < 8 || digits.length > 12)
    errors.phone = "Enter a phone number with 8 to 12 digits.";
  return errors;
}

// Keeps Tab inside an open dialog.
function trapTab(e: KeyboardEvent<HTMLElement>, container: HTMLElement | null) {
  if (e.key !== "Tab" || !container) return;
  const items = Array.from(
    container.querySelectorAll<HTMLElement>("button:not([disabled]), input, select, textarea"),
  );
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error: string | undefined;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
        {optional ? <span className="font-normal text-[#6b5446]"> (optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-[#9b2c1f]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DietBadge({ tag }: { tag: DietId }) {
  const label = dietary.find((d) => d.id === tag)?.label ?? tag;
  return (
    <span className="rounded-full border border-[#7a8c5c] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#4b5a33]">
      <span aria-hidden="true">{tag}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

function SectionTitle({
  eyebrow,
  title,
  light,
}: {
  eyebrow: string;
  title: string;
  light?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "text-xs font-bold tracking-[0.2em] uppercase",
          light ? "text-[#e08a64]" : "text-[#8f4325]",
        )}
      >
        {eyebrow}
      </p>
      <h3 className="mt-2 text-3xl font-bold @3xl:text-4xl">{title}</h3>
    </div>
  );
}

function HeroArt({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 320 320" aria-hidden="true" className="h-auto w-full max-w-sm">
      <defs>
        <linearGradient id={`${uid}-arch`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9784f" />
          <stop offset="1" stopColor="#a9532f" />
        </linearGradient>
        <radialGradient id={`${uid}-brew`} cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#9a6342" />
          <stop offset="1" stopColor="#4a2c1d" />
        </radialGradient>
      </defs>
      <path d="M36 320 V156 A124 124 0 0 1 284 156 V320 Z" fill={`url(#${uid}-arch)`} />
      <circle cx="232" cy="88" r="24" fill="#f2c9a0" opacity="0.9" />
      <g
        className="motion-safe:animate-pulse"
        stroke="#fbf6f0"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      >
        <path d="M136 146 C124 126 148 114 136 92" />
        <path d="M162 140 C150 118 174 106 162 80" />
        <path d="M188 146 C176 126 200 114 188 92" />
      </g>
      <ellipse cx="160" cy="276" rx="112" ry="22" fill="#fbf6f0" />
      <ellipse cx="160" cy="272" rx="78" ry="12" fill="#ead8c6" />
      <path
        d="M232 192 C266 190 268 238 234 240"
        stroke="#fbf6f0"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M84 176 H236 C236 238 206 270 160 270 C114 270 84 238 84 176 Z" fill="#fbf6f0" />
      <ellipse cx="160" cy="176" rx="76" ry="17" fill={`url(#${uid}-brew)`} />
      <path
        d="M160 187 C151 182 140 177 145 170 C149 165 156 167 160 172 C164 167 171 165 175 170 C180 177 169 182 160 187 Z"
        fill="#f3dcc0"
      />
      <ellipse cx="160" cy="176" rx="76" ry="17" fill="none" stroke="#fbf6f0" strokeWidth="4" />
      <path d="M50 300 C58 280 92 276 104 292 C96 304 64 308 50 300 Z" fill="#e7b57d" />
      <path
        d="M60 296 L72 288 M76 296 L86 288"
        stroke="#b97a3f"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShopfrontArt() {
  return (
    <svg viewBox="0 0 320 240" aria-hidden="true" className="h-auto w-full">
      <rect x="0" y="228" width="320" height="12" fill="#3b2a22" />
      <rect x="40" y="44" width="240" height="186" fill="#8f4325" />
      <rect x="30" y="32" width="260" height="20" rx="3" fill="#a9532f" />
      <rect x="92" y="58" width="136" height="26" rx="4" fill="#f5ede3" />
      <text
        x="160"
        y="76"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        letterSpacing="3"
        fill="#3b2a22"
      >
        EMBER &amp; OAT
      </text>
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i} fill={i % 2 === 0 ? "#f5ede3" : "#e08a64"}>
          <rect x={50 + i * 20} y="94" width="20" height="24" />
          <circle cx={60 + i * 20} cy="118" r="10" />
        </g>
      ))}
      <rect x="60" y="138" width="112" height="78" rx="3" fill="#f2c9a0" />
      <path d="M116 138 V216 M60 176 H172" stroke="#8f4325" strokeWidth="4" />
      <path d="M74 166 h14 v8 h-14 z M128 166 h14 v8 h-14 z" fill="#8f4325" opacity="0.6" />
      <rect x="192" y="132" width="62" height="98" rx="31" fill="#3b2a22" />
      <circle cx="240" cy="184" r="3.5" fill="#e08a64" />
      <rect x="44" y="204" width="16" height="24" rx="3" fill="#c2643f" />
      <circle cx="52" cy="198" r="12" fill="#7a8c5c" />
      <rect x="262" y="204" width="16" height="24" rx="3" fill="#c2643f" />
      <circle cx="270" cy="196" r="14" fill="#7a8c5c" />
    </svg>
  );
}

function MapArt() {
  return (
    <svg viewBox="0 0 400 240" aria-hidden="true" className="h-auto w-full">
      <rect width="400" height="240" fill="#ead8c6" />
      <rect x="250" y="20" width="120" height="80" rx="12" fill="#c9d1b0" />
      <path d="M0 140 H400 M0 60 H400 M120 0 V240 M300 0 V240" stroke="#fbf6f0" strokeWidth="16" />
      <path d="M0 200 L400 176" stroke="#fbf6f0" strokeWidth="8" />
      <path d="M200 0 V240" stroke="#f5ede3" strokeWidth="10" strokeDasharray="2 0" />
      <path
        d="M36 140 H196 V60"
        stroke="#8f4325"
        strokeWidth="4"
        strokeDasharray="8 7"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="20" y="126" width="30" height="28" rx="6" fill="#3b2a22" />
      <path
        d="M200 92 C188 92 180 82 180 72 C180 60 189 52 200 52 C211 52 220 60 220 72 C220 82 212 92 200 92 Z"
        fill="#c2643f"
      />
      <path d="M200 92 L193 80 H207 Z" fill="#c2643f" />
      <circle cx="200" cy="71" r="7" fill="#fbf6f0" />
    </svg>
  );
}

export function CafeHospitalityDemo({ design }: DemoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const menuRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const reserveRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const visitRef = useRef<HTMLElement>(null);

  const [category, setCategory] = useState<CategoryId>("all");
  const [diets, setDiets] = useState<readonly DietId[]>([]);
  const [showDirections, setShowDirections] = useState(false);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Reservation>(emptyReservation);
  const [errors, setErrors] = useState<ReservationErrors>({});
  const [sent, setSent] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const anchorRef = useRef(16);
  const restoreFocus = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);

  const visible = menu.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      diets.every((d) => item.tags.includes(d) || (d === "V" && item.tags.includes("VG"))),
  );

  function go(ref: RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ block: "nearest" });
  }

  function toggleDiet(id: DietId) {
    setDiets((current) =>
      current.includes(id) ? current.filter((d) => d !== id) : [...current, id],
    );
  }

  // The dialog sits at the trigger's height in the (tall) demo so it opens where the visitor is looking.
  function openReservation(e: MouseEvent<HTMLButtonElement>, time = "") {
    const trigger = e.currentTarget;
    const root = trigger.closest(".showroom-demo");
    triggerRef.current = trigger;
    anchorRef.current = root
      ? trigger.getBoundingClientRect().top - root.getBoundingClientRect().top - 120
      : 16;
    setForm({ ...emptyReservation, time });
    setErrors({});
    setSent(false);
    setOpen(true);
  }

  function closeReservation() {
    restoreFocus.current = true;
    setOpen(false);
  }

  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay) return;
    const max = overlay.clientHeight - panel.offsetHeight - 140;
    panel.style.top = `${Math.max(16, Math.min(anchorRef.current, max))}px`;
  }, [open]);

  // Focus goes into the dialog on open (and after submit or reset), and back to the trigger on close.
  useEffect(() => {
    if (!open) return;
    if (sent) doneRef.current?.focus();
    else dateRef.current?.focus();
  }, [open, sent]);

  useEffect(() => {
    if (open || !restoreFocus.current) return;
    restoreFocus.current = false;
    triggerRef.current?.focus();
  }, [open]);

  function update<K extends keyof Reservation>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    const firstKey = (Object.keys(found) as (keyof Reservation)[])[0];
    if (firstKey) {
      const el = e.currentTarget.elements.namedItem(firstKey);
      if (el instanceof HTMLElement) el.focus();
      return;
    }
    setSent(true);
  }

  const fid = (name: string) => `${uid}-${name}`;
  const invalid = (key: keyof Reservation) =>
    errors[key] ? { "aria-invalid": true as const, "aria-describedby": `${fid(key)}-error` } : {};
  const border = (key: keyof Reservation) =>
    errors[key] ? "border-[#9b2c1f]" : "border-[#cdb39b]";

  const navItems = [
    { label: "Menu", ref: menuRef },
    { label: "Our story", ref: storyRef },
    { label: "Reservations", ref: reserveRef },
    { label: "Reviews", ref: reviewsRef },
    { label: "Visit", ref: visitRef },
  ] as const;

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.sansHumanist, heading: demoFonts.sansRounded }}
      className="bg-[#f5ede3] text-[#3b2a22]"
    >
      <div inert={open}>
        <header className="border-b border-[#dcc6b0]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 @3xl:px-8">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-full bg-[#a9532f] text-[#fbf6f0]">
                <Coffee className="size-5" aria-hidden="true" />
              </span>
              <p className="font-[family-name:var(--demo-font-heading)] text-lg leading-tight font-bold">
                {design.businessName}
              </p>
            </div>
            <nav aria-label="Café sections" className="order-3 w-full @3xl:order-none @3xl:w-auto">
              <ul className="flex flex-wrap gap-1">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => go(item.ref)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium hover:bg-[#ead8c6] ${ring}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <button type="button" onClick={(e) => openReservation(e)} className={btnPrimary}>
              <CalendarDays className="size-4" aria-hidden="true" />
              Book a table
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 size-72 rounded-full bg-[#ead8c6] opacity-70"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 @3xl:grid-cols-[1.1fr_0.9fr] @3xl:px-8 @5xl:py-20">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#8f4325] uppercase">
                Kiln Lane, Tallowbrook · since 2016
              </p>
              <h2 className="mt-4 text-4xl leading-[1.08] font-bold @3xl:text-5xl @5xl:text-6xl">
                Slow mornings, warm loaves and coffee roasted down the lane.
              </h2>
              <p className="mt-5 max-w-xl text-lg text-[#6b5446]">
                A neighbourhood café serving our own roast, a seasonal kitchen until 2:30 pm and a
                bakery counter that usually sells out by noon.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={(e) => openReservation(e)} className={btnPrimary}>
                  Book a table
                </button>
                <button type="button" onClick={() => go(menuRef)} className={btnGhost}>
                  Browse the menu
                </button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-2 text-sm">
                {["Open daily from 6:30 am", "Dog-friendly courtyard", "Walk-ins welcome"].map(
                  (chip) => (
                    <li
                      key={chip}
                      className="rounded-full bg-[#fbf6f0] px-3 py-1.5 font-medium shadow-sm"
                    >
                      {chip}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="flex justify-center">
              <HeroArt uid={uid} />
            </div>
          </div>
        </section>

        {/* Menu */}
        <section
          ref={menuRef}
          aria-labelledby={`${uid}-menu`}
          className="bg-[#fbf6f0] py-14 @5xl:py-20"
        >
          <div className="mx-auto max-w-6xl px-5 @3xl:px-8">
            <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-[#8f4325] uppercase">
                  Eat & drink
                </p>
                <h3 id={`${uid}-menu`} className="mt-2 text-3xl font-bold @3xl:text-4xl">
                  The menu
                </h3>
              </div>
              <p className="max-w-md text-[#6b5446]">
                Coffee from our own roaster, a kitchen that changes with the season and pastries
                baked overnight.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 @3xl:flex-row @3xl:items-center @3xl:justify-between">
              <div role="group" aria-label="Menu category" className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const Icon =
                    c.id === "coffee"
                      ? Coffee
                      : c.id === "kitchen"
                        ? UtensilsCrossed
                        : c.id === "bakery"
                          ? Croissant
                          : null;
                  const active = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold motion-safe:transition-colors",
                        active
                          ? "border-[#2a1d17] bg-[#2a1d17] text-[#f5ede3]"
                          : "border-[#cdb39b] bg-transparent hover:bg-[#ead8c6]",
                        ring,
                      )}
                    >
                      {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <div
                role="group"
                aria-label="Dietary filters"
                className="flex flex-wrap items-center gap-2"
              >
                <span className="text-sm text-[#6b5446]">Only show:</span>
                {dietary.map((d) => {
                  const active = diets.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleDiet(d.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-semibold motion-safe:transition-colors",
                        active
                          ? "border-[#4b5a33] bg-[#4b5a33] text-white"
                          : "border-[#9aa77f] text-[#4b5a33] hover:bg-[#eef0e2]",
                        ring,
                      )}
                    >
                      {d.label} ({d.id})
                    </button>
                  );
                })}
              </div>
            </div>

            <p aria-live="polite" className="mt-5 text-sm text-[#6b5446]">
              Showing {visible.length} of {menu.length} items
            </p>

            {visible.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-[#cdb39b] p-8 text-center">
                <p className="font-semibold">
                  Nothing in this section matches those dietary filters.
                </p>
                <button type="button" onClick={() => setDiets([])} className={`mt-3 ${btnGhost}`}>
                  Clear dietary filters
                </button>
              </div>
            ) : (
              <ul className="mt-4 grid gap-3 @3xl:grid-cols-2">
                {visible.map((item) => (
                  <li
                    key={item.name}
                    className="rounded-2xl border border-[#ead8c6] bg-white p-5 shadow-[0_1px_0_#ead8c6]"
                  >
                    <div className="flex items-baseline gap-3">
                      <h4 className="text-lg font-bold">{item.name}</h4>
                      <span
                        aria-hidden="true"
                        className="flex-1 border-b-2 border-dotted border-[#dcc6b0]"
                      />
                      <p className="font-bold text-[#8f4325]">${item.price.toFixed(2)}</p>
                    </div>
                    <p className="mt-1.5 text-sm text-[#6b5446]">{item.description}</p>
                    {item.tags.length > 0 || item.favourite ? (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {item.tags.map((t) => (
                          <DietBadge key={t} tag={t} />
                        ))}
                        {item.favourite ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#f6e3d6] px-2 py-0.5 text-[11px] font-bold text-[#8f4325]">
                            <Heart className="size-3" aria-hidden="true" /> House favourite
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-6 text-sm text-[#6b5446]">
              Oat, almond or soy milk +$0.80 · extra shot +$0.60. Our kitchen handles gluten, nuts
              and dairy, so please tell us about allergies when you order.
            </p>
          </div>
        </section>

        {/* Our story */}
        <section ref={storyRef} className="bg-[#2a1d17] py-14 text-[#f5ede3] @5xl:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 @3xl:grid-cols-2 @3xl:px-8">
            <div className="rounded-3xl bg-[#3b2a22] p-6">
              <ShopfrontArt />
            </div>
            <div>
              <SectionTitle eyebrow="Since 2016" title="Our story" light />
              <p className="mt-5 text-[#e6d6c7]">
                Ines Calder and Tom Ferrow started Ember &amp; Oat with a second-hand roaster in a
                back shed and a sourdough starter named Gus. The shed is now the roastery, Gus is
                ten years old, and the lane out front fills up every Saturday.
              </p>
              <p className="mt-4 text-[#e6d6c7]">
                We buy green coffee from growers we know by name, bake through the night and plan
                the kitchen menu around whatever the local farms bring in that week.
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { value: "120", label: "loaves baked each morning" },
                  { value: "9", label: "local growers on the menu" },
                  { value: "0", label: "single-use cups in the café" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col-reverse justify-end rounded-2xl border border-[#5a4134] p-4"
                  >
                    <dt className="mt-1 text-xs text-[#d9c7b8]">{stat.label}</dt>
                    <dd className="font-[family-name:var(--demo-font-heading)] text-3xl font-bold text-[#e08a64]">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Reservations */}
        <section ref={reserveRef} className="bg-[#ead8c6] py-14 @5xl:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 @3xl:grid-cols-2 @3xl:px-8">
            <div>
              <SectionTitle eyebrow="Save a seat" title="Reservations" />
              <p className="mt-4 text-[#5a4538]">
                Walk-ins are always welcome. For groups, birthdays or a courtyard table, send a
                request and we&apos;ll text to confirm within the hour during opening times.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  { Icon: Users, text: "Tables for 1 to 12, larger groups by arrangement" },
                  { Icon: Clock, text: "Bookings from 7 am to 2 pm, held for 15 minutes" },
                  { Icon: Leaf, text: "Dog-friendly courtyard tables on request" },
                ].map(({ Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#fbf6f0] text-[#8f4325]">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="pt-1">{text}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={(e) => openReservation(e)}
                className={`mt-7 ${btnPrimary}`}
              >
                Request a table
              </button>
            </div>
            <div className="rounded-3xl bg-[#fbf6f0] p-6 shadow-[0_20px_40px_-28px_rgba(59,42,34,0.6)]">
              <h4 className="text-lg font-bold">Quick pick a time</h4>
              <p className="mt-1 text-sm text-[#6b5446]">
                Popular weekend slots. Choose one to start a request with that time filled in.
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-2 @xl:grid-cols-3">
                {quickSlots.map((slot) => (
                  <li key={slot}>
                    <button
                      type="button"
                      onClick={(e) => openReservation(e, slot)}
                      className={`w-full rounded-xl border border-[#cdb39b] bg-white px-3 py-3 text-sm font-semibold hover:border-[#a9532f] hover:bg-[#f6e3d6] motion-safe:transition-colors ${ring}`}
                    >
                      {slot}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-xl bg-[#f5ede3] p-3 text-sm text-[#5a4538]">
                Booking for 8 or more? Add any dietary needs in the request and the kitchen will
                plan for them.
              </p>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section ref={reviewsRef} className="py-14 @5xl:py-20">
          <div className="mx-auto max-w-6xl px-5 @3xl:px-8">
            <SectionTitle eyebrow="Kind words" title="What regulars say" />
            <ul className="mt-8 grid gap-4 @3xl:grid-cols-3">
              {reviews.map((r) => (
                <li key={r.name}>
                  <figure className="flex h-full flex-col rounded-3xl border border-[#dcc6b0] bg-[#fbf6f0] p-6">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex text-[#c2643f]" aria-hidden="true">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className="size-4 fill-current" />
                        ))}
                      </span>
                      <span className="sr-only">Rated 5 out of 5.</span>
                      <span className="rounded-full bg-[#ead8c6] px-2 py-0.5 text-[11px] font-semibold text-[#5a4538]">
                        Sample review
                      </span>
                    </div>
                    <blockquote className="mt-4 flex-1 text-[#4a372d]">
                      &ldquo;{r.text}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 font-bold">{r.name}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Hours & location */}
        <section
          ref={visitRef}
          aria-labelledby={`${uid}-visit`}
          className="bg-[#fbf6f0] py-14 @5xl:py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-8 px-5 @3xl:grid-cols-2 @3xl:px-8">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#8f4325] uppercase">Come by</p>
              <h3 id={`${uid}-visit`} className="mt-2 text-3xl font-bold @3xl:text-4xl">
                Hours &amp; location
              </h3>
              <dl className="mt-6 divide-y divide-[#ead8c6] rounded-2xl border border-[#ead8c6] bg-white">
                {hours.map((h) => (
                  <div key={h.day} className="flex justify-between gap-4 px-4 py-3 text-sm">
                    <dt className="font-semibold">{h.day}</dt>
                    <dd className="text-[#6b5446]">{h.time}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-sm text-[#6b5446]">
                The kitchen closes 30 minutes before we do.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="size-4 text-[#8f4325]" aria-hidden="true" /> 14 Kiln Lane,
                  Tallowbrook NSW
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4 text-[#8f4325]" aria-hidden="true" /> (02) 5550 0142
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-4 text-[#8f4325]" aria-hidden="true" />{" "}
                  hello@emberandoat.example
                </li>
              </ul>
            </div>
            <div>
              <div className="overflow-hidden rounded-3xl border border-[#dcc6b0]">
                <MapArt />
              </div>
              <p className="mt-2 text-xs text-[#6b5446]">
                Map illustration: café pin, station at left.
              </p>
              <button
                type="button"
                aria-expanded={showDirections}
                aria-controls={`${uid}-directions`}
                onClick={() => setShowDirections((v) => !v)}
                className={`mt-4 ${btnGhost}`}
              >
                <Navigation className="size-4" aria-hidden="true" />
                {showDirections ? "Hide directions" : "Get directions"}
              </button>
              <ol
                id={`${uid}-directions`}
                hidden={!showDirections}
                className="mt-4 list-decimal space-y-2 rounded-2xl bg-[#ead8c6] p-5 pl-9 text-sm"
              >
                <li>From Tallowbrook station, walk east along Mill Street for two blocks.</li>
                <li>
                  Turn left at the bakery mural onto Kiln Lane. We&apos;re the terracotta awning.
                </li>
                <li>
                  Two-hour street parking on Mill Street, bike racks out front, bus stop at the
                  corner.
                </li>
              </ol>
            </div>
          </div>
        </section>

        <footer className="bg-[#2a1d17] text-[#f5ede3]">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 @3xl:grid-cols-3 @3xl:px-8">
            <div>
              <p className="font-[family-name:var(--demo-font-heading)] text-xl font-bold">
                {design.businessName}
              </p>
              <p className="mt-2 text-sm text-[#d9c7b8]">
                Roastery, kitchen and bakery on Kiln Lane.
              </p>
            </div>
            <div className="text-sm text-[#d9c7b8]">
              <p className="font-semibold text-[#e08a64]">Hours</p>
              <p className="mt-1">Mon–Fri 6:30 am – 3 pm</p>
              <p>Sat 7 am – 3 pm · Sun 7:30 am – 2 pm</p>
            </div>
            <div className="text-sm text-[#d9c7b8]">
              <p className="font-semibold text-[#e08a64]">Find us</p>
              <p className="mt-1">14 Kiln Lane, Tallowbrook NSW</p>
              <p>(02) 5550 0142 · hello@emberandoat.example</p>
            </div>
          </div>
        </footer>
      </div>

      {open ? (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${uid}-res-title`}
          className="absolute inset-0 z-20"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              closeReservation();
            } else trapTab(e, panelRef.current);
          }}
        >
          <div
            aria-hidden="true"
            onClick={closeReservation}
            className="absolute inset-0 bg-[#2a1d17]/60"
          />
          <div
            ref={panelRef}
            className="absolute right-3 left-3 mx-auto max-w-lg rounded-3xl border border-[#dcc6b0] bg-[#fbf6f0] p-6 text-[#3b2a22] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id={`${uid}-res-title`} className="text-2xl font-bold">
                  Request a table
                </h3>
                <p className="mt-1 text-sm text-[#6b5446]">
                  We&apos;ll text to confirm. Fields marked optional can be left blank.
                </p>
              </div>
              <button
                type="button"
                onClick={closeReservation}
                aria-label="Close table request"
                className={`grid size-9 shrink-0 place-items-center rounded-full hover:bg-[#ead8c6] ${ring}`}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {sent ? (
              <div className="mt-5">
                <DemoSent
                  title={`Table for ${form.party} at ${form.time} requested`}
                  onReset={() => {
                    setForm(emptyReservation);
                    setSent(false);
                  }}
                  className="bg-[#ead8c6] text-[#3b2a22]"
                />
                <button
                  ref={doneRef}
                  type="button"
                  onClick={closeReservation}
                  className={`mt-4 w-full ${btnPrimary}`}
                >
                  Close
                </button>
              </div>
            ) : (
              <form noValidate onSubmit={submit} className="mt-5 grid gap-4 @xl:grid-cols-3">
                <Field id={fid("date")} label="Date" error={errors.date}>
                  <input
                    ref={dateRef}
                    id={fid("date")}
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    className={cn(inputClass, border("date"))}
                    {...invalid("date")}
                  />
                </Field>
                <Field id={fid("time")} label="Time" error={errors.time}>
                  <select
                    id={fid("time")}
                    name="time"
                    value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                    className={cn(inputClass, border("time"))}
                    {...invalid("time")}
                  >
                    <option value="">Choose…</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id={fid("party")} label="Party size" error={errors.party}>
                  <select
                    id={fid("party")}
                    name="party"
                    value={form.party}
                    onChange={(e) => update("party", e.target.value)}
                    className={cn(inputClass, border("party"))}
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === "1" ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid gap-4 @xl:col-span-3 @xl:grid-cols-2">
                  <Field id={fid("name")} label="Name" error={errors.name}>
                    <input
                      id={fid("name")}
                      name="name"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      className={cn(inputClass, border("name"))}
                      {...invalid("name")}
                    />
                  </Field>
                  <Field id={fid("phone")} label="Mobile number" error={errors.phone}>
                    <input
                      id={fid("phone")}
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className={cn(inputClass, border("phone"))}
                      {...invalid("phone")}
                    />
                  </Field>
                </div>
                <div className="@xl:col-span-3">
                  <Field id={fid("requests")} label="Special requests" error={undefined} optional>
                    <textarea
                      id={fid("requests")}
                      name="requests"
                      rows={3}
                      value={form.requests}
                      onChange={(e) => update("requests", e.target.value)}
                      placeholder="High chair, courtyard table, a birthday candle…"
                      className={cn(inputClass, "border-[#cdb39b]")}
                    />
                  </Field>
                </div>
                <div className="flex flex-col-reverse gap-3 @xl:col-span-3 @xl:flex-row @xl:justify-end">
                  <button type="button" onClick={closeReservation} className={btnGhost}>
                    Cancel
                  </button>
                  <button type="submit" className={btnPrimary}>
                    Send request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}

      <DemoDisclaimer design={design} className="bg-[#2a1d17] text-[#f5ede3]" />
    </DemoRoot>
  );
}
