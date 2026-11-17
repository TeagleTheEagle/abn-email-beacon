import { getProductPreview } from "@/content/product-previews";

export function ProductPreview({ handle }: { handle: string }) {
  const preview = getProductPreview(handle);
  if (!preview) return null;
  return (
    <section aria-labelledby="actual-product-preview" className="mt-10 border-t border-border pt-8">
      <h2 id="actual-product-preview" className="text-lg text-foreground">
        Actual product pages
      </h2>
      <p className="mt-2 text-xs text-muted-foreground">
        {preview.versionLabel} Two pages are shown; the paid file contains more.
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {preview.pages.map((page) => (
          <figure key={page.src}>
            <img
              src={page.src}
              alt={page.alt}
              width={893}
              height={1263}
              loading="lazy"
              className="w-full rounded-md border border-border bg-surface"
            />
            <figcaption className="mt-2 text-xs text-muted-foreground">{page.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
