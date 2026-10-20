import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { CartDrawer } from "./CartDrawer";
import { nav } from "@/content/site";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border bg-background/70 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:h-20">
        <Link to="/" className="flex items-center gap-3" aria-label="Teague Industries home">
          <Logo className="h-7 w-7" />
          <span className="hidden font-display text-[10px] tracking-brand text-foreground sm:block">Teague Industries</span>
        </Link>
        <ul className="hidden items-center gap-7 lg:flex">
          {nav.map((n) => (
            <li key={n.to}>
              <Link
                to={n.to}
                className="font-display text-[10px] tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-primary-soft" }}
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <CartDrawer />
          <Link to="/contact" className="btn-primary hidden !px-5 !py-2.5 !text-xs sm:inline-flex">
            Get a free preview
          </Link>
          <button className="p-2 text-foreground lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col gap-2 border-l border-border bg-surface p-6 animate-in slide-in-from-right">
            <button className="self-end p-2" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-6 w-6" />
            </button>
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 font-display text-xs tracking-[0.25em] text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-primary-soft" }}
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setOpen(false)} className="btn-primary mt-6">
              Get a free preview
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
