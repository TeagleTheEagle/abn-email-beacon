import { createFileRoute } from "@tanstack/react-router";
import { EnquiryPipeline } from "@/components/EnquiryPipeline";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/enquiries")({
  head: () => ({
    ...seo("/enquiries", "Owner enquiry pipeline", "Private enquiry workflow."),
    meta: [
      ...seo("/enquiries", "Owner enquiry pipeline", "Private enquiry workflow.").meta,
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EnquiryPipeline,
});
