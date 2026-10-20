import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/Reveal";
import { site } from "@/content/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => seo("/privacy", "Privacy Policy", "How Teague Industries collects, uses and protects the information you share with us."),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <PageHeader label="Legal" title="Privacy Policy" />
      <article className="mx-auto max-w-2xl space-y-8 px-6 text-muted-foreground [&_h2]:text-sm [&_h2]:text-foreground">
        <section><h2>What we collect</h2><p className="mt-3">When you use our contact form we collect your name, business name, email, phone (optional), business type, what you need, your current website (optional) and your message.</p></section>
        <section><h2>Why we collect it</h2><p className="mt-3">Only to reply to your enquiry, prepare your free preview and provide our services.</p></section>
        <section><h2>We never sell it</h2><p className="mt-3">Your information is never sold or shared with marketers.</p></section>
        <section><h2>Where it's stored</h2><p className="mt-3">Your details are stored securely with our hosting and database provider, which may store data on servers outside Australia. Only Teague Industries can view your enquiry.</p></section>
        <section><h2>Shop purchases</h2><p className="mt-3">Purchases in our shop are processed by Shopify. When you check out, Shopify collects your name, email, billing details and payment information to complete the order. We never see or store your full card details. Shopify handles this data under its own privacy policy (shopify.com/legal/privacy), and we can see your order details to provide your download and support.</p></section>
        <section><h2>Website visit tracking</h2><p className="mt-3">We use privacy-friendly analytics to count page visits and see which pages are popular, where visitors come from and what device type they use. This information is used in aggregate to improve the site, and we don't use it to identify you personally.</p></section>
        <section><h2>Cookies and local storage</h2><p className="mt-3">Our site uses a small amount of browser storage to remember your shopping cart. Shopify's checkout uses its own cookies to process orders securely. We don't use advertising or tracking cookies. You can clear cookies and site data in your browser settings at any time; your cart will be emptied if you do.</p></section>
        <section><h2>Your rights</h2><p className="mt-3">You can ask to see, correct or delete the personal information we hold about you. We handle personal information in line with the Australian Privacy Principles.</p></section>
        <section><h2>Deleting your data</h2><p className="mt-3">Email <a className="text-primary-soft" href={`mailto:${site.email}`}>{site.email}</a> and we'll delete your details.</p></section>
        <section><h2>Who we are</h2><p className="mt-3">Teague Industries · ABN {site.abn} · <a className="text-primary-soft" href={`mailto:${site.email}`}>{site.email}</a></p></section>
      </article>
    </>
  );
}
