import { Monitor, ShoppingBag, Sparkles, LifeBuoy, type LucideIcon } from "lucide-react";

export type Service = {
  id: string;
  icon: LucideIcon;
  title: string;
  short: string;
  price: string;
  priceNote?: string;
  fromAud: number; // numeric price for the estimate calculator; keep in step with `price`
  monthly?: boolean;
  turnaround?: string;
  included: string[];
  whoFor: string;
  popular?: boolean;
};

// The entry-level Care Plan. It sits in `services` (so the cards, calculator and MCP see it) and in
// `carePlans` beside the Local Growth tier. Both are month-to-month; stop any time by email (Terms).
const essentials: Service = {
  id: "care-plan",
  icon: LifeBuoy,
  title: "Care Plan · Essentials",
  short: "Monthly care so your site stays fast, safe and up to date.",
  price: "A$49",
  priceNote: "/month",
  fromAud: 49,
  monthly: true,
  included: [
    "Hosting, SSL certificate and daily backups",
    "Uptime and security checks",
    "Two small edits a month: text, photos, prices",
    "Monthly health report",
    "Priority support",
  ],
  whoFor: "Anyone who'd rather run their business than maintain a website.",
};

export const services: Service[] = [
  {
    id: "website-build",
    icon: Monitor,
    title: "Website Build",
    short: "A fast, mobile-friendly website that brings in customers.",
    price: "A$500",
    priceNote: "one-off · Free preview first.",
    fromAud: 500,
    popular: true,
    turnaround: "About one week (5–7 business days)",
    included: [
      "Custom, mobile-friendly website (up to 5 pages)",
      "Contact form",
      "Google Maps",
      "Basic SEO",
      "Connection to your own domain",
      "Two rounds of revisions included",
      "A free preview before you pay",
    ],
    whoFor: "Cafés, tradies, salons and local shops that need a professional home online.",
  },
  {
    id: "shopify-store",
    icon: ShoppingBag,
    title: "Store Setup",
    short: "An online store, built and ready to take orders.",
    price: "From A$1,200",
    fromAud: 1200,
    included: [
      "Theme design",
      "Up to 25 products loaded and formatted (bulk CSV import for larger catalogues)",
      "Payments",
      "Shipping or digital delivery",
      "Domain connection",
      "Policy pages",
    ],
    whoFor: "Businesses ready to sell products online, physical or digital.",
  },
  {
    id: "smart-store",
    icon: Sparkles,
    title: "Smart Store Setup",
    short: "Your store with useful automation to reduce everyday admin.",
    price: "From A$2,000",
    fromAud: 2000,
    included: [
      "Everything in Store Setup",
      "Product descriptions, drafted for your approval",
      '"You may also like" product recommendations',
      "Live chat with FAQ auto-replies and order tracking",
      "Automated emails: welcome, abandoned cart, post-purchase",
      "Built on the store platform's own tools — no extra monthly app fees from us",
    ],
    whoFor: "Store owners who want more sales with less admin.",
  },
  essentials,
];

export const carePlans: Service[] = [
  essentials,
  {
    id: "care-plan-growth",
    icon: LifeBuoy,
    title: "Care Plan · Local Growth",
    short: "Essentials, plus the systems that bring local customers back.",
    price: "A$149",
    priceNote: "/month",
    fromAud: 149,
    monthly: true,
    included: [
      "Everything in Essentials",
      "Missed-call text-back: an instant SMS when you can't answer",
      "A Google Business Profile update or offer every month",
      "Automated Google review requests after each job or visit",
      "Monthly lead and traffic report",
    ],
    whoFor: "Tradies, cafés and salons that live on calls, bookings and reviews.",
  },
];

// Fixed-scope add-ons: one clearly defined deliverable each, sold beside a build or on their own.
// Launch test prices (22 Oct 2026); adjust here and every page follows.
export type AddOn = {
  id: string;
  title: string;
  price: string;
  fromAud: number;
  summary: string;
  included: string[];
  note?: string;
  href?: string;
};

export const addOns: AddOn[] = [
  {
    id: "audit",
    title: "48-Hour Website Audit",
    price: "A$149",
    fromAud: 149,
    summary: "A 10-minute video review of your current site and a one-page priority roadmap.",
    included: [
      "Speed, mobile and conversion review",
      "Ranked action list",
      "Delivered within 48 hours",
    ],
    note: "Credited in full if you go ahead with a build within 30 days.",
    href: "/product/48-hour-website-speed-conversion-audit",
  },
  {
    id: "fix-sprint",
    title: "Website Fix Sprint",
    price: "From A$299",
    fromAud: 299,
    summary: "The fixes from your audit, implemented and checked on your existing site.",
    included: [
      "Agreed list of fixes",
      "Before-and-after checks",
      "Quoted against your actual site",
    ],
    note: "Your A$149 audit is credited.",
  },
  {
    id: "business-email",
    title: "Business Email Setup",
    price: "A$199",
    fromAud: 199,
    summary: "Email on your own domain, set up properly and handed over.",
    included: [
      "Mailbox on your domain",
      "SPF, DKIM and DMARC records so mail lands in inboxes",
      "Branded signature and a handover guide",
    ],
    note: "Email provider subscription separate.",
  },
  {
    id: "booking",
    title: "Booking System Setup",
    price: "A$349",
    fromAud: 349,
    summary: "Online bookings on your site: services, availability and confirmations.",
    included: [
      "Service list and availability",
      "Booking page on your website",
      "Confirmation and reminder messages",
    ],
    note: "Booking platform fees separate.",
  },
  {
    id: "follow-up",
    title: "Enquiry & Quote Follow-up",
    price: "A$399",
    fromAud: 399,
    summary: "Never lose a quote to silence: a lead tracker and an automatic follow-up sequence.",
    included: [
      "One enquiry form feeding a lead tracker",
      "Follow-ups at day 2, 5 and 10",
      "Overdue-invoice reminders",
    ],
  },
  {
    id: "missed-call",
    title: "Missed-Call Text-Back",
    price: "A$299 setup + A$79/month",
    fromAud: 299,
    summary:
      "When you can't answer, the caller gets an instant text with your name and a way to reach you.",
    included: [
      "Automatic SMS to missed callers",
      "Your wording, your number",
      "SMS service included in the monthly fee",
    ],
  },
  {
    id: "google-profile",
    title: "Google Business Profile & Reviews",
    price: "A$299",
    fromAud: 299,
    summary: "Show up on Google Maps and collect reviews without chasing people.",
    included: [
      "Profile set up or tidied: hours, services, photos",
      "Review-request messages for after each job",
      "Counter sign with a tap-to-review QR code",
    ],
  },
  {
    id: "listing-pack",
    title: "Product Listing Pack",
    price: "A$249",
    fromAud: 249,
    summary: "Ten products written, formatted and uploaded to your store.",
    included: [
      "Ten product descriptions",
      "Images sized and named",
      "Uploaded and organised into collections",
    ],
  },
  {
    id: "ad-pack",
    title: "Video Ad Pack",
    price: "From A$299",
    fromAud: 299,
    summary:
      "Three short vertical ads of your product or service, ready to post on Instagram, TikTok and Facebook.",
    included: [
      "Three 10–15 second ads, 1080×1920, with your offer and link on screen",
      "AI-generated scenes of your product in use, built from one photo or your website",
      "Delivered within three business days; music and captions on request",
    ],
    note: "A$599 adds real-motion video scenes; A$899 is five ads with a presenter.",
  },
];
