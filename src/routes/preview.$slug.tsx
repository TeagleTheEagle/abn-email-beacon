import { createFileRoute, notFound } from "@tanstack/react-router";
import { ClientPreview } from "@/components/ClientPreview";
import { isPreviewSlug, previews } from "@/content/previews";
import { seo } from "@/lib/seo";

// Free previews for prospects (see src/content/previews.ts). Private links: noindex, not in the nav
// or sitemap, and rendered without the Teague Industries nav and footer (see __root.tsx).
export const Route = createFileRoute("/preview/$slug")({
  beforeLoad: ({ params }) => {
    if (!isPreviewSlug(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const preview = isPreviewSlug(params.slug) ? previews[params.slug] : undefined;
    const base = seo(
      `/preview/${params.slug}`,
      preview ? `${preview.name} — Website Preview` : "Website Preview",
      preview
        ? `A free website preview for ${preview.name}, ${preview.suburb}, prepared by Teague Industries.`
        : "A free website preview prepared by Teague Industries.",
    );
    base.meta.push({ name: "robots", content: "noindex, nofollow" });
    return base;
  },
  component: PreviewPage,
});

function PreviewPage() {
  const { slug } = Route.useParams();
  const preview = isPreviewSlug(slug) ? previews[slug] : undefined;
  if (!preview) return null;
  return <ClientPreview preview={preview} />;
}
