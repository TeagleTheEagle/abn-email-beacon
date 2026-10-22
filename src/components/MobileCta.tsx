import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

// On phones, keep "Get a free preview" one tap away once the visitor has scrolled past the hero.
// Hidden on the contact page (it's already the form) and inside the demos (they have their own UI).
export function MobileCta() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const on = () => setShown(window.scrollY > 480);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  if (pathname === "/contact" || pathname.startsWith("/demo/") || pathname === "/design-system")
    return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl transition-transform duration-300 sm:hidden ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!shown}
    >
      <Link to="/contact" className="btn-primary w-full" tabIndex={shown ? 0 : -1}>
        Get a free preview <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
