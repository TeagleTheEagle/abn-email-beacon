import cafe from '@/assets/demo-cafe.webp';
import tradie from '@/assets/demo-tradie.webp';
import salon from '@/assets/demo-salon.webp';
import retail from '@/assets/demo-retail.webp';

export const demos = {
  cafe: { name: 'Harbour & Grain', category: 'Café', eyebrow: 'Coffee. Community. The good things.', title: 'Your daily ritual, made better.', body: 'Fresh coffee, seasonal plates and a little time for yourself.', image: cafe, action: 'Explore the menu', items: [{ name: 'Flat white', detail: 'Coffee', price: 5 }, { name: 'Iced latte', detail: 'Coffee', price: 6 }, { name: 'Avocado toast', detail: 'Kitchen', price: 19 }, { name: 'Breakfast bowl', detail: 'Kitchen', price: 22 }] },
  tradie: { name: 'Northside Electrical', category: 'Trades', eyebrow: 'Local expertise. Straight answers.', title: 'Good work. No shortcuts.', body: 'Electrical repairs, lighting and upgrades for your home or business.', image: tradie, action: 'Request a job', items: [{ name: 'Repairs & fault finding', detail: 'Find the problem. Get it sorted.', price: 0 }, { name: 'Lighting installation', detail: 'A brighter, better space.', price: 0 }, { name: 'Switchboard upgrades', detail: 'Ready for the way you live.', price: 0 }] },
  salon: { name: 'FORME Studio', category: 'Hair & beauty', eyebrow: 'A fresh perspective.', title: 'Great hair. Entirely you.', body: 'Thoughtful cuts and considered colour, in a space to slow down.', image: salon, action: 'Book an appointment', items: [{ name: 'Cut & finish', detail: 'Shape, style and a fresh start.', price: 85 }, { name: 'Colour refresh', detail: 'A colour that feels like you.', price: 140 }, { name: 'Treatment & style', detail: 'A little extra care.', price: 65 }] },
  retail: { name: 'COMMON GOODS', category: 'Retail', eyebrow: 'Less, but better.', title: 'Everyday things. Well made.', body: 'Considered essentials for wherever your day takes you.', image: retail, action: 'Shop essentials', items: [{ name: 'Everyday canvas tote', detail: 'Olive · Cotton canvas', price: 39 }, { name: 'The everyday tee', detail: 'Natural · Organic cotton', price: 45 }, { name: 'Steel water bottle', detail: '500 ml · Stainless steel', price: 29 }] },
} as const;

export type DemoKind = keyof typeof demos;
export const demoKinds: DemoKind[] = ['cafe', 'tradie', 'salon', 'retail'];
export function isDemoKind(value: string): value is DemoKind { return demoKinds.some(kind => kind === value); }