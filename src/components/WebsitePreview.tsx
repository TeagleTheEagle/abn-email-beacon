import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Monitor, Smartphone, Globe } from 'lucide-react';
import { DemoSite } from '@/components/DemoSite';
import { Button } from '@/components/ui/button';
import { demoKinds, demos, type DemoKind } from '@/content/demos';

export function WebsitePreview() {
  const [kind, setKind] = useState<DemoKind>('cafe');
  const [mobile, setMobile] = useState(false);
  return <div className="website-preview">
    <div className="preview-toolbar"><span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground"><Globe size={14} /><span className="truncate">{demos[kind].name} <span className="text-primary-soft">· Demo</span></span></span><div className="flex shrink-0 items-center gap-1"><Button variant="ghost" size="icon" title="Desktop preview" aria-label="Desktop preview" aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor /></Button><Button variant="ghost" size="icon" title="Mobile preview" aria-label="Mobile preview" aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone /></Button></div></div>
    <div className={`preview-viewport ${mobile ? 'preview-mobile' : ''}`}><DemoSite key={kind} kind={kind} compact /></div>
    <div className="preview-bottom"><div className="flex min-w-0 flex-wrap gap-1">{demoKinds.map(value => <Button key={value} size="sm" variant="ghost" className="preview-tab" aria-pressed={kind === value} onClick={() => setKind(value)}>{value === 'cafe' ? 'Café' : value === 'tradie' ? 'Trades' : value === 'salon' ? 'Salon' : 'Retail'}</Button>)}</div><Button asChild size="icon" variant="ghost" title="Open full demo"><Link to="/demo/$kind" params={{ kind }} aria-label="Open full demo"><ArrowUpRight /></Link></Button></div>
  </div>;
}