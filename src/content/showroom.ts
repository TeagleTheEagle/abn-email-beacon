// The Website Designs showroom (/demos): twelve fictional businesses, one interactive demo each
// (components in src/components/showroom/demos). Every name, address, price and review in them is
// invented sample content, and the pages say so.

export const showroomCategories = [
  { id: "beauty", label: "Beauty & Wellness" },
  { id: "automotive", label: "Automotive" },
  { id: "hospitality", label: "Hospitality" },
  { id: "trades", label: "Trades" },
  { id: "home", label: "Home Services" },
  { id: "fitness", label: "Health & Fitness" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "corporate", label: "Professional Services" },
] as const;

export type ShowroomCategory = (typeof showroomCategories)[number]["id"];

export type ShowroomDesign = {
  id: string;
  slug: string;
  title: string;
  // The invented business the demo is built for.
  businessName: string;
  industry: string;
  category: ShowroomCategory;
  tagline: string;
  description: string;
  styleTags: readonly string[];
  // Page sections, in order, as listed in the comparison drawer.
  sections: readonly string[];
  includedFeatures: readonly string[];
  interactiveWidget: string;
  accentColor: string;
  // Swatch colours for the gallery card; the demo itself sets its own styles.
  palette: { background: string; surface: string; text: string; accent: string };
};

export const showroomDesigns = [
  {
    id: "01",
    slug: "barbershop",
    title: "Luxury Barbershop",
    businessName: "Brass & Blade Barber Co.",
    industry: "Barbershop",
    category: "beauty",
    tagline: "Dark charcoal, brushed brass and a chair that's always booked.",
    description:
      "A moody, editorial barbershop site with barber profiles, a clear price list and an appointment request form that picks the barber, service and time.",
    styleTags: ["Dark & moody", "Brass accents", "Editorial serif"],
    sections: ["Hero", "Barbers", "Services & pricing", "Appointment request", "Reviews", "Hours"],
    includedFeatures: ["Barber profiles", "Service price list", "Click-to-call", "Opening hours"],
    interactiveWidget: "Appointment request form",
    accentColor: "#c9a45c",
    palette: { background: "#141414", surface: "#1f1d1a", text: "#efe6d6", accent: "#c9a45c" },
  },
  {
    id: "02",
    slug: "beauty-salon",
    title: "Beauty Salon & Spa",
    businessName: "Maison Bloom Beauty & Spa",
    industry: "Beauty salon & day spa",
    category: "beauty",
    tagline: "Soft cream and blush, with treatments that book themselves.",
    description:
      "A calm, luxurious salon and spa site with treatment categories, pricing cards and a step-by-step booking flow from treatment to time.",
    styleTags: ["Soft & luxurious", "Cream & blush", "Elegant serif"],
    sections: ["Hero", "Treatments", "Pricing", "Booking", "Reviews", "Visit us"],
    includedFeatures: ["Treatment menu", "Pricing cards", "Gift voucher banner", "Opening hours"],
    interactiveWidget: "Treatment tabs and booking flow",
    accentColor: "#c98b86",
    palette: { background: "#faf6f1", surface: "#f3e6e1", text: "#4a3b38", accent: "#c98b86" },
  },
  {
    id: "03",
    slug: "auto-detailing",
    title: "Automotive Detailing",
    businessName: "Apex Gloss Detailing",
    industry: "Car detailing",
    category: "automotive",
    tagline: "High contrast, high gloss, and proof on every page.",
    description:
      "A bold, high-contrast detailing site with a package selector and a before-and-after slider that shows the finish rather than describing it.",
    styleTags: ["High contrast", "Bold type", "Performance"],
    sections: ["Hero", "Before & after", "Packages", "Add-ons", "Reviews", "Booking"],
    includedFeatures: ["Package comparison", "Add-on pricing", "Booking request", "Service area"],
    interactiveWidget: "Before/after comparison slider",
    accentColor: "#ff5a1f",
    palette: { background: "#0b0d10", surface: "#161a20", text: "#f4f5f7", accent: "#ff5a1f" },
  },
  {
    id: "04",
    slug: "cafe",
    title: "Café & Coffee Shop",
    businessName: "Ember & Oat Café",
    industry: "Café",
    category: "hospitality",
    tagline: "Warm terracotta and espresso, with a menu worth scrolling.",
    description:
      "A warm neighbourhood café site with a menu you can filter by coffee, kitchen and bakery, and a table reservation request.",
    styleTags: ["Warm & inviting", "Terracotta", "Rounded type"],
    sections: ["Hero", "Menu", "Our story", "Reservations", "Reviews", "Hours & location"],
    includedFeatures: ["Filterable menu", "Dietary labels", "Opening hours", "Map & directions"],
    interactiveWidget: "Filterable menu and table reservation",
    accentColor: "#c2643f",
    palette: { background: "#f5ede3", surface: "#ead8c6", text: "#3b2a22", accent: "#c2643f" },
  },
  {
    id: "05",
    slug: "plumbing-trades",
    title: "Plumbing & Trades",
    businessName: "Steadfast Plumbing Co.",
    industry: "Plumbing & gas",
    category: "trades",
    tagline: "Navy and cyan, built for the 2 am burst pipe.",
    description:
      "A high-trust trades site that leads with the emergency line, shows the service area and gives an instant price range for common faults.",
    styleTags: ["High trust", "Navy & cyan", "Emergency-first"],
    sections: ["Emergency bar", "Hero", "Services", "Quote estimator", "Service area", "Reviews"],
    includedFeatures: ["24/7 call button", "Service area checklist", "Licence details", "Reviews"],
    interactiveWidget: "Instant quote estimator",
    accentColor: "#19c3e6",
    palette: { background: "#0c1f3f", surface: "#13305e", text: "#f2f7fb", accent: "#19c3e6" },
  },
  {
    id: "06",
    slug: "pet-grooming",
    title: "Pet Grooming",
    businessName: "Wag & Willow Grooming",
    industry: "Pet grooming",
    category: "home",
    tagline: "Sage and sand, friendly for owners and their dogs.",
    description:
      "An approachable grooming site with clear packages and a calculator that prices a groom by your dog's size and breed.",
    styleTags: ["Friendly", "Sage & sand", "Rounded shapes"],
    sections: ["Hero", "Packages", "Price calculator", "How it works", "Reviews", "Book"],
    includedFeatures: ["Grooming packages", "Mobile van option", "FAQs", "Booking request"],
    interactiveWidget: "Dog size and breed price calculator",
    accentColor: "#6f8f6a",
    palette: { background: "#f6f0e6", surface: "#e5ecdf", text: "#3d4a3a", accent: "#6f8f6a" },
  },
  {
    id: "07",
    slug: "landscaping",
    title: "Landscaping & Gardening",
    businessName: "Greenline Landscape Studio",
    industry: "Landscape design",
    category: "trades",
    tagline: "Forest green and stone, laid out like an architect's folio.",
    description:
      "An architectural portfolio site for a landscaper, with residential and commercial work on separate tabs and a budget selector that frames the first conversation.",
    styleTags: ["Architectural", "Forest green", "Portfolio-led"],
    sections: ["Hero", "Projects", "Services", "Budget planner", "Process", "Contact"],
    includedFeatures: ["Project portfolio", "Residential & commercial", "Process steps", "Enquiry"],
    interactiveWidget: "Project budget selector",
    accentColor: "#7fa35b",
    palette: { background: "#f1efe9", surface: "#1f3d2b", text: "#1c2a21", accent: "#7fa35b" },
  },
  {
    id: "08",
    slug: "fitness-studio",
    title: "Fitness Studio & Personal Training",
    businessName: "Forge Athletic Studio",
    industry: "Fitness studio",
    category: "fitness",
    tagline: "Black and electric lime, with a timetable that filters itself.",
    description:
      "A high-energy studio site with trainer profiles, a free trial pass request and a weekly class timetable you can filter by day and intensity.",
    styleTags: ["Athletic", "High contrast", "Condensed type"],
    sections: ["Hero", "Timetable", "Trainers", "Memberships", "Trial pass", "Reviews"],
    includedFeatures: ["Trainer cards", "Membership options", "Free trial request", "Reviews"],
    interactiveWidget: "Class timetable filtered by day and intensity",
    accentColor: "#d4ff00",
    palette: { background: "#0d0d0d", surface: "#1a1a1a", text: "#f5f5f5", accent: "#d4ff00" },
  },
  {
    id: "09",
    slug: "fine-dining",
    title: "Restaurant & Fine Dining",
    businessName: "Aurelia Dining Room",
    industry: "Fine dining restaurant",
    category: "hospitality",
    tagline: "Deep burgundy and charcoal, set like a printed menu.",
    description:
      "An editorial restaurant site with a tasting menu you open course by course and a private dining enquiry for groups and events.",
    styleTags: ["Editorial", "Burgundy & gold", "Classic serif"],
    sections: ["Hero", "Tasting menu", "The room", "Private dining", "Press", "Reservations"],
    includedFeatures: ["Course-by-course menu", "Wine pairing", "Private dining", "Dress code"],
    interactiveWidget: "Tasting menu accordion and private dining enquiry",
    accentColor: "#c8a96a",
    palette: { background: "#1b1b1d", surface: "#4a0f1c", text: "#f3ece0", accent: "#c8a96a" },
  },
  {
    id: "10",
    slug: "cleaning-services",
    title: "Cleaning Services",
    businessName: "Clearwater Cleaning Co.",
    industry: "Home & office cleaning",
    category: "home",
    tagline: "Crisp ocean blue, with a price before the first phone call.",
    description:
      "A fresh, trustworthy cleaning site with service tiers and an estimator that prices a clean by room count and how often you book.",
    styleTags: ["Crisp & clean", "Ocean blue", "Friendly sans"],
    sections: ["Hero", "Service tiers", "Price estimator", "What's included", "Reviews", "Book"],
    includedFeatures: [
      "Service tiers",
      "Checklist of inclusions",
      "Insured & police-checked",
      "FAQs",
    ],
    interactiveWidget: "Room count and frequency price estimator",
    accentColor: "#0a6ebd",
    palette: { background: "#f2f8fc", surface: "#dcecf8", text: "#0f2b40", accent: "#0a6ebd" },
  },
  {
    id: "11",
    slug: "boutique-ecommerce",
    title: "Boutique E-Commerce Store",
    businessName: "Atelier Nord",
    industry: "Fashion boutique",
    category: "ecommerce",
    tagline: "Minimal luxury retail, from product grid to cart.",
    description:
      "A minimal online boutique with a product grid, size and colour selection and a working demo cart with quantities and a subtotal. No real payments.",
    styleTags: ["Minimal", "Luxury retail", "Generous white space"],
    sections: ["Hero", "New arrivals", "Product detail", "Cart", "Journal", "Newsletter"],
    includedFeatures: ["Product grid", "Size & colour options", "Cart drawer", "Free shipping bar"],
    interactiveWidget: "Size selector and demo shopping cart",
    accentColor: "#8a6d4b",
    palette: { background: "#f7f5f2", surface: "#ebe6df", text: "#111111", accent: "#8a6d4b" },
  },
  {
    id: "12",
    slug: "consulting",
    title: "Professional Consulting",
    businessName: "Meridian Advisory",
    industry: "Business consulting",
    category: "corporate",
    tagline: "Slate and navy, with case studies that do the selling.",
    description:
      "A composed corporate site with practice areas, illustrative case studies and a consultation request that asks the right questions up front.",
    styleTags: ["Corporate", "Slate & navy", "Measured"],
    sections: ["Hero", "Practice areas", "Case studies", "Approach", "Team", "Consultation"],
    includedFeatures: ["Practice areas", "Case study cards", "Team profiles", "Insights"],
    interactiveWidget: "Consultation request flow",
    accentColor: "#689af5",
    palette: { background: "#f4f6f9", surface: "#0f2a4a", text: "#1e293b", accent: "#689af5" },
  },
] as const satisfies readonly ShowroomDesign[];

export type ShowroomSlug = (typeof showroomDesigns)[number]["slug"];

export const showroomSlugs: ShowroomSlug[] = showroomDesigns.map((d) => d.slug);

// `some` rather than an object lookup, so prototype names like "constructor" never match.
export const isShowroomSlug = (slug: string): slug is ShowroomSlug =>
  showroomDesigns.some((d) => d.slug === slug);

export function getShowroomDesign(slug: ShowroomSlug): ShowroomDesign {
  const design = showroomDesigns.find((d) => d.slug === slug);
  if (!design) throw new Error(`Unknown showroom design: ${slug}`);
  return design;
}

export const categoryLabel = (category: ShowroomCategory) =>
  showroomCategories.find((c) => c.id === category)?.label ?? category;

// How many designs the /demos comparison drawer holds at once.
export const MAX_COMPARE = 3;

// A made-up web address for the mock browser bars (viewer frame and gallery previews), built from
// the fictional business name.
export const demoDomain = (design: ShowroomDesign) =>
  `${design.businessName
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")}.example`;
