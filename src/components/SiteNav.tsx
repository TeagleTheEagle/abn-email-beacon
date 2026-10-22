import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "./Logo";
import { CartDrawer } from "./CartDrawer";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3"
          aria-label="Teague Industries home"
        >
          <Logo className="h-8 w-8" />
          <span className="font-display text-[10px] text-foreground sm:text-xs">
            Teague Industries
          </span>
        </Link>
        <ul className="hidden min-w-0 items-center gap-5 lg:flex">
          {nav
            .filter((n) => ["/services", "/work", "/pricing", "/about"].includes(n.to))
            .map((n) => (
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
          {/* Sheet (Radix Dialog) gives the phone menu what a hand-rolled overlay lacks: Escape closes it,
              focus moves in and is trapped, the page behind stops scrolling, and focus returns on close. */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-72 flex-col gap-2 border-l border-border bg-surface p-6 lg:hidden">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Site navigation</SheetDescription>
              </SheetHeader>
              <nav aria-label="Site" className="mt-6 flex flex-col gap-2">
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
