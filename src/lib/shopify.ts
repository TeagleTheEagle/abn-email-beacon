// Shopify Storefront API client — 2026-10 API version.
import { cachedOnServer } from "@/lib/ttl-cache";

// How long a server-rendered page may reuse a Shopify answer before asking again.
const PRODUCT_CACHE_MS = 60_000;

export const SHOPIFY_API_VERSION = "2026-10";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "jk1j1p-c5.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "89829ea8a5b2ae9ea90c3d6d59ccfef4";

export interface ShopifyVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    seo?: { title: string | null; description: string | null };
    description: string;
    handle: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: { edges: Array<{ node: ShopifyVariant }> };
    options: Array<{ name: string; values: string[] }>;
    details?: Array<{ key: string; value: string } | null>;
  };
}

// The product detail fields (namespace "details") are edited in the Shopify admin on each product.
const DETAIL_KEYS = ["audience", "includes", "format", "requirements", "delivery", "licence"];
const DETAILS_FIELD = `details: metafields(identifiers: [${DETAIL_KEYS.map(
  (k) => `{ namespace: "details", key: "${k}" }`,
).join(", ")}]) { key value }`;

export interface ProductDetails {
  audience?: string;
  includes: string[];
  format?: string;
  requirements?: string;
  delivery?: string;
  licence?: string;
}

// Normalise store copy so visitor-facing product descriptions and metafields
// use "online store" rather than leaking platform names or non-www canonical URLs.
export function normaliseStoreCopy(text: string): string {
  return text
    .replace(/\bShopify store\b/gi, "online store")
    .replace(/\ba Shopify account\b/gi, "an online store account")
    .replace(/\bA Shopify account\b/g, "An online store account")
    .replace(/(?<![.\w])teagueindustries\.com\.au/g, "www.teagueindustries.com.au");
}

function normaliseNode<T extends ShopifyProduct["node"] & { descriptionHtml?: string }>(
  node: T,
): T {
  return {
    ...node,
    description: normaliseStoreCopy(node.description),
    ...(node.descriptionHtml !== undefined
      ? { descriptionHtml: normaliseStoreCopy(node.descriptionHtml) }
      : {}),
    ...(node.details
      ? {
          details: node.details.map((f) =>
            f && f.value ? { ...f, value: normaliseStoreCopy(f.value) } : f,
          ),
        }
      : {}),
  };
}

export function productDetails(node: Pick<ShopifyProduct["node"], "details">): ProductDetails {
  const out: ProductDetails = { includes: [] };
  for (const field of node.details ?? []) {
    if (!field?.value) continue;
    const val = normaliseStoreCopy(field.value);
    if (field.key === "includes") {
      try {
        const list: unknown = JSON.parse(val);
        if (Array.isArray(list))
          out.includes = list
            .filter((v): v is string => typeof v === "string")
            .map(normaliseStoreCopy);
      } catch {
        // A malformed list just isn't shown.
      }
    } else if (DETAIL_KEYS.includes(field.key)) {
      out[field.key as Exclude<keyof ProductDetails, "includes">] = val;
    }
  }
  return out;
}

// What the shop card and product page say about delivery when the Delivery field is empty.
export function deliveryLabel(node: Pick<ShopifyProduct["node"], "details" | "handle">) {
  return (
    productDetails(node).delivery ??
    (node.handle.includes("audit") ? "Delivered within 48 hours" : "Digital delivery")
  );
}

// Shopify's CDN resizes on request: ask for the width a slot needs instead of the 1024px original.
export function shopifyImage(url: string, width: number) {
  if (!url.includes("cdn.shopify.com")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}width=${width}`;
}

export function formatPrice(amount: string, currencyCode: string) {
  const value = parseFloat(amount);
  if (currencyCode === "AUD") return `A$${value.toFixed(2)}`;
  try {
    return new Intl.NumberFormat("en-AU", { style: "currency", currency: currencyCode }).format(
      value,
    );
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

// Storefront API helper — use for all storefront requests.
export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    throw new Error("Store temporarily unavailable. Please try again later.");
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(
      `Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`,
    );
  }

  return data;
}

export const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          seo { title description }
          handle
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 5) { edges { node { url altText } } }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price { amount currencyCode }
                availableForSale
                selectedOptions { name value }
              }
            }
          }
          options { name values }
          ${DETAILS_FIELD}
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      seo { title description }
      descriptionHtml
      handle
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 10) { edges { node { url altText } } }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price { amount currencyCode }
            availableForSale
            selectedOptions { name value }
          }
        }
      }
      options { name values }
      ${DETAILS_FIELD}
    }
  }
`;

export function fetchProducts(query?: string): Promise<ShopifyProduct[]> {
  return cachedOnServer(
    `products:${query ?? ""}`,
    PRODUCT_CACHE_MS,
    async () => {
      const data = await storefrontApiRequest(STOREFRONT_QUERY, {
        first: 50,
        query: query ?? null,
      });
      const edges = (data?.data?.products?.edges ?? []) as ShopifyProduct[];
      return edges.map((edge) => ({ ...edge, node: normaliseNode(edge.node) }));
    },
    (products) => products.length > 0,
  );
}

export function fetchProduct(
  handle: string,
): Promise<(ShopifyProduct["node"] & { descriptionHtml?: string }) | null> {
  return cachedOnServer(
    `product:${handle}`,
    PRODUCT_CACHE_MS,
    async () => {
      const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
      const raw = (data?.data?.product ?? null) as
        (ShopifyProduct["node"] & { descriptionHtml?: string }) | null;
      return raw ? normaliseNode(raw) : null;
    },
    (product) => product !== null,
  );
}

// ---- Cart mutations (Storefront API checkout — never manual URLs) ----

export interface ShopifyCartLineInput {
  quantity: number;
  variantId: string;
}
export interface ShopifyCartLine {
  lineId: string;
  variantId: string;
  quantity: number;
}
export type CartFailure = { success: false; error: string; cartNotFound: boolean };
export type CreateShopifyCartResult =
  | {
      success: true;
      cartId: string;
      checkoutUrl: string;
      lines: ShopifyCartLine[];
    }
  | CartFailure;
export type CartMutationResult = { success: true; lineId?: string } | CartFailure;

const INVALID_CART_RESPONSE = "The store returned an invalid response. Please try again.";
const failure = (error = INVALID_CART_RESPONSE, cartNotFound = false): CartFailure => ({
  success: false,
  error,
  cartNotFound,
});

type CartUserError = { field: string[] | null; message: string };

function cartUserErrors(value: unknown): CartUserError[] | null {
  if (!Array.isArray(value)) return null;
  return value.every(
    (error) =>
      error &&
      typeof error === "object" &&
      typeof (error as { message?: unknown }).message === "string",
  )
    ? (value as CartUserError[])
    : null;
}

function userErrorFailure(errors: CartUserError[]): CartFailure | null {
  if (errors.length === 0) return null;
  const cartNotFound = errors.some((error) => {
    const message = error.message.toLowerCase();
    return message.includes("cart not found") || message.includes("does not exist");
  });
  return failure(errors.map((error) => error.message).join(" "), cartNotFound);
}

const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) {
      id
      totalQuantity
      checkoutUrl
      lines(first: 100) {
        edges { node { id quantity merchandise { ... on ProductVariant { id } } } }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges { node { id quantity merchandise { ... on ProductVariant { id } } } }
        }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) {
          edges { node { id quantity merchandise { ... on ProductVariant { id } } } }
        }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

function formatCheckoutUrl(checkoutUrl: string): string | null {
  try {
    const url = new URL(checkoutUrl);
    if (url.protocol !== "https:") return null;
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return null;
  }
}

export async function createShopifyCart(
  items: ShopifyCartLineInput[],
): Promise<CreateShopifyCartResult> {
  if (
    items.length === 0 ||
    items.some((item) => !item.variantId || !Number.isInteger(item.quantity) || item.quantity < 1)
  )
    return failure("The requested cart items are invalid.");

  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: {
      lines: items.map((item) => ({ quantity: item.quantity, merchandiseId: item.variantId })),
    },
  });
  const payload = data?.data?.cartCreate;
  const errors = cartUserErrors(payload?.userErrors);
  if (!payload || !errors) return failure();
  const rejected = userErrorFailure(errors);
  if (rejected) return rejected;

  const cart = payload.cart;
  const checkoutUrl =
    typeof cart?.checkoutUrl === "string" ? formatCheckoutUrl(cart.checkoutUrl) : null;
  if (typeof cart?.id !== "string" || !checkoutUrl || !Array.isArray(cart?.lines?.edges))
    return failure();

  const lines: ShopifyCartLine[] = [];
  for (const item of items) {
    const edge = cart.lines.edges.find(
      (candidate: { node?: { merchandise?: { id?: unknown }; quantity?: unknown } }) =>
        candidate.node?.merchandise?.id === item.variantId,
    );
    const lineId = edge?.node?.id;
    const quantity = edge?.node?.quantity;
    if (typeof lineId !== "string" || quantity !== item.quantity) return failure();
    lines.push({ lineId, variantId: item.variantId, quantity });
  }
  return { success: true, cartId: cart.id, checkoutUrl, lines };
}

export async function addLineToShopifyCart(
  cartId: string,
  item: ShopifyCartLineInput,
): Promise<CartMutationResult> {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });
  const payload = data?.data?.cartLinesAdd;
  const errors = cartUserErrors(payload?.userErrors);
  if (!payload || !errors) return failure();
  const rejected = userErrorFailure(errors);
  if (rejected) return rejected;
  if (!Array.isArray(payload.cart?.lines?.edges)) return failure();

  const newLine = payload.cart.lines.edges.find(
    (line: { node?: { merchandise?: { id?: unknown } } }) =>
      line.node?.merchandise?.id === item.variantId,
  );
  const lineId = newLine?.node?.id;
  if (typeof lineId !== "string" || !lineId) return failure();
  return { success: true, lineId };
}

export async function updateShopifyCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<CartMutationResult> {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  const payload = data?.data?.cartLinesUpdate;
  const errors = cartUserErrors(payload?.userErrors);
  if (!payload || !errors) return failure();
  const rejected = userErrorFailure(errors);
  if (rejected) return rejected;
  return typeof payload.cart?.id === "string" ? { success: true } : failure();
}

export async function removeLineFromShopifyCart(
  cartId: string,
  lineId: string,
): Promise<CartMutationResult> {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });
  const payload = data?.data?.cartLinesRemove;
  const errors = cartUserErrors(payload?.userErrors);
  if (!payload || !errors) return failure();
  const rejected = userErrorFailure(errors);
  if (rejected) return rejected;
  return typeof payload.cart?.id === "string" ? { success: true } : failure();
}

export async function checkCartExists(
  cartId: string,
): Promise<{ exists: boolean; checkoutUrl: string | null; lines: ShopifyCartLine[] }> {
  const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
  if (!data?.data || !("cart" in data.data))
    throw new Error("Store returned an invalid response while checking the cart.");
  const cart = data.data.cart;
  if (cart === null) return { exists: false, checkoutUrl: null, lines: [] };
  if (
    typeof cart?.id !== "string" ||
    typeof cart?.totalQuantity !== "number" ||
    typeof cart?.checkoutUrl !== "string"
  )
    throw new Error("Store returned an invalid response while checking the cart.");
  const checkoutUrl = formatCheckoutUrl(cart.checkoutUrl);
  if (!checkoutUrl) throw new Error("Store returned an invalid checkout URL.");
  if (!Array.isArray(cart.lines?.edges)) throw new Error("Store returned invalid cart lines.");
  const lines = cart.lines.edges.map(
    (edge: { node?: { id?: unknown; quantity?: unknown; merchandise?: { id?: unknown } } }) => {
      const line = edge.node;
      if (
        typeof line?.id !== "string" ||
        typeof line?.merchandise?.id !== "string" ||
        typeof line?.quantity !== "number"
      )
        throw new Error("Store returned an invalid cart line.");
      return {
        lineId: line.id,
        variantId: line.merchandise.id,
        quantity: line.quantity,
      };
    },
  );
  return { exists: cart.totalQuantity > 0, checkoutUrl, lines };
}
