import { defineMcp } from "@lovable.dev/mcp-js";
import { site } from "@/content/site";
import listServices from "./tools/list-services";
import listFaqs from "./tools/list-faqs";
import listProducts from "./tools/list-products";
import requestPreview from "./tools/request-preview";

export default defineMcp({
  name: "abn-email-beacon",
  title: site.name,
  version: "0.1.0",
  instructions: `Public tools for ${site.name} (ABN ${site.abn}, founded by ${site.founder}, ${site.email}), an Australian studio based on Sydney's Lower North Shore (${site.suburbs.join(", ")}) and working Australia-wide online, building Websites and Stores for Australian businesses. Read services, prices, FAQs and shop products, or send a free-preview enquiry. Prices are in AUD; not GST registered.`,
  tools: [listServices, listFaqs, listProducts, requestPreview],
});
