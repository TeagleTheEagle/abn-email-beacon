import { defineMcp } from "@lovable.dev/mcp-js";
import listServices from "./tools/list-services";
import listFaqs from "./tools/list-faqs";
import listProducts from "./tools/list-products";
import requestPreview from "./tools/request-preview";

export default defineMcp({
  name: "abn-email-beacon",
  title: "Abn Email Beacon",
  version: "0.1.0",
  instructions:
    "Public tools for Teague Industries, an Australian studio building Websites and Stores for small businesses. Read services, prices, FAQs and shop products, or send a free-preview enquiry. Prices are in AUD; not GST registered.",
  tools: [listServices, listFaqs, listProducts, requestPreview],
});
