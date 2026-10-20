import { Monitor, ShoppingBag, Sparkles, LifeBuoy, type LucideIcon } from "lucide-react";

export type Service = {
  id: string;
  icon: LucideIcon;
  title: string;
  short: string;
  price: string;
  priceNote?: string;
  included: string[];
  whoFor: string;
  popular?: boolean;
};

export const services: Service[] = [
  {
    id: "website-build",
    icon: Monitor,
    title: "Website Build",
    short: "A fast, mobile-friendly website that brings in customers.",
    price: "A$500",
    priceNote: "one-off · Free preview first.",
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
    title: "Shopify Store Setup",
    short: "A Shopify store, built and ready to take orders.",
    price: "From A$1,200",
    included: [
      "Theme design",
      "Product upload",
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
    title: "Smart Store Setup (AI)",
    short: "Your store plus AI tools that sell while you sleep.",
    price: "From A$2,000",
    included: [
      "Everything in Shopify Store Setup",
      "AI-written product descriptions",
      "\"You may also like\" product recommendations",
      "Live chat with FAQ auto-replies and order tracking",
      "Automated emails: welcome, abandoned cart, post-purchase",
      "Built on Shopify's own tools — no extra monthly app fees",
    ],
    whoFor: "Store owners who want more sales with less admin.",
  },
  {
    id: "care-plan",
    icon: LifeBuoy,
    title: "Care Plan",
    short: "Monthly care so your site stays fast, safe and up to date.",
    price: "From A$49",
    priceNote: "/ month",
    included: [
      "Small edits and content updates",
      "Uptime and security checks",
      "Monthly health report",
      "Priority support",
    ],
    whoFor: "Anyone who'd rather run their business than maintain a website.",
  },
];
