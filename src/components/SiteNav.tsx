import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { CartDrawer } from "./CartDrawer";
import { Button } from "@/components/ui/button";
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
      <nav className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 md:flex md:justify-between lg:h-20">
        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Teague Industries home">
          <Logo className="h-7 w-7" />
          <span className="font-display text-[8px] text-foreground sm:text-[10px]">Teague Industries</span>
        </Link>
        <ul className="hidden min-w-0 items-center gap-5 lg:flex">
          {nav.filter(n => ["/services", "/work", "/pricing", "/about"].includes(n.to)).map((n) => (
            <li key={n.to}>
              <Link
                to={n.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-primary-soft" }}
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 items-center gap-3">
          <CartDrawer />
          <Link to="/contact" className="btn-primary hidden !px-5 !py-2.5 !text-xs sm:inline-flex">
            Get a free preview
          </Link>
          <Button variant="ghost" size="icon" className="text-foreground lg:hidden" onClick={() => setOpen(true)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col gap-2 border-l border-border bg-surface p-6 animate-in slide-in-from-right">
            <Button variant="ghost" size="icon" className="self-end" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-6 w-6" />
            </Button>
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium text-muted-foreground hover:text-foreground"
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
