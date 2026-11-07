import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Send, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { newLeadId, notifyLead } from "@/lib/leads";
import { track } from "@/lib/analytics";
import { faqs, site, steps } from "@/content/site";
import { addOns, carePlans, services } from "@/content/services";
import { showroomDesigns, type ShowroomSlug } from "@/content/showroom";
import { useCartStore } from "@/stores/cartStore";

export interface JarvisAction {
  label: string;
  to?: string;
  externalHref?: string;
  openLeadForm?: {
    needs?: string[];
    note?: string;
  };
}

export interface JarvisMessage {
  id: string;
  sender: "jarvis" | "user";
  text: string;
  actions?: JarvisAction[];
}

const websitePrice = services.find((s) => s.id === "website-build")?.price ?? "A$500";
const storePrice = services.find((s) => s.id === "shopify-store")?.price ?? "From A$1,200";
const storeBasePrice = storePrice.replace(/^From\s+/i, "");

const QUICK_PROMPTS = [
  { label: "Free preview", prompt: "How do I get a free website preview?" },
  { label: "Pricing & packages", prompt: "How much does a website or online store cost?" },
  { label: "Showroom designs", prompt: "Show me website designs for my industry" },
  { label: "Book a 15-min call", prompt: "I'd like to book a 15-minute call with Ben" },
] as const;

export interface PagePrompts {
  greeting: string;
  prompts: Array<{ label: string; prompt: string }>;
}

const DEFAULT_PAGE_PROMPTS: PagePrompts = {
  greeting: `Good day, I’m JARVIS — at your service for Teague Industries. Ask me about our ${websitePrice} websites, ${storeBasePrice}+ online stores, or 12 industry designs — or request your free website preview right here.`,
  prompts: [...QUICK_PROMPTS],
};

/** Page-aware greeting + quick prompt chips so JARVIS matches what the visitor is looking at. */
export function getPagePrompts(pathname: string): PagePrompts {
  if (pathname.startsWith("/pricing")) {
    return {
      greeting: `Looking at pricing? Every build starts with a free working preview before you pay a cent — websites are ${websitePrice} one-off and stores are ${storePrice.toLowerCase()}. Ask me to break down exactly what’s included.`,
      prompts: [
        { label: "Website vs Store?", prompt: "Should I get a website or an online store?" },
        { label: "What’s in a Care Plan?", prompt: "What does a Care Plan cover?" },
        { label: "Free preview", prompt: "How do I get a free website preview?" },
        { label: "Book a 15-min call", prompt: "I'd like to book a 15-minute call with Ben" },
      ],
    };
  }
  if (pathname.startsWith("/demos/")) {
    const slug = pathname.slice("/demos/".length).split("/")[0] ?? "";
    const design = showroomDesigns.find((d) => d.slug === slug);
    if (design) {
      return {
        greeting: `Like the "${design.title}" concept? I can have Ben build a free preview of this exact style branded for your business — no upfront cost. Just tell me your business name.`,
        prompts: [
          { label: "Brand this demo for me", prompt: `I'd like a free preview like the ${design.title} demo` },
          { label: "What’s included?", prompt: `What's included in the ${design.title} design?` },
          { label: "See all 12 designs", prompt: "Show me website designs for my industry" },
          { label: "Pricing", prompt: "How much does a website cost?" },
        ],
      };
    }
  }
  if (pathname === "/demos" || pathname.startsWith("/work")) {
    return {
      greeting: `Browsing the designs? Tell me your industry — barbershop, café, tradie, salon, fitness and more — and I’ll point you to the closest concept and start your free preview.`,
      prompts: [
        { label: "Match my industry", prompt: "Show me website designs for my industry" },
        { label: "Free preview", prompt: "How do I get a free website preview?" },
        { label: "Pricing", prompt: "How much does a website cost?" },
        { label: "Book a 15-min call", prompt: "I'd like to book a 15-minute call with Ben" },
      ],
    };
  }
  if (pathname.startsWith("/shop") || pathname.startsWith("/product") || pathname.startsWith("/templates")) {
    return {
      greeting: `Looking at the shop? I can explain what’s inside any template or kit, how instant download works, or get Ben to set it all up for you.`,
      prompts: [
        { label: "What’s in the downloads?", prompt: "What's included in the templates and kits?" },
        { label: "Can Ben set it up for me?", prompt: "Can Ben set up a template for my business?" },
        { label: "Custom website instead", prompt: "How much does a custom website cost?" },
        { label: "Free preview", prompt: "How do I get a free website preview?" },
      ],
    };
  }
  if (pathname.startsWith("/services")) {
    return {
      greeting: `Comparing services? Websites are ${websitePrice} one-off, stores are ${storePrice.toLowerCase()}, and every option starts with a free preview. Tell me what your business needs and I’ll recommend the right fit.`,
      prompts: [
        { label: "Recommend a service", prompt: "Which service is right for my business?" },
        { label: "Add-ons & audits", prompt: "What add-ons do you offer?" },
        { label: "Free preview", prompt: "How do I get a free website preview?" },
        { label: "Book a 15-min call", prompt: "I'd like to book a 15-minute call with Ben" },
      ],
    };
  }
  if (pathname.startsWith("/about")) {
    return {
      greeting: `You’re dealing directly with Ben — the founder — from first message to launch. No account managers, no jargon. Ask me anything, or start your free preview.`,
      prompts: [
        { label: "Free preview", prompt: "How do I get a free website preview?" },
        { label: "How it works", prompt: "How does the free preview process work?" },
        { label: "Pricing", prompt: "How much does a website cost?" },
        { label: "Book a 15-min call", prompt: "I'd like to book a 15-minute call with Ben" },
      ],
    };
  }
  if (pathname.startsWith("/contact") || pathname.startsWith("/book")) {
    return {
      greeting: `Skip the form if you like — tell me your business name and email right here and I’ll log your free preview request for Ben instantly.`,
      prompts: [
        { label: "Start free preview here", prompt: "How do I get a free website preview?" },
        { label: "Pricing first", prompt: "How much does a website or online store cost?" },
        { label: "See designs", prompt: "Show me website designs for my industry" },
      ],
    };
  }
  return DEFAULT_PAGE_PROMPTS;
}

/** Pulls a business name out of chat text ("I run Apex Electrical", "my cafe is called…") to pre-fill the lead form. */
export function extractBusinessName(text: string): string | null {
  const match = text.match(
    /(?:my (?:business|company|shop|store|salon|caf[eé]|studio|clinic|firm|brand)(?:'s name)? is(?: called| named)?|i (?:run|own|manage|have)|we (?:run|own|are)|(?:it'?s|called|named))\s+([A-Za-z0-9][A-Za-z0-9&'’.\-]*(?:\s+[A-Za-z0-9&'’.\-]+){0,3})/i,
  );
  const raw = match?.[1];
  if (!raw) return null;
  const trimmed = raw.replace(/[.,!?;:]+$/, "").trim();
  const cut = trimmed.split(/\s+(?:and|in|based|located|near|that|which|we|i)\b/i)[0] ?? trimmed;
  const name = cut.trim();
  return name.length >= 2 ? name : null;
}

const INDUSTRY_KEYWORDS: Array<{ pattern: RegExp; slug: ShowroomSlug }> = [
  { pattern: /barber|haircut|fade|shave/i, slug: "barbershop" },
  { pattern: /salon|spa|beauty|facial|nail|massage/i, slug: "beauty-salon" },
  { pattern: /detail|car|auto|mechanic|ceramic/i, slug: "auto-detailing" },
  { pattern: /cafe|coffee|bakery|brunch|espresso/i, slug: "cafe" },
  { pattern: /plumb|tradie|electric|sparky|builder|drain|gas|roof|hvac/i, slug: "plumbing-trades" },
  { pattern: /pet|dog|groom|vet|puppy/i, slug: "pet-grooming" },
  { pattern: /landscap|garden|lawn|outdoor/i, slug: "landscaping" },
  { pattern: /gym|fitness|trainer|workout|pilates|yoga/i, slug: "fitness-studio" },
  { pattern: /restaurant|dining|bistro|wine|hospitality/i, slug: "fine-dining" },
  { pattern: /clean|cleaner|end of lease|housekeeping|maid/i, slug: "cleaning-services" },
  { pattern: /boutique|fashion|clothing|apparel|retail|ecommerce|e-commerce/i, slug: "boutique-ecommerce" },
  { pattern: /consult|advisory|corporate|accountant|law|legal|finance|agency/i, slug: "consulting" },
];

export function generateJarvisReply(
  input: string,
  cartCount = 0,
  checkoutUrl: string | null = null,
): { text: string; actions: JarvisAction[]; openLeadForm?: { needs?: string[]; note?: string } } {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct industry / showroom demo match
  for (const item of INDUSTRY_KEYWORDS) {
    if (item.pattern.test(lower)) {
      const design = showroomDesigns.find((d) => d.slug === item.slug);
      if (design) {
        return {
          text: `For ${design.industry.toLowerCase()}, take a look at our "${design.title}" showroom concept (${design.businessName}). It includes ${design.includedFeatures.join(", ")}, plus an interactive ${design.interactiveWidget.toLowerCase()}. Every website build is ${websitePrice} one-off with a free preview first.`,
          actions: [
            { label: `Open ${design.title} Demo`, to: `/demos/${design.slug}` },
            {
              label: "Request a free preview like this",
              openLeadForm: {
                needs: design.category === "ecommerce" ? ["Website", "Online store"] : ["Website"],
                note: `Interested in a build like the ${design.title} demo.`,
              },
            },
            { label: "All 12 Website Designs", to: "/demos" },
          ],
        };
      }
    }
  }

  // 2. Cart / Shop / Templates queries
  if (/cart|bag|checkout|basket|order|template|shop|product|buy/i.test(lower) && !/online store cost|store setup/i.test(lower)) {
    const cartNote =
      cartCount > 0
        ? `You currently have ${cartCount} item${cartCount === 1 ? "" : "s"} in your cart.`
        : "Your cart is currently empty.";
    const actions: JarvisAction[] = [
      { label: "Browse Shop", to: "/shop" },
      { label: "Browse Templates", to: "/templates" },
    ];
    if (cartCount > 0 && checkoutUrl) {
      actions.unshift({ label: "Proceed to Checkout", externalHref: checkoutUrl });
    }
    return {
      text: `${cartNote} You can browse ready-made Australian business templates and fixed-scope digital products in the Shop, or request a custom ${websitePrice} website build.`,
      actions,
    };
  }

  // 3. Booking a call
  if (/book a call|call|phone|talk|speak|chat with ben|15-min|15 min|appointment|meeting/i.test(lower)) {
    const actions: JarvisAction[] = [{ label: "Book a 15-minute call", to: "/book" }];
    if (site.bookingUrl) {
      actions.unshift({ label: "Choose a calendar time", externalHref: site.bookingUrl });
    }
    actions.push({
      label: "Request free preview in chat",
      openLeadForm: { needs: ["Call request"], note: "Requested via JARVIS chat" },
    });
    return {
      text: `You can book a free, no-obligation 15-minute call with Ben on our Book a Call page, or email ${site.email} directly.`,
      actions,
    };
  }

  // 4. Add-ons (Audit, SEO, Booking setup, Business email, Missed-call text-back, Video ads)
  if (/audit|sprint|business email|booking system|follow-up|missed-call|missed call|google business|review|video ad|add-on|addon/i.test(lower)) {
    const matchedAddOn = addOns.find(
      (a) =>
        lower.includes(a.id.replace("-", " ")) ||
        a.title
          .toLowerCase()
          .split(/\W+/)
          .filter((w) => w.length > 3)
          .some((w) => lower.includes(w)),
    );
    if (matchedAddOn) {
      return {
        text: `${matchedAddOn.title} (${matchedAddOn.price}): ${matchedAddOn.summary} Includes: ${matchedAddOn.included.join("; ")}.${matchedAddOn.note ? ` ${matchedAddOn.note}` : ""}`,
        actions: [
          {
            label: `Enquire about ${matchedAddOn.title}`,
            openLeadForm: { needs: [matchedAddOn.title], note: `Enquiry for ${matchedAddOn.title} (${matchedAddOn.price})` },
          },
          { label: "View all Services & Add-ons", to: "/services" },
        ],
      };
    }
    const summaryList = addOns.map((a) => `${a.title} (${a.price})`).join(" · ");
    return {
      text: `Alongside website and store builds, we offer fixed-scope add-ons: ${summaryList}.`,
      actions: [
        { label: "Explore Services & Add-ons", to: "/services" },
        { label: "See Pricing", to: "/pricing" },
      ],
    };
  }

  // 5. Care Plans / Hosting / Ongoing maintenance
  if (/care plan|hosting|maintenance|monthly|ongoing|support|backup|security|domain/i.test(lower)) {
    const plansText = carePlans
      .map((p) => `${p.title} (${p.price}${p.priceNote ?? ""}): ${p.included.join(", ")}`)
      .join(" | ");
    return {
      text: `You own your website, domain and accounts 100%. For hands-off hosting, SSL, daily backups and monthly updates, we offer two month-to-month Care Plans (cancel any time by email): ${plansText}.`,
      actions: [
        { label: "Compare Care Plans", to: "/pricing" },
        {
          label: "Request a Free Preview",
          openLeadForm: { needs: ["Website", "Care Plan"], note: "Interested in Website + Care Plan" },
        },
      ],
    };
  }

  // 6. Pricing / Packages / Cost / Estimate
  if (/price|pricing|cost|how much|package|estimate|quote|store|smart store|\$500|500/i.test(lower)) {
    const coreList = services
      .map((s) => `• ${s.title}: ${s.price}${s.priceNote ? ` (${s.priceNote})` : ""} — ${s.short}`)
      .join("\n");
    return {
      text: `Here is our transparent pricing — every build starts with a free working preview before you pay a cent:\n${coreList}`,
      actions: [
        {
          label: "Start Free Preview in Chat",
          openLeadForm: { needs: ["Website"], note: "Requested free preview from JARVIS pricing summary" },
        },
        { label: "Open Estimate Calculator", to: "/pricing" },
        { label: "View Services", to: "/services" },
      ],
    };
  }

  // 7. Showroom / Demos / Portfolio / Examples
  if (/demo|showroom|design|example|portfolio|work|sample|industry|look like/i.test(lower)) {
    return {
      text: `We have 12 interactive industry website designs in our Showroom (Barbershop, Beauty Salon, Automotive Detailing, Café, Plumbing & Trades, Pet Grooming, Landscaping, Fitness Studio, Fine Dining, Cleaning, Boutique E-Commerce, and Consulting), plus our featured live demos. Tell me your industry or open the Showroom below:`,
      actions: [
        { label: "Open 12-Design Showroom", to: "/demos" },
        { label: "See Featured Work", to: "/work" },
        { label: "Request Your Free Preview", openLeadForm: { needs: ["Website"] } },
      ],
    };
  }

  // 8. Free preview / How it works / Turnaround / Revisions
  if (/preview|how do i|how does it work|step|process|turnaround|how long|revision|start|get started/i.test(lower)) {
    const stepsLine = steps.map((s) => `${s.n}. ${s.title} (${s.when})`).join(" → ");
    return {
      text: `Getting started is completely risk-free: ${stepsLine}. There is zero upfront cost or obligation — you only pay ${websitePrice} for a standard website (or ${storePrice.toLowerCase()} for an online store) if you approve the preview. Two rounds of revisions are included (further work is quoted first), written quotes are valid for 30 days, and you own the finished site.`,
      openLeadForm: { needs: ["Website"], note: "Requested free preview via JARVIS" },
      actions: [
        { label: "Open Full Contact Form", to: "/contact" },
        { label: "Book a 15-min Call", to: "/book" },
      ],
    };
  }

  // 9. Match against site FAQs
  const matchedFaq = faqs.find((f) =>
    f.q
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
      .some((w) => lower.includes(w)),
  );
  if (matchedFaq) {
    return {
      text: `${matchedFaq.q}\n${matchedFaq.a}`,
      actions: [
        { label: "Request a Free Preview", openLeadForm: { needs: ["Website"] } },
        { label: "See Pricing & FAQs", to: "/pricing" },
      ],
    };
  }

  // 10. Default helpful response
  return {
    text: `Good day, I’m JARVIS — Teague Industries’ on-site assistant. I can submit a free website preview request for your business right here in chat, calculate prices for websites (${websitePrice}) and stores (${storePrice.toLowerCase()}), or take you to our 12 interactive industry demos. How can I help?`,
    actions: [
      { label: "Request Free Preview in Chat", openLeadForm: { needs: ["Website"] } },
      { label: "Explore 12 Website Designs", to: "/demos" },
      { label: "Calculate Estimate", to: "/pricing" },
      { label: "Book a Call", to: "/book" },
    ],
  };
}

export function JarvisAssistant() {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname });
  const cartItems = useCartStore((s) => s.items);
  const checkoutUrl = useCartStore((s) => s.checkoutUrl);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<JarvisMessage[]>(() => [
    {
      id: "welcome",
      sender: "jarvis",
      text: getPagePrompts(pathname).greeting,
      actions: [
        { label: "Request Free Preview Here", openLeadForm: { needs: ["Website"] } },
        { label: "12 Website Designs", to: "/demos" },
        { label: "Pricing & Calculator", to: "/pricing" },
      ],
    },
  ]);
  const pagePrompts = getPagePrompts(pathname);

  // Inline Free-Preview Lead Capture state inside JARVIS
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [leadNeeds, setLeadNeeds] = useState<string[]>(["Website"]);
  const [leadNote, setLeadNote] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadSent, setLeadSent] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, open, leadFormOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleUserPrompt = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    const userMsg: JarvisMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
    };

    const reply = generateJarvisReply(text, cartCount, checkoutUrl);
    const jarvisMsgId = `j-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const jarvisMsg: JarvisMessage = {
      id: jarvisMsgId,
      sender: "jarvis",
      text: reply.text,
      actions: reply.actions,
    };

    const historySnapshot = messages.slice(-8).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg, jarvisMsg]);
    setInput("");

    // Smart auto-fill: pick the business name out of the conversation so the
    // visitor doesn't have to retype it in the lead form.
    const detectedName = extractBusinessName(text);
    if (detectedName && !leadSent) {
      setBusinessName((current) => current || detectedName);
    }

    if (reply.openLeadForm && !leadSent) {
      setLeadNeeds(reply.openLeadForm.needs ?? ["Website"]);
      setLeadNote(reply.openLeadForm.note ?? text);
      setLeadFormOpen(true);
    }

    // Call the server-side Gemini + Public APIs endpoint (/api/jarvis) so JARVIS can answer any question
    if (typeof window !== "undefined" && typeof window.fetch === "function") {
      void window
        .fetch("/api/jarvis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: historySnapshot,
            cartCount,
            checkoutUrl,
          }),
        })
        .then(async (res) => {
          if (!res.ok) return;
          const data = (await res.json()) as {
            text?: string;
            actions?: JarvisAction[];
          };
          if (data.text) {
            const nextText = data.text;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === jarvisMsgId
                  ? {
                      ...m,
                      text: nextText,
                      ...(data.actions ? { actions: data.actions } : {}),
                    }
                  : m,
              ),
            );
          }
        })
        .catch(() => {
          // Offline or unit-test environment: keep the instant local response.
        });
    }
  };

  const onChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleUserPrompt(input);
  };

  const handleActionClick = (action: JarvisAction) => {
    if (action.openLeadForm) {
      setLeadSent(false);
      setLeadNeeds(action.openLeadForm.needs ?? ["Website"]);
      setLeadNote(action.openLeadForm.note ?? "");
      setLeadFormOpen(true);
      return;
    }
    if (action.externalHref) {
      window.open(action.externalHref, "_blank", "noopener,noreferrer");
      return;
    }
    if (action.to) {
      void navigate({ to: action.to });
      if (window.innerWidth < 640) {
        setOpen(false);
      }
    }
  };

  const onLeadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const bName = businessName.trim();
    const mail = email.trim();
    if (!bName) {
      setLeadError("Please enter your business name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setLeadError("Please enter a valid email address.");
      return;
    }
    setLeadError(null);
    setSubmittingLead(true);
    try {
      const id = newLeadId();
      const { error } = await supabase.from("leads").insert({
        id,
        name: bName,
        business_name: bName,
        email: mail,
        needs: leadNeeds,
        message: `[JARVIS Assistant on ${pathname}] ${leadNote || "Free preview request"}`.trim(),
      });
      if (error) throw new Error("Could not send request. Please try again.");
      track("generate_lead", { form: "jarvis_assistant" });
      void notifyLead(supabase, id);
      setLeadSent(true);
      setLeadFormOpen(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `j-confirm-${Date.now()}`,
          sender: "jarvis",
          text: `Done — I’ve logged your free preview request for ${bName} (${mail}). Ben will be in touch within 1–2 business days with your preview.`,
        },
      ]);
      setBusinessName("");
      setEmail("");
    } catch (err) {
      setLeadError((err as Error).message);
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div
      data-testid="jarvis-assistant"
      className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6"
    >
      {/* Floating Holographic JARVIS Launcher Button */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setTimeout(() => inputRef.current?.focus(), 80);
        }}
        aria-expanded={open}
        aria-controls="jarvis-command-panel"
        aria-label="Ask JARVIS AI Assistant"
        className="group flex items-center gap-3 rounded-full border border-primary/50 bg-[#070c17]/95 px-4 py-2.5 text-left text-foreground shadow-[0_0_28px_rgba(84,217,255,0.32)] backdrop-blur-xl transition duration-200 hover:border-primary hover:shadow-[0_0_36px_rgba(84,217,255,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="relative grid h-9 w-9 shrink-0 place-items-center">
          <svg viewBox="0 0 100 100" aria-hidden="true" className="h-9 w-9">
            <defs>
              <radialGradient id="teague-jarvis-orb" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#54d9ff" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#0284c7" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#070c17" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill="url(#teague-jarvis-orb)" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#54d9ff"
              strokeWidth="2.2"
              strokeDasharray="12 6"
              className="origin-center animate-[spin_14s_linear_infinite]"
            />
            <circle
              cx="50"
              cy="50"
              r="32"
              fill="none"
              stroke="#f4a640"
              strokeWidth="2.2"
              strokeDasharray="24 16"
              className="origin-center animate-[spin_9s_linear_infinite_reverse]"
            />
            <circle cx="50" cy="50" r="21" fill="#0e1626" stroke="#8fe6ff" strokeWidth="2" />
            <circle cx="50" cy="50" r="9" fill="#eef3f8" />
          </svg>
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-[#070c17]"
          />
        </span>
        <span className="pr-1">
          <span className="block font-display text-[10px] tracking-[0.18em] text-primary">
            JARVIS AI
          </span>
          <span className="block text-xs font-medium text-muted-foreground group-hover:text-foreground">
            Ask or get a free preview
          </span>
        </span>
      </button>

      {/* Expandable JARVIS Command Center Panel */}
      {open && (
        <section
          id="jarvis-command-panel"
          aria-label="JARVIS AI Website Assistant"
          className="mt-3 flex h-[min(36rem,calc(100dvh-7.5rem))] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-primary/40 bg-[#070c17]/98 text-foreground shadow-[0_24px_64px_rgba(0,0,0,0.85),0_0_32px_rgba(84,217,255,0.2)] backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-border bg-[#0e1626]/90 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#070c17] ring-1 ring-primary/40">
                <svg viewBox="0 0 100 100" aria-hidden="true" className="h-7 w-7">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#54d9ff"
                    strokeWidth="3"
                    strokeDasharray="12 6"
                    className="origin-center animate-[spin_12s_linear_infinite]"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="28"
                    fill="none"
                    stroke="#f4a640"
                    strokeWidth="3"
                    strokeDasharray="20 14"
                    className="origin-center animate-[spin_8s_linear_infinite_reverse]"
                  />
                  <circle cx="50" cy="50" r="11" fill="#54d9ff" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs tracking-wider text-foreground">
                    JARVIS
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="h-2.5 w-2.5" aria-hidden="true" /> Online
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Teague Industries · Interactive Site Assistant
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close JARVIS assistant"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.sender === "user" ? "flex flex-col items-end" : "flex flex-col items-start"
                }
              >
                <div
                  className={
                    m.sender === "user"
                      ? "max-w-[85%] whitespace-pre-line rounded-lg rounded-br-none bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground"
                      : "max-w-[92%] whitespace-pre-line rounded-lg rounded-bl-none border border-border bg-[#0e1626] px-3.5 py-2.5 text-xs leading-relaxed text-foreground"
                  }
                >
                  {m.text}
                </div>
                {m.actions && m.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.actions.map((act) => (
                      <button
                        key={act.label}
                        type="button"
                        onClick={() => handleActionClick(act)}
                        className="inline-flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary-soft transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        {act.label}
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Inline Free-Preview Lead Capture Card */}
            {leadFormOpen && (
              <form
                onSubmit={onLeadSubmit}
                noValidate
                className="rounded-lg border border-primary/50 bg-[#0e1626] p-3.5 shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-[10px] uppercase tracking-wider text-primary">
                    Instant Free Preview Request
                  </p>
                  <button
                    type="button"
                    onClick={() => setLeadFormOpen(false)}
                    aria-label="Cancel preview form"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  No upfront payment or obligation. We’ll build your preview first.
                </p>
                <div className="mt-2.5 grid gap-2">
                  <label className="block">
                    <span className="sr-only">Business name</span>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your business name"
                      autoComplete="organization"
                      className="w-full rounded-sm border border-border bg-[#070c17] px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Email address</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      autoComplete="email"
                      className="w-full rounded-sm border border-border bg-[#070c17] px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </label>
                  {leadError && (
                    <p role="alert" className="text-[11px] text-destructive">
                      {leadError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="btn-primary h-9 w-full text-xs"
                  >
                    {submittingLead ? "Sending to Ben…" : "Send my free preview request"}
                  </button>
                </div>
              </form>
            )}

            {leadSent && !leadFormOpen && (
              <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>Free preview request sent to Ben.</span>
              </div>
            )}
          </div>

          {/* Quick Action Chips */}
          <div className="border-t border-border bg-[#0e1626]/70 px-3 py-2">
            <div className="flex flex-wrap gap-1.5">
              {pagePrompts.prompts.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleUserPrompt(chip.prompt)}
                  className="rounded-sm border border-border bg-[#070c17] px-2 py-1 text-[11px] text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={onChatSubmit}
            className="flex items-center gap-2 border-t border-border bg-[#0e1626] px-3 py-2.5"
          >
            <label htmlFor="jarvis-teague-input" className="sr-only">
              Ask JARVIS about websites, stores, demos or pricing
            </label>
            <input
              ref={inputRef}
              id="jarvis-teague-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about pricing, demos, or your industry…"
              autoComplete="off"
              className="h-9 flex-1 rounded-sm border border-border bg-[#070c17] px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="inline-flex h-9 items-center justify-center rounded-sm bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
