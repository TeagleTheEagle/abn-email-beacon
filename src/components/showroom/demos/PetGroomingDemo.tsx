import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import {
  CalendarCheck,
  Check,
  ChevronDown,
  Clock,
  Dog,
  Droplets,
  Heart,
  Info,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

const PHONE = "(02) 5550 0142";
const PHONE_HREF = "tel:+61255500142";
const EMAIL = "hello@wagandwillow.example";
const ADDRESS = "22 Lorikeet Lane, Fernhollow NSW";
const VAN_AREAS = ["Fernhollow", "Bellwether Heights", "Quarry Bend", "Millpond", "Saltbush Cove"];

const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f5a3b]";
const ringLight =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6f0e6]";
const display = "font-[family-name:var(--demo-font-heading)]";

type Size = "small" | "medium" | "large" | "giant";
type Coat = "short" | "double" | "long" | "curly";
type PackageId = "puppy" | "bath" | "full" | "spa";
type AddonId = "nails" | "teeth" | "deshed" | "van";

const sizeOrder: readonly Size[] = ["small", "medium", "large", "giant"];
const coatOrder: readonly Coat[] = ["short", "double", "long", "curly"];
const packageOrder: readonly PackageId[] = ["puppy", "bath", "full", "spa"];
const addonOrder: readonly AddonId[] = ["nails", "teeth", "deshed", "van"];

const sizes: Record<Size, { label: string; weight: string; fee: number; minutes: number }> = {
  small: { label: "Small", weight: "Under 10 kg", fee: 0, minutes: 0 },
  medium: { label: "Medium", weight: "10 to 25 kg", fee: 18, minutes: 15 },
  large: { label: "Large", weight: "25 to 40 kg", fee: 38, minutes: 30 },
  giant: { label: "Giant", weight: "Over 40 kg", fee: 65, minutes: 45 },
};

const coats: Record<Coat, { label: string; short: string; text: string; fee: number }> = {
  short: { label: "Short", short: "short", text: "Staffy, Kelpie, Whippet", fee: 0 },
  double: { label: "Double", short: "double", text: "Collie, Husky, Retriever", fee: 22 },
  long: { label: "Long / silky", short: "long", text: "Maltese, Shih Tzu, Setter", fee: 25 },
  curly: { label: "Curly / woolly", short: "curly", text: "Poodle, Cavoodle, Groodle", fee: 28 },
};

type Pkg = {
  name: string;
  tag: string;
  base: number;
  minutes: number;
  popular: boolean;
  includes: readonly string[];
  free: readonly AddonId[];
};

const packages: Record<PackageId, Pkg> = {
  puppy: {
    name: "Puppy Welcome",
    tag: "For pups under six months",
    base: 55,
    minutes: 45,
    popular: false,
    includes: [
      "Gentle bath and low-noise blow-dry",
      "Face, feet and tummy tidy",
      "Nail clip",
      "Treats and a lot of cuddles",
    ],
    free: [],
  },
  bath: {
    name: "Bath & Tidy",
    tag: "Fresh between full grooms",
    base: 70,
    minutes: 75,
    popular: false,
    includes: [
      "Warm bath with oatmeal shampoo",
      "Blow-dry and full brush-out",
      "Ear clean and nail clip",
      "Face and sanitary tidy",
    ],
    free: [],
  },
  full: {
    name: "Full Groom",
    tag: "Our most-booked package",
    base: 98,
    minutes: 120,
    popular: true,
    includes: [
      "Everything in Bath & Tidy",
      "Full body clip or scissor finish in your style",
      "Paw pad tidy and nail grind",
      "Finishing spritz and a bandana",
    ],
    free: ["nails"],
  },
  spa: {
    name: "Signature Spa",
    tag: "The full pamper",
    base: 130,
    minutes: 150,
    popular: false,
    includes: [
      "Everything in Full Groom",
      "Conditioning coat mask",
      "Teeth clean and fresh breath",
      "Paw balm and face massage",
    ],
    free: ["nails", "teeth"],
  },
};

const addons: Record<AddonId, { label: string; fee: number; hint: string }> = {
  nails: { label: "Nail grind", fee: 15, hint: "Smooth, rounded nails" },
  teeth: { label: "Teeth clean", fee: 20, hint: "Brush and plaque scale" },
  deshed: { label: "De-shed treatment", fee: 35, hint: "Cuts shedding for weeks" },
  van: { label: "Mobile van visit", fee: 25, hint: "We come to your driveway" },
};

const breeds = [
  { name: "Maltese", size: "small", coat: "long" },
  { name: "Cavoodle", size: "small", coat: "curly" },
  { name: "Staffordshire Bull Terrier", size: "medium", coat: "short" },
  { name: "Border Collie", size: "medium", coat: "double" },
  { name: "Labradoodle", size: "large", coat: "curly" },
  { name: "Golden Retriever", size: "large", coat: "double" },
  { name: "Afghan Hound", size: "large", coat: "long" },
  { name: "Bernese Mountain Dog", size: "giant", coat: "double" },
  { name: "Great Dane", size: "giant", coat: "short" },
] as const satisfies readonly { name: string; size: Size; coat: Coat }[];

const steps = [
  {
    icon: CalendarCheck,
    title: "Send a request",
    text: "Tell us about your dog and pick a day. We reply within one business day to confirm a time.",
  },
  {
    icon: Heart,
    title: "A calm hello",
    text: "Drop off at the salon or meet our van at your door. We start with a sniff, a pat and a quick coat check.",
  },
  {
    icon: Droplets,
    title: "Bath, dry and trim",
    text: "One dog at a time, with warm water, gentle products and breaks. Cage dryers are never used.",
  },
  {
    icon: Sparkles,
    title: "Home, fluffy and happy",
    text: "You get a text when your dog is ready, plus notes on skin, ears and coat for next time.",
  },
] as const;

const faqs = [
  {
    id: "first",
    q: "Is my dog's first groom stressful?",
    a: "We keep first visits short and quiet. Pups under six months can book Puppy Welcome, and anxious dogs get extra breaks, a slower dry and a text update halfway through.",
  },
  {
    id: "vaccines",
    q: "Which vaccinations do you need?",
    a: "Dogs must be up to date on their C3 or C5 vaccination and on flea and tick prevention. Please bring the vaccination certificate on the first visit.",
  },
  {
    id: "matted",
    q: "What if my dog's coat is matted?",
    a: "Light tangles are brushed out at no charge. Heavy matting is uncomfortable, so we may clip it short and add a de-matting fee of $20 to $40, which we always agree with you first.",
  },
  {
    id: "van",
    q: "Where does the mobile van go?",
    a: `The van works through ${VAN_AREAS.join(", ")}. It carries its own warm water and power, so all we need is a spot to park within a few metres of your home.`,
  },
  {
    id: "cancel",
    q: "What is your cancellation policy?",
    a: "Please give us 24 hours' notice to move or cancel a booking. Late changes may carry a $25 fee, which keeps the day fair for other dogs waiting for a spot.",
  },
] as const;

const reviews = [
  {
    name: "Priya, with Biscuit the Cavoodle",
    text: "Biscuit used to shake at the groomers. She trotted in here wagging, and the cut was exactly the teddy-bear shape I asked for.",
  },
  {
    name: "Dan, with Bruno the Staffy",
    text: "The van saved my Saturday. Bruno got a bath and nail grind in the driveway and the price matched the estimate to the dollar.",
  },
  {
    name: "Mei, with Juniper the Golden",
    text: "The de-shed treatment is a miracle. Less fur on the couch for weeks, and they sent photos and coat notes when she was done.",
  },
] as const;

const days = ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Any day is fine"] as const;

type Field = "name" | "phone" | "dog" | "breed" | "day";
type Errors = Partial<Record<Field, string>>;

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

function DogIllustration({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 320 300" aria-hidden="true" className="h-auto w-full">
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#e5ecdf" />
          <stop offset="1" stopColor="#e5ecdf" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="150" r="145" fill={`url(#${uid}-bg)`} />
      <g fill="none" stroke="#6f8f6a" strokeWidth="2">
        <circle cx="50" cy="70" r="14" />
        <circle cx="80" cy="35" r="8" />
        <circle cx="270" cy="60" r="16" />
        <circle cx="242" cy="28" r="7" />
        <circle cx="285" cy="130" r="9" />
        <circle cx="35" cy="140" r="10" />
      </g>
      <ellipse cx="98" cy="128" rx="24" ry="52" fill="#b88f5c" transform="rotate(14 98 128)" />
      <ellipse cx="222" cy="128" rx="24" ry="52" fill="#b88f5c" transform="rotate(-14 222 128)" />
      <ellipse cx="160" cy="135" rx="64" ry="60" fill="#dcbc8c" />
      <ellipse cx="160" cy="162" rx="34" ry="26" fill="#f3e4c8" />
      <ellipse cx="160" cy="148" rx="11" ry="8" fill="#3d4a3a" />
      <path
        d="M160 156 V168 M160 168 Q148 178 138 168 M160 168 Q172 178 182 168"
        fill="none"
        stroke="#3d4a3a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M152 174 Q160 196 168 174 Z" fill="#e58f8f" />
      <circle cx="134" cy="124" r="6" fill="#3d4a3a" />
      <circle cx="186" cy="124" r="6" fill="#3d4a3a" />
      <circle cx="136" cy="122" r="2" fill="#fff" />
      <circle cx="188" cy="122" r="2" fill="#fff" />
      <g fill="#fffdf7" stroke="#d3dccb" strokeWidth="1.5">
        <circle cx="140" cy="78" r="16" />
        <circle cx="162" cy="68" r="19" />
        <circle cx="184" cy="80" r="15" />
        <circle cx="120" cy="92" r="10" />
        <circle cx="204" cy="94" r="9" />
      </g>
      <path d="M52 205 H268 V232 Q268 276 224 276 H96 Q52 276 52 232 Z" fill="#6f8f6a" />
      <rect x="44" y="196" width="232" height="20" rx="10" fill="#4f6b4a" />
      <g fill="#fffdf7" stroke="#d3dccb" strokeWidth="1.5">
        <circle cx="96" cy="196" r="12" />
        <circle cx="122" cy="190" r="9" />
        <circle cx="218" cy="193" r="13" />
        <circle cx="196" cy="187" r="8" />
      </g>
      <path
        d="M90 240 Q160 262 230 240"
        fill="none"
        stroke="#e5ecdf"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
    </svg>
  );
}

function PawTrail({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      aria-hidden="true"
      className={cn("h-5 w-24 text-[#6f8f6a]", className)}
    >
      {[8, 44, 80].map((x) => (
        <g key={x} fill="currentColor">
          <ellipse cx={x + 8} cy="15" rx="5" ry="4.5" />
          <circle cx={x + 2} cy="8" r="2" />
          <circle cx={x + 6.5} cy="5" r="2" />
          <circle cx={x + 11} cy="5" r="2" />
          <circle cx={x + 15} cy="8" r="2" />
        </g>
      ))}
    </svg>
  );
}

function Stars({ label }: { label: string }) {
  return (
    <span role="img" aria-label={label} className="flex gap-0.5 text-[#8a6a2f]">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} aria-hidden="true" className="size-4 fill-current" />
      ))}
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
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3f5a3b]">{eyebrow}</p>
      <h3
        id={id}
        className={cn(
          display,
          "mt-2 text-3xl font-bold leading-tight text-[#2f3d2c] @3xl:text-4xl",
        )}
      >
        {title}
      </h3>
      <PawTrail className="mx-auto mt-3" />
      {intro ? <p className="mt-4 text-[#46543f]">{intro}</p> : null}
    </div>
  );
}

export function PetGroomingDemo({ design }: DemoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const packagesRef = useRef<HTMLElement>(null);
  const calcRef = useRef<HTMLElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const bookRef = useRef<HTMLElement>(null);

  const [pkgId, setPkgId] = useState<PackageId>("full");
  const [size, setSize] = useState<Size>("medium");
  const [coat, setCoat] = useState<Coat>("short");
  const [extras, setExtras] = useState<AddonId[]>([]);
  const [breedPick, setBreedPick] = useState("");

  const [openFaq, setOpenFaq] = useState<string[]>(["first"]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dog, setDog] = useState("");
  const [breed, setBreed] = useState("");
  const [day, setDay] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const pkg = packages[pkgId];
  const vanOn = extras.includes("van");
  const isIncluded = (id: AddonId) => pkg.free.includes(id);
  const chosenExtras = addonOrder.filter((id) => extras.includes(id) && !isIncluded(id));
  const sizeFee = sizes[size].fee;
  const coatFee = coats[coat].fee;
  const extrasTotal = chosenExtras.reduce((sum, id) => sum + addons[id].fee, 0);
  const total = pkg.base + sizeFee + coatFee + extrasTotal;
  const minutes = pkg.minutes + sizes[size].minutes + (extras.includes("deshed") ? 30 : 0);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const duration = `${hours > 0 ? `${hours} h ` : ""}${mins > 0 ? `${mins} min` : ""}`.trim();
  const quote = `${pkg.name}, ${sizes[size].label.toLowerCase()} dog, ${coats[coat].short} coat${vanOn ? ", mobile van" : ""}: ${money(total)}`;

  const go = (ref: RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ block: "nearest" });
  const nav = [
    { label: "Packages", ref: packagesRef },
    { label: "Calculator", ref: calcRef },
    { label: "How it works", ref: howRef },
    { label: "Reviews", ref: reviewsRef },
    { label: "Book", ref: bookRef },
  ] as const;

  function pickBreed(value: string) {
    setBreedPick(value);
    const found = breeds.find((b) => b.name === value);
    if (found) {
      setSize(found.size);
      setCoat(found.coat);
    }
  }

  function toggleExtra(id: AddonId) {
    setExtras((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function choosePackage(id: PackageId) {
    setPkgId(id);
    go(calcRef);
  }

  function bookQuote() {
    if (!breed.trim() && breedPick) setBreed(breedPick);
    go(bookRef);
  }

  const toggleFaq = (id: string) =>
    setOpenFaq((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    const digits = phone.replace(/\D/g, "");
    if (!name.trim()) next.name = "Enter your name.";
    if (digits.length < 8 || digits.length > 12 || !/^[\d\s()+-]+$/.test(phone.trim())) {
      next.phone = "Enter a phone number we can reach you on, like 0400 000 000.";
    }
    if (!dog.trim()) next.dog = "Enter your dog's name.";
    if (!breed.trim()) next.breed = "Enter your dog's breed or mix.";
    if (!day) next.day = "Choose the day that suits you best.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  function reset() {
    setName("");
    setPhone("");
    setDog("");
    setBreed("");
    setDay("");
    setNotes("");
    setErrors({});
    setSent(false);
  }

  const input = cn(
    "mt-1.5 w-full rounded-2xl border border-[#75866f] bg-white px-4 py-2.5 text-[#2f3d2c] placeholder:text-[#667363]",
    ring,
  );
  const labelCls = "text-sm font-semibold text-[#2f3d2c]";
  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={`${uid}-${field}-err`} className="mt-1.5 text-sm font-medium text-[#a02d22]">
        {errors[field]}
      </p>
    ) : null;
  const describedBy = (field: Field) => (errors[field] ? `${uid}-${field}-err` : undefined);
  const greenButton = cn(
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#3f5a3b] bg-[#3f5a3b] px-6 py-3 text-sm font-semibold text-[#f6f0e6] hover:bg-[#2f4a2b] motion-safe:transition-colors",
    ring,
  );
  const ghostButton = cn(
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#3f5a3b] px-6 py-3 text-sm font-semibold text-[#2f4a2b] hover:bg-[#3f5a3b]/10 motion-safe:transition-colors",
    ring,
  );
  const choiceLabel =
    "flex h-full cursor-pointer flex-col gap-0.5 rounded-2xl border-2 border-[#b5c2ac] bg-white px-3 py-3 text-sm text-[#2f3d2c] hover:border-[#6f8f6a] peer-checked:border-[#3f5a3b] peer-checked:bg-[#f0f5ec] peer-checked:shadow-[inset_0_0_0_1px_#3f5a3b] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#3f5a3b]";

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.sansRounded, heading: demoFonts.sansRounded }}
      className="bg-[#f6f0e6] text-[#3d4a3a]"
    >
      <header className="border-b border-[#d8ccb4] bg-[#f6f0e6]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <p
            className={cn(
              display,
              "flex items-center gap-2 text-lg font-bold text-[#2f3d2c] @xl:text-xl",
            )}
          >
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-[#3f5a3b] text-[#f6f0e6]"
            >
              <PawPrint className="size-5" />
            </span>
            {design.businessName}
          </p>
          <nav aria-label="Demo site sections" className="hidden items-center gap-1 @3xl:flex">
            {nav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item.ref)}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-semibold text-[#3d4a3a] hover:bg-[#e5ecdf]",
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
              "hidden items-center gap-2 rounded-full text-sm font-semibold text-[#2f4a2b] @xl:inline-flex",
              ring,
            )}
          >
            <Phone aria-hidden="true" className="size-4" /> {PHONE}
          </a>
        </div>
        <nav
          aria-label="Demo site sections, compact"
          className="border-t border-[#d8ccb4] @3xl:hidden"
        >
          <ul className="flex justify-between gap-1 overflow-x-auto px-3 py-1.5">
            {nav.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => go(item.ref)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold text-[#3d4a3a]",
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
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 @3xl:grid-cols-[1.1fr_1fr] @3xl:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#e5ecdf] px-3.5 py-1.5 text-sm font-semibold text-[#2f4a2b]">
              <ShieldCheck aria-hidden="true" className="size-4" /> Fear-free grooming in Fernhollow
            </p>
            <h2
              id={`${uid}-hero`}
              className={cn(
                display,
                "mt-5 text-4xl font-bold leading-[1.08] text-[#2f3d2c] @xl:text-5xl @5xl:text-6xl",
              )}
            >
              Clean, calm and <span className="text-[#4f6b4a]">wagging</span> when they leave.
            </h2>
            <p className="mt-5 max-w-lg text-lg text-[#46543f]">
              Gentle one-dog-at-a-time grooming at our salon or in our mobile van. Work out your
              price in the calculator, then send a booking request in a minute.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => go(calcRef)} className={greenButton}>
                <Dog aria-hidden="true" className="size-4" /> Price my dog's groom
              </button>
              <button type="button" onClick={() => go(bookRef)} className={ghostButton}>
                Request a booking
              </button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#3d4a3a]">
              {["Gentle, low-stress handling", "No cage dryers", "Pet-safe products"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check aria-hidden="true" className="size-4 text-[#4f6b4a]" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-sm @3xl:max-w-none">
            <DogIllustration uid={uid} />
          </div>
        </div>
      </section>

      {/* Packages */}
      <section
        ref={packagesRef}
        aria-labelledby={`${uid}-packages`}
        className="border-y border-[#d8ccb4] bg-[#ebe3d2]"
      >
        <div className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20">
          <SectionTitle
            id={`${uid}-packages`}
            eyebrow="Grooming packages"
            title="Pick the pamper that fits"
            intro="Prices start from the small, short-coat rate. Size and coat add a little, and the calculator shows exactly how much."
          />
          <ul className="grid gap-5 @xl:grid-cols-2 @5xl:grid-cols-4">
            {packageOrder.map((id) => {
              const p = packages[id];
              return (
                <li
                  key={id}
                  className={cn(
                    "relative flex flex-col rounded-3xl border-2 bg-[#f6f0e6] p-6",
                    p.popular ? "border-[#3f5a3b]" : "border-[#c9d3c0]",
                  )}
                >
                  {p.popular ? (
                    <span className="absolute -top-3 left-6 rounded-full bg-[#3f5a3b] px-3 py-0.5 text-xs font-semibold text-[#f6f0e6]">
                      Most popular
                    </span>
                  ) : null}
                  <h4 className={cn(display, "text-xl font-bold text-[#2f3d2c]")}>{p.name}</h4>
                  <p className="mt-1 text-sm text-[#46543f]">{p.tag}</p>
                  <p className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-sm text-[#46543f]">from</span>
                    <span className={cn(display, "text-4xl font-bold text-[#2f3d2c]")}>
                      {money(p.base)}
                    </span>
                  </p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm">
                    {p.includes.map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-[#4f6b4a]"
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => choosePackage(id)}
                    className={cn(p.popular ? greenButton : ghostButton, "mt-6 w-full")}
                  >
                    Price this package<span className="sr-only">: {p.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 grid gap-6 rounded-3xl bg-[#3f5a3b] p-6 text-[#f6f0e6] @3xl:grid-cols-[auto_1fr_auto] @3xl:items-center @3xl:p-8">
            <span
              aria-hidden="true"
              className="grid size-14 place-items-center rounded-full bg-[#f6f0e6] text-[#3f5a3b]"
            >
              <Truck className="size-7" />
            </span>
            <div>
              <h4 className={cn(display, "text-2xl font-bold")}>Mobile van: we come to you</h4>
              <p className="mt-1.5 text-[#e5ecdf]">
                A fully fitted van with warm water, a quiet dryer and a private table, parked at
                your door for +$25 per visit. Ideal for nervous dogs, seniors and busy weeks.
              </p>
              <p className="mt-2 text-sm text-[#e5ecdf]">
                <span className="font-semibold text-[#f6f0e6]">Van areas:</span>{" "}
                {VAN_AREAS.join(", ")}
              </p>
            </div>
            <button
              type="button"
              aria-pressed={vanOn}
              onClick={() => {
                toggleExtra("van");
                go(calcRef);
              }}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#f6f0e6] px-6 py-3 text-sm font-semibold motion-safe:transition-colors",
                ringLight,
                vanOn
                  ? "bg-transparent text-[#f6f0e6] hover:bg-[#f6f0e6]/10"
                  : "bg-[#f6f0e6] text-[#2f4a2b] hover:bg-white",
              )}
            >
              {vanOn ? (
                <>
                  <Check aria-hidden="true" className="size-4" /> Van added to quote
                </>
              ) : (
                "Add van to my quote"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section
        ref={calcRef}
        aria-labelledby={`${uid}-calc`}
        className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-calc`}
          eyebrow="Price calculator"
          title="What will my dog's groom cost?"
          intro="Choose a breed to fill in size and coat for you, or set them yourself. The total updates as you go."
        />
        <div className="grid gap-6 @3xl:grid-cols-[1fr_340px] @5xl:grid-cols-[1fr_380px]">
          <div className="space-y-7 rounded-3xl bg-[#e5ecdf] p-5 @xl:p-8">
            <div>
              <label htmlFor={`${uid}-breed-pick`} className={labelCls}>
                Quick pick a breed <span className="font-normal text-[#46543f]">(optional)</span>
              </label>
              <select
                id={`${uid}-breed-pick`}
                value={breedPick}
                onChange={(e) => pickBreed(e.target.value)}
                className={cn(input, "appearance-auto")}
              >
                <option value="">Other, or not listed</option>
                {breeds.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className={labelCls}>Dog size</legend>
              <div className="mt-2 grid grid-cols-2 gap-3 @3xl:grid-cols-4">
                {sizeOrder.map((s, i) => (
                  <div key={s} className="relative">
                    <input
                      id={`${uid}-size-${s}`}
                      type="radio"
                      name={`${uid}-size`}
                      value={s}
                      checked={size === s}
                      onChange={() => {
                        setSize(s);
                        setBreedPick("");
                      }}
                      className="peer sr-only"
                    />
                    <label htmlFor={`${uid}-size-${s}`} className={choiceLabel}>
                      <Dog
                        aria-hidden="true"
                        className={cn(
                          "text-[#4f6b4a]",
                          i === 0 && "size-4",
                          i === 1 && "size-5",
                          i === 2 && "size-6",
                          i === 3 && "size-7",
                        )}
                      />
                      <span className="font-semibold">{sizes[s].label}</span>
                      <span className="text-xs text-[#46543f]">{sizes[s].weight}</span>
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={labelCls}>Coat type</legend>
              <div className="mt-2 grid grid-cols-2 gap-3 @3xl:grid-cols-4">
                {coatOrder.map((c) => (
                  <div key={c} className="relative">
                    <input
                      id={`${uid}-coat-${c}`}
                      type="radio"
                      name={`${uid}-coat`}
                      value={c}
                      checked={coat === c}
                      onChange={() => {
                        setCoat(c);
                        setBreedPick("");
                      }}
                      className="peer sr-only"
                    />
                    <label htmlFor={`${uid}-coat-${c}`} className={choiceLabel}>
                      <span className="font-semibold">{coats[c].label}</span>
                      <span className="text-xs text-[#46543f]">{coats[c].text}</span>
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={labelCls}>Package</legend>
              <div className="mt-2 grid grid-cols-2 gap-3 @3xl:grid-cols-4">
                {packageOrder.map((id) => (
                  <div key={id} className="relative">
                    <input
                      id={`${uid}-pkg-${id}`}
                      type="radio"
                      name={`${uid}-pkg`}
                      value={id}
                      checked={pkgId === id}
                      onChange={() => setPkgId(id)}
                      className="peer sr-only"
                    />
                    <label htmlFor={`${uid}-pkg-${id}`} className={choiceLabel}>
                      <span className="font-semibold">{packages[id].name}</span>
                      <span className="text-xs text-[#46543f]">
                        from {money(packages[id].base)}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={labelCls}>Add-ons</legend>
              <div className="mt-2 grid gap-3 @xl:grid-cols-2">
                {addonOrder.map((id) => {
                  const a = addons[id];
                  const inc = isIncluded(id);
                  return (
                    <label
                      key={id}
                      htmlFor={`${uid}-addon-${id}`}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#3f5a3b]",
                        inc || extras.includes(id)
                          ? "border-[#3f5a3b] bg-[#f0f5ec]"
                          : "border-[#b5c2ac]",
                      )}
                    >
                      <input
                        id={`${uid}-addon-${id}`}
                        type="checkbox"
                        checked={inc || extras.includes(id)}
                        disabled={inc}
                        onChange={() => toggleExtra(id)}
                        className="mt-0.5 size-5 shrink-0 accent-[#3f5a3b]"
                      />
                      <span className="flex-1">
                        <span className="block font-semibold text-[#2f3d2c]">{a.label}</span>
                        <span className="block text-xs text-[#46543f]">{a.hint}</span>
                      </span>
                      <span className="font-semibold text-[#2f3d2c]">
                        {inc ? "Included" : `+${money(a.fee)}`}
                      </span>
                    </label>
                  );
                })}
              </div>
              {coat === "double" && !extras.includes("deshed") ? (
                <p className="mt-3 flex items-start gap-2 text-sm text-[#3d4a3a]">
                  <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#4f6b4a]" />
                  Double coats shed heavily. The de-shed treatment is a popular add-on for them.
                </p>
              ) : null}
            </fieldset>
          </div>

          <aside
            aria-label="Your groom estimate"
            className="h-fit rounded-3xl border-2 border-[#3f5a3b] bg-[#f6f0e6] p-6"
          >
            <p className={cn(display, "flex items-center gap-2 text-xl font-bold text-[#2f3d2c]")}>
              <Scissors aria-hidden="true" className="size-5 text-[#4f6b4a]" /> Your estimate
            </p>
            <div aria-live="polite" aria-atomic="true">
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt>{pkg.name}</dt>
                  <dd>{money(pkg.base)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{sizes[size].label} dog</dt>
                  <dd>{sizeFee ? `+${money(sizeFee)}` : "$0"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{coats[coat].label} coat</dt>
                  <dd>{coatFee ? `+${money(coatFee)}` : "$0"}</dd>
                </div>
                {addonOrder
                  .filter((id) => isIncluded(id))
                  .map((id) => (
                    <div key={id} className="flex justify-between gap-3 text-[#46543f]">
                      <dt>{addons[id].label}</dt>
                      <dd>Included</dd>
                    </div>
                  ))}
                {chosenExtras.map((id) => (
                  <div key={id} className="flex justify-between gap-3">
                    <dt>{addons[id].label}</dt>
                    <dd>+{money(addons[id].fee)}</dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-3 border-t-2 border-dashed border-[#b5c2ac] pt-4">
                  <dt className="font-semibold">Estimated total</dt>
                  <dd className={cn(display, "text-4xl font-bold text-[#2f3d2c]")}>
                    {money(total)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 flex items-center gap-2 text-sm text-[#46543f]">
                <Clock aria-hidden="true" className="size-4" /> About {duration}
                {vanOn ? ", at your door" : ", at our salon"}
              </p>
            </div>
            <button type="button" onClick={bookQuote} className={cn(greenButton, "mt-5 w-full")}>
              Book this groom
            </button>
            <p className="mt-3 text-xs text-[#46543f]">
              An estimate only. We confirm the final price at drop-off, and heavily matted coats may
              carry a de-matting fee.
            </p>
          </aside>
        </div>
      </section>

      {/* How it works */}
      <section
        ref={howRef}
        aria-labelledby={`${uid}-how`}
        className="border-y border-[#d8ccb4] bg-[#e5ecdf]"
      >
        <div className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20">
          <SectionTitle
            id={`${uid}-how`}
            eyebrow="How it works"
            title="Four easy steps from muddy to marvellous"
          />
          <ol className="grid gap-5 @xl:grid-cols-2 @5xl:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-3xl bg-[#f6f0e6] p-6">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-11 place-items-center rounded-full bg-[#3f5a3b] text-[#f6f0e6]"
                  >
                    <s.icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-[#3f5a3b]">Step {i + 1}</span>
                </div>
                <h4 className={cn(display, "mt-4 text-lg font-bold text-[#2f3d2c]")}>{s.title}</h4>
                <p className="mt-1.5 text-sm text-[#46543f]">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Reviews */}
      <section
        ref={reviewsRef}
        aria-labelledby={`${uid}-reviews`}
        className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20"
      >
        <SectionTitle id={`${uid}-reviews`} eyebrow="Reviews" title="Happy owners, happier dogs" />
        <div className="grid gap-5 @3xl:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="flex flex-col rounded-3xl border-2 border-[#c9d3c0] bg-white/60 p-6"
            >
              <Stars label="5 out of 5 stars" />
              <blockquote className="mt-3 flex-1 text-[#2f3d2c]">“{r.text}”</blockquote>
              <figcaption className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-[#2f3d2c]">{r.name}</span>
                <span className="rounded-full bg-[#e5ecdf] px-2.5 py-0.5 text-xs font-semibold text-[#2f4a2b]">
                  Sample review
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section aria-labelledby={`${uid}-faq`} className="border-y border-[#d8ccb4] bg-[#ebe3d2]">
        <div className="mx-auto max-w-3xl px-5 py-14 @3xl:py-20">
          <SectionTitle id={`${uid}-faq`} eyebrow="FAQs" title="Good questions" />
          <ul className="space-y-3">
            {faqs.map((f) => {
              const isOpen = openFaq.includes(f.id);
              return (
                <li key={f.id} className="rounded-2xl bg-[#f6f0e6]">
                  <h4 className="m-0">
                    <button
                      id={`${uid}-faq-${f.id}`}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${uid}-faq-panel-${f.id}`}
                      onClick={() => toggleFaq(f.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left font-semibold text-[#2f3d2c]",
                        ring,
                      )}
                    >
                      {f.q}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "size-5 shrink-0 text-[#4f6b4a] motion-safe:transition-transform",
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
                    className="px-5 pb-5 text-[#46543f]"
                  >
                    {f.a}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Book */}
      <section
        ref={bookRef}
        aria-labelledby={`${uid}-book`}
        className="mx-auto max-w-6xl px-5 py-14 @3xl:py-20"
      >
        <SectionTitle
          id={`${uid}-book`}
          eyebrow="Book"
          title="Request a booking"
          intro="Tell us about your dog and we'll reply within one business day to confirm a time. No payment is taken online."
        />
        <div className="grid gap-6 @3xl:grid-cols-[1fr_300px]">
          {sent ? (
            <DemoSent
              title="Booking request received"
              onReset={reset}
              className="border-2 border-[#3f5a3b] bg-[#e5ecdf] text-[#2f3d2c] @3xl:self-start"
            />
          ) : (
            <form
              noValidate
              onSubmit={submit}
              className="grid gap-5 rounded-3xl bg-[#e5ecdf] p-5 @xl:grid-cols-2 @xl:p-8"
            >
              <p className="rounded-2xl bg-[#f6f0e6] px-4 py-3 text-sm @xl:col-span-2">
                <span className="font-semibold text-[#2f3d2c]">Your quote:</span> {quote}
              </p>
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
                <label htmlFor={`${uid}-phone`} className={labelCls}>
                  Phone
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
                <label htmlFor={`${uid}-dog`} className={labelCls}>
                  Dog's name
                </label>
                <input
                  id={`${uid}-dog`}
                  value={dog}
                  onChange={(e) => setDog(e.target.value)}
                  aria-invalid={Boolean(errors.dog)}
                  aria-describedby={describedBy("dog")}
                  className={input}
                />
                {errorText("dog")}
              </div>
              <div>
                <label htmlFor={`${uid}-breed`} className={labelCls}>
                  Breed
                </label>
                <input
                  id={`${uid}-breed`}
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g. Cavoodle"
                  aria-invalid={Boolean(errors.breed)}
                  aria-describedby={describedBy("breed")}
                  className={input}
                />
                {errorText("breed")}
              </div>
              <div className="@xl:col-span-2">
                <label htmlFor={`${uid}-day`} className={labelCls}>
                  Preferred day
                </label>
                <select
                  id={`${uid}-day`}
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  aria-invalid={Boolean(errors.day)}
                  aria-describedby={describedBy("day")}
                  className={cn(input, "appearance-auto")}
                >
                  <option value="">Choose a day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errorText("day")}
              </div>
              <div className="@xl:col-span-2">
                <label htmlFor={`${uid}-notes`} className={labelCls}>
                  Notes <span className="font-normal text-[#46543f]">(optional)</span>
                </label>
                <textarea
                  id={`${uid}-notes`}
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Style you'd like, nervous around dryers, sore hips..."
                  className={input}
                />
              </div>
              <div className="@xl:col-span-2">
                <button type="submit" className={cn(greenButton, "w-full @xl:w-auto")}>
                  <CalendarCheck aria-hidden="true" className="size-4" /> Send booking request
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4 @3xl:self-start">
            <div className="rounded-3xl border-2 border-[#c9d3c0] bg-white/60 p-6">
              <h4 className={cn(display, "text-lg font-bold text-[#2f3d2c]")}>Salon hours</h4>
              <dl className="mt-3 space-y-2 text-sm">
                {[
                  ["Tue to Fri", "8 am to 5 pm"],
                  ["Saturday", "8 am to 1 pm"],
                  ["Sun and Mon", "Closed"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-[#46543f]">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-3xl bg-[#3f5a3b] p-6 text-[#f6f0e6]">
              <h4 className={cn(display, "text-lg font-bold")}>Prefer to talk?</h4>
              <a
                href={PHONE_HREF}
                className={cn(
                  "mt-3 inline-flex items-center gap-2 rounded-full font-semibold underline underline-offset-4",
                  ringLight,
                )}
              >
                <Phone aria-hidden="true" className="size-4" /> {PHONE}
              </a>
              <p className="mt-2 flex items-start gap-2 text-sm text-[#e5ecdf]">
                <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> {EMAIL}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d8ccb4] bg-[#e5ecdf]">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm text-[#3d4a3a] @3xl:grid-cols-3">
          <div>
            <p className={cn(display, "flex items-center gap-2 text-lg font-bold text-[#2f3d2c]")}>
              <PawPrint aria-hidden="true" className="size-5 text-[#4f6b4a]" />{" "}
              {design.businessName}
            </p>
            <p className="mt-2">
              Gentle grooming for dogs of every size, at the salon or in the van.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[#2f3d2c]">Hours</p>
            <p className="mt-2">Tue to Fri 8 am to 5 pm</p>
            <p>Saturday 8 am to 1 pm</p>
          </div>
          <div>
            <p className="font-semibold text-[#2f3d2c]">Find us</p>
            <p className="mt-2 flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#4f6b4a]" />{" "}
              {ADDRESS}
            </p>
            <p>
              {PHONE} · {EMAIL}
            </p>
          </div>
        </div>
      </footer>
      <DemoDisclaimer design={design} className="bg-[#e5ecdf] text-[#3d4a3a]" />
    </DemoRoot>
  );
}
