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
    category: "Online Store",
    tag: "Live",
    description: "An online store selling ready-made Australian business templates.",
    image: templatesImg,
    imageAlt: "Laptop on a dark desk showing an online store of business document templates",
    link: { label: "View live", href: "/shop", external: false },
  },
  {
    title: "Café Website Starter Kit (Demo)",
    category: "Website",
    tag: "Demo",
    description:
      "An inviting café concept with a visual first impression and an interactive coffee and kitchen menu.",
    image: cafeImg,
    imageAlt: "Tablet on a café counter displaying a stylish café website",
    demoKind: "cafe",
    link: { label: "Open interactive demo", href: "/demo/cafe" },
  },
  {
    title: "Tradie Website (Demo)",
    category: "Website",
    tag: "Demo",
    description:
      "An electrical services concept with clear service details and a working demonstration job-request form.",
    image: tradieImg,
    imageAlt: "Demo plumbing and electrical website shown on a laptop in a work van",
    demoKind: "tradie",
    link: { label: "Open interactive demo", href: "/demo/tradie" },
  },
  {
    title: "Salon Website (Demo)",
    category: "Website",
    tag: "Demo",
    description:
      "A hair salon concept with a priced service menu and an interactive demonstration booking form.",
    image: salonImg,
    imageAlt: "Demo hair salon website shown on a tablet at a salon reception desk",
    demoKind: "salon",
    link: { label: "Open interactive demo", href: "/demo/salon" },
  },
  {
    title: "Retail Store (Demo)",
    category: "Online Store",
    tag: "Demo",
    description:
      "A boutique store concept with an essentials collection and a demo shopping bag. No payments are taken.",
    image: retailImg,
    imageAlt: "Demo clothing boutique online store shown on a laptop on a shop counter",
    demoKind: "retail",
    link: { label: "Open interactive demo", href: "/demo/retail" },
  },
  {
    title: "Your business could be here",
    category: "Founding clients",
    description: "Get a free preview of your new website or store — no obligation.",
    placeholder: true,
    link: { label: "Get a free preview", href: "/contact" },
  },
];
