import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDisclaimer, DemoRoot, DemoSent, type DemoProps } from "./DemoRoot";
import { demoFonts } from "./demo-fonts";

const EMAIL = "hello@ateliernord.example";
const ADDRESS = "18 Fennel Lane, Fitzmere VIC";
const FREE_SHIPPING_FROM = 200;
const FLAT_SHIPPING = 12;
const MAX_QTY = 9;

const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]";
const display = "font-[family-name:var(--demo-font-heading)]";

const btnPrimary = cn(
  "inline-flex items-center justify-center gap-2 border border-[#111111] bg-[#111111] px-6 py-3.5 text-xs font-semibold tracking-[0.2em] text-[#f7f5f2] uppercase hover:bg-[#2e2a26] disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors",
  ring,
);
const btnGhost = cn(
  "inline-flex items-center justify-center gap-2 border border-[#111111] px-6 py-3.5 text-xs font-semibold tracking-[0.2em] text-[#111111] uppercase hover:bg-[#111111] hover:text-[#f7f5f2] motion-safe:transition-colors",
  ring,
);

type Kind = "coat" | "shirt" | "dress" | "shirtdress" | "knit" | "trousers" | "tote";
type Category = "Outerwear" | "Dresses" | "Knitwear" | "Essentials";
type Colour = { name: string; hex: string };
type Size = { label: string; soldOut?: boolean };
type Product = {
  id: string;
  name: string;
  kind: Kind;
  category: Category;
  price: number;
  colours: readonly [Colour, ...Colour[]];
  sizes: readonly [Size, ...Size[]];
  blurb: string;
  details: readonly string[];
};

const camel: Colour = { name: "Camel", hex: "#b08a5b" };
const charcoal: Colour = { name: "Charcoal", hex: "#3b3b3d" };
const bone: Colour = { name: "Bone", hex: "#e6dfd2" };
const sage: Colour = { name: "Sage", hex: "#a3ad98" };
const ink: Colour = { name: "Ink", hex: "#26324a" };
const clay: Colour = { name: "Clay", hex: "#b5735a" };
const oat: Colour = { name: "Oat", hex: "#d6c8ae" };
const black: Colour = { name: "Black", hex: "#1a1a1a" };

const letterSizes = (soldOut: readonly string[]): [Size, ...Size[]] => [
  { label: "XS", ...(soldOut.includes("XS") ? { soldOut: true } : {}) },
  ...["S", "M", "L", "XL"].map((label) => ({
    label,
    ...(soldOut.includes(label) ? { soldOut: true } : {}),
  })),
];

const products: readonly [Product, ...Product[]] = [
  {
    id: "coat",
    name: "Structured wool coat",
    kind: "coat",
    category: "Outerwear",
    price: 495,
    colours: [camel, charcoal, bone],
    sizes: letterSizes(["XL"]),
    blurb:
      "A long, single-breasted coat in a dense double-faced wool, cut to sit cleanly over knitwear.",
    details: ["100% Australian merino wool", "Fully lined, horn-effect buttons", "Dry clean only"],
  },
  {
    id: "poplin",
    name: "Poplin relaxed shirt",
    kind: "shirt",
    category: "Essentials",
    price: 165,
    colours: [bone, sage, ink],
    sizes: letterSizes(["XS"]),
    blurb:
      "A crisp cotton poplin shirt with a soft collar and a longer back hem. Wears open or buttoned.",
    details: ["100% organic cotton poplin", "Mother-of-pearl buttons", "Machine wash cold"],
  },
  {
    id: "slip",
    name: "Bias-cut slip dress",
    kind: "dress",
    category: "Dresses",
    price: 285,
    colours: [clay, ink, black],
    sizes: letterSizes(["XS", "XL"]),
    blurb:
      "Cut on the bias in a heavy satin crepe so it skims rather than clings. Adjustable straps.",
    details: ["Triacetate and recycled polyester crepe", "Adjustable straps", "Hand wash cold"],
  },
  {
    id: "linen-dress",
    name: "Linen shirt dress",
    kind: "shirtdress",
    category: "Dresses",
    price: 245,
    colours: [oat, sage, clay],
    sizes: letterSizes([]),
    blurb:
      "Washed European linen with a self-tie belt and deep side pockets. Gets better every wear.",
    details: ["100% European flax linen", "Self-tie belt, side pockets", "Machine wash, line dry"],
  },
  {
    id: "merino",
    name: "Merino knit jumper",
    kind: "knit",
    category: "Knitwear",
    price: 195,
    colours: [charcoal, oat, ink],
    sizes: letterSizes(["XL"]),
    blurb:
      "A fine-gauge merino crew with a ribbed hem and cuff. Light enough for spring, warm enough for mornings.",
    details: ["100% extra-fine merino", "Mulesing-free wool", "Hand wash, dry flat"],
  },
  {
    id: "cashmere",
    name: "Cashmere crew",
    kind: "knit",
    category: "Knitwear",
    price: 320,
    colours: [camel, bone, sage],
    sizes: letterSizes(["XS"]),
    blurb: "Two-ply cashmere with a relaxed shoulder and a slightly cropped body.",
    details: ["100% Grade-A cashmere", "Relaxed fit", "Hand wash, dry flat"],
  },
  {
    id: "trouser",
    name: "Wide-leg trouser",
    kind: "trousers",
    category: "Essentials",
    price: 210,
    colours: [black, bone, camel],
    sizes: [
      { label: "6" },
      { label: "8" },
      { label: "10" },
      { label: "12", soldOut: true },
      { label: "14" },
    ],
    blurb:
      "A high-waisted, pleated trouser in a drapey wool-blend suiting with a long, clean line.",
    details: ["Wool and viscose blend", "Pleated, side-zip closure", "Dry clean recommended"],
  },
  {
    id: "tote",
    name: "Leather market tote",
    kind: "tote",
    category: "Essentials",
    price: 340,
    colours: [black, camel, clay],
    sizes: [{ label: "One size" }],
    blurb: "A roomy, unlined vegetable-tanned leather tote that darkens and softens with use.",
    details: ["Vegetable-tanned leather", "Fits a 15-inch laptop", "Wipe clean, condition yearly"],
  },
];

const filters = ["All", "Outerwear", "Dresses", "Knitwear", "Essentials"] as const;
type Filter = (typeof filters)[number];

const sizeGuide = [
  ["XS", "AU 6"],
  ["S", "AU 8–10"],
  ["M", "AU 12"],
  ["L", "AU 14"],
  ["XL", "AU 16"],
] as const;

const articles = [
  {
    id: "twelve",
    tag: "Guide",
    title: "Building a wardrobe of twelve",
    read: "6 min read",
    excerpt:
      "Twelve considered pieces that move between seasons, and how to choose them without a spreadsheet.",
    more: "Start with the thing you reach for most, then build outward: one coat, two knits, a good trouser. Buy in colours that already live together, and wear every piece for a month before deciding on the next.",
  },
  {
    id: "wool",
    tag: "Materials",
    title: "On wool, and why we wait for it",
    read: "4 min read",
    excerpt:
      "Why our merino arrives once a year, and what a slower fibre does for the way a garment ages.",
    more: "Fine wool is shorn once a year, spun in small batches and knitted to order. The wait is part of the quality: yarn that has rested holds its shape through hundreds of wears.",
  },
  {
    id: "studio",
    tag: "Studio",
    title: "A week in the Fennel Lane studio",
    read: "5 min read",
    excerpt:
      "Pattern tables, fabric swatches and a very strict policy on the number of pins in the carpet.",
    more: "Mondays are for fittings, Wednesdays for cutting. By Friday the studio smells of steam and espresso, and the sample rack has changed completely.",
  },
] as const;

const aud = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const money = (n: number) => aud.format(n);

const tint = (hex: string) => `color-mix(in srgb, ${hex} 18%, #ebe6df)`;

function isDark(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
}

const productById = (id: string) => products.find((p) => p.id === id);

type Line = {
  key: string;
  productId: string;
  colour: string;
  hex: string;
  size: string;
  qty: number;
};

// A flat colour-block garment illustration. The fill follows the selected swatch.
function Garment({ kind, hex, className }: { kind: Kind; hex: string; className?: string }) {
  const dark = isDark(hex);
  const edge = dark ? "rgba(255,255,255,0.3)" : "rgba(17,17,17,0.4)";
  const detail = dark ? "rgba(255,255,255,0.4)" : "rgba(17,17,17,0.35)";
  const hanger = "rgba(17,17,17,0.45)";

  let body = "";
  let lines: ReactNode = null;
  switch (kind) {
    case "coat":
      body =
        "M74 38 L100 52 L126 38 L154 50 L170 144 L150 148 L144 222 L56 222 L50 148 L30 144 L46 50 Z";
      lines = (
        <>
          <path d="M74 38 L96 104 L100 112 L104 104 L126 38" />
          <path d="M100 112 V222 M64 172 H84 M116 172 H136 M46 50 L56 150 M154 50 L144 150" />
          <circle cx="94" cy="138" r="2.5" fill={detail} />
          <circle cx="94" cy="166" r="2.5" fill={detail} />
        </>
      );
      break;
    case "shirt":
      body =
        "M76 36 L100 48 L124 36 L156 52 L176 108 L154 118 L148 104 L148 216 L52 216 L52 104 L46 118 L24 108 L44 52 Z";
      lines = (
        <>
          <path d="M76 36 L100 74 L124 36 M100 74 V216 M114 104 H136 V128 H114 Z" />
          {[96, 122, 148, 174, 200].map((y) => (
            <circle key={y} cx="94" cy={y} r="2" fill={detail} />
          ))}
        </>
      );
      break;
    case "dress":
      body = "M84 34 L100 54 L116 34 L124 34 L122 84 L148 222 L52 222 L78 84 L76 34 Z";
      lines = <path d="M78 84 Q100 94 122 84 M66 150 Q100 160 134 150 M60 206 H140" />;
      break;
    case "shirtdress":
      body =
        "M76 36 L100 48 L124 36 L152 50 L168 102 L148 110 L146 98 L154 222 L46 222 L54 98 L52 110 L32 102 L48 50 Z";
      lines = (
        <>
          <path d="M76 36 L100 70 L124 36 M100 70 V222 M54 128 H146" />
          {[90, 108, 156, 184].map((y) => (
            <circle key={y} cx="94" cy={y} r="2" fill={detail} />
          ))}
        </>
      );
      break;
    case "knit":
      body =
        "M76 40 Q100 62 124 40 L158 54 L178 152 L154 158 L146 122 L146 216 L54 216 L54 122 L46 158 L22 152 L42 54 Z";
      lines = (
        <>
          <path d="M80 38 Q100 58 120 38 M54 204 H146 M24 142 L48 148 M176 142 L152 148" />
          {[60, 70, 80, 90, 100, 110, 120, 130, 140].map((x) => (
            <path key={x} d={`M${x} 204 V216`} />
          ))}
        </>
      );
      break;
    case "trousers":
      body = "M62 40 H138 L148 222 H108 L100 108 L92 222 H52 Z";
      lines = <path d="M62 54 H138 M100 54 V108 M80 54 V100 M120 54 V100" />;
      break;
    case "tote":
      body = "M44 92 H156 L148 214 H52 Z";
      lines = <path d="M44 106 H156 M86 150 H114" />;
      break;
  }

  return (
    <svg viewBox="0 0 200 240" aria-hidden="true" className={cn("h-full w-full", className)}>
      <ellipse cx="100" cy="228" rx="62" ry="5" fill="rgba(17,17,17,0.12)" />
      {kind === "tote" ? (
        <>
          <path
            d="M72 94 V64 Q72 38 100 38 Q128 38 128 64 V94"
            fill="none"
            stroke={edge}
            strokeWidth="8"
          />
          <path
            d="M72 94 V64 Q72 38 100 38 Q128 38 128 64 V94"
            fill="none"
            stroke={hex}
            strokeWidth="5"
          />
        </>
      ) : (
        <path
          d="M100 26 V18 a5 5 0 1 0 -5 -5 M100 26 L50 48 M100 26 L150 48"
          fill="none"
          stroke={hanger}
          strokeWidth="1.5"
        />
      )}
      <path d={body} fill={hex} stroke={edge} strokeWidth="1.5" strokeLinejoin="round" />
      <g
        fill="none"
        stroke={detail}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {lines}
      </g>
    </svg>
  );
}

function JournalArt({ index }: { index: number }) {
  const palettes = [
    ["#d6c8ae", "#8a6d4b", "#3b3b3d"],
    ["#a3ad98", "#26324a", "#e6dfd2"],
    ["#b5735a", "#e6dfd2", "#1a1a1a"],
  ] as const;
  const p = palettes[index % palettes.length] ?? palettes[0];
  return (
    <svg
      viewBox="0 0 320 180"
      aria-hidden="true"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="320" height="180" fill={p[0]} />
      {index === 0 ? (
        <>
          <rect x="40" y="30" width="60" height="130" fill={p[1]} />
          <rect x="112" y="60" width="60" height="100" fill={p[2]} />
          <rect x="184" y="20" width="60" height="140" fill={p[1]} opacity="0.55" />
        </>
      ) : index === 1 ? (
        <>
          <circle cx="110" cy="90" r="58" fill={p[1]} />
          <circle cx="190" cy="90" r="58" fill={p[2]} opacity="0.7" />
        </>
      ) : (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M${30 + i * 48} 160 L${54 + i * 48} 20 L${78 + i * 48} 160 Z`}
              fill={i % 2 ? p[1] : p[2]}
              opacity={0.85}
            />
          ))}
        </>
      )}
    </svg>
  );
}

function SectionHead({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 @3xl:mb-10">
      <div>
        <p className="text-xs tracking-[0.35em] text-[#7a5f3f] uppercase">{eyebrow}</p>
        <h3
          id={id}
          className={cn(display, "mt-2 text-3xl font-normal tracking-tight @3xl:text-4xl")}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  small,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  small?: boolean;
}) {
  const box = small ? "size-8" : "size-11";
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-stretch border border-[#111111]"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn("grid place-items-center hover:bg-[#ebe6df] disabled:opacity-40", box, ring)}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <output
        aria-label="Quantity"
        className={cn(
          "grid min-w-8 place-items-center text-sm font-semibold tabular-nums",
          small ? "h-8" : "h-11",
        )}
      >
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn("grid place-items-center hover:bg-[#ebe6df] disabled:opacity-40", box, ring)}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

// Keeps Tab inside the bag drawer.
function trapTab(e: KeyboardEvent<HTMLElement>, container: HTMLElement | null) {
  if (e.key !== "Tab" || !container) return;
  const items = Array.from(
    container.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])"),
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

function scrollParent(el: HTMLElement): HTMLElement | null {
  let p = el.parentElement;
  while (p) {
    const oy = getComputedStyle(p).overflowY;
    if (oy === "auto" || oy === "scroll") return p;
    p = p.parentElement;
  }
  return null;
}

// The demo is a tall page inside a scrolling frame, so an absolutely positioned drawer must sit in
// the part of the demo that is currently on screen. Returns that band, relative to the demo root.
function measureBand(anchor: HTMLElement | null): { top: number; height: number } {
  const root = anchor?.closest<HTMLElement>(".showroom-demo");
  if (!root) return { top: 0, height: 640 };
  const rr = root.getBoundingClientRect();
  const sp = scrollParent(root);
  const spr = sp?.getBoundingClientRect();
  const clipTop = Math.max(0, spr?.top ?? 0);
  const clipBottom = Math.min(window.innerHeight, spr?.bottom ?? window.innerHeight);
  const visTop = Math.max(clipTop, rr.top);
  const visBottom = Math.min(clipBottom, rr.bottom);
  const height = Math.round(Math.min(rr.height, Math.max(visBottom - visTop, 360)));
  const top = Math.round(Math.min(Math.max(0, visTop - rr.top), Math.max(0, rr.height - height)));
  return { top, height };
}

export function BoutiqueEcommerceDemo({ design }: DemoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const arrivalsRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const journalRef = useRef<HTMLElement>(null);
  const newsletterRef = useRef<HTMLElement>(null);
  const sizeGroupRef = useRef<HTMLFieldSetElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bagHeadingRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const restoreFocus = useRef(false);

  const [filter, setFilter] = useState<Filter>("All");
  const [cardColour, setCardColour] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string>(products[0].id);
  const [colourIdx, setColourIdx] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [viewRequest, setViewRequest] = useState(0);

  const [cart, setCart] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [band, setBand] = useState({ top: 0, height: 640 });
  const [announcement, setAnnouncement] = useState("");

  const [readOpen, setReadOpen] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const selected = productById(selectedId) ?? products[0];
  const colour = selected.colours[colourIdx] ?? selected.colours[0];
  const visible = products.filter((p) => filter === "All" || p.category === filter);

  const lines = cart.flatMap((l) => {
    const product = productById(l.productId);
    return product ? [{ ...l, product }] : [];
  });
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : FLAT_SHIPPING;
  const remaining = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100);
  const shippingText =
    subtotal === 0
      ? `Spend ${money(FREE_SHIPPING_FROM)} for free Australia-wide shipping.`
      : remaining > 0
        ? `You are ${money(remaining)} away from free shipping.`
        : "You have unlocked free shipping.";

  const go = (ref: RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ block: "start" });
  const nav = [
    { label: "New arrivals", ref: arrivalsRef },
    { label: "Journal", ref: journalRef },
    { label: "Newsletter", ref: newsletterRef },
  ] as const;

  function viewProduct(p: Product) {
    setSelectedId(p.id);
    setColourIdx(cardColour[p.id] ?? 0);
    setSize("");
    setQty(1);
    setSizeError("");
    setGuideOpen(false);
    setViewRequest((n) => n + 1);
  }

  // After "View", scroll the detail panel into view and move focus to its heading.
  useEffect(() => {
    if (viewRequest === 0) return;
    detailRef.current?.scrollIntoView({ block: "start" });
    detailHeadingRef.current?.focus({ preventScroll: true });
  }, [viewRequest]);

  function openBag(trigger: HTMLElement | null) {
    triggerRef.current = trigger;
    setCheckout(false);
    setOpen(true);
  }

  function closeBag() {
    restoreFocus.current = true;
    setOpen(false);
    setCheckout(false);
  }

  useLayoutEffect(() => {
    if (!open) return;
    const update = () =>
      setBand((prev) => {
        const next = measureBand(overlayRef.current);
        return next.top === prev.top && next.height === prev.height ? prev : next;
      });
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  // Focus moves into the drawer on open and back to the trigger on close.
  useEffect(() => {
    if (open) {
      closeRef.current?.focus({ preventScroll: true });
      return;
    }
    if (!restoreFocus.current) return;
    restoreFocus.current = false;
    triggerRef.current?.focus({ preventScroll: true });
  }, [open]);

  function addToBag(trigger: HTMLElement) {
    if (!size) {
      setSizeError(`Choose a size to add the ${selected.name.toLowerCase()} to your bag.`);
      sizeGroupRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus();
      return;
    }
    setSizeError("");
    const key = `${selected.id}-${colour.name}-${size}`;
    setCart((cur) => {
      const existing = cur.find((l) => l.key === key);
      if (existing) {
        return cur.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
      }
      return [
        ...cur,
        { key, productId: selected.id, colour: colour.name, hex: colour.hex, size, qty },
      ];
    });
    setAnnouncement(`Added ${qty} ${selected.name}, ${colour.name}, size ${size} to your bag.`);
    openBag(trigger);
  }

  function changeQty(key: string, next: number) {
    setCheckout(false);
    setCart((cur) => cur.map((l) => (l.key === key ? { ...l, qty: next } : l)));
  }

  function removeLine(key: string, name: string) {
    setCheckout(false);
    setCart((cur) => cur.filter((l) => l.key !== key));
    setAnnouncement(`Removed ${name} from your bag.`);
    bagHeadingRef.current?.focus();
  }

  function subscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError("Enter a valid email address, like name@example.com.");
      return;
    }
    setEmailError("");
    setSubscribed(true);
  }

  const toggleRead = (id: string) =>
    setReadOpen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const label = "text-xs font-semibold tracking-[0.2em] text-[#111111] uppercase";

  return (
    <DemoRoot
      design={design}
      fonts={{ body: demoFonts.sansHumanist, heading: demoFonts.serifClassic }}
      className="bg-[#f7f5f2] text-[#111111]"
    >
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <div inert={open}>
        <p className="bg-[#111111] px-4 py-2 text-center text-xs tracking-[0.15em] text-[#f7f5f2] uppercase">
          Free shipping Australia-wide over {money(FREE_SHIPPING_FROM)}
        </p>
        <header className="border-b border-[#d8d0c4]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
            <nav
              aria-label="Demo site sections"
              className="hidden flex-1 items-center gap-1 @3xl:flex"
            >
              {nav.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => go(item.ref)}
                  className={cn(
                    "px-3 py-2 text-xs tracking-[0.2em] uppercase hover:text-[#7a5f3f]",
                    ring,
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <p className={cn(display, "text-xl tracking-[0.35em] uppercase @3xl:text-2xl")}>
              {design.businessName}
            </p>
            <div className="flex flex-1 justify-end">
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={(e) => openBag(e.currentTarget)}
                className={cn(
                  "relative inline-flex items-center gap-2 px-2 py-2 text-xs tracking-[0.2em] uppercase hover:text-[#7a5f3f]",
                  ring,
                )}
              >
                <ShoppingBag aria-hidden="true" className="size-5" />
                <span className="hidden @xl:inline">Bag</span>
                <span className="grid min-w-5 place-items-center rounded-full bg-[#111111] px-1 text-[0.7rem] leading-5 font-semibold text-[#f7f5f2]">
                  {count}
                  <span className="sr-only"> {count === 1 ? "item" : "items"} in bag</span>
                </span>
              </button>
            </div>
          </div>
          <nav
            aria-label="Demo site sections, compact"
            className="border-t border-[#d8d0c4] @3xl:hidden"
          >
            <ul className="flex justify-center gap-2 px-3 py-1.5">
              {nav.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => go(item.ref)}
                    className={cn(
                      "px-2 py-1.5 text-[0.7rem] tracking-[0.18em] whitespace-nowrap uppercase",
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
        <section aria-labelledby={`${uid}-hero`} className="bg-[#ebe6df]">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 @3xl:grid-cols-2 @3xl:py-20">
            <div>
              <p className="text-xs tracking-[0.35em] text-[#7a5f3f] uppercase">The Spring edit</p>
              <h2
                id={`${uid}-hero`}
                className={cn(
                  display,
                  "mt-4 text-4xl leading-[1.08] font-normal tracking-tight @xl:text-5xl @5xl:text-6xl",
                )}
              >
                Quiet clothes, made to be worn for years.
              </h2>
              <p className="mt-5 max-w-md text-lg text-[#4a443d]">
                Considered tailoring, fine knitwear and everyday essentials in natural fibres and a
                restrained palette. Designed in Melbourne, made in small runs.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={() => go(arrivalsRef)} className={btnPrimary}>
                  Shop new arrivals <ArrowRight aria-hidden="true" className="size-4" />
                </button>
                <button type="button" onClick={() => go(journalRef)} className={btnGhost}>
                  Read the journal
                </button>
              </div>
            </div>
            <div aria-hidden="true" className="grid grid-cols-5 grid-rows-2 gap-3">
              <div
                className="col-span-3 row-span-2 aspect-[3/4] p-4"
                style={{ background: tint("#b08a5b") }}
              >
                <Garment kind="coat" hex="#b08a5b" />
              </div>
              <div className="col-span-2 aspect-square p-3" style={{ background: tint("#a3ad98") }}>
                <Garment kind="knit" hex="#a3ad98" />
              </div>
              <div className="col-span-2 aspect-square p-3" style={{ background: tint("#26324a") }}>
                <Garment kind="trousers" hex="#26324a" />
              </div>
            </div>
          </div>
          <ul className="border-t border-[#d8d0c4]">
            <li className="mx-auto grid max-w-6xl gap-4 px-5 py-5 text-sm @xl:grid-cols-3">
              <span className="flex items-center gap-3">
                <Truck aria-hidden="true" className="size-5 text-[#7a5f3f]" /> Free shipping over{" "}
                {money(FREE_SHIPPING_FROM)}
              </span>
              <span className="flex items-center gap-3">
                <RotateCcw aria-hidden="true" className="size-5 text-[#7a5f3f]" /> 30-day easy
                returns
              </span>
              <span className="flex items-center gap-3">
                <Sparkles aria-hidden="true" className="size-5 text-[#7a5f3f]" /> Natural fibres,
                small runs
              </span>
            </li>
          </ul>
        </section>

        {/* New arrivals */}
        <section
          ref={arrivalsRef}
          aria-labelledby={`${uid}-arrivals`}
          className="mx-auto max-w-6xl px-5 py-16 @3xl:py-24"
        >
          <SectionHead id={`${uid}-arrivals`} eyebrow="Just in" title="New arrivals">
            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "border px-3.5 py-1.5 text-xs tracking-[0.15em] uppercase motion-safe:transition-colors",
                    ring,
                    filter === f
                      ? "border-[#111111] bg-[#111111] text-[#f7f5f2]"
                      : "border-[#8f8679] hover:border-[#111111]",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </SectionHead>
          <p aria-live="polite" className="mb-5 text-sm text-[#55504a]">
            Showing {visible.length} of {products.length} pieces
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 @3xl:grid-cols-3 @5xl:grid-cols-4">
            {visible.map((p) => {
              const idx = cardColour[p.id] ?? 0;
              const c = p.colours[idx] ?? p.colours[0];
              const allSold = p.sizes.every((s) => s.soldOut);
              return (
                <li key={p.id}>
                  <article aria-labelledby={`${uid}-card-${p.id}`} className="flex h-full flex-col">
                    <div className="relative aspect-[4/5] p-6" style={{ background: tint(c.hex) }}>
                      <Garment kind={p.kind} hex={c.hex} />
                      <span className="absolute top-2 left-2 bg-[#f7f5f2]/90 px-2 py-0.5 text-[0.65rem] tracking-[0.12em] text-[#55504a] uppercase">
                        Sample product
                      </span>
                      {allSold ? (
                        <span className="absolute top-2 right-2 bg-[#111111] px-2 py-0.5 text-[0.65rem] tracking-[0.12em] text-[#f7f5f2] uppercase">
                          Sold out
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div>
                        <h4
                          id={`${uid}-card-${p.id}`}
                          className={cn(display, "text-lg leading-snug font-normal")}
                        >
                          {p.name}
                        </h4>
                        <p className="text-xs tracking-[0.12em] text-[#55504a] uppercase">
                          {p.category}
                        </p>
                      </div>
                      <p className="text-base font-semibold">{money(p.price)}</p>
                    </div>
                    <div
                      role="group"
                      aria-label={`Colours for ${p.name}`}
                      className="mt-3 flex flex-wrap items-center gap-2"
                    >
                      {p.colours.map((col, i) => (
                        <button
                          key={col.name}
                          type="button"
                          aria-label={col.name}
                          aria-pressed={idx === i}
                          onClick={() => setCardColour((cur) => ({ ...cur, [p.id]: i }))}
                          className={cn(
                            "size-6 rounded-full border border-[#111111]/40",
                            ring,
                            idx === i &&
                              "ring-2 ring-[#111111] ring-offset-2 ring-offset-[#f7f5f2]",
                          )}
                          style={{ background: col.hex }}
                        />
                      ))}
                      <span className="text-xs text-[#55504a]">{c.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => viewProduct(p)}
                      className={cn(btnGhost, "mt-4 w-full py-2.5")}
                    >
                      View<span className="sr-only"> {p.name}</span>
                    </button>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Product detail */}
        <section
          ref={detailRef}
          aria-labelledby={`${uid}-detail`}
          className="border-y border-[#d8d0c4] bg-[#ebe6df]"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 @3xl:py-24">
            <div className="grid gap-8 @3xl:grid-cols-2 @3xl:gap-14">
              <div
                role="img"
                aria-label={`${selected.name} in ${colour.name}, illustration`}
                className="relative mx-auto aspect-[4/5] w-full max-w-lg p-10"
                style={{ background: tint(colour.hex) }}
              >
                <Garment kind={selected.kind} hex={colour.hex} />
                <span className="absolute top-3 left-3 bg-[#f7f5f2]/90 px-2.5 py-1 text-xs tracking-[0.12em] text-[#55504a] uppercase">
                  Sample product
                </span>
              </div>
              <div>
                <p className="text-xs tracking-[0.35em] text-[#7a5f3f] uppercase">
                  Product detail · {selected.category}
                </p>
                <h3
                  id={`${uid}-detail`}
                  ref={detailHeadingRef}
                  tabIndex={-1}
                  className={cn(
                    display,
                    "mt-2 text-3xl font-normal tracking-tight outline-none @3xl:text-4xl",
                  )}
                >
                  {selected.name}
                </h3>
                <p className="mt-2 text-2xl font-semibold">
                  {money(selected.price)}{" "}
                  <span className="text-sm font-normal text-[#55504a]">AUD, GST included</span>
                </p>
                <p className="mt-4 text-[#3f3a34]">{selected.blurb}</p>

                <fieldset className="mt-6">
                  <legend className={label}>
                    Colour:{" "}
                    <span className="font-normal tracking-normal text-[#3f3a34] normal-case">
                      {colour.name}
                    </span>
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {selected.colours.map((col, i) => (
                      <div key={col.name} className="relative">
                        <input
                          id={`${uid}-colour-${i}`}
                          type="radio"
                          name={`${uid}-colour`}
                          value={col.name}
                          checked={colourIdx === i}
                          onChange={() => setColourIdx(i)}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={`${uid}-colour-${i}`}
                          title={col.name}
                          className="block size-10 cursor-pointer rounded-full border border-[#111111]/40 peer-checked:ring-2 peer-checked:ring-[#111111] peer-checked:ring-offset-2 peer-checked:ring-offset-[#ebe6df] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#111111]"
                          style={{ background: col.hex }}
                        >
                          <span className="sr-only">{col.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                <fieldset
                  ref={sizeGroupRef}
                  aria-describedby={sizeError ? `${uid}-size-err` : undefined}
                  className="mt-6"
                >
                  <legend className={label}>Size</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.sizes.map((s) => (
                      <div key={s.label} className="relative">
                        <input
                          id={`${uid}-size-${s.label}`}
                          type="radio"
                          name={`${uid}-size`}
                          value={s.label}
                          checked={size === s.label}
                          disabled={Boolean(s.soldOut)}
                          aria-invalid={Boolean(sizeError)}
                          onChange={() => {
                            setSize(s.label);
                            setSizeError("");
                          }}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={`${uid}-size-${s.label}`}
                          className="grid h-11 min-w-12 cursor-pointer place-items-center border border-[#8f8679] bg-[#f7f5f2] px-3 text-sm peer-checked:border-[#111111] peer-checked:bg-[#111111] peer-checked:text-[#f7f5f2] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#111111] peer-disabled:cursor-not-allowed peer-disabled:border-[#cfc7ba] peer-disabled:bg-transparent peer-disabled:text-[#6b655d] peer-disabled:line-through"
                        >
                          {s.label}
                          {s.soldOut ? <span className="sr-only"> (sold out)</span> : null}
                        </label>
                      </div>
                    ))}
                  </div>
                  {sizeError ? (
                    <p
                      id={`${uid}-size-err`}
                      role="alert"
                      className="mt-3 text-sm font-semibold text-[#a3261d]"
                    >
                      {sizeError}
                    </p>
                  ) : null}
                </fieldset>

                {selected.kind !== "tote" ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      aria-expanded={guideOpen}
                      aria-controls={`${uid}-guide`}
                      onClick={() => setGuideOpen((g) => !g)}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-sm underline underline-offset-4",
                        ring,
                      )}
                    >
                      <Ruler aria-hidden="true" className="size-4" /> Size guide
                    </button>
                    <div
                      id={`${uid}-guide`}
                      hidden={!guideOpen}
                      className="mt-3 border border-[#bdb3a4] bg-[#f7f5f2] p-4 text-sm"
                    >
                      <p className="font-semibold">Sample size guide (AU)</p>
                      <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 @xl:grid-cols-5">
                        {sizeGuide.map(([k, v]) => (
                          <div key={k}>
                            <dt className="inline font-semibold">{k}</dt>{" "}
                            <dd className="inline text-[#3f3a34]">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap items-end gap-4">
                  <div>
                    <p className={cn(label, "mb-2")}>Quantity</p>
                    <Stepper
                      label="Quantity to add"
                      value={qty}
                      min={1}
                      max={MAX_QTY}
                      onChange={setQty}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => addToBag(e.currentTarget)}
                    className={cn(btnPrimary, "min-w-48 flex-1")}
                  >
                    <ShoppingBag aria-hidden="true" className="size-4" /> Add to bag ·{" "}
                    {money(selected.price * qty)}
                  </button>
                </div>

                <ul className="mt-8 space-y-2 border-t border-[#bdb3a4] pt-5 text-sm text-[#3f3a34]">
                  {selected.details.map((d) => (
                    <li key={d} className="flex items-start gap-2">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#7a5f3f]" />{" "}
                      {d}
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <Truck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#7a5f3f]" />{" "}
                    Free shipping over {money(FREE_SHIPPING_FROM)}, otherwise {money(FLAT_SHIPPING)}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Journal */}
        <section
          ref={journalRef}
          aria-labelledby={`${uid}-journal`}
          className="mx-auto max-w-6xl px-5 py-16 @3xl:py-24"
        >
          <SectionHead id={`${uid}-journal`} eyebrow="Journal" title="Notes from the studio" />
          <ul className="grid gap-8 @3xl:grid-cols-3">
            {articles.map((a, i) => {
              const isOpen = readOpen.includes(a.id);
              return (
                <li key={a.id}>
                  <article aria-labelledby={`${uid}-art-${a.id}`} className="flex h-full flex-col">
                    <div className="aspect-[16/9] overflow-hidden">
                      <JournalArt index={i} />
                    </div>
                    <p className="mt-4 text-xs tracking-[0.2em] text-[#7a5f3f] uppercase">
                      {a.tag} · {a.read}
                    </p>
                    <h4
                      id={`${uid}-art-${a.id}`}
                      className={cn(display, "mt-1.5 text-xl leading-snug font-normal")}
                    >
                      {a.title}
                    </h4>
                    <p className="mt-2 text-[#3f3a34]">{a.excerpt}</p>
                    <p
                      id={`${uid}-more-${a.id}`}
                      hidden={!isOpen}
                      className="mt-3 border-l-2 border-[#8a6d4b] pl-3 text-[#3f3a34]"
                    >
                      {a.more}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`${uid}-more-${a.id}`}
                        onClick={() => toggleRead(a.id)}
                        className={cn(
                          "inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4",
                          ring,
                        )}
                      >
                        {isOpen ? "Show less" : "Read more"}
                        <span className="sr-only"> about {a.title}</span>
                      </button>
                      <span className="border border-[#8f8679] px-2 py-0.5 text-xs text-[#55504a]">
                        Sample article
                      </span>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Newsletter */}
        <section
          ref={newsletterRef}
          aria-labelledby={`${uid}-news`}
          className="bg-[#111111] text-[#f7f5f2]"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 @3xl:grid-cols-2 @3xl:py-20">
            <div>
              <p className="text-xs tracking-[0.35em] text-[#d9bf98] uppercase">
                The Atelier letter
              </p>
              <h3
                id={`${uid}-news`}
                className={cn(display, "mt-2 text-3xl font-normal tracking-tight @3xl:text-4xl")}
              >
                New pieces, first.
              </h3>
              <p className="mt-3 max-w-md text-[#d8d1c6]">
                One short note a fortnight: new arrivals, restocks and what is on the cutting table.
                Unsubscribe any time.
              </p>
            </div>
            {subscribed ? (
              <DemoSent
                title="You are on the list"
                onReset={() => {
                  setSubscribed(false);
                  setEmail("");
                }}
                className="border border-[#f7f5f2]/30 bg-[#1f1d1b] text-[#f7f5f2]"
              />
            ) : (
              <form noValidate onSubmit={subscribe}>
                <label
                  htmlFor={`${uid}-email`}
                  className="text-xs font-semibold tracking-[0.2em] uppercase"
                >
                  Email address
                </label>
                <div className="mt-2 flex flex-col gap-3 @xl:flex-row">
                  <input
                    id={`${uid}-email`}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? `${uid}-email-err` : `${uid}-email-hint`}
                    className="min-w-0 flex-1 border border-[#8f8679] bg-[#1f1d1b] px-4 py-3.5 text-[#f7f5f2] placeholder:text-[#a9a196] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7f5f2]"
                    placeholder="name@example.com"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center border border-[#f7f5f2] bg-[#f7f5f2] px-6 py-3.5 text-xs font-semibold tracking-[0.2em] text-[#111111] uppercase hover:bg-[#ebe6df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7f5f2]"
                  >
                    Subscribe
                  </button>
                </div>
                {emailError ? (
                  <p
                    id={`${uid}-email-err`}
                    role="alert"
                    className="mt-2 text-sm font-semibold text-[#ffb4ab]"
                  >
                    {emailError}
                  </p>
                ) : (
                  <p id={`${uid}-email-hint`} className="mt-2 text-sm text-[#d8d1c6]">
                    We will only use your email for the letter.
                  </p>
                )}
              </form>
            )}
          </div>
        </section>

        <footer className="border-t border-[#d8d0c4]">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 text-sm text-[#3f3a34] @3xl:grid-cols-4">
            <div>
              <p className={cn(display, "text-lg tracking-[0.3em] text-[#111111] uppercase")}>
                {design.businessName}
              </p>
              <p className="mt-2">Minimal luxury fashion, designed in Melbourne.</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#111111] uppercase">
                Shipping
              </p>
              <p className="mt-2">
                Free over {money(FREE_SHIPPING_FROM)}, otherwise {money(FLAT_SHIPPING)}. Dispatched
                in 1–2 business days.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#111111] uppercase">
                Returns
              </p>
              <p className="mt-2">30 days, unworn with tags. Free exchanges on size.</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#111111] uppercase">
                Studio
              </p>
              <p className="mt-2">{ADDRESS}</p>
              <p>{EMAIL}</p>
            </div>
          </div>
        </footer>
        <DemoDisclaimer design={design} className="border-t border-[#d8d0c4] bg-[#ebe6df]" />
      </div>

      {open ? (
        <div
          ref={overlayRef}
          className="absolute inset-0 z-30"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              closeBag();
            } else trapTab(e, panelRef.current);
          }}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close bag"
            onClick={closeBag}
            className="absolute inset-0 size-full cursor-default bg-[#111111]/45"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-bag-title`}
            style={{ top: band.top, height: band.height }}
            className="absolute right-0 flex w-full max-w-md flex-col border-l border-[#d8d0c4] bg-[#f7f5f2] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#d8d0c4] px-5 py-4">
              <h3
                id={`${uid}-bag-title`}
                ref={bagHeadingRef}
                tabIndex={-1}
                className={cn(display, "text-2xl font-normal outline-none")}
              >
                Your bag <span className="text-base text-[#55504a]">({count})</span>
              </h3>
              <button
                ref={closeRef}
                type="button"
                onClick={closeBag}
                aria-label="Close bag"
                className={cn("grid size-10 place-items-center hover:bg-[#ebe6df]", ring)}
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <div className="border-b border-[#d8d0c4] bg-[#ebe6df] px-5 py-4">
              <p className="text-sm font-semibold">{shippingText}</p>
              <div
                role="progressbar"
                aria-label="Progress to free shipping"
                aria-valuemin={0}
                aria-valuemax={FREE_SHIPPING_FROM}
                aria-valuenow={Math.min(subtotal, FREE_SHIPPING_FROM)}
                aria-valuetext={`${money(Math.min(subtotal, FREE_SHIPPING_FROM))} of ${money(FREE_SHIPPING_FROM)} towards free shipping`}
                className="mt-2 h-2 w-full overflow-hidden bg-[#cfc7ba]"
              >
                <div
                  className="h-full bg-[#7a5f3f] motion-safe:transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-10 text-center">
                <ShoppingBag aria-hidden="true" className="size-10 text-[#7a5f3f]" />
                <p className={cn(display, "text-xl")}>Your bag is empty</p>
                <p className="text-sm text-[#55504a]">
                  Choose a size on any piece and add it to see how the cart works.
                </p>
                <button type="button" onClick={closeBag} className={btnGhost}>
                  Continue shopping
                </button>
              </div>
            ) : (
              <ul className="flex-1 divide-y divide-[#d8d0c4] overflow-y-auto px-5">
                {lines.map((l) => (
                  <li key={l.key} className="flex gap-4 py-4">
                    <div className="h-24 w-20 shrink-0 p-2" style={{ background: tint(l.hex) }}>
                      <Garment kind={l.product.kind} hex={l.hex} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn(display, "leading-snug")}>{l.product.name}</p>
                          <p className="text-sm text-[#55504a]">
                            {l.colour} · Size {l.size}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">{money(l.product.price * l.qty)}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                        <Stepper
                          small
                          label={`Quantity of ${l.product.name}, ${l.colour}, ${l.size}`}
                          value={l.qty}
                          min={1}
                          max={MAX_QTY}
                          onChange={(n) => changeQty(l.key, n)}
                        />
                        <button
                          type="button"
                          onClick={() => removeLine(l.key, l.product.name)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-1 py-1 text-sm underline underline-offset-4",
                            ring,
                          )}
                        >
                          <Trash2 aria-hidden="true" className="size-4" /> Remove
                          <span className="sr-only">
                            {" "}
                            {l.product.name}, {l.colour}, size {l.size}
                          </span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {lines.length > 0 ? (
              <div className="border-t border-[#d8d0c4] bg-[#ebe6df] px-5 py-4">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt>Subtotal</dt>
                    <dd>{money(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Shipping</dt>
                    <dd>{shipping === 0 ? "Free" : money(shipping)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-t border-[#bdb3a4] pt-2 text-base font-semibold">
                    <dt>Total (GST included)</dt>
                    <dd>{money(subtotal + shipping)}</dd>
                  </div>
                </dl>
                {checkout ? (
                  <div
                    role="status"
                    className="mt-4 border border-[#111111] bg-[#f7f5f2] p-4 text-center"
                  >
                    <p className="font-semibold">Demonstration only, no payment is taken.</p>
                    <p className="mt-1 text-sm text-[#3f3a34]">
                      A real store would continue to secure payment here. Nothing was sent and no
                      order was placed.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCheckout(false)}
                      className={cn(
                        "mt-3 text-sm font-semibold underline underline-offset-4",
                        ring,
                      )}
                    >
                      Back to bag
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setCheckout(true)}
                      className={cn(btnPrimary, "mt-4 w-full")}
                    >
                      Checkout (demo)
                    </button>
                    <p className="mt-2 text-center text-xs text-[#55504a]">
                      Demonstration only, no payment is taken.
                    </p>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </DemoRoot>
  );
}
