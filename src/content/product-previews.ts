import playbookCover from "@/assets/product-previews/conversion-playbook-cover.webp";
import playbookChecklist from "@/assets/product-previews/conversion-playbook-checklist.webp";

export interface ProductPreview {
  versionLabel: string;
  pages: Array<{ src: string; alt: string; caption: string }>;
}

const previews: Record<string, ProductPreview> = {
  "shopify-conversion-checkout-optimisation-playbook": {
    versionLabel: "Preview shows the local PDF created 27 October 2026.",
    pages: [
      {
        src: playbookCover,
        alt: "Conversion playbook cover page",
        caption: "Cover · page 1 of 14",
      },
      {
        src: playbookChecklist,
        alt: "Conversion playbook checklist page",
        caption: "Mobile conversion checklist · page 4 of 14",
      },
    ],
  },
};

export function getProductPreview(handle: string): ProductPreview | undefined {
  return previews[handle];
}
