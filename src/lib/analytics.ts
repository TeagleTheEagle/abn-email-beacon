// Google Analytics 4. Nothing loads unless VITE_GA_MEASUREMENT_ID is set in .env (format G-XXXXXXXXXX).
export const GA_ID: string | undefined = import.meta.env["VITE_GA_MEASUREMENT_ID"] || undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Head entries for the root route: the gtag loader plus its init. Empty when analytics is off.
export function analyticsScripts() {
  if (!GA_ID) return [];
  return [
    { src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, async: true },
    {
      children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});`,
    },
  ];
}

export function trackPageView(path: string) {
  window.gtag?.("event", "page_view", { page_path: path, page_location: window.location.href, page_title: document.title });
}

// GA4 recommended event names: generate_lead, add_to_cart, begin_checkout.
export function track(event: string, params: Record<string, unknown> = {}) {
  window.gtag?.("event", event, params);
}
