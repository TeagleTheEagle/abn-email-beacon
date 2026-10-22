import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/Reveal";
import { site } from "@/content/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo(
      "/privacy",
      "Privacy Policy",
      "How Teague Industries collects, uses and protects the information you share with us.",
    ),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <PageHeader label="Legal" title="Privacy Policy" sub="Last updated 20 October 2026" />
      <article className="mx-auto max-w-2xl space-y-8 px-6 text-muted-foreground [&_h2]:text-sm [&_h2]:text-foreground">
        <section>
          <h2>What we collect</h2>
          <p className="mt-3">
            When you use our contact form we collect your name, business name, email, phone
            (optional), business type, what you need, your current website (optional) and your
            message. The quick form on the home page collects your business name and email. The
            estimate tools on the pricing and services pages collect your business name and email
            together with the business type and services you selected.
          </p>
        </section>
        <section>
          <h2>Why we collect it</h2>
          <p className="mt-3">
            Only to reply to your enquiry, prepare your free preview and provide our services.
          </p>
        </section>
        <section>
          <h2>We never sell it</h2>
          <p className="mt-3">Your information is never sold or shared with marketers.</p>
        </section>
        <section>
          <h2>Where it's stored</h2>
          <p className="mt-3">
            Your details are stored securely with our hosting and database provider, which may store
            data on servers outside Australia. Only Teague Industries can view your enquiry.
          </p>
        </section>
        <section>
          <h2>Shop purchases</h2>
          <p className="mt-3">
            Purchases in our shop are processed by our store provider, Shopify. At checkout, the
            provider collects your name, email, billing details and payment information to complete
            the order. We never see or store your full card details. The provider handles this data
            under its own privacy policy, available at checkout, and we can see your order details
            to provide your download and support.
          </p>
        </section>
        <section>
          <h2>Website visit tracking</h2>
          <p className="mt-3">
            We use Google Analytics to count page visits and see which pages are popular, where
            visitors come from, what device type they use, and whether visitors send an enquiry or
            start a purchase. Google Analytics does not collect your IP address in full and we do
            not use it to identify you personally; the information is used in aggregate to improve
            the site. Google's privacy policy (policies.google.com/privacy) explains how it handles
            this data, and you can opt out with Google's browser add-on
            (tools.google.com/dlpage/gaoptout).
          </p>
        </section>
        <section>
          <h2>Enquiry emails</h2>
          <p className="mt-3">
            When you send an enquiry we use an email delivery service (Resend) to notify us and to
            send you a confirmation. It processes your name, business name, email address and
            message for that purpose only.
          </p>
        </section>
        <section>
          <h2>Cookies and local storage</h2>
          <p className="mt-3">
            Our site uses browser local storage to remember your shopping cart. Google Analytics
            sets first-party cookies (named _ga and _ga_*) that last up to two years, to tell
            returning visitors from new ones. Our hosting's analytics also uses a first-party cookie
            called session-id to group page visits into browsing sessions; it expires after 30
            minutes and is refreshed when analytics events are sent. Shopify's checkout uses its own
            cookies to process orders securely. You can clear cookies and site data in your browser
            settings at any time; your cart will be emptied if you do.
          </p>
        </section>
        <section>
          <h2>Your rights</h2>
          <p className="mt-3">
            You can ask to see, correct or delete the personal information we hold about you. We
            handle personal information in line with the Australian Privacy Principles.
          </p>
        </section>
        <section>
          <h2>Deleting your data</h2>
          <p className="mt-3">
            Email{" "}
            <a className="text-primary-soft" href={`mailto:${site.email}`}>
              {site.email}
            </a>{" "}
            and we'll delete your details.
          </p>
        </section>
        <section>
          <h2>Who we are</h2>
          <p className="mt-3">
            Teague Industries · ABN {site.abn} ·{" "}
            <a className="text-primary-soft" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
        </section>
      </article>
    </>
  );
}
