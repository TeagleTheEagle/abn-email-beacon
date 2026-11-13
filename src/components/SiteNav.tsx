import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, LogOut, User, Mail } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { nav } from "@/content/site";
import { useAuth } from "@/contexts/AuthContext";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const displayName = profile?.full_name || profile?.business_name || user?.email || "Account";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border bg-surface/80 backdrop-blur-xl" : "bg-transparent"
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
            .filter((n) =>
              ["/services", "/work", "/demos", "/pricing", "/shop", "/about"].includes(n.to),
            )
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
          {loading ? (
            <div className="h-10 w-24 animate-pulse bg-surface-2 rounded" aria-hidden="true" />
          ) : user ? (
            <>
              <Link
                to="/account"
                className="btn-chrome hidden !px-5 !py-2.5 !text-xs sm:inline-flex"
              >
                Client Portal
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 lg:hidden">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass" align="end" sideOffset={4}>
                  <div className="p-2 border-b border-border">
                    <p className="font-medium text-sm truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2">
                      <User className="h-4 w-4" aria-hidden="true" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                    }}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Desktop avatar dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden lg:inline-flex h-9 gap-2">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[140px]">
                      {displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass" align="end" sideOffset={4}>
                  <div className="p-2 border-b border-border">
                    <p className="font-medium text-sm truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2">
                      <User className="h-4 w-4" aria-hidden="true" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                    }}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth" className="btn-chrome hidden !px-5 !py-2.5 !text-xs sm:inline-flex">
              Client Portal
            </Link>
          )}
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
                {user ? (
                  <>
                    <Link to="/account" onClick={() => setOpen(false)} className="btn-chrome mt-2">
                      Client Portal
                    </Link>
                    <button
                      onClick={async () => {
                        setOpen(false);
                        await signOut();
                      }}
                      className="btn-primary mt-2 text-destructive bg-destructive border-destructive hover:bg-destructive/90"
                    >
                      <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)} className="btn-chrome mt-2">
                    Client Portal
                  </Link>
                )}
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
