import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5a1f]";
const fieldClass = cn(
  "w-full rounded-lg border border-[#3a414c] bg-[#0b0d10] px-3 py-2.5 text-[#f4f5f7] [color-scheme:dark] placeholder:text-[#7d8591] aria-[invalid=true]:border-[#ff8a66]",
  focusRing,
);

const packages = [
  {
    id: "express",
    name: "Express",
    price: 149,
    time: "About 2 hours",
    blurb: "A proper hand wash for cars that are already in good shape.",
    popular: false,
    includes: [
      "Snow foam and two-bucket hand wash",
      "Wheels, tyres and arches cleaned",
      "Interior vacuum and wipe-down",
      "Spray sealant, about 4 weeks of protection",
    ],
  },
  {
    id: "signature",
    name: "Signature",
    price: 329,
    time: "About 5 hours",
    blurb: "Our most booked detail: a one-stage polish that brings the depth back.",
    popular: true,
    includes: [
      "Everything in Express",
      "Clay bar and iron decontamination",
      "One-stage machine polish",
      "Interior steam clean and leather wipe",
      "Six-month paint sealant",
    ],
  },
  {
    id: "ceramic",
    name: "Ceramic",
    price: 899,
    time: "1 to 2 days",
    blurb: "Two-stage paint correction, locked in with a five-year ceramic coating.",
    popular: false,
    includes: [
      "Everything in Signature",
      "Two-stage paint correction",
      "Five-year ceramic coating on paint",
      "Glass and wheel faces coated",
      "12 months of maintenance washes",
    ],
  },
] as const;
type PackageId = (typeof packages)[number]["id"];

const sizes = [
  { id: "small", label: "Hatch or sedan", surcharge: 0 },
  { id: "suv", label: "SUV or wagon", surcharge: 40 },
  { id: "large", label: "4WD, ute or van", surcharge: 80 },
] as const;
type SizeId = (typeof sizes)[number]["id"];

const addOns = [
  {
    id: "headlights",
    name: "Headlight restoration",
    price: 79,
    note: "Sand, polish and UV-seal both lenses",
  },
  {
    id: "engine",
    name: "Engine bay detail",
    price: 69,
    note: "Degrease, rinse and dress the plastics",
  },
  {
    id: "pet-hair",
    name: "Pet hair removal",
    price: 45,
    note: "Rubber-brush and vacuum every seat",
  },
  {
    id: "leather",
    name: "Leather clean and condition",
    price: 59,
    note: "pH-neutral clean, matte conditioner",
  },
  { id: "wheels", name: "Wheel face ceramic", price: 129, note: "Brake dust rinses straight off" },
  { id: "odour", name: "Odour treatment", price: 49, note: "Steam, then an enzyme fog overnight" },
] as const;
type AddOnId = (typeof addOns)[number]["id"];

const reviews = [
  {
    name: "Liam K.",
    detail: "Signature, SUV",
    rating: 5,
    text: "Three years of beach car parks and school runs, gone. It honestly looks better than the day I picked it up.",
  },
  {
    name: "Aisha M.",
    detail: "Ceramic",
    rating: 5,
    text: "The paint correction took out swirls I'd stopped noticing. Six months on, rain still beads straight off the bonnet.",
  },
  {
    name: "Tom W.",
    detail: "Express, mobile",
    rating: 4,
    text: "They came to my work car park, finished inside two hours and sent a text when it was done. Easy.",
  },
] as const;

const serviceArea = [
  "Varden Heights",
  "Kestrel Point",
  "Ostler Bay",
  "Quillon Park",
  "Tamsin Vale",
  "Corrowind",
] as const;

const aud = (n: number) => `$${n.toLocaleString("en-AU")}`;

// ---- Before/after car illustration ---------------------------------------------------------------

const BODY =
  "M80 270 C68 266 62 252 64 236 C66 214 74 202 96 196 L156 184 C214 140 268 118 336 112 C410 106 470 110 512 126 C548 140 574 158 596 174 L700 186 C736 190 752 204 756 224 L758 252 C758 264 750 270 738 270 L660 270 A60 60 0 0 0 540 270 L270 270 A60 60 0 0 0 150 270 Z";
const GLASS =
  "M186 184 C232 146 282 128 338 124 C404 119 456 122 494 136 C524 148 548 162 566 177 Z";
const DOOR = "M262 190 L552 182 C548 214 542 244 538 266 L274 268 C270 240 266 214 262 190 Z";
const SPARKLE = "M0 -12 L2.4 -2.4 L12 0 L2.4 2.4 L0 12 L-2.4 2.4 L-12 0 L-2.4 -2.4 Z";

const waterSpots = [
  [180, 214, 5],
  [236, 232, 4],
  [300, 205, 6],
  [352, 246, 3.5],
  [430, 222, 5],
  [468, 248, 4],
  [520, 210, 3],
  [610, 214, 5.5],
  [662, 200, 4],
  [700, 226, 3.5],
  [132, 236, 4],
  [268, 160, 3],
  [376, 150, 4.5],
  [452, 140, 3],
  [720, 240, 5],
] as const;
const swirlCentres = [
  [430, 190],
  [646, 210],
  [238, 206],
] as const;
const swirlRadii = [12, 24, 36, 48, 60, 72] as const;
const sparkles = [
  [360, 132, 1],
  [646, 192, 0.8],
  [232, 168, 0.6],
] as const;

function CarScene({ variant, idPrefix }: { variant: "before" | "after"; idPrefix: string }) {
  const p = `${idPrefix}-${variant}`;
  const glossy = variant === "after";
  const url = (name: string) => `url(#${p}-${name})`;
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className="block size-full"
      aria-hidden="true"
      focusable="false"
      style={{
        filter: glossy
          ? "saturate(1.25) contrast(1.06)"
          : "saturate(0.22) brightness(0.72) contrast(0.82) sepia(0.18)",
      }}
    >
      <defs>
        <radialGradient id={`${p}-bg`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#2c323c" />
          <stop offset="55%" stopColor="#13161b" />
          <stop offset="100%" stopColor="#08090b" />
        </radialGradient>
        <linearGradient id={`${p}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b1f26" />
          <stop offset="100%" stopColor="#0a0b0d" />
        </linearGradient>
        <linearGradient id={`${p}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9a5c" />
          <stop offset="30%" stopColor="#ff5a1f" />
          <stop offset="62%" stopColor="#c4300b" />
          <stop offset="100%" stopColor="#4d0e04" />
        </linearGradient>
        <linearGradient id={`${p}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5d6b7d" />
          <stop offset="45%" stopColor="#1c232d" />
          <stop offset="100%" stopColor="#0a0d12" />
        </linearGradient>
        <linearGradient id={`${p}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3f5f8" />
          <stop offset="50%" stopColor="#8a929d" />
          <stop offset="100%" stopColor="#d8dce2" />
        </linearGradient>
        <linearGradient id={`${p}-streak`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${p}-film`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b5236" stopOpacity="0" />
          <stop offset="100%" stopColor="#5a4128" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id={`${p}-shadow`}>
          <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${p}-mirror`} maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="400">
          <rect x="0" y="332" width="800" height="68" fill={url("fade")} />
        </mask>
        <clipPath id={`${p}-body`}>
          <path d={BODY} />
        </clipPath>
      </defs>

      <rect width="800" height="400" fill={url("bg")} />
      <rect x="0" y="300" width="800" height="100" fill={url("floor")} />
      <rect x="250" y="34" width="300" height="5" rx="2.5" fill="#ffffff" opacity="0.55" />
      <ellipse cx="404" cy="332" rx="372" ry="18" fill={url("shadow")} />

      <g id={`${p}-car`}>
        <path d={BODY} fill={url("paint")} />
        <path d={GLASS} fill={url("glass")} />
        <path d="M398 120 L412 119 L407 183 L393 184 Z" fill="#1a0b06" />
        <path d={DOOR} fill="none" stroke="#2a0a03" strokeOpacity="0.55" strokeWidth="2" />
        <rect x="474" y="198" width="34" height="6" rx="3" fill="#2a0a03" opacity="0.7" />
        <path
          d="M96 208 C260 198 520 194 744 206"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.22"
          strokeWidth="2"
        />
        <path d="M270 258 L540 256 L540 270 L270 270 Z" fill="#14161a" />
        <path
          d="M556 176 C560 164 576 158 590 162 L592 176 C580 180 566 180 556 176 Z"
          fill={url("paint")}
          stroke="#2a0a03"
          strokeOpacity="0.4"
        />
        <path
          d="M708 198 C730 200 746 206 752 216 L749 222 C732 218 716 212 704 205 Z"
          fill="#eaf4ff"
        />
        <path d="M66 224 C70 211 80 203 98 199 L102 207 C88 213 77 221 71 230 Z" fill="#ff2d1a" />
        <path d="M716 246 L752 244 L752 258 L722 260 Z" fill="#111317" />
        {[210, 600].map((cx) => (
          <g key={cx} transform={`translate(${cx} 280)`}>
            <circle r="52" fill="#0b0c0e" />
            <circle r="45" fill="none" stroke="#23262b" strokeWidth="4" />
            <circle r="37" fill="#16191d" />
            <rect x="-31" y="-15" width="11" height="30" rx="4" fill="#ff5a1f" />
            {[0, 72, 144, 216, 288].map((a) => (
              <path
                key={a}
                d="M-4 -8 L-6 -35 L6 -35 L4 -8 Z"
                fill={url("rim")}
                transform={`rotate(${a})`}
              />
            ))}
            <circle r="37" fill="none" stroke={url("rim")} strokeWidth="3" />
            <circle r="9" fill={url("rim")} />
            <circle r="3" fill="#16191d" />
          </g>
        ))}
      </g>

      {glossy ? (
        <>
          <g mask={url("mirror")} opacity="0.6">
            <use href={`#${p}-car`} transform="matrix(1 0 0 -1 0 664)" />
          </g>
          <g clipPath={url("body")}>
            <rect
              x="60"
              y="146"
              width="700"
              height="10"
              fill={url("streak")}
              opacity="0.75"
              transform="rotate(-1.2 400 150)"
            />
            <polygon points="318,96 356,96 262,284 224,284" fill="#ffffff" opacity="0.16" />
            <polygon points="372,96 384,96 290,284 278,284" fill="#ffffff" opacity="0.3" />
            <polygon points="604,96 650,96 572,284 526,284" fill="#ffffff" opacity="0.12" />
            <rect x="80" y="222" width="680" height="3" fill={url("streak")} opacity="0.4" />
          </g>
          {sparkles.map(([x, y, s]) => (
            <path
              key={`${x}-${y}`}
              d={SPARKLE}
              transform={`translate(${x} ${y}) scale(${s})`}
              fill="#ffffff"
            />
          ))}
        </>
      ) : (
        <>
          <g clipPath={url("body")}>
            <rect x="0" y="100" width="800" height="180" fill="#b9ab92" opacity="0.16" />
            <rect x="0" y="210" width="800" height="64" fill={url("film")} />
            <ellipse cx="300" cy="252" rx="34" ry="10" fill="#4a3520" opacity="0.55" />
            <ellipse cx="520" cy="250" rx="28" ry="9" fill="#4a3520" opacity="0.5" />
            <ellipse cx="700" cy="250" rx="40" ry="12" fill="#4a3520" opacity="0.45" />
            {swirlCentres.map(([cx, cy]) =>
              swirlRadii.map((r) => (
                <circle
                  key={`${cx}-${r}`}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.16"
                  strokeWidth="1"
                />
              )),
            )}
            {waterSpots.map(([x, y, r]) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r={r}
                fill="#ffffff"
                fillOpacity="0.08"
                stroke="#ffffff"
                strokeOpacity="0.4"
                strokeWidth="1"
              />
            ))}
          </g>
          {[210, 600].map((cx) => (
            <circle key={cx} cx={cx} cy={280} r={37} fill="#4a3826" opacity="0.5" />
          ))}
        </>
      )}
    </svg>
  );
}

const grime = [
  "radial-gradient(ellipse 30% 22% at 24% 80%, rgba(96,72,44,0.5), transparent 70%)",
  "radial-gradient(ellipse 26% 20% at 76% 80%, rgba(96,72,44,0.45), transparent 70%)",
  "radial-gradient(ellipse 70% 30% at 50% 96%, rgba(70,54,36,0.5), transparent 70%)",
  "radial-gradient(circle at 38% 36%, rgba(170,160,140,0.14), transparent 45%)",
  "linear-gradient(180deg, rgba(160,150,130,0.06), rgba(120,100,70,0.12))",
].join(", ");

function BeforeAfterSlider() {
  const [after, setAfter] = useState(50);
  const dragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const prefix = `ag${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const rangeId = `${prefix}-range`;

  const setFromClientX = (clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const pct = Math.round(((clientX - rect.left) / rect.width) * 100);
    setAfter(Math.min(100, Math.max(0, pct)));
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div>
      <div
        ref={frameRef}
        role="img"
        aria-label={`Illustration of the same car before and after paint correction, showing ${after}% after`}
        className="relative aspect-[2/1] w-full cursor-ew-resize touch-pan-y overflow-hidden rounded-2xl border border-[#2a3039] bg-[#08090b] select-none"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          dragging.current = true;
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromClientX(e.clientX);
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={() => {
          dragging.current = false;
        }}
      >
        <div className="absolute inset-0">
          <CarScene variant="before" idPrefix={prefix} />
          <div
            className="absolute inset-0"
            style={{ background: grime, mixBlendMode: "multiply" }}
          />
        </div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - after}% 0 0)` }}>
          <CarScene variant="after" idPrefix={prefix} />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-[#ffffff] shadow-[0_0_12px_rgba(255,255,255,0.6)]"
          style={{ left: `${after}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#ffffff] bg-[#0b0d10]/85 text-[#ffffff]">
            <ChevronLeft className="size-4" aria-hidden="true" />
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        </div>
        <span
          className={cn(
            "pointer-events-none absolute top-3 left-3 rounded-full bg-[#ff5a1f] px-3 py-1 text-xs font-bold tracking-widest text-[#0b0d10] uppercase motion-safe:transition-opacity",
            after < 12 && "opacity-0",
          )}
        >
          After
        </span>
        <span
          className={cn(
            "pointer-events-none absolute top-3 right-3 rounded-full bg-[#0b0d10]/85 px-3 py-1 text-xs font-bold tracking-widest text-[#f4f5f7] uppercase motion-safe:transition-opacity",
            after > 88 && "opacity-0",
          )}
        >
          Before
        </span>
      </div>
      <div className="mt-4 rounded-xl border border-[#2a3039] bg-[#161a20] p-4">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={rangeId} className="text-sm font-semibold">
            Slide to reveal the finish
          </label>
          <output htmlFor={rangeId} className="text-sm font-bold text-[#ff7a45] tabular-nums">
            {after}% after
          </output>
        </div>
        <input
          id={rangeId}
          type="range"
          min={0}
          max={100}
          step={1}
          value={after}
          onChange={(e) => setAfter(Number(e.target.value))}
          aria-valuetext={`${after}% after`}
          className={cn("mt-3 h-2 w-full cursor-pointer accent-[#ff5a1f]", focusRing)}
        />
        <p className="mt-2 text-xs text-[#a9b0bb]">
          Drag across the car, or use the slider and arrow keys. Illustration, not a photograph.
        </p>
      </div>
    </div>
  );
}

// ---- Page pieces ---------------------------------------------------------------------------------

function SectionTitle({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold tracking-[0.25em] text-[#ff7a45] uppercase">{kicker}</p>
      <h3 id={id} className="mt-2 text-3xl leading-none uppercase @3xl:text-5xl">
        {title}
      </h3>
      {children ? <p className="mt-3 text-[#b9c0ca]">{children}</p> : null}
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-[#ff8a66]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const emptyBooking = {
  name: "",
  phone: "",
  email: "",
  suburb: "",
  where: "mobile",
  date: "",
  vehicle: "",
  notes: "",
};
type BookingKey = keyof typeof emptyBooking;
type BookingErrors = Partial<Record<BookingKey, string>>;

function BookingForm({ summary, onChange }: { summary: string; onChange: () => void }) {
  const uid = useId();
  const [form, setForm] = useState(emptyBooking);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [sent, setSent] = useState(false);
  const fid = (key: BookingKey) => `${uid}-${key}`;
  const describedBy = (key: BookingKey) => (errors[key] ? `${fid(key)}-error` : undefined);

  const update =
    (key: BookingKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: BookingErrors = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (form.phone.replace(/\D/g, "").length < 8) next.phone = "Enter a phone number we can call.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter an email address like name@example.com.";
    if (!form.suburb) next.suburb = "Choose your suburb.";
    if (!form.date) next.date = "Pick a preferred date.";
    if (!form.vehicle.trim()) next.vehicle = "Tell us the make and model.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      const el = e.currentTarget.elements.namedItem(first);
      if (el instanceof HTMLElement) el.focus();
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <DemoSent
        title="Booking request received"
        onReset={() => {
          setForm(emptyBooking);
          setErrors({});
          setSent(false);
        }}
        className="border border-[#ff5a1f]/50 bg-[#161a20] text-[#f4f5f7]"
      />
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="rounded-2xl border border-[#2a3039] bg-[#161a20] p-5 @3xl:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ff5a1f]/40 bg-[#ff5a1f]/10 p-3 text-sm">
        <p>
          <span className="font-semibold">Your selection:</span> {summary}
        </p>
        <button
          type="button"
          onClick={onChange}
          className={cn("font-semibold text-[#ff7a45] underline underline-offset-4", focusRing)}
        >
          Change
        </button>
      </div>
      <div className="mt-5 grid gap-4 @xl:grid-cols-2">
        <Field id={fid("name")} label="Your name" error={errors.name}>
          <input
            id={fid("name")}
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={update("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            className={fieldClass}
          />
        </Field>
        <Field id={fid("phone")} label="Mobile" error={errors.phone}>
          <input
            id={fid("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={update("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone")}
            className={fieldClass}
          />
        </Field>
        <Field id={fid("email")} label="Email" error={errors.email}>
          <input
            id={fid("email")}
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            className={fieldClass}
          />
        </Field>
        <Field id={fid("suburb")} label="Suburb" error={errors.suburb}>
          <select
            id={fid("suburb")}
            name="suburb"
            value={form.suburb}
            onChange={update("suburb")}
            aria-invalid={Boolean(errors.suburb)}
            aria-describedby={describedBy("suburb")}
            className={fieldClass}
          >
            <option value="">Choose a suburb</option>
            {serviceArea.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="other">Somewhere else (we'll quote travel)</option>
          </select>
        </Field>
        <Field id={fid("where")} label="Where should we detail it?" error={undefined}>
          <select
            id={fid("where")}
            name="where"
            value={form.where}
            onChange={update("where")}
            className={fieldClass}
          >
            <option value="mobile">Mobile: we come to you</option>
            <option value="studio">At our Varden Heights studio</option>
          </select>
        </Field>
        <Field id={fid("date")} label="Preferred date" error={errors.date}>
          <input
            id={fid("date")}
            name="date"
            type="date"
            value={form.date}
            onChange={update("date")}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={describedBy("date")}
            className={fieldClass}
          />
        </Field>
        <div className="@xl:col-span-2">
          <Field id={fid("vehicle")} label="Vehicle make, model and colour" error={errors.vehicle}>
            <input
              id={fid("vehicle")}
              name="vehicle"
              placeholder="e.g. 2019 hatchback, pearl white"
              value={form.vehicle}
              onChange={update("vehicle")}
              aria-invalid={Boolean(errors.vehicle)}
              aria-describedby={describedBy("vehicle")}
              className={fieldClass}
            />
          </Field>
        </div>
        <div className="@xl:col-span-2">
          <Field id={fid("notes")} label="Anything we should know? (optional)" error={undefined}>
            <textarea
              id={fid("notes")}
              name="notes"
              rows={3}
              value={form.notes}
              onChange={update("notes")}
              className={fieldClass}
            />
          </Field>
        </div>
      </div>
      <button
        type="submit"
        className={cn(
          "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff5a1f] px-5 py-3 font-bold tracking-wide text-[#0b0d10] uppercase hover:bg-[#ff7a45] motion-safe:transition-colors @xl:w-auto",
          focusRing,
        )}
      >
        Request this booking <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={cn(
            "size-4",
            n <= rating ? "fill-[#ff5a1f] text-[#ff5a1f]" : "fill-none text-[#4a525e]",
          )}
        />
      ))}
    </div>
  );
}

// Water beading on fresh ceramic, for the hero panel.
const droplets = [
  [60, 70, 14],
  [120, 46, 9],
  [176, 98, 18],
  [246, 58, 11],
  [304, 112, 15],
  [92, 152, 12],
  [206, 172, 8],
  [262, 196, 16],
  [338, 42, 7],
  [52, 226, 10],
  [144, 234, 15],
  [312, 246, 9],
  [356, 182, 12],
  [222, 256, 6],
] as const;

function BeadingPanel() {
  return (
    <svg viewBox="0 0 400 300" className="block size-full" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="apex-hero-paint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff7a3d" />
          <stop offset="45%" stopColor="#d23a0c" />
          <stop offset="100%" stopColor="#3d0b03" />
        </linearGradient>
        <radialGradient id="apex-hero-drop" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#apex-hero-paint)" />
      <polygon points="150,0 230,0 120,300 40,300" fill="#ffffff" opacity="0.12" />
      <polygon points="250,0 266,0 156,300 140,300" fill="#ffffff" opacity="0.2" />
      {droplets.map(([x, y, r]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x + 1.5} cy={y + 2.5} r={r} fill="#000000" opacity="0.25" />
          <circle
            cx={x}
            cy={y}
            r={r}
            fill="url(#apex-hero-drop)"
            stroke="#ffffff"
            strokeOpacity="0.35"
          />
          <ellipse
            cx={x - r * 0.35}
            cy={y - r * 0.4}
            rx={r * 0.3}
            ry={r * 0.18}
            fill="#ffffff"
            opacity="0.85"
          />
        </g>
      ))}
    </svg>
  );
}

// ---- The demo ------------------------------------------------------------------------------------

export function AutoDetailingDemo({ design }: DemoProps) {
  const uid = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [packageId, setPackageId] = useState<PackageId>("signature");
  const [sizeId, setSizeId] = useState<SizeId>("small");
  const [chosen, setChosen] = useState<readonly AddOnId[]>([]);
  const resultsRef = useRef<HTMLElement>(null);
  const packagesRef = useRef<HTMLElement>(null);
  const addOnsRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const bookingRef = useRef<HTMLElement>(null);

  const pkg = packages.find((p) => p.id === packageId) ?? packages[0];
  const size = sizes.find((s) => s.id === sizeId) ?? sizes[0];
  const extras = addOns.filter((a) => chosen.includes(a.id));
  const total = pkg.price + size.surcharge + extras.reduce((sum, a) => sum + a.price, 0);
  const summary = `${pkg.name}, ${size.label.toLowerCase()}${
    extras.length ? `, ${extras.length} add-on${extras.length === 1 ? "" : "s"}` : ""
  }. Estimate ${aud(total)}`;

  const jump = (ref: RefObject<HTMLElement | null>) => {
    setMenuOpen(false);
    ref.current?.scrollIntoView({ block: "nearest" });
  };
  const toggleAddOn = (id: AddOnId) =>
    setChosen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const nav = [
    { label: "Results", ref: resultsRef },
    { label: "Packages", ref: packagesRef },
    { label: "Add-ons", ref: addOnsRef },
    { label: "Reviews", ref: reviewsRef },
  ] as const;
  const wrap = "mx-auto w-full max-w-6xl px-5 @3xl:px-8";

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.sansHumanist, heading: demoFonts.display }}
      className="bg-[#0b0d10] text-[#f4f5f7]"
    >
      {/* Header */}
      <header className="border-b border-[#232831] bg-[#0b0d10]">
        <div className={cn(wrap, "flex items-center justify-between gap-4 py-4")}>
          <p className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true" focusable="false">
              <path d="M16 3 L30 28 H22 L16 17 L10 28 H2 Z" fill="#ff5a1f" />
              <path d="M16 17 L19 22 H13 Z" fill="#f4f5f7" />
            </svg>
            <span className="font-[family-name:var(--demo-font-heading)] text-lg tracking-wide uppercase">
              {design.businessName}
            </span>
          </p>
          <nav aria-label="Demo site" className="hidden items-center gap-1 @3xl:flex">
            {nav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => jump(item.ref)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-semibold text-[#c9ced6] hover:text-[#ffffff]",
                  focusRing,
                )}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => jump(bookingRef)}
              className={cn(
                "ml-2 rounded-md bg-[#ff5a1f] px-4 py-2 text-sm font-bold text-[#0b0d10] uppercase hover:bg-[#ff7a45] motion-safe:transition-colors",
                focusRing,
              )}
            >
              Book a detail
            </button>
          </nav>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls={`${uid}-menu`}
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border border-[#3a414c] px-3 py-2 text-sm font-semibold @3xl:hidden",
              focusRing,
            )}
          >
            {menuOpen ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <Menu className="size-4" aria-hidden="true" />
            )}
            Menu
          </button>
        </div>
        <nav
          id={`${uid}-menu`}
          aria-label="Demo site menu"
          className={cn(menuOpen ? "block" : "hidden", "border-t border-[#232831] @3xl:hidden")}
        >
          <ul className={cn(wrap, "grid gap-1 py-3")}>
            {[...nav, { label: "Book a detail", ref: bookingRef }].map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => jump(item.ref)}
                  className={cn(
                    "w-full rounded-md px-3 py-2.5 text-left font-semibold hover:bg-[#161a20]",
                    focusRing,
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
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 85% 20%, rgba(255,90,31,0.22), transparent 70%), linear-gradient(180deg, #0b0d10, #111419)",
        }}
      >
        <svg
          className="pointer-events-none absolute inset-0 size-full opacity-40"
          aria-hidden="true"
          focusable="false"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path d="M-10 90 L60 0" stroke="#ff5a1f" strokeWidth="0.15" />
          <path d="M5 100 L75 10" stroke="#ff5a1f" strokeWidth="0.08" />
          <path d="M30 100 L100 12" stroke="#f4f5f7" strokeWidth="0.06" />
        </svg>
        <div
          className={cn(
            wrap,
            "relative grid items-center gap-10 py-14 @3xl:grid-cols-[1.15fr_1fr] @3xl:py-20",
          )}
        >
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#ff5a1f]/50 px-3 py-1 text-xs font-bold tracking-[0.2em] text-[#ff7a45] uppercase">
              <Sparkles className="size-3.5" aria-hidden="true" /> Mobile and studio detailing
            </p>
            <h2
              id={`${uid}-hero`}
              className="mt-5 text-5xl leading-[0.95] uppercase @xl:text-6xl @5xl:text-7xl"
            >
              Paint that looks <span className="text-[#ff5a1f]">wet.</span> Every time.
            </h2>
            <p className="mt-5 max-w-xl text-lg text-[#c9ced6]">
              Hand washed, machine polished and ceramic protected by detailers who treat a daily
              driver like a show car. We come to you, or you can drop it at the studio.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => jump(bookingRef)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg bg-[#ff5a1f] px-5 py-3 font-bold tracking-wide text-[#0b0d10] uppercase hover:bg-[#ff7a45] motion-safe:transition-colors",
                  focusRing,
                )}
              >
                Book a detail <ArrowRight className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => jump(resultsRef)}
                className={cn(
                  "rounded-lg border border-[#5a626e] px-5 py-3 font-bold tracking-wide uppercase hover:border-[#f4f5f7]",
                  focusRing,
                )}
              >
                See the difference
              </button>
            </div>
            <ul className="mt-8 grid gap-3 text-sm text-[#c9ced6] @xl:grid-cols-3">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#ff7a45]" aria-hidden="true" /> Fully insured
              </li>
              <li className="flex items-center gap-2">
                <Droplets className="size-4 text-[#ff7a45]" aria-hidden="true" /> Water-wise
                rinseless option
              </li>
              <li className="flex items-center gap-2">
                <Star className="size-4 text-[#ff7a45]" aria-hidden="true" /> 4.9 average (sample)
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-[#2a3039] shadow-[0_30px_80px_-30px_rgba(255,90,31,0.5)]">
              <BeadingPanel />
            </div>
            <p className="absolute -bottom-4 left-4 rounded-lg border border-[#2a3039] bg-[#161a20] px-4 py-2 text-sm">
              <span className="block text-xs text-[#a9b0bb]">Ceramic package</span>
              <span className="font-semibold">Water beads straight off</span>
            </p>
          </div>
        </div>
      </section>

      {/* Before & after */}
      <section ref={resultsRef} aria-labelledby={`${uid}-results`} className="py-14 @3xl:py-20">
        <div className={wrap}>
          <SectionTitle id={`${uid}-results`} kicker="Proof, not promises" title="Before & after">
            Swirl marks, water spots and road film come off in a two-stage correction. Drag the
            divider to see the same panel either side of it.
          </SectionTitle>
          <div className="mt-8 grid gap-6 @5xl:grid-cols-[1fr_280px]">
            <BeforeAfterSlider />
            <ul className="grid content-start gap-3 @xl:grid-cols-3 @5xl:grid-cols-1">
              {[
                ["Swirl marks", "Levelled with a two-stage machine polish"],
                ["Water spots", "Neutralised, then the paint is decontaminated"],
                ["Protection", "Five-year ceramic layer on top"],
              ].map(([t, d]) => (
                <li key={t} className="rounded-xl border border-[#2a3039] bg-[#161a20] p-4">
                  <p className="flex items-center gap-2 font-semibold">
                    <Check className="size-4 text-[#ff7a45]" aria-hidden="true" /> {t}
                  </p>
                  <p className="mt-1 text-sm text-[#b9c0ca]">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section
        ref={packagesRef}
        aria-labelledby={`${uid}-packages`}
        className="border-y border-[#232831] bg-[#101317] py-14 @3xl:py-20"
      >
        <div className={wrap}>
          <SectionTitle id={`${uid}-packages`} kicker="Pick your finish" title="Packages">
            Prices are for a hatch or sedan. Choose your vehicle size and the estimate updates.
          </SectionTitle>
          <div
            role="group"
            aria-label="Vehicle size"
            className="mt-7 inline-flex flex-wrap gap-1 rounded-xl border border-[#2a3039] bg-[#0b0d10] p-1"
          >
            {sizes.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={sizeId === s.id}
                onClick={() => setSizeId(s.id)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold motion-safe:transition-colors",
                  sizeId === s.id
                    ? "bg-[#f4f5f7] text-[#0b0d10]"
                    : "text-[#c9ced6] hover:text-[#ffffff]",
                  focusRing,
                )}
              >
                {s.label}
                {s.surcharge ? ` (+${aud(s.surcharge)})` : ""}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-4 @3xl:grid-cols-3">
            {packages.map((p) => {
              const selected = p.id === packageId;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-6 motion-safe:transition-colors",
                    selected
                      ? "border-[#ff5a1f] bg-[#1c1410] shadow-[0_0_0_1px_#ff5a1f,0_20px_60px_-30px_rgba(255,90,31,0.6)]"
                      : "border-[#2a3039] bg-[#161a20]",
                  )}
                >
                  {p.popular ? (
                    <p className="absolute -top-3 right-5 rounded-full bg-[#f4f5f7] px-3 py-0.5 text-xs font-bold tracking-wide text-[#0b0d10] uppercase">
                      Most booked
                    </p>
                  ) : null}
                  <h4 className="text-2xl uppercase">{p.name}</h4>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[#a9b0bb]">
                    <Clock className="size-3.5" aria-hidden="true" /> {p.time}
                  </p>
                  <p className="mt-4 font-[family-name:var(--demo-font-heading)] text-4xl">
                    {aud(p.price + size.surcharge)}
                  </p>
                  <p className="mt-3 text-sm text-[#c9ced6]">{p.blurb}</p>
                  <ul className="mt-4 grid gap-2 text-sm">
                    {p.includes.map((line) => (
                      <li key={line} className="flex gap-2">
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-[#ff7a45]"
                          aria-hidden="true"
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPackageId(p.id)}
                    className={cn(
                      "mt-6 rounded-lg px-4 py-2.5 font-bold tracking-wide uppercase motion-safe:transition-colors",
                      selected
                        ? "bg-[#ff5a1f] text-[#0b0d10]"
                        : "border border-[#5a626e] hover:border-[#f4f5f7]",
                      focusRing,
                    )}
                  >
                    {selected ? `${p.name} selected` : `Choose ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section ref={addOnsRef} aria-labelledby={`${uid}-addons`} className="py-14 @3xl:py-20">
        <div className={cn(wrap, "grid gap-8 @5xl:grid-cols-[1fr_340px]")}>
          <div>
            <SectionTitle id={`${uid}-addons`} kicker="Make it yours" title="Add-ons">
              Tap to add or remove. Your running total sits alongside.
            </SectionTitle>
            <div className="mt-7 grid gap-3 @xl:grid-cols-2">
              {addOns.map((a) => {
                const on = chosen.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleAddOn(a.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left motion-safe:transition-colors",
                      on
                        ? "border-[#ff5a1f] bg-[#1c1410]"
                        : "border-[#2a3039] bg-[#161a20] hover:border-[#5a626e]",
                      focusRing,
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border",
                        on
                          ? "border-[#ff5a1f] bg-[#ff5a1f] text-[#0b0d10]"
                          : "border-[#5a626e] text-[#c9ced6]",
                      )}
                    >
                      {on ? (
                        <Check className="size-4" aria-hidden="true" />
                      ) : (
                        <Plus className="size-4" aria-hidden="true" />
                      )}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold">{a.name}</span>
                        <span className="font-bold text-[#ff7a45]">+{aud(a.price)}</span>
                      </span>
                      <span className="mt-0.5 block text-sm text-[#a9b0bb]">{a.note}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <aside
            aria-label="Your detail"
            className="self-start rounded-2xl border border-[#2a3039] bg-[#161a20] p-6"
          >
            <p className="text-xs font-bold tracking-[0.25em] text-[#ff7a45] uppercase">
              Your detail
            </p>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt>{pkg.name} package</dt>
                <dd>{aud(pkg.price)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>{size.label}</dt>
                <dd>{size.surcharge ? `+${aud(size.surcharge)}` : "Included"}</dd>
              </div>
              {extras.map((a) => (
                <div key={a.id} className="flex justify-between gap-3">
                  <dt>{a.name}</dt>
                  <dd>+{aud(a.price)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-[#2a3039] pt-4">
              <p className="text-sm text-[#a9b0bb]">Estimated total</p>
              <p
                aria-live="polite"
                className="font-[family-name:var(--demo-font-heading)] text-4xl text-[#ff5a1f]"
              >
                {aud(total)}
              </p>
            </div>
            <p className="mt-2 text-xs text-[#a9b0bb]">
              Final price confirmed after we see the car. Prices in AUD.
            </p>
            <button
              type="button"
              onClick={() => jump(bookingRef)}
              className={cn(
                "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff5a1f] px-4 py-3 font-bold tracking-wide text-[#0b0d10] uppercase hover:bg-[#ff7a45] motion-safe:transition-colors",
                focusRing,
              )}
            >
              Continue to booking <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </aside>
        </div>
      </section>

      {/* Reviews */}
      <section
        ref={reviewsRef}
        aria-labelledby={`${uid}-reviews`}
        className="border-y border-[#232831] bg-[#101317] py-14 @3xl:py-20"
      >
        <div className={wrap}>
          <SectionTitle id={`${uid}-reviews`} kicker="From the driveway" title="Reviews" />
          <ul className="mt-8 grid gap-4 @3xl:grid-cols-3">
            {reviews.map((r) => (
              <li
                key={r.name}
                className="flex flex-col rounded-2xl border border-[#2a3039] bg-[#161a20] p-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <Stars rating={r.rating} />
                  <span className="rounded-full border border-[#3a414c] px-2 py-0.5 text-xs text-[#a9b0bb]">
                    Sample review
                  </span>
                </div>
                <blockquote className="mt-4 flex-1 text-[#e1e4e9]">"{r.text}"</blockquote>
                <p className="mt-5 text-sm">
                  <span className="font-semibold">{r.name}</span>{" "}
                  <span className="text-[#a9b0bb]">· {r.detail}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Booking */}
      <section ref={bookingRef} aria-labelledby={`${uid}-booking`} className="py-14 @3xl:py-20">
        <div className={cn(wrap, "grid gap-8 @5xl:grid-cols-[1fr_1.5fr]")}>
          <div>
            <SectionTitle id={`${uid}-booking`} kicker="Lock in a day" title="Booking">
              Send a request and we'll confirm a time within one business day. No payment is taken
              until the job is done.
            </SectionTitle>
            <h4 className="mt-8 text-lg uppercase">Service area</h4>
            <p className="mt-1 text-sm text-[#b9c0ca]">
              Mobile detailing is free in these suburbs. Further out, we quote travel.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {serviceArea.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-1.5 rounded-full border border-[#3a414c] px-3 py-1 text-sm"
                >
                  <MapPin className="size-3.5 text-[#ff7a45]" aria-hidden="true" /> {s}
                </li>
              ))}
            </ul>
          </div>
          <BookingForm summary={summary} onChange={() => jump(packagesRef)} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#232831] bg-[#07080a]">
        <div className={cn(wrap, "grid gap-8 py-12 @xl:grid-cols-2 @5xl:grid-cols-4")}>
          <div>
            <p className="font-[family-name:var(--demo-font-heading)] text-xl tracking-wide uppercase">
              {design.businessName}
            </p>
            <p className="mt-2 text-sm text-[#a9b0bb]">
              Paint correction, ceramic coatings and maintenance details.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#ff7a45] uppercase">Hours</p>
            <ul className="mt-3 grid gap-1 text-sm text-[#c9ced6]">
              <li>Mon to Fri: 7:00am to 5:30pm</li>
              <li>Saturday: 7:30am to 3:00pm</li>
              <li>Sunday: by appointment</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#ff7a45] uppercase">Studio</p>
            <p className="mt-3 flex gap-2 text-sm text-[#c9ced6]">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Unit 4, 22 Torque Street, Varden Heights
            </p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#ff7a45] uppercase">Contact</p>
            <ul className="mt-3 grid gap-2 text-sm text-[#c9ced6]">
              <li className="flex items-center gap-2">
                <Phone className="size-4" aria-hidden="true" /> (02) 5550 0142
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" aria-hidden="true" /> hello@apexgloss.example
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <DemoDisclaimer design={design} className="bg-[#07080a] text-[#c9ced6]" />
    </DemoRoot>
  );
}
