import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { Clock, Mail, MapPin, Menu, Phone, Scissors, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

const PHONE = "(02) 5550 0142";
const PHONE_HREF = "tel:+61255500142";
const EMAIL = "hello@brassandblade.example";
const STREET = "14 Foundry Lane";
const SUBURB = "Brindlemere NSW";

const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e6c98a]";
const display = "font-[family-name:var(--demo-font-heading)]";

const barbers = [
  {
    id: "elias",
    name: "Elias Varga",
    role: "Owner & head barber",
    years: 14,
    focus: "Classic scissor work, side parts and executive cuts.",
    initials: "EV",
  },
  {
    id: "theo",
    name: "Theo Marchetti",
    role: "Senior barber",
    years: 9,
    focus: "Skin fades, tapers and textured crops.",
    initials: "TM",
  },
  {
    id: "sam",
    name: "Sam Okoro",
    role: "Shave specialist",
    years: 7,
    focus: "Hot towel shaves, beard sculpting and line-ups.",
    initials: "SO",
  },
  {
    id: "rory",
    name: "Rory Quill",
    role: "Barber",
    years: 4,
    focus: "Junior cuts, longer styles and curly hair.",
    initials: "RQ",
  },
] as const;

const services = [
  {
    id: "signature",
    group: "Cuts",
    name: "Signature cut",
    detail: "Consultation, cut, wash and hot towel finish.",
    price: 55,
    mins: 45,
  },
  {
    id: "fade",
    group: "Cuts",
    name: "Skin fade",
    detail: "Foil-shaver fade blended into scissor work on top.",
    price: 60,
    mins: 45,
  },
  {
    id: "long",
    group: "Cuts",
    name: "Long scissor cut",
    detail: "For longer styles, cut dry and finished with product.",
    price: 65,
    mins: 60,
  },
  {
    id: "clipper",
    group: "Cuts",
    name: "Clipper cut & line-up",
    detail: "One length all over with a sharp edge-up.",
    price: 35,
    mins: 20,
  },
  {
    id: "junior",
    group: "Cuts",
    name: "Junior cut (under 12)",
    detail: "Patient, quick and finished with a sticker.",
    price: 35,
    mins: 30,
  },
  {
    id: "beard",
    group: "Beard & shave",
    name: "Beard sculpt",
    detail: "Shape, line and condition, with a hot towel.",
    price: 35,
    mins: 25,
  },
  {
    id: "shave",
    group: "Beard & shave",
    name: "Hot towel shave",
    detail: "Straight razor, two hot towels and a cold finish.",
    price: 55,
    mins: 40,
  },
  {
    id: "cutbeard",
    group: "Packages",
    name: "Cut & beard",
    detail: "Signature cut plus a full beard sculpt.",
    price: 85,
    mins: 70,
  },
  {
    id: "fullbrass",
    group: "Packages",
    name: "The Full Brass",
    detail: "Cut, hot towel shave, scalp massage and an espresso.",
    price: 120,
    mins: 90,
  },
] as const;

const serviceGroups = ["Cuts", "Beard & shave", "Packages"] as const;

const days = [
  { id: "tue", short: "Tue", long: "Tuesday", open: 9, close: 19 },
  { id: "wed", short: "Wed", long: "Wednesday", open: 9, close: 19 },
  { id: "thu", short: "Thu", long: "Thursday", open: 9, close: 20 },
  { id: "fri", short: "Fri", long: "Friday", open: 9, close: 19 },
  { id: "sat", short: "Sat", long: "Saturday", open: 8, close: 16 },
  { id: "sun", short: "Sun", long: "Sunday", open: 10, close: 15 },
] as const;

const reviews = [
  {
    name: "Daniel K.",
    text: "Elias spent ten minutes asking what I actually wanted before he picked up the scissors. Best cut I've had in years.",
  },
  {
    name: "Hamish R.",
    text: "The hot towel shave is the best forty minutes of my month. I book the next one before I leave the chair.",
  },
  {
    name: "Michael T.",
    text: "Took my son for his first proper cut. Rory was patient and funny, and the fade is spotless.",
  },
] as const;

type Field = "service" | "day" | "time" | "name" | "phone";
type Errors = Partial<Record<Field, string>>;

function formatTime(total: number) {
  const h24 = Math.floor(total / 60);
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(total % 60).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
}

function hourLabel(h: number) {
  return `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "am" : "pm"}`;
}

// Deterministic "already booked" slots so the demo looks like a busy book without a server.
function isBooked(barberId: string, dayId: string, start: number) {
  let n = start / 60;
  for (const ch of barberId + dayId) n += ch.charCodeAt(0);
  return barberId === "any" ? n % 7 === 0 : n % 3 === 0;
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
    <div className="mb-8 max-w-2xl">
      <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a45c]">
        <span aria-hidden="true" className="h-px w-8 bg-[#c9a45c]" />
        {eyebrow}
      </p>
      <h3 id={id} className="mt-3 text-3xl font-normal leading-tight text-[#f5eee2] @3xl:text-4xl">
        {title}
      </h3>
      {intro ? <p className="mt-3 text-[#b3a996]">{intro}</p> : null}
    </div>
  );
}

function Emblem({ uid }: { uid: string }) {
  const grad = `${uid}-brass`;
  const path = `${uid}-ring`;
  return (
    <svg viewBox="0 0 240 240" aria-hidden="true" className="h-full w-full">
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d79d" />
          <stop offset="0.5" stopColor="#c9a45c" />
          <stop offset="1" stopColor="#7d5f2c" />
        </linearGradient>
        <path id={path} d="M120,120 m-90,0 a90,90 0 1,1 180,0 a90,90 0 1,1 -180,0" />
      </defs>
      <circle cx="120" cy="120" r="116" fill="none" stroke={`url(#${grad})`} strokeWidth="2" />
      <circle cx="120" cy="120" r="106" fill="#1a1815" stroke={`url(#${grad})`} strokeWidth="1" />
      <circle
        cx="120"
        cy="120"
        r="72"
        fill="none"
        stroke="#c9a45c"
        strokeOpacity="0.5"
        strokeDasharray="2 5"
      />
      <text fill={`url(#${grad})`} fontSize="12.5" letterSpacing="4.2" fontFamily="Georgia, serif">
        <textPath href={`#${path}`}>BRASS &amp; BLADE · BARBER CO. · EST. 2012 · </textPath>
      </text>
      <g transform="rotate(-38 120 120)">
        <path d="M68 112 h62 l6 8 l-6 8 h-62 a8 8 0 0 1 0 -16 z" fill={`url(#${grad})`} />
        <rect
          x="136"
          y="115"
          width="44"
          height="10"
          rx="5"
          fill="#2a241c"
          stroke={`url(#${grad})`}
        />
      </g>
      <g transform="rotate(38 120 120)" fill="none" stroke={`url(#${grad})`} strokeWidth="3">
        <path d="M66 120 h108" strokeLinecap="round" />
        {[78, 90, 102, 114, 126, 138, 150, 162].map((x) => (
          <path key={x} d={`M${x} 120 v12`} strokeWidth="2" />
        ))}
      </g>
      <circle cx="120" cy="120" r="5" fill="#c9a45c" />
    </svg>
  );
}

export function BarbershopDemo({ design }: DemoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [menuOpen, setMenuOpen] = useState(false);
  const barbersRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const bookingRef = useRef<HTMLElement>(null);
  const hoursRef = useRef<HTMLElement>(null);

  const [barberId, setBarberId] = useState<string>("any");
  const [serviceId, setServiceId] = useState("");
  const [dayId, setDayId] = useState("");
  const [time, setTime] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const service = services.find((s) => s.id === serviceId);
  const day = days.find((d) => d.id === dayId);
  const barber = barbers.find((b) => b.id === barberId);
  const slots = day
    ? Array.from({ length: day.close - day.open }, (_, i) => (day.open + i) * 60)
    : [];
  const fits = (start: number, mins: number, close: number) => start + mins <= close * 60;

  const go = (ref: RefObject<HTMLElement | null>) => {
    setMenuOpen(false);
    ref.current?.scrollIntoView({ block: "nearest" });
  };

  const nav = [
    { label: "Barbers", ref: barbersRef },
    { label: "Services", ref: servicesRef },
    { label: "Book", ref: bookingRef },
    { label: "Hours", ref: hoursRef },
  ] as const;

  const clearError = (field: Field) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  function chooseBarber(id: string) {
    setBarberId(id);
    if (day && time !== null && isBooked(id, day.id, time)) setTime(null);
  }
  function chooseService(id: string) {
    setServiceId(id);
    const next = services.find((s) => s.id === id);
    if (day && next && time !== null && !fits(time, next.mins, day.close)) setTime(null);
    clearError("service");
  }
  function chooseDay(id: string) {
    setDayId(id);
    setTime(null);
    clearError("day");
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    if (!service) next.service = "Choose a service.";
    if (!day) next.day = "Choose a day.";
    else if (time === null) next.time = "Choose a time.";
    if (!name.trim()) next.name = "Enter your name.";
    if (phone.replace(/\D/g, "").length < 8) next.phone = "Enter a mobile number we can text.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  function reset() {
    setBarberId("any");
    setServiceId("");
    setDayId("");
    setTime(null);
    setName("");
    setPhone("");
    setNotes("");
    setErrors({});
    setSent(false);
  }

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3.5 py-1.5 text-sm motion-safe:transition-colors",
      ring,
      active
        ? "border-[#c9a45c] bg-[#c9a45c] text-[#141414]"
        : "border-[#3a352d] bg-[#1f1d1a] text-[#efe6d6] hover:border-[#c9a45c]",
    );
  const input = cn(
    "mt-1.5 w-full rounded-md border border-[#3a352d] bg-[#141414] px-3 py-2.5 text-[#efe6d6] [color-scheme:dark] placeholder:text-[#8a8274]",
    ring,
  );
  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`${uid}-${field}-err`} className="mt-1.5 text-sm text-[#f0a58f]">
        {errors[field]}
      </p>
    ) : null;
  const describedBy = (field: Field) => (errors[field] ? `${uid}-${field}-err` : undefined);

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.sansHumanist, heading: demoFonts.serifClassic }}
      className="bg-[#141414] text-[#efe6d6]"
    >
      <header className="relative z-10 border-b border-[#2e2a24] bg-[#141414]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-[#c9a45c] bg-[radial-gradient(circle_at_30%_30%,#3a3020,#141414)]"
            >
              <Scissors className="size-4 text-[#c9a45c]" />
            </span>
            <p
              className={cn(display, "truncate text-base tracking-wide text-[#f5eee2] @xl:text-lg")}
            >
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
                  "rounded px-3 py-2 text-sm uppercase tracking-[0.18em] text-[#cfc5b3] hover:text-[#c9a45c]",
                  ring,
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={PHONE_HREF}
              className={cn(
                "hidden items-center gap-2 rounded-full bg-[#c9a45c] px-4 py-2 text-sm font-semibold text-[#141414] hover:bg-[#d8b672] @xl:inline-flex",
                ring,
              )}
            >
              <Phone aria-hidden="true" className="size-4" />
              {PHONE}
            </a>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls={`${uid}-menu`}
              onClick={() => setMenuOpen((o) => !o)}
              className={cn(
                "grid size-10 place-items-center rounded-full border border-[#3a352d] @3xl:hidden",
                ring,
              )}
            >
              {menuOpen ? (
                <X aria-hidden="true" className="size-5" />
              ) : (
                <Menu aria-hidden="true" className="size-5" />
              )}
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </div>
        <nav
          id={`${uid}-menu`}
          aria-label="Demo site menu"
          hidden={!menuOpen}
          className="border-t border-[#2e2a24] px-5 pb-4 @3xl:hidden"
        >
          <ul className="grid grid-cols-2 gap-2 pt-3">
            {nav.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => go(item.ref)}
                  className={cn(
                    "w-full rounded-md border border-[#2e2a24] bg-[#1f1d1a] px-3 py-2.5 text-left text-sm uppercase tracking-[0.18em]",
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
        className="relative overflow-hidden border-b border-[#2e2a24]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_10%,rgba(201,164,92,0.22),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(120,80,40,0.28),transparent_60%),linear-gradient(180deg,#1b1916,#141414)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.025)_0px,rgba(255,255,255,0.025)_1px,transparent_1px,transparent_5px)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 @3xl:grid-cols-[1.2fr_1fr] @3xl:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#c9a45c]">
              {SUBURB} · Est. 2012
            </p>
            <h2
              id={`${uid}-hero`}
              className="mt-5 text-4xl font-normal leading-[1.08] text-[#f5eee2] @xl:text-5xl @5xl:text-6xl"
            >
              Sharp cuts, hot towels and an <em className="text-[#c9a45c]">honest</em> chair.
            </h2>
            <p className="mt-5 max-w-xl text-lg text-[#c2b8a5]">
              Four barbers, one long brass-trimmed room and no rush. Book your barber, your service
              and your time in under a minute.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => go(bookingRef)}
                className={cn(
                  "rounded-full bg-[#c9a45c] px-6 py-3 font-semibold text-[#141414] hover:bg-[#d8b672] motion-safe:transition-colors",
                  ring,
                )}
              >
                Request an appointment
              </button>
              <a
                href={PHONE_HREF}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-[#c9a45c] px-6 py-3 font-semibold text-[#e6c98a] hover:bg-[#c9a45c]/10",
                  ring,
                )}
              >
                <Phone aria-hidden="true" className="size-4" />
                Call {PHONE}
              </a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-[#3a352d] pt-6">
              {[
                ["4", "Barbers"],
                ["14 yrs", "Head barber"],
                ["$35", "Cuts from"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#a89f90]">{l}</dt>
                  <dd className={cn(display, "mt-1 text-2xl text-[#e6c98a]")}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mx-auto w-56 @xl:w-72 @5xl:w-80">
            <Emblem uid={uid} />
          </div>
        </div>
      </section>

      {/* Barbers */}
      <section
        ref={barbersRef}
        aria-labelledby={`${uid}-barbers`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-barbers`}
          eyebrow="The barbers"
          title="Pick your chair"
          intro="Every barber does every cut. These are the ones they're known for."
        />
        <div className="grid gap-5 @xl:grid-cols-2 @5xl:grid-cols-4">
          {barbers.map((b) => (
            <article
              key={b.id}
              className="flex flex-col overflow-hidden rounded-lg border border-[#2e2a24] bg-[#1f1d1a]"
            >
              <div
                aria-hidden="true"
                className="relative grid h-40 place-items-center bg-[radial-gradient(circle_at_50%_35%,#3d3222,#1a1815_70%)]"
              >
                <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(135deg,#7d2a22_0px,#7d2a22_8px,#efe6d6_8px,#efe6d6_16px,#2a3a5c_16px,#2a3a5c_24px,#efe6d6_24px,#efe6d6_32px)] opacity-80" />
                <span
                  className={cn(
                    display,
                    "grid size-24 place-items-center rounded-full border border-[#c9a45c] bg-[#141414] text-3xl text-[#e6c98a] shadow-[0_0_0_6px_rgba(201,164,92,0.12)]",
                  )}
                >
                  {b.initials}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h4 className="text-xl font-normal text-[#f5eee2]">{b.name}</h4>
                <p className="text-xs uppercase tracking-[0.2em] text-[#c9a45c]">{b.role}</p>
                <p className="mt-3 flex-1 text-sm text-[#b3a996]">{b.focus}</p>
                <p className="mt-3 text-sm text-[#a89f90]">{b.years} years behind the chair</p>
                <button
                  type="button"
                  onClick={() => {
                    chooseBarber(b.id);
                    go(bookingRef);
                  }}
                  className={cn(
                    "mt-4 rounded-full border border-[#c9a45c] px-4 py-2 text-sm font-semibold text-[#e6c98a] hover:bg-[#c9a45c] hover:text-[#141414] motion-safe:transition-colors",
                    ring,
                  )}
                >
                  Book with {b.name.split(" ")[0]}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Services & pricing */}
      <section
        ref={servicesRef}
        aria-labelledby={`${uid}-services`}
        className="border-y border-[#2e2a24] bg-[#1a1815]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20">
          <SectionTitle
            id={`${uid}-services`}
            eyebrow="Services & pricing"
            title="The price list"
            intro="Every cut finishes with a hot towel and a style. Card or cash, and no surprises at the counter."
          />
          <div className="grid gap-10 @3xl:grid-cols-2 @5xl:grid-cols-3">
            {serviceGroups.map((group) => (
              <div key={group}>
                <h4 className="border-b border-[#3a352d] pb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a45c]">
                  {group}
                </h4>
                <ul className="mt-2 divide-y divide-[#2e2a24]">
                  {services
                    .filter((s) => s.group === group)
                    .map((s) => (
                      <li key={s.id} className="py-4">
                        <div className="flex items-baseline gap-2">
                          <span className={cn(display, "text-lg text-[#f5eee2]")}>{s.name}</span>
                          <span
                            aria-hidden="true"
                            className="mb-1 flex-1 border-b border-dotted border-[#5a5246]"
                          />
                          <span className={cn(display, "text-lg text-[#e6c98a]")}>${s.price}</span>
                        </div>
                        <p className="mt-1 text-sm text-[#b3a996]">{s.detail}</p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-1.5 text-[#a89f90]">
                            <Clock aria-hidden="true" className="size-3.5" /> {s.mins} min
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              chooseService(s.id);
                              go(bookingRef);
                            }}
                            className={cn(
                              "rounded px-2 py-1 font-semibold text-[#e6c98a] underline underline-offset-4 hover:text-[#f0d79d]",
                              ring,
                            )}
                          >
                            Book this<span className="sr-only">: {s.name}</span>
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment request */}
      <section
        ref={bookingRef}
        aria-labelledby={`${uid}-book`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-book`}
          eyebrow="Appointment request"
          title="Request your appointment"
          intro="Choose a barber, a service and a time. We'll text to confirm within the hour."
        />
        {sent ? (
          <DemoSent
            title="Appointment request received"
            onReset={reset}
            className="border border-[#3a352d] bg-[#1f1d1a] text-[#efe6d6]"
          />
        ) : (
          <form
            noValidate
            onSubmit={submit}
            className="grid gap-6 @3xl:grid-cols-[1fr_300px] @5xl:grid-cols-[1fr_340px]"
          >
            <div className="space-y-7 rounded-lg border border-[#2e2a24] bg-[#1f1d1a] p-5 @xl:p-7">
              <fieldset>
                <legend className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a45c]">
                  1. Barber
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[{ id: "any", name: "Any barber" }, ...barbers].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      aria-pressed={barberId === b.id}
                      onClick={() => chooseBarber(b.id)}
                      className={chip(barberId === b.id)}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div>
                <label
                  htmlFor={`${uid}-service`}
                  className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a45c]"
                >
                  2. Service
                </label>
                <select
                  id={`${uid}-service`}
                  value={serviceId}
                  onChange={(e) => chooseService(e.target.value)}
                  aria-invalid={Boolean(errors.service)}
                  aria-describedby={describedBy("service")}
                  className={input}
                >
                  <option value="">Choose a service</option>
                  {serviceGroups.map((group) => (
                    <optgroup key={group} label={group}>
                      {services
                        .filter((s) => s.group === group)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} · ${s.price} · {s.mins} min
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                {errorText("service")}
              </div>
              <fieldset aria-describedby={describedBy("day")}>
                <legend className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a45c]">
                  3. Day
                </legend>
                <div className="mt-3 grid grid-cols-3 gap-2 @xl:grid-cols-6">
                  {days.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      aria-pressed={dayId === d.id}
                      onClick={() => chooseDay(d.id)}
                      className={cn(chip(dayId === d.id), "rounded-md")}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[#a89f90]">Closed Mondays.</p>
                {errorText("day")}
              </fieldset>
              <fieldset aria-describedby={describedBy("time")}>
                <legend className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a45c]">
                  4. Time
                </legend>
                {day ? (
                  <div className="mt-3 grid grid-cols-3 gap-2 @xl:grid-cols-4 @5xl:grid-cols-6">
                    {slots.map((t) => {
                      const booked = isBooked(barberId, day.id, t);
                      const late = service ? !fits(t, service.mins, day.close) : false;
                      const unavailable = booked || late;
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={unavailable}
                          aria-pressed={time === t}
                          onClick={() => {
                            setTime(t);
                            clearError("time");
                          }}
                          className={cn(
                            chip(time === t),
                            "rounded-md px-2 disabled:cursor-not-allowed disabled:border-[#2a2722] disabled:bg-transparent disabled:text-[#6f685c] disabled:line-through",
                          )}
                        >
                          {formatTime(t)}
                          {unavailable ? (
                            <span className="sr-only">
                              {booked ? " (booked)" : " (too close to closing)"}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#a89f90]">Choose a day to see open times.</p>
                )}
                {errorText("time")}
              </fieldset>
              <div className="grid gap-4 @xl:grid-cols-2">
                <div>
                  <label htmlFor={`${uid}-name`} className="text-sm font-semibold text-[#efe6d6]">
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
                  <label htmlFor={`${uid}-phone`} className="text-sm font-semibold text-[#efe6d6]">
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
                  <label htmlFor={`${uid}-notes`} className="text-sm font-semibold text-[#efe6d6]">
                    Anything we should know?{" "}
                    <span className="font-normal text-[#a89f90]">(optional)</span>
                  </label>
                  <textarea
                    id={`${uid}-notes`}
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={input}
                  />
                </div>
              </div>
            </div>

            <aside
              aria-label="Appointment summary"
              className="h-fit rounded-lg border border-[#c9a45c]/40 bg-[linear-gradient(160deg,#2a241b,#1a1815)] p-5 @xl:p-6"
            >
              <p className={cn(display, "text-2xl text-[#f5eee2]")}>Your appointment</p>
              <dl className="mt-4 space-y-3 text-sm" aria-live="polite">
                {[
                  ["Barber", barber ? barber.name : "Any available barber"],
                  ["Service", service ? service.name : "Not chosen yet"],
                  [
                    "When",
                    day
                      ? time !== null
                        ? `${day.long}, ${formatTime(time)}`
                        : `${day.long}, time to choose`
                      : "Not chosen yet",
                  ],
                  [
                    "Duration",
                    service
                      ? `${service.mins} min${time !== null ? `, finishing ${formatTime(time + service.mins)}` : ""}`
                      : "–",
                  ],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between gap-4 border-b border-[#3a352d] pb-3"
                  >
                    <dt className="text-[#a89f90]">{k}</dt>
                    <dd className="text-right text-[#efe6d6]">{v}</dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-4 pt-1">
                  <dt className="text-[#a89f90]">Price</dt>
                  <dd className={cn(display, "text-3xl text-[#e6c98a]")}>
                    {service ? `$${service.price}` : "$0"}
                  </dd>
                </div>
              </dl>
              <button
                type="submit"
                className={cn(
                  "mt-6 w-full rounded-full bg-[#c9a45c] px-5 py-3 font-semibold text-[#141414] hover:bg-[#d8b672] motion-safe:transition-colors",
                  ring,
                )}
              >
                Request appointment
              </button>
              <p className="mt-3 text-xs text-[#a89f90]">
                Pay in the shop. Free to cancel up to 4 hours before.
              </p>
            </aside>
          </form>
        )}
      </section>

      {/* Reviews */}
      <section
        aria-labelledby={`${uid}-reviews`}
        className="border-y border-[#2e2a24] bg-[#1a1815]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20">
          <SectionTitle id={`${uid}-reviews`} eyebrow="Reviews" title="From the chair" />
          <div className="grid gap-5 @3xl:grid-cols-3">
            {reviews.map((r) => (
              <figure
                key={r.name}
                className="flex flex-col rounded-lg border border-[#2e2a24] bg-[#141414] p-6"
              >
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className="size-4 fill-[#c9a45c] text-[#c9a45c]"
                    />
                  ))}
                  <span className="sr-only">Rated 5 out of 5</span>
                </div>
                <blockquote
                  className={cn(display, "mt-4 flex-1 text-lg leading-relaxed text-[#efe6d6]")}
                >
                  “{r.text}”
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#e6c98a]">{r.name}</span>
                  <span className="rounded-full border border-[#3a352d] px-2.5 py-0.5 text-xs text-[#a89f90]">
                    Sample review
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Hours */}
      <section
        ref={hoursRef}
        aria-labelledby={`${uid}-hours`}
        className="mx-auto max-w-6xl px-5 py-16 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-hours`}
          eyebrow="Hours"
          title="Walk-ins welcome, bookings preferred"
        />
        <div className="grid gap-6 @3xl:grid-cols-2">
          <dl className="rounded-lg border border-[#2e2a24] bg-[#1f1d1a] p-5 @xl:p-7">
            <div className="flex justify-between border-b border-[#2e2a24] py-3">
              <dt>Monday</dt>
              <dd className="text-[#a89f90]">Closed</dd>
            </div>
            {days.map((d) => (
              <div
                key={d.id}
                className="flex justify-between border-b border-[#2e2a24] py-3 last:border-0"
              >
                <dt>{d.long}</dt>
                <dd className="text-[#e6c98a]">
                  {hourLabel(d.open)} – {hourLabel(d.close)}
                  {d.id === "thu" ? (
                    <span className="ml-2 text-xs text-[#a89f90]">late night</span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
          <div className="overflow-hidden rounded-lg border border-[#2e2a24] bg-[#1f1d1a]">
            <svg viewBox="0 0 400 180" aria-hidden="true" className="h-44 w-full bg-[#181613]">
              <g stroke="#2e2a24" strokeWidth="14" fill="none">
                <path d="M0 60 H400" />
                <path d="M0 140 H400" />
                <path d="M120 0 V180" />
                <path d="M300 0 V180" />
              </g>
              <path d="M0 100 H400" stroke="#3a352d" strokeWidth="6" strokeDasharray="10 8" />
              <rect x="180" y="72" width="70" height="20" rx="3" fill="#2a241b" stroke="#c9a45c" />
              <circle cx="215" cy="58" r="10" fill="#c9a45c" />
              <path d="M215 68 L209 58 H221 Z" fill="#c9a45c" />
              <text x="20" y="52" fill="#8a8274" fontSize="11" letterSpacing="2">
                FOUNDRY LANE
              </text>
              <text x="310" y="170" fill="#8a8274" fontSize="11" letterSpacing="2">
                MILL ST
              </text>
            </svg>
            <div className="space-y-3 p-5 text-sm @xl:p-7">
              <p className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#c9a45c]" />
                {STREET}, {SUBURB}. Two-hour parking on Mill Street.
              </p>
              <a
                href={PHONE_HREF}
                className={cn("flex w-fit items-center gap-3 rounded hover:text-[#e6c98a]", ring)}
              >
                <Phone aria-hidden="true" className="size-4 shrink-0 text-[#c9a45c]" />
                {PHONE}
              </a>
              <p className="flex items-center gap-3">
                <Mail aria-hidden="true" className="size-4 shrink-0 text-[#c9a45c]" />
                {EMAIL}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#2e2a24] bg-[#0f0f0f]">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm text-[#b3a996] @3xl:grid-cols-3">
          <div>
            <p className={cn(display, "text-lg text-[#f5eee2]")}>{design.businessName}</p>
            <p className="mt-2">
              Traditional barbering, modern fades and the best hot towel shave in{" "}
              {SUBURB.replace(" NSW", "")}.
            </p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-[#c9a45c]">Hours</p>
            <p className="mt-2">Tue–Fri 9 am – 7 pm (Thu till 8 pm)</p>
            <p>Sat 8 am – 4 pm · Sun 10 am – 3 pm · Mon closed</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-[#c9a45c]">Visit</p>
            <p className="mt-2">
              {STREET}, {SUBURB}
            </p>
            <p>
              {PHONE} · {EMAIL}
            </p>
          </div>
        </div>
      </footer>
      <DemoDisclaimer design={design} className="bg-[#0f0f0f] text-[#b3a996]" />
    </DemoRoot>
  );
}
