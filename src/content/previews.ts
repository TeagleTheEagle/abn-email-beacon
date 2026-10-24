import cafe from "@/assets/demo-cafe.webp";
import cafeSmall from "@/assets/demo-cafe-640.webp";
import salon from "@/assets/demo-salon.webp";
import salonSmall from "@/assets/demo-salon-640.webp";

// Free previews for real prospects. Each is a first pass at a client's website built from public
// details (Google listing, hours, what reviewers mention). Pages live at /preview/<slug>, are
// noindex and are not in the nav or sitemap. Photos are placeholders until the client supplies theirs.
// Prospect list and outreach messages: outreach/ (untracked).

export type PreviewHours = { days: string; hours: string };
export type PreviewItem = { name: string; detail: string };

export type ClientPreview = {
  slug: string;
  /** Short brand name for the header and footer. */
  brand: string;
  /** Full trading name as it appears on Google. */
  name: string;
  kind: "barber" | "cafe";
  theme: "barber" | "cafe-fresh" | "cafe-cosy";
  suburb: string;
  address: string;
  phone: string;
  instagram?: string;
  eyebrow: string;
  title: string;
  body: string;
  primaryAction: string;
  itemsTitle: string;
  itemsIntro: string;
  items: PreviewItem[];
  aboutTitle: string;
  about: string[];
  rating: { stars: string; count: number };
  hours: PreviewHours[];
  hoursNote?: string;
  image: string;
  imageSmall: string;
  imageAlt: string;
};

export const previews: Record<string, ClientPreview> = {
  "frank-and-michael": {
    slug: "frank-and-michael",
    brand: "Frank & Michael",
    name: "Frank and Michael Hairdressing Barber Shop",
    kind: "barber",
    theme: "barber",
    suburb: "Crows Nest",
    address: "441 Pacific Hwy, Crows Nest NSW 2065",
    phone: "0410 492 387",
    eyebrow: "Crows Nest · Est. on the Pacific Highway",
    title: "A proper barber shop. The old-school kind.",
    body: "Good haircuts, a friendly chat and fair prices, six days a week on the Pacific Highway at Crows Nest.",
    primaryAction: "Call to book",
    itemsTitle: "What we do",
    itemsIntro: "Classic barbering, done properly. Walk in or call ahead.",
    items: [
      { name: "Men's haircuts", detail: "Classic cuts, modern styles and a tidy finish." },
      { name: "Hairdressing", detail: "Cuts and styling for the whole family." },
      { name: "Beard trims", detail: "Shaped, lined up and kept neat." },
      { name: "Kids' cuts", detail: "Patient, quick and friendly." },
    ],
    aboutTitle: "Homely and old school",
    about: [
      "Frank and Michael run a traditional barber shop at 441 Pacific Highway. Regulars describe the place as homely and old school, like a barber shop in a small Italian town, and they keep coming back for the same reason: consistently good cuts at a reasonable price.",
      "With 234 Google reviews and a 4.9-star rating, it is one of the best-reviewed barbers on the North Shore. Frank, Michael and Ken look after you from the moment you sit down.",
    ],
    rating: { stars: "4.9", count: 234 },
    hours: [
      { days: "Monday to Friday", hours: "8:30 am – 5:30 pm" },
      { days: "Saturday", hours: "8 am – 1 pm" },
      { days: "Sunday", hours: "Closed" },
    ],
    hoursNote: "Closed on public holidays.",
    image: salon,
    imageSmall: salonSmall,
    imageAlt: "Placeholder photo of a hair studio interior",
  },
  "lil-lane-eatery": {
    slug: "lil-lane-eatery",
    brand: "Lil Lane Eatery",
    name: "Lil Lane Eatery",
    kind: "cafe",
    theme: "cafe-fresh",
    suburb: "Lane Cove",
    address: "Shop 1/152 Longueville Rd, Lane Cove NSW 2066",
    phone: "(02) 9418 9708",
    instagram: "https://www.instagram.com/lillane_eatery/",
    eyebrow: "Lane Cove · Breakfast and lunch",
    title: "Modern Australian, with an Asian twist.",
    body: "Big flavours, great coffee and a menu that looks after everyone, from low-carb to little ones. Tuesday to Sunday from 7 am.",
    primaryAction: "See the menu",
    itemsTitle: "What people come for",
    itemsIntro: "A few of the dishes regulars keep mentioning.",
    items: [
      { name: "Chilli scrambled eggs", detail: "Breakfast with a kick." },
      { name: "Eggs benny", detail: "A classic, done well." },
      { name: "Low-carb brekkie", detail: "All the good stuff, none of the heaviness." },
      { name: "Haloumi wrap", detail: "Grilled haloumi, fresh and filling." },
      { name: "The ugly potato", detail: "Not pretty. Unreasonably good." },
      { name: "Kids' menu", detail: "Proper food and drinks for small people, at fair prices." },
    ],
    aboutTitle: "A little local spot with a big following",
    about: [
      "Tucked into Longueville Road, Lil Lane has become one of Lane Cove's favourite cafés: 4.8 stars from almost 400 Google reviews. The menu blends modern Australian and Asian flavours, with plenty of vegan and low-carb options, and the coffee gets as much praise as the food.",
      "Beautiful décor, super friendly service and a warm welcome for families. Come early, grab a table outside and make a morning of it.",
    ],
    rating: { stars: "4.8", count: 399 },
    hours: [
      { days: "Tuesday to Sunday", hours: "7 am – 2 pm" },
      { days: "Monday", hours: "Closed" },
    ],
    image: cafe,
    imageSmall: cafeSmall,
    imageAlt: "Placeholder photo of a café counter and coffee",
  },
  "birdwood-cafe": {
    slug: "birdwood-cafe",
    brand: "Birdwood Cafe",
    name: "Birdwood Cafe",
    kind: "cafe",
    theme: "cafe-cosy",
    suburb: "Lane Cove",
    address: "24 Birdwood Ln, Lane Cove NSW 2066",
    phone: "(02) 8095 0400",
    eyebrow: "Lane Cove · Open every day from 6 am",
    title: "Your local on Birdwood Lane.",
    body: "Breakfast, lunch and good coffee, seven days a week. Cosy inside, sunny out the front.",
    primaryAction: "See the menu",
    itemsTitle: "Regulars' favourites",
    itemsIntro: "The dishes that come up again and again in our reviews.",
    items: [
      { name: "Pork belly sandwich", detail: "The one people cross Lane Cove for." },
      { name: "Eggs benedict", detail: "Soft eggs, proper hollandaise." },
      { name: "Bacon and egg roll", detail: "The breakfast classic, made fresh." },
      { name: "Banana bread", detail: "Toasted, buttered, gone." },
      { name: "Coffee", detail: "From 6 am, for the early starters." },
    ],
    aboutTitle: "Cosy, friendly and open early",
    about: [
      "Birdwood Cafe is tucked into Birdwood Lane, just off the main strip in Lane Cove. It opens at 6 am every day of the week, which makes it the first stop for a lot of early starters, and the kitchen runs through to mid-afternoon.",
      "With more than 440 Google reviews, it is one of the most-reviewed cafés in Lane Cove. People mention the friendly, attentive staff, the cosy room and the outdoor seating almost as often as the pork belly sandwich.",
    ],
    rating: { stars: "4.3", count: 443 },
    hours: [{ days: "Every day", hours: "6 am – 3 pm" }],
    image: cafe,
    imageSmall: cafeSmall,
    imageAlt: "Placeholder photo of a café counter and coffee",
  },
};

export const previewSlugs = Object.keys(previews);
export function isPreviewSlug(value: string): value is keyof typeof previews {
  return Object.hasOwn(previews, value);
}
