import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { BookCallLink } from "./BookCallLink";
import { nav, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 px-6 pb-24 sm:pb-10">
      <div className="chrome-line mx-auto mb-16 max-w-6xl" />
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="font-display text-[11px] tracking-brand">Teague Industries</span>
          </div>
          <p className="label mt-5 !text-[10px] leading-6">{site.tagline}</p>
        </div>
        <div>
          <p className="label mb-4">Quick links</p>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-muted-foreground hover:text-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="label mb-4">Contact</p>
          <p>
            <a href={`mailto:${site.email}`} className="text-foreground hover:text-primary-soft">
              {site.email}
            </a>
          </p>
          <p>
            <BookCallLink className="text-foreground hover:text-primary-soft">
              Book a 15-minute call
            </BookCallLink>
          </p>
          <p>ABN: {site.abn}</p>
          <p>{site.location}</p>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
        <p>© 2026 Teague Industries</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
