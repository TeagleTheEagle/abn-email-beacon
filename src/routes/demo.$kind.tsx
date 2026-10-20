import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { demos, isDemoKind } from '@/content/demos';
import { DemoSite } from '@/components/DemoSite';
import { Button } from '@/components/ui/button';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/demo/$kind')({
  beforeLoad: ({ params }) => { if (!isDemoKind(params.kind)) throw notFound(); },
  head: ({ params }) => seo(`/demo/${params.kind}`, `${isDemoKind(params.kind) ? demos[params.kind].name : 'Website'} — Interactive Demo`, 'Explore an interactive Teague Industries website concept. Fictional business, illustrative imagery and no real bookings or payments.'),
  component: DemoPage,
});

function DemoPage() {
  const { kind } = Route.useParams();
  if (!isDemoKind(kind)) return null;
  return <div className="px-4 pb-12 pt-24 sm:px-6 sm:pt-28"><div className="mx-auto max-w-6xl"><div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><div className="min-w-0"><Button asChild variant="link" className="h-auto p-0"><Link to="/work"><ArrowLeft /> Back to work</Link></Button><h1 className="mt-2 text-base font-semibold text-foreground">{demos[kind].name}: {demos[kind].category.toLowerCase()} website demo</h1><p className="mt-1 text-sm text-muted-foreground">Interactive concept · Not a client project</p></div><Button asChild><Link to="/contact">Get a preview <ArrowRight /></Link></Button></div><DemoSite kind={kind} /></div></div>;
}