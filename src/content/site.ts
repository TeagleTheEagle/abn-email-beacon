export const site = {
  name: "Teague Industries",
  tagline: "PEOPLE | TECHNOLOGY | A BRIGHTER TOMORROW",
  est: "EST. 2026",
  email: "benteaguey6@gmail.com",
  abn: "64 813 107 974",
  storeUrl: "/shop",
  storeLabel: "teagueindustries.com.au",
  location: "Based on Sydney's Lower North Shore",
  suburbs: ["North Sydney", "Neutral Bay", "Cremorne", "Mosman", "Crows Nest", "Kirribilli", "Lane Cove", "Chatswood"],
};

export const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/work", label: "Work" },
  { to: "/pricing", label: "Pricing" },
  { to: "/templates", label: "Templates" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export const steps = [
  { n: "01", title: "We build a preview", body: "Free, no obligation." },
  { n: "02", title: "You approve it", body: "Tweaks included." },
  { n: "03", title: "We launch", body: "Domain, payments, go live." },
];

export const faqs = [
  { q: "How much does a website cost?", a: "Our standard website build is A$500. Shopify stores start from A$1,200, Smart Store (AI) setups from A$2,000, and Care Plans from A$49/month." },
  { q: "Do I have to pay before I see anything?", a: "No. We build a free preview first. You only pay if you want to go ahead." },
  { q: "How long does it take?", a: "A standard website usually takes about 1 week (5–7 business days)." },
  { q: "Who owns the website?", a: "You do: your content, your domain, your accounts." },
  { q: "Do I own my domain name?", a: "Yes. Your domain is registered in your name, and you keep it even if you stop working with us." },
  { q: "Does Shopify cost extra?", a: "Yes. Shopify charges its own monthly plan fee, paid directly to Shopify, not us. Our setup fee covers building the store. Current plans are listed on Shopify's pricing page." },
  { q: "Where are you based?", a: "Sydney's Lower North Shore — North Sydney, Neutral Bay, Cremorne, Mosman, Crows Nest, Kirribilli, Lane Cove and Chatswood. We also work online with businesses anywhere in Australia." },
  { q: "What are \"AI features\"?", a: "Things like auto-written product descriptions, smart product recommendations, chat that answers common questions, and automated emails, set up for you." },
];
