import { ArrowRight, Clock, Instagram, MapPin, Phone, Star } from "lucide-react";
import type { ClientPreview as Preview } from "@/content/previews";
import { site } from "@/content/site";

// A client's free preview: a full, light-themed website for their business, framed by a thin
// Teague Industries band at the top. Nothing here submits anywhere; the phone and map links are real.
export function ClientPreview({ preview }: { preview: Preview }) {
  const tel = `tel:${preview.phone.replace(/[^\d+]/g, "")}`;
  const mapsSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${preview.name}, ${preview.address}`,
  )}`;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
    `${preview.name}, ${preview.address}`,
  )}&output=embed`;
  const menuId = "cs-items";
  const primaryHref = preview.kind === "barber" ? tel : `#${menuId}`;

  return (
    <div className="client-preview">
      <aside className="cs-band" aria-label="About this preview">
        <p>
          <strong>Free website preview for {preview.name}</strong>, prepared by Teague Industries.
          Details and photos are a first pass for you to correct. Like it? Reply to Ben at{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>. Nothing to pay unless you want it
          launched.
        </p>
      </aside>

      <div className={`client-site cs-theme-${preview.theme}`}>
        <header className="cs-header">
          <a href="#cs-top" className="cs-brand">
            {preview.brand}
          </a>
          <nav className="cs-nav" aria-label={`${preview.brand} sections`}>
            <a href={`#${menuId}`}>{preview.kind === "barber" ? "Services" : "Menu"}</a>
            <a href="#cs-about">About</a>
            <a href="#cs-hours">Hours</a>
            <a href="#cs-find">Find us</a>
          </nav>
          <a href={tel} className="cs-button cs-button-small">
            <Phone size={16} aria-hidden="true" /> {preview.phone}
          </a>
        </header>

        <section id="cs-top" className="cs-hero">
          <img
            src={preview.image}
            srcSet={`${preview.imageSmall} 640w, ${preview.image} 1024w`}
            sizes="100vw"
            alt={preview.imageAlt}
            width={1024}
            height={640}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="cs-hero-shade" aria-hidden="true" />
          <div className="cs-hero-copy">
            <p className="cs-eyebrow">{preview.eyebrow}</p>
            <h1>{preview.title}</h1>
            <p className="cs-lede">{preview.body}</p>
            <div className="cs-actions">
              <a href={primaryHref} className="cs-button">
                {preview.primaryAction} <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a
                href={mapsSearch}
                className="cs-button cs-button-ghost"
                target="_blank"
                rel="noreferrer"
              >
                <MapPin size={18} aria-hidden="true" /> Get directions
              </a>
            </div>
            <p className="cs-rating">
              <Star size={16} aria-hidden="true" fill="currentColor" />
              <span>
                {preview.rating.stars} stars from {preview.rating.count} Google reviews
              </span>
            </p>
          </div>
          <p className="cs-photo-note">Placeholder photo. Your photos go here.</p>
        </section>

        <section id={menuId} className="cs-section">
          <div className="cs-section-heading">
            <h2>{preview.itemsTitle}</h2>
            <p>{preview.itemsIntro}</p>
          </div>
          <ul className="cs-items">
            {preview.items.map((item) => (
              <li key={item.name} className="cs-item">
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="cs-about" className="cs-section cs-about">
          <div className="cs-about-grid">
            <div>
              <p className="cs-eyebrow">About</p>
              <h2>{preview.aboutTitle}</h2>
            </div>
            <div className="cs-about-copy">
              {preview.about.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="cs-section cs-details">
          <div id="cs-hours" className="cs-card">
            <h2>
              <Clock size={20} aria-hidden="true" /> Opening hours
            </h2>
            <dl className="cs-hours">
              {preview.hours.map((row) => (
                <div key={row.days}>
                  <dt>{row.days}</dt>
                  <dd>{row.hours}</dd>
                </div>
              ))}
            </dl>
            {preview.hoursNote && <p className="cs-muted">{preview.hoursNote}</p>}
          </div>
          <div id="cs-find" className="cs-card">
            <h2>
              <MapPin size={20} aria-hidden="true" /> Find us
            </h2>
            <p className="cs-address">{preview.address}</p>
            <p>
              <a href={tel} className="cs-link">
                <Phone size={16} aria-hidden="true" /> {preview.phone}
              </a>
            </p>
            {preview.instagram && (
              <p>
                <a href={preview.instagram} className="cs-link" target="_blank" rel="noreferrer">
                  <Instagram size={16} aria-hidden="true" /> Follow us on Instagram
                </a>
              </p>
            )}
            <a
              href={mapsSearch}
              className="cs-button cs-button-small"
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="cs-map">
            <iframe
              title={`Map showing ${preview.name}`}
              src={mapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>

        <section className="cs-section cs-cta">
          <h2>
            {preview.kind === "barber" ? "Need a cut this week?" : `See you at ${preview.brand}.`}
          </h2>
          <p>
            {preview.kind === "barber"
              ? "Walk in, or call ahead and we'll have a chair ready."
              : "Come in for breakfast or lunch, or call ahead for a bigger table."}
          </p>
          <div className="cs-actions">
            <a href={tel} className="cs-button">
              <Phone size={18} aria-hidden="true" /> Call {preview.phone}
            </a>
            <a
              href={mapsSearch}
              className="cs-button cs-button-ghost"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={18} aria-hidden="true" /> Directions
            </a>
          </div>
        </section>

        <footer className="cs-footer">
          <div>
            <strong>{preview.brand}</strong>
            <span>
              {preview.address} · {preview.phone}
            </span>
          </div>
          <span>Website preview by Teague Industries</span>
        </footer>
      </div>
    </div>
  );
}
