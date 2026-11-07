import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ShoppingBag, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demos, type DemoKind } from "@/content/demos";

// `priority` marks the one preview that is the page's largest visible image (the home hero) so the
// browser fetches it first; every other demo image waits until it's near the viewport.
export function DemoSite({
  kind,
  compact = false,
  priority = false,
  businessName,
  location,
}: {
  kind: DemoKind;
  compact?: boolean;
  priority?: boolean;
  businessName?: string;
  location?: string;
}) {
  const demo = demos[kind];
  const searchParams =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const customBiz = businessName?.trim() || searchParams?.get("biz")?.trim() || "";
  const customLoc = location?.trim() || searchParams?.get("loc")?.trim() || "";
  const activeName = customBiz || demo.name;
  const activeEyebrow = customLoc ? `${demo.category} · ${customLoc}` : demo.eyebrow;
  const activeTitle = customBiz
    ? customLoc
      ? `${customBiz} — ${customLoc}`
      : `${customBiz} · ${demo.title}`
    : demo.title;
  const isBookingKind = kind === "tradie" || kind === "salon" || kind === "barbershop";
  const isAppointmentKind = kind === "salon" || kind === "barbershop";
  const [filter, setFilter] = useState("All");
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const count = Object.values(quantities).reduce((total, value) => total + value, 0);
  const total = demo.items.reduce(
    (sum, item) => sum + item.price * (quantities[item.name] ?? 0),
    0,
  );
  // The booking/request form renders further down the demo; bring it into view and focus it, otherwise
  // the button looks like it did nothing.
  const bookingRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!booking || !bookingRef.current) return;
    bookingRef.current.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "center",
    });
    bookingRef.current.querySelector("input")?.focus({ preventScroll: true });
  }, [booking]);
  const openAction = () => {
    if (isBookingKind) setBooking(true);
    else
      document
        .getElementById(`demo-items-${kind}-${compact ? "compact" : "full"}`)
        ?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
          block: "nearest",
        });
  };
  return (
    <div className={`demo-site demo-${kind} ${compact ? "demo-compact" : ""}`}>
      <div className="demo-navigation">
        <span className="demo-brand">{activeName}</span>
        <span className="demo-nav-links">
          {kind === "retail" ? "Collection" : kind === "cafe" ? "Menu & kitchen" : "Our services"}
        </span>
        {kind === "retail" ? (
          <span className="demo-bag">
            <ShoppingBag size={16} /> {count}
          </span>
        ) : (
          <Button size="sm" className="demo-button" onClick={openAction}>
            {isAppointmentKind ? "Book now" : kind === "tradie" ? "Get in touch" : "Our menu"}{" "}
            <ArrowRight />
          </Button>
        )}
      </div>
      <div className="demo-cover">
        <img
          src={demo.image}
          srcSet={`${demo.imageSmall} 640w, ${demo.image} 1024w`}
          sizes={compact ? "(max-width: 767px) 92vw, 640px" : "(max-width: 1199px) 92vw, 1100px"}
          alt={`${demo.category} concept imagery for ${activeName}`}
          width={1024}
          height={640}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
        />
        <div className="demo-cover-shade" />
        <div className="demo-cover-copy">
          <p className="demo-eyebrow">{activeEyebrow}</p>
          <h2>{activeTitle}</h2>
          <p>{demo.body}</p>
          <Button className="demo-button" onClick={openAction}>
            {demo.action} <ArrowRight />
          </Button>
        </div>
      </div>
      <section id={`demo-items-${kind}-${compact ? "compact" : "full"}`} className="demo-items">
        <div className="demo-section-heading">
          <h3>{demo.itemsTitle}</h3>
          {kind === "cafe" && (
            <div className="demo-filters">
              {["All", "Coffee", "Kitchen"].map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant="ghost"
                  aria-pressed={filter === value}
                  className="demo-filter"
                  onClick={() => setFilter(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="demo-item-grid">
          {demo.items
            .filter((item) => kind !== "cafe" || filter === "All" || item.detail === filter)
            .map((item) => (
              <article key={item.name} className="demo-item">
                <div>
                  <h4>{item.name}</h4>
                  <p>{item.detail}</p>
                </div>
                <div className="demo-item-action">
                  {item.price > 0 && <strong>A${item.price}</strong>}
                  {kind === "retail" && (
                    <div className="demo-quantity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="demo-filter"
                        aria-label={`Remove ${item.name}`}
                        disabled={!quantities[item.name]}
                        onClick={() =>
                          setQuantities((q) => ({
                            ...q,
                            [item.name]: Math.max(0, (q[item.name] ?? 0) - 1),
                          }))
                        }
                      >
                        <Minus />
                      </Button>
                      <span>{quantities[item.name] ?? 0}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="demo-filter"
                        aria-label={`Add ${item.name}`}
                        onClick={() =>
                          setQuantities((q) => ({ ...q, [item.name]: (q[item.name] ?? 0) + 1 }))
                        }
                      >
                        <Plus />
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            ))}
        </div>
        {kind === "retail" && count > 0 && (
          <p className="demo-cart" role="status">
            Demo bag · {count} {count === 1 ? "item" : "items"} · A${total} — no payment taken
          </p>
        )}
        {isBookingKind && booking && (
          <form
            ref={bookingRef}
            className="demo-booking"
            onSubmit={(event) => {
              event.preventDefault();
              setConfirmed(true);
            }}
          >
            {confirmed ? (
              <p role="status">
                <Check size={18} /> Demo request complete — no enquiry has been sent.
              </p>
            ) : (
              <>
                <label>
                  Your name
                  <input required autoComplete="name" placeholder="Alex" />
                </label>
                <label>
                  {isAppointmentKind ? "Preferred date" : "Job details"}
                  <input
                    required
                    type={isAppointmentKind ? "date" : "text"}
                    placeholder={isAppointmentKind ? "Pick a date" : "What needs attention?"}
                  />
                </label>
                <Button className="demo-button" type="submit">
                  {isAppointmentKind ? "Preview booking" : "Preview request"} <ArrowRight />
                </Button>
              </>
            )}
          </form>
        )}
      </section>
      {!compact && (
        <footer className="demo-footer">
          <strong>{activeName}</strong>
          <span>Fictional business · Demonstration only · Images and prices are illustrative</span>
        </footer>
      )}
    </div>
  );
}
