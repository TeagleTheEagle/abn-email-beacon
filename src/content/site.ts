import { services } from "@/content/services";

const websitePrice = services.find((s) => s.id === "website-build")?.price ?? "A$500";
const storePrice = services.find((s) => s.id === "shopify-store")?.price ?? "From A$1,200";
const smartStorePrice = services.find((s) => s.id === "smart-store")?.price ?? "From A$2,000";
const carePlanService = services.find((s) => s.id === "care-plan");
const carePlanPrice = `${carePlanService?.price ?? "A$49"}${carePlanService?.priceNote ?? "/month"}`;

export const site = {
  name: "Teague Industries",
  founder: "Ben Teague",
  tagline: "FAST, HONEST WEBSITES AND STORES FOR AUSTRALIAN BUSINESSES",
  est: "EST. 2026",
  email: "benteaguey6@gmail.com",
  abn: "64 813 107 974",
  storeUrl: "/shop",
  storeLabel: "www.teagueindustries.com.au",
  // Paste a Calendly / Cal.com / Google appointment page here and every "Book a call" button opens
  // it. While it's empty they go to the call-request form at /book.
  bookingUrl: "",
  location: "Based on Sydney's Lower North Shore",
  suburbs: [
    "North Sydney",
    "Neutral Bay",
    "Cremorne",
    "Mosman",
    "Crows Nest",
    "Kirribilli",
    "Lane Cove",
    "Chatswood",
  ],
};

export const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/work", label: "Work" },
  { to: "/demos", label: "Website Designs" },
  { to: "/pricing", label: "Pricing" },
  { to: "/templates", label: "Templates" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

// The client journey, shown on the home and contact pages. Keep the promises in step with the FAQs.
export const steps = [
  {
    n: "01",
    title: "Tell us about your business",
    body: "A short brief about your business. We reply within 1–2 business days.",
    when: "Today",
  },
  {
    n: "02",
    title: "We build your free preview",
    body: "No deposit, no obligation. See the real thing before you decide.",
    when: "A few days",
  },
  {
    n: "03",
    title: "You approve it",
    body: "Two rounds of revisions included, so it's right before it's live.",
    when: "Your call",
  },
  {
    n: "04",
    title: "We launch and hand over",
    body: "Domain, payments, go live. You own the site, domain and accounts, 100%.",
    when: "About a week in",
  },
];

export const faqs = [
  {
    q: "How much does a website cost?",
    a: `Our standard website build is ${websitePrice}. Stores start ${storePrice.toLowerCase()}, Smart Store setups ${smartStorePrice.toLowerCase()}, and Care Plans from ${carePlanPrice}.`,
  },
  {
    q: "Do I have to pay before I see anything?",
    a: "No. We build a free preview first. You only pay if you want to go ahead.",
  },
  {
    q: "How long does it take?",
    a: "A standard website usually takes about 1 week (5–7 business days).",
  },
  {
    q: "Who owns the website?",
    a: "You do: your finished site, your content, your domain, your accounts.",
  },
  {
    q: "Do I own my domain name?",
    a: "Yes. Your domain is registered in your name, and you keep it even if you stop working with us.",
  },
  {
    q: "Does the store platform cost extra?",
    a: "Yes. The store platform charges its own monthly plan fee, paid directly to the provider, not us. Our setup fee covers building the store. We confirm the current platform costs with your quote.",
  },
  {
    q: "Where are you based?",
    a: "Sydney's Lower North Shore — North Sydney, Neutral Bay, Cremorne, Mosman, Crows Nest, Kirribilli, Lane Cove and Chatswood. We also work online with businesses anywhere in Australia.",
  },
  {
    q: "How many changes are included?",
    a: "Two rounds of revisions are included with every website build — text, images and layout tweaks within the agreed scope. Anything beyond that is quoted before we start, so there are no surprises.",
  },
  {
    q: "What is store automation?",
    a: "Things like product description drafts, smart product recommendations, chat that answers common questions, and automated emails, set up for you.",
  },
  {
    q: "What does the free preview include?",
    a: "A working preview of your actual website on a private link: the home page and key pages with your business details and a first pass at the content, usually within a few days. If you like it, we finish any remaining pages, connect your domain and launch. If not, there is nothing to pay.",
  },
  {
    q: "When do I pay?",
    a: "After you approve the preview and before launch. Store builds are quoted with the preview, and written quotes are valid for 30 days. Care Plans are billed monthly from launch, and you can stop any time by email.",
  },
  {
    q: "What are the ongoing costs?",
    a: "Your domain renews yearly in your name, usually A$15–30 a year for a .com.au. Hosting, SSL and backups are included in a Care Plan; without one, we set hosting up in your name and you pay the host directly, confirmed with your quote. Online stores also pay the store platform's monthly plan to the provider.",
  },
  {
    q: "What is the refund policy on digital templates?",
    a: "Digital templates and guides are instant digital downloads — there are no change-of-mind refunds once downloaded. Faulty or not-as-described files are replaced or refunded in full within 30 days. Your rights under the Australian Consumer Law are unaffected.",
  },
];
