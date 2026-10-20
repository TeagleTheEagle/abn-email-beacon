import templatesImg from "@/assets/work-templates.jpg";
import cafeImg from "@/assets/work-cafe.jpg";

export type Project = {
  title: string;
  category: string;
  tag?: string;
  description: string;
  image?: string;
  imageAlt?: string;
  link?: { label: string; href: string; external?: boolean };
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
    link: { label: "View live", href: "https://teagueindustries.com.au", external: true },
  },
  {
    title: "Café Website Starter Kit",
    category: "Website",
    tag: "Demo",
    description: "A demo café website template with menu, location and contact pages.",
    image: cafeImg,
    imageAlt: "Tablet on a café counter displaying a stylish café website",
    link: { label: "View demo", href: "/contact" },
  },
  {
    title: "Your business could be here",
    category: "Coming soon",
    description: "Get a free preview of your new website or store — no obligation.",
    placeholder: true,
    link: { label: "Get a free preview", href: "/contact" },
  },
];
