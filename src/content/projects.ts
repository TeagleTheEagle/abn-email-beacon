import templatesImg from "@/assets/work-templates.jpg";
import cafeImg from "@/assets/work-cafe.jpg";
import tradieImg from "@/assets/work-tradie.jpg";
import salonImg from "@/assets/work-salon.jpg";
import retailImg from "@/assets/work-retail.jpg";

export type Project = {
  title: string;
  category: string;
  tag?: string;
  description: string;
  image?: string;
  imageAlt?: string;
  link?: { label: string; href: string; external?: boolean };
  demoKind?: "cafe" | "tradie" | "salon" | "retail";
  placeholder?: boolean;
};

// Add new projects to this array.
export const projects: Project[] = [
  {
    title: "Teague Industries Templates Store",
    category: "Shopify Store",
    tag: "Live",
    description: "A Shopify store selling ready-made Australian business templates.",
    image: templatesImg,
    imageAlt: "Laptop on a dark desk showing an online store of business document templates",
    link: { label: "View live", href: "/shop", external: false },
  },
  {
    title: "Café Website Starter Kit (Demo)",
    category: "Website",
    tag: "Demo",
    description: "A one-page café website template with menu, gallery, reviews and a visit-us section.",
    image: cafeImg,
    imageAlt: "Tablet on a café counter displaying a stylish café website",
    demoKind: "cafe",
    link: { label: "Open interactive demo", href: "/demo/cafe" },
  },
  {
    title: "Tradie Website (Demo)",
    category: "Website",
    tag: "Demo",
    description: "Demo design for a plumber or electrician: services, service areas, licence details and a 'Book a job' form.",
    image: tradieImg,
    imageAlt: "Demo plumbing and electrical website shown on a laptop in a work van",
    demoKind: "tradie",
    link: { label: "Open interactive demo", href: "/demo/tradie" },
  },
  {
    title: "Salon Website (Demo)",
    category: "Website",
    tag: "Demo",
    description: "Demo design for a hair or beauty salon: service menu with prices, gallery and online booking.",
    image: salonImg,
    imageAlt: "Demo hair salon website shown on a tablet at a salon reception desk",
    demoKind: "salon",
    link: { label: "Open interactive demo", href: "/demo/salon" },
  },
  {
    title: "Retail Shopify Store (Demo)",
    category: "Shopify Store",
    tag: "Demo",
    description: "Demo design for a boutique shop: best sellers, product pages, cart and Shopify checkout.",
    image: retailImg,
    imageAlt: "Demo clothing boutique online store shown on a laptop on a shop counter",
    demoKind: "retail",
    link: { label: "Open interactive demo", href: "/demo/retail" },
  },
  {
    title: "Your business could be here",
    category: "Coming soon",
    description: "Get a free preview of your new website or store — no obligation.",
    placeholder: true,
    link: { label: "Get a free preview", href: "/contact" },
  },
];
