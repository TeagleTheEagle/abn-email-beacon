import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { site } from "@/content/site";

// "Book a call" goes to the booking page in site.bookingUrl when there is one, otherwise to the
// call-request form at /book.
export function BookCallLink({
  className,
  children = "Book a 15-minute call",
}: {
  className?: string;
  children?: ReactNode;
}) {
  if (site.bookingUrl) {
    return (
      <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to="/book" className={className}>
      {children}
    </Link>
  );
}
