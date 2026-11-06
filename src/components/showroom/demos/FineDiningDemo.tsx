import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import {
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Shirt,
  Users,
  Wine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

const PHONE = "(02) 5550 0187";
const PHONE_HREF = "tel:+61255500187";
const EMAIL = "hello@aureliadining.example";
const ADDRESS = "3 Lantern Walk, Calderbrook NSW";
const MENU_PRICE = 195;
const PAIRING_PRICE = 110;
const MIN_GUESTS = 6;
const MAX_GUESTS = 40;

const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c98f]";
const display = "font-[family-name:var(--demo-font-heading)]";

const courses = [
  {
    id: "snacks",
    numeral: "I",
    name: "Snacks from the hearth",
    line: "Smoked eel tartlet · pepperberry gougère · oyster leaf",
    detail: "Three bites to begin, brought to the table with warm towels while the bread proves.",
    diet: "Pescatarian swap available",
    wine: "Méthode traditionnelle, cool-climate blanc de blancs",
  },
  {
    id: "bread",
    numeral: "II",
    name: "Bread & butter",
    line: "Rye sourdough · cultured butter · saltbush",
    detail:
      "Baked each afternoon from a fourteen-year-old starter, with butter cultured in house for five days.",
    diet: "Vegetarian",
    wine: "",
  },
  {
    id: "kingfish",
    numeral: "III",
    name: "Kingfish",
    line: "Buttermilk · green strawberry · dill oil",
    detail: "Line-caught kingfish, lightly cured and dressed at the table with chilled buttermilk.",
    diet: "Gluten free",
    wine: "Dry riesling, high-altitude vineyard",
  },
  {
    id: "garden",
    numeral: "IV",
    name: "From the garden",
    line: "Hay-roasted carrot · macadamia · finger lime",
    detail:
      "Heirloom carrots from our kitchen garden, roasted under hay and glazed in their own juice.",
    diet: "Vegan on request",
    wine: "Skin-contact chenin blanc",
  },
  {
    id: "cod",
    numeral: "V",
    name: "Murray cod",
    line: "Brown butter · sea herbs · smoked roe",
    detail:
      "Pan-roasted on the skin until it crackles, finished with foaming brown butter and coastal greens.",
    diet: "Gluten free",
    wine: "Barrel-fermented chardonnay",
  },
  {
    id: "duck",
    numeral: "VI",
    name: "Dry-aged duck",
    line: "Cherry · beetroot · duck jus",
    detail: "Aged fourteen days on the bone, roasted over ironbark coals and carved at the pass.",
    diet: "Dairy free",
    wine: "Cool-climate pinot noir",
  },
  {
    id: "pre",
    numeral: "VII",
    name: "Pre-dessert",
    line: "Yoghurt sorbet · quandong · lemon myrtle",
    detail: "A bright, cold reset before the last course.",
    diet: "Gluten free",
    wine: "Late-harvest gewürztraminer",
  },
  {
    id: "dessert",
    numeral: "VIII",
    name: "Chocolate & wattleseed",
    line: "Dark chocolate · wattleseed · burnt honey",
    detail: "Dark chocolate cremeux, roasted wattleseed ice cream and a shard of burnt honey.",
    diet: "Contains nuts",
    wine: "Twenty-year aged tawny",
  },
] as const;

const spaces = [
  {
    name: "The Dining Room",
    seats: "48 guests",
    text: "Twelve tables under the arched windows, lit by candles and a long brass rail.",
  },
  {
    name: "The Cellar Table",
    seats: "6 to 12 guests",
    text: "One table among the wine racks, with its own sommelier for the night.",
  },
  {
    name: "The Gallery",
    seats: "Up to 40 guests",
    text: "The mezzanine above the room, for exclusive use with its own bar.",
  },
] as const;

const occasions = ["Birthday", "Anniversary", "Corporate dinner", "Engagement", "Other"] as const;

const press = [
  {
    source: "The Harbour Table Review",
    quote:
      "A menu that reads like a letter from the coast to the country. The duck alone is worth the drive.",
  },
  {
    source: "Plate & Pour Quarterly",
    quote:
      "Quietly the most confident dining room of the year, with service that anticipates without hovering.",
  },
  {
    source: "The Late Supper Journal",
    quote: "Eight courses that never feel like eight. Book the pairing and let the sommelier talk.",
  },
] as const;

type Field = "date" | "guests" | "occasion" | "name" | "email";
type Errors = Partial<Record<Field, string>>;

function Ornament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 24"
      aria-hidden="true"
      className={cn("h-6 w-44 text-[#c8a96a]", className)}
    >
      <path d="M0 12 H82 M118 12 H200" stroke="currentColor" strokeWidth="1" />
      <path d="M100 2 L110 12 L100 22 L90 12 Z" fill="none" stroke="currentColor" />
      <circle cx="100" cy="12" r="2.5" fill="currentColor" />
      <circle cx="84" cy="12" r="1.5" fill="currentColor" />
      <circle cx="116" cy="12" r="1.5" fill="currentColor" />
    </svg>
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
      <p className="text-xs uppercase tracking-[0.4em] text-[#c8a96a]">{eyebrow}</p>
      <h3 id={id} className="mt-3 text-3xl font-normal leading-tight text-[#f3ece0] @3xl:text-5xl">
        {title}
      </h3>
      <Ornament className="mx-auto mt-4" />
      {intro ? <p className="mt-4 text-[#c9bba8]">{intro}</p> : null}
    </div>
  );
}

function RoomIllustration({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 480 280" aria-hidden="true" className="h-auto w-full">
      <defs>
        <linearGradient id={`${uid}-win`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8a96a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#4a0f1c" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor="#f0d9a0" stopOpacity="0.7" />
          <stop offset="1" stopColor="#f0d9a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="280" fill="#231316" />
      {[30, 140, 250, 360].map((x) => (
        <g key={x} stroke="#c8a96a" strokeOpacity="0.6" fill="none">
          <path d={`M${x} 180 V80 A45 45 0 0 1 ${x + 90} 80 V180 Z`} fill={`url(#${uid}-win)`} />
          <path d={`M${x + 45} 35 V180 M${x} 120 H${x + 90}`} strokeOpacity="0.35" />
        </g>
      ))}
      <rect x="0" y="180" width="480" height="100" fill="#1b1b1d" />
      <rect
        x="50"
        y="205"
        width="380"
        height="10"
        rx="2"
        fill="#4a0f1c"
        stroke="#c8a96a"
        strokeOpacity="0.7"
      />
      <path d="M70 215 V255 M410 215 V255" stroke="#c8a96a" strokeOpacity="0.5" strokeWidth="3" />
      {[110, 190, 270, 350].map((x) => (
        <g key={x}>
          <circle cx={x} cy="182" r="26" fill={`url(#${uid}-glow)`} />
          <rect x={x - 3} y="186" width="6" height="19" fill="#f3ece0" />
          <path d={`M${x} 176 q4 6 0 10 q-4 -4 0 -10`} fill="#f0d9a0" />
        </g>
      ))}
      <path d="M0 180 H480" stroke="#c8a96a" strokeOpacity="0.4" />
    </svg>
  );
}

export function FineDiningDemo({ design }: DemoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const menuRef = useRef<HTMLElement>(null);
  const roomRef = useRef<HTMLElement>(null);
  const privateRef = useRef<HTMLElement>(null);
  const reserveRef = useRef<HTMLElement>(null);

  const [open, setOpen] = useState<string[]>(["snacks"]);
  const [pairing, setPairing] = useState(false);

  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("10");
  const [occasion, setOccasion] = useState("");
  const [withPairing, setWithPairing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const perPerson = MENU_PRICE + (pairing ? PAIRING_PRICE : 0);
  const guestCount = Number.parseInt(guests, 10);
  const validGuests =
    !Number.isNaN(guestCount) && guestCount >= MIN_GUESTS && guestCount <= MAX_GUESTS;
  const room = validGuests ? (guestCount <= 12 ? "The Cellar Table" : "The Gallery") : "";
  const estimate = validGuests ? guestCount * (MENU_PRICE + (withPairing ? PAIRING_PRICE : 0)) : 0;
  const allOpen = open.length === courses.length;

  const go = (ref: RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ block: "nearest" });
  const nav = [
    { label: "Menu", ref: menuRef },
    { label: "The room", ref: roomRef },
    { label: "Private dining", ref: privateRef },
    { label: "Reserve", ref: reserveRef },
  ] as const;

  const toggleCourse = (id: string) =>
    setOpen((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]));

  function stepGuests(delta: number) {
    const base = Number.isNaN(guestCount) ? MIN_GUESTS : guestCount;
    setGuests(String(Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, base + delta))));
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const next: Errors = {};
    if (!date) next.date = "Choose a date for your event.";
    else if (date < today) next.date = "Choose a date from today onwards.";
    if (!validGuests) next.guests = `Private dining is for ${MIN_GUESTS} to ${MAX_GUESTS} guests.`;
    if (!occasion) next.occasion = "Choose the occasion.";
    if (!name.trim()) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      next.email = "Enter an email address so we can reply.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  function reset() {
    setDate("");
    setGuests("10");
    setOccasion("");
    setWithPairing(false);
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setErrors({});
    setSent(false);
  }

  const input = cn(
    "mt-1.5 w-full rounded-none border border-[#5a4a3f] bg-[#141416] px-3 py-2.5 text-[#f3ece0] [color-scheme:dark] placeholder:text-[#8f8478]",
    ring,
  );
  const labelCls = "text-xs uppercase tracking-[0.25em] text-[#c8a96a]";
  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`${uid}-${field}-err`} className="mt-1.5 text-sm text-[#f2a7a0]">
        {errors[field]}
      </p>
    ) : null;
  const describedBy = (field: Field) => (errors[field] ? `${uid}-${field}-err` : undefined);
  const goldButton = cn(
    "inline-flex items-center justify-center gap-2 border border-[#c8a96a] bg-[#c8a96a] px-6 py-3 text-sm uppercase tracking-[0.2em] text-[#1b1b1d] hover:bg-[#d8bd82] motion-safe:transition-colors",
    ring,
  );
  const ghostButton = cn(
    "inline-flex items-center justify-center gap-2 border border-[#c8a96a] px-6 py-3 text-sm uppercase tracking-[0.2em] text-[#e3c98f] hover:bg-[#c8a96a]/10",
    ring,
  );

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.serifBook, heading: demoFonts.serifDidone }}
      className="bg-[#1b1b1d] text-[#f3ece0]"
    >
      <header className="border-b border-[#3a2a2c] bg-[#161618]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <p
            className={cn(display, "text-lg uppercase tracking-[0.3em] text-[#f3ece0] @xl:text-xl")}
          >
            {design.businessName}
          </p>
          <nav aria-label="Demo site sections" className="hidden items-center gap-1 @3xl:flex">
            {nav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.ref)}
                className={cn(
                  "px-3 py-2 text-xs uppercase tracking-[0.25em] text-[#c9bba8] hover:text-[#e3c98f]",
                  ring,
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <a
            href={PHONE_HREF}
            className={cn("hidden items-center gap-2 text-sm text-[#e3c98f] @xl:inline-flex", ring)}
          >
            <Phone aria-hidden="true" className="size-4" /> {PHONE}
          </a>
        </div>
        <nav
          aria-label="Demo site sections, compact"
          className="border-t border-[#3a2a2c] @3xl:hidden"
        >
          <ul className="flex flex-wrap justify-center gap-x-2 gap-y-1 px-3 py-1.5">
            {nav.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => go(item.ref)}
                  className={cn(
                    "whitespace-nowrap px-2 py-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-[#c9bba8]",
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
        className="relative overflow-hidden border-b border-[#3a2a2c]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,169,106,0.2),transparent_55%),radial-gradient(ellipse_at_100%_100%,rgba(74,15,28,0.95),transparent_60%),radial-gradient(ellipse_at_0%_80%,rgba(74,15,28,0.7),transparent_50%),linear-gradient(170deg,#2a0d14,#1b1b1d_75%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(243,236,224,0.025)_0px,rgba(243,236,224,0.025)_1px,transparent_1px,transparent_8px)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-4 border border-[#c8a96a]/25 @3xl:inset-8"
        />
        <div className="relative mx-auto max-w-4xl px-8 py-20 text-center @3xl:py-28">
          <p className="text-xs uppercase tracking-[0.45em] text-[#c8a96a]">
            Calderbrook · Since 2015
          </p>
          <Ornament className="mx-auto mt-6" />
          <h2
            id={`${uid}-hero`}
            className="mt-6 text-4xl font-normal leading-[1.05] text-[#f3ece0] @xl:text-6xl @5xl:text-7xl"
          >
            An evening, <em className="text-[#e3c98f]">in eight courses</em>.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#d8ccb9]">
            A single tasting menu written each season from the coast, the garden and the coals.
            Dinner Wednesday to Saturday, lunch on Friday and Saturday.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => go(menuRef)} className={goldButton}>
              View the menu
            </button>
            <button type="button" onClick={() => go(reserveRef)} className={ghostButton}>
              Reservations
            </button>
          </div>
          <dl className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-[#c8a96a]/30 pt-6">
            {[
              ["8", "Courses"],
              [`$${MENU_PRICE}`, "Per person"],
              [`$${PAIRING_PRICE}`, "Wine pairing"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-[0.7rem] uppercase tracking-[0.25em] text-[#c9bba8]">{l}</dt>
                <dd className={cn(display, "mt-1 text-2xl text-[#e3c98f] @xl:text-3xl")}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Tasting menu */}
      <section
        ref={menuRef}
        aria-labelledby={`${uid}-menu`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-24"
      >
        <SectionTitle
          id={`${uid}-menu`}
          eyebrow="Spring tasting menu"
          title="The tasting menu"
          intro="Open each course to read more. Add the wine pairing to see what the sommelier pours with it."
        />
        <div className="grid gap-8 @3xl:grid-cols-[1fr_280px] @5xl:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                aria-pressed={pairing}
                onClick={() => setPairing((p) => !p)}
                className={cn(
                  "inline-flex items-center gap-3 border border-[#5a4a3f] px-4 py-2.5 text-sm",
                  ring,
                  pairing && "border-[#c8a96a] bg-[#4a0f1c]",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative h-5 w-9 rounded-full border border-[#c8a96a] motion-safe:transition-colors",
                    pairing ? "bg-[#c8a96a]" : "bg-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 size-3.5 rounded-full motion-safe:transition-all",
                      pairing ? "left-[18px] bg-[#1b1b1d]" : "left-0.5 bg-[#c8a96a]",
                    )}
                  />
                </span>
                <Wine aria-hidden="true" className="size-4 text-[#e3c98f]" />
                Wine pairing (+${PAIRING_PRICE})
              </button>
              <button
                type="button"
                onClick={() => setOpen(allOpen ? [] : courses.map((c) => c.id))}
                className={cn("text-sm text-[#e3c98f] underline underline-offset-4", ring)}
              >
                {allOpen ? "Close all courses" : "Open all courses"}
              </button>
            </div>
            <ol className="border-t border-[#3a2a2c]">
              {courses.map((c) => {
                const isOpen = open.includes(c.id);
                return (
                  <li key={c.id} className="border-b border-[#3a2a2c]">
                    <h4 className="m-0 font-normal">
                      <button
                        id={`${uid}-course-${c.id}`}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`${uid}-panel-${c.id}`}
                        onClick={() => toggleCourse(c.id)}
                        className={cn(
                          "flex w-full items-center gap-4 py-5 text-left hover:bg-[#241a1c]",
                          ring,
                        )}
                      >
                        <span
                          className={cn(
                            display,
                            "w-10 shrink-0 text-center text-lg text-[#c8a96a]",
                          )}
                        >
                          {c.numeral}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(display, "block text-xl text-[#f3ece0] @xl:text-2xl")}
                          >
                            {c.name}
                          </span>
                          <span className="mt-0.5 block text-sm italic text-[#c9bba8]">
                            {c.line}
                          </span>
                        </span>
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-5 shrink-0 text-[#c8a96a] motion-safe:transition-transform",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>
                    </h4>
                    <div
                      id={`${uid}-panel-${c.id}`}
                      role="region"
                      aria-labelledby={`${uid}-course-${c.id}`}
                      hidden={!isOpen}
                      className="pb-6 pl-14 pr-2"
                    >
                      <p className="text-[#e6dccb]">{c.detail}</p>
                      <p className="mt-2 text-sm text-[#c9bba8]">{c.diet}</p>
                      {pairing ? (
                        <p className="mt-3 flex items-start gap-2 border-l-2 border-[#c8a96a] bg-[#4a0f1c]/60 px-3 py-2 text-sm text-[#f3ece0]">
                          <Wine
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-[#e3c98f]"
                          />
                          {c.wine
                            ? `Paired with ${c.wine}`
                            : "No pour with this course, so take a breath."}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <aside
            aria-label="Price per person"
            className="h-fit border border-[#c8a96a]/50 bg-[linear-gradient(170deg,#4a0f1c,#2a0d14)] p-6"
          >
            <p className={cn(display, "text-2xl")}>Your evening</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3 border-b border-[#c8a96a]/30 pb-3">
                <dt className="text-[#d8ccb9]">Tasting menu</dt>
                <dd>${MENU_PRICE}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[#c8a96a]/30 pb-3">
                <dt className="text-[#d8ccb9]">Wine pairing</dt>
                <dd>{pairing ? `$${PAIRING_PRICE}` : "Not added"}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 pt-1" aria-live="polite">
                <dt className="text-[#d8ccb9]">Total per person</dt>
                <dd className={cn(display, "text-4xl text-[#e3c98f]")}>${perPerson}</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm text-[#d8ccb9]">
              Vegetarian and pescatarian menus with 48 hours' notice. A non-alcoholic pairing is
              available on the night.
            </p>
            <button
              type="button"
              onClick={() => go(reserveRef)}
              className={cn(goldButton, "mt-6 w-full")}
            >
              Reserve a table
            </button>
          </aside>
        </div>
      </section>

      {/* The room */}
      <section
        ref={roomRef}
        aria-labelledby={`${uid}-room`}
        className="border-y border-[#3a2a2c] bg-[#4a0f1c]"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 @3xl:grid-cols-2 @3xl:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#e3c98f]">The room</p>
            <h3
              id={`${uid}-room`}
              className="mt-3 text-3xl font-normal leading-tight @3xl:text-5xl"
            >
              Candlelight, linen and a long brass rail.
            </h3>
            <p className="mt-5 text-[#e6dccb]">
              A converted 1920s printing hall with arched windows, a wood-fired kitchen in full view
              and a cellar of four hundred wines underfoot.
            </p>
            <ul className="mt-8 space-y-5">
              {spaces.map((s) => (
                <li key={s.name} className="border-l border-[#c8a96a] pl-4">
                  <h4 className="text-xl font-normal">{s.name}</h4>
                  <p className="mt-0.5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#e3c98f]">
                    <Users aria-hidden="true" className="size-3.5" /> {s.seats}
                  </p>
                  <p className="mt-1.5 text-sm text-[#e6dccb]">{s.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 flex items-start gap-3 border border-[#c8a96a]/40 p-4 text-sm text-[#f3ece0]">
              <Shirt aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#e3c98f]" />
              <span>
                <strong className="font-semibold">Dress code:</strong> smart. Jackets are welcome
                but never required; we ask guests to leave activewear and beachwear at home.
              </span>
            </p>
          </div>
          <div className="border border-[#c8a96a]/40 p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
            <RoomIllustration uid={uid} />
          </div>
        </div>
      </section>

      {/* Private dining */}
      <section
        ref={privateRef}
        aria-labelledby={`${uid}-private`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-24"
      >
        <SectionTitle
          id={`${uid}-private`}
          eyebrow="Private dining"
          title="Gather around our table"
          intro={`For ${MIN_GUESTS} to ${MAX_GUESTS} guests in the Cellar Table or the Gallery. Tell us about the evening and our events team will reply within one business day.`}
        />
        {sent ? (
          <DemoSent
            title="Private dining enquiry received"
            onReset={reset}
            className="mx-auto max-w-xl border border-[#c8a96a]/50 bg-[#241a1c] text-[#f3ece0]"
          />
        ) : (
          <form
            noValidate
            onSubmit={submit}
            className="grid gap-8 border border-[#3a2a2c] bg-[#201d1f] p-5 @xl:p-8 @3xl:grid-cols-[1fr_260px]"
          >
            <div className="grid gap-5 @xl:grid-cols-2">
              <div>
                <label htmlFor={`${uid}-date`} className={labelCls}>
                  Date
                </label>
                <input
                  id={`${uid}-date`}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={describedBy("date")}
                  className={input}
                />
                {errorText("date")}
              </div>
              <div>
                <label htmlFor={`${uid}-guests`} className={labelCls}>
                  Guests
                </label>
                <div className="mt-1.5 flex">
                  <button
                    type="button"
                    onClick={() => stepGuests(-1)}
                    aria-label="One fewer guest"
                    className={cn(
                      "grid w-11 shrink-0 place-items-center border border-[#5a4a3f] text-[#e3c98f]",
                      ring,
                    )}
                  >
                    <Minus aria-hidden="true" className="size-4" />
                  </button>
                  <input
                    id={`${uid}-guests`}
                    type="number"
                    inputMode="numeric"
                    min={MIN_GUESTS}
                    max={MAX_GUESTS}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    aria-invalid={Boolean(errors.guests)}
                    aria-describedby={describedBy("guests")}
                    className={cn(input, "mt-0 border-x-0 text-center")}
                  />
                  <button
                    type="button"
                    onClick={() => stepGuests(1)}
                    aria-label="One more guest"
                    className={cn(
                      "grid w-11 shrink-0 place-items-center border border-[#5a4a3f] text-[#e3c98f]",
                      ring,
                    )}
                  >
                    <Plus aria-hidden="true" className="size-4" />
                  </button>
                </div>
                {errorText("guests")}
              </div>
              <fieldset className="@xl:col-span-2" aria-describedby={describedBy("occasion")}>
                <legend className={labelCls}>Occasion</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {occasions.map((o) => (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={occasion === o}
                      onClick={() => setOccasion(o)}
                      className={cn(
                        "border px-3.5 py-1.5 text-sm motion-safe:transition-colors",
                        ring,
                        occasion === o
                          ? "border-[#c8a96a] bg-[#c8a96a] text-[#1b1b1d]"
                          : "border-[#5a4a3f] text-[#f3ece0] hover:border-[#c8a96a]",
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
                {errorText("occasion")}
              </fieldset>
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
              <div className="@xl:col-span-2">
                <label htmlFor={`${uid}-phone`} className={labelCls}>
                  Phone{" "}
                  <span className="normal-case tracking-normal text-[#c9bba8]">(optional)</span>
                </label>
                <input
                  id={`${uid}-phone`}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  className={input}
                />
              </div>
              <div className="@xl:col-span-2">
                <label htmlFor={`${uid}-notes`} className={labelCls}>
                  Notes{" "}
                  <span className="normal-case tracking-normal text-[#c9bba8]">
                    (dietary needs, speeches, timings)
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
            <div className="flex h-fit flex-col gap-4 border border-[#c8a96a]/40 bg-[#1b1b1d] p-5">
              <p className={cn(display, "text-xl")}>Indicative spend</p>
              <label htmlFor={`${uid}-pair`} className="flex items-center gap-3 text-sm">
                <input
                  id={`${uid}-pair`}
                  type="checkbox"
                  checked={withPairing}
                  onChange={(e) => setWithPairing(e.target.checked)}
                  className={cn("size-4 accent-[#c8a96a]", ring)}
                />
                Include wine pairing
              </label>
              <dl className="space-y-2 text-sm" aria-live="polite">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#c9bba8]">Suggested space</dt>
                  <dd className="text-right">{room || "–"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#c9bba8]">Per person</dt>
                  <dd>${MENU_PRICE + (withPairing ? PAIRING_PRICE : 0)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-[#3a2a2c] pt-3">
                  <dt className="text-[#c9bba8]">Minimum spend</dt>
                  <dd className={cn(display, "text-3xl text-[#e3c98f]")}>
                    {estimate ? `$${estimate.toLocaleString("en-AU")}` : "–"}
                  </dd>
                </div>
              </dl>
              <button type="submit" className={goldButton}>
                Send enquiry
              </button>
              <p className="text-xs text-[#c9bba8]">
                No deposit is taken until your event is confirmed.
              </p>
            </div>
          </form>
        )}
      </section>

      {/* Press */}
      <section aria-labelledby={`${uid}-press`} className="border-y border-[#3a2a2c] bg-[#161618]">
        <div className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20">
          <SectionTitle id={`${uid}-press`} eyebrow="Press" title="What they wrote" />
          <div className="grid gap-8 @3xl:grid-cols-3">
            {press.map((p) => (
              <figure key={p.source} className="flex flex-col text-center">
                <blockquote
                  className={cn(display, "flex-1 text-xl italic leading-relaxed text-[#f3ece0]")}
                >
                  “{p.quote}”
                </blockquote>
                <figcaption className="mt-5">
                  <span className="block text-xs uppercase tracking-[0.3em] text-[#e3c98f]">
                    {p.source}
                  </span>
                  <span className="mt-2 inline-block border border-[#5a4a3f] px-2.5 py-0.5 text-xs text-[#c9bba8]">
                    Sample press quote
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Reservations */}
      <section
        ref={reserveRef}
        aria-labelledby={`${uid}-reserve`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-24"
      >
        <SectionTitle
          id={`${uid}-reserve`}
          eyebrow="Reservations"
          title="Reserve a table"
          intro="Bookings open sixty days ahead, released at 10 am each morning."
        />
        <div className="grid gap-6 @3xl:grid-cols-3">
          <div className="border border-[#3a2a2c] bg-[#201d1f] p-6">
            <h4 className="flex items-center gap-2 text-xl font-normal">
              <Clock aria-hidden="true" className="size-5 text-[#c8a96a]" /> Sittings
            </h4>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Dinner", "Wed–Sat, 6 pm – late"],
                ["Last seating", "8:45 pm"],
                ["Lunch", "Fri–Sat, 12 pm – 3 pm"],
                ["Closed", "Sunday to Tuesday"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-3 border-b border-[#3a2a2c] pb-3 last:border-0"
                >
                  <dt className="text-[#c9bba8]">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="border border-[#3a2a2c] bg-[#201d1f] p-6">
            <h4 className="text-xl font-normal">Before you book</h4>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#e6dccb] marker:text-[#c8a96a]">
              <li>Tables of up to five book by phone or email.</li>
              <li>Please share dietary needs 48 hours ahead.</li>
              <li>
                A $50 per person card hold applies; no charge unless you cancel within 24 hours.
              </li>
              <li>Dress code: smart.</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-5 border border-[#c8a96a]/60 bg-[linear-gradient(170deg,#4a0f1c,#2a0d14)] p-6">
            <div>
              <h4 className="text-xl font-normal">Speak to the maître d'</h4>
              <p className="mt-2 text-sm text-[#e6dccb]">
                Phones are answered from 11 am, Wednesday to Saturday.
              </p>
            </div>
            <a href={PHONE_HREF} className={cn(goldButton, "w-full")}>
              <Phone aria-hidden="true" className="size-4" /> Call {PHONE}
            </a>
            <p className="flex items-center gap-2 text-sm text-[#e6dccb]">
              <Mail aria-hidden="true" className="size-4 text-[#e3c98f]" /> {EMAIL}
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#3a2a2c] bg-[#121214]">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm text-[#c9bba8] @3xl:grid-cols-3">
          <div>
            <p className={cn(display, "text-lg uppercase tracking-[0.3em] text-[#f3ece0]")}>
              {design.businessName}
            </p>
            <p className="mt-2">A seasonal tasting menu in a converted printing hall.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#e3c98f]">Hours</p>
            <p className="mt-2">Dinner Wed–Sat from 6 pm</p>
            <p>Lunch Fri–Sat 12 pm – 3 pm · Sun–Tue closed</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#e3c98f]">Find us</p>
            <p className="mt-2 flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#c8a96a]" />{" "}
              {ADDRESS}
            </p>
            <p>
              {PHONE} · {EMAIL}
            </p>
          </div>
        </div>
      </footer>
      <DemoDisclaimer design={design} className="bg-[#121214] text-[#f3ece0]" />
    </DemoRoot>
  );
}
