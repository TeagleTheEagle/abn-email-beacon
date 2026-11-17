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
      <PageHeader label="Legal" title="Privacy Policy" sub="Last updated 17 November 2026" />
      <article className="mx-auto max-w-2xl space-y-8 px-6 text-muted-foreground [&_h2]:text-sm [&_h2]:text-foreground">
        <section>
          <h2>What we collect</h2>
          <p className="mt-3">
            When you use our contact form we collect your name, business name, email, phone
            (optional), business type, what you need, your current website (optional) and your
            message. The call-request form collects your name, business name, email, phone, a
            preferred time and anything you'd like to talk about. The quick form on the home page
            collects your business name and email. The estimate tools on the pricing and services
            pages collect your business name and email together with the business type and services
            you selected. The public assistant enquiry tool collects the same contact details needed
            to respond.
          </p>
        </section>
        <section>
          <h2>Accounts and sign-in</h2>
          <p className="mt-3">
            When you create an account, Supabase stores your email address and authentication
            details. Your private profile can contain your full name, business name and phone
            number. If you choose Google sign-in, Google and Supabase process the account
            information needed to authenticate you. Passwords are handled by Supabase and are not
            included in our analytics.
          </p>
        </section>
        <section>
          <h2>Website assistant chat</h2>
          <p className="mt-3">
            JARVIS processes the message you enter, recent chat history and basic cart context to
            answer you. Chat history is held in your browser only for the current page session and
            is not saved in our enquiry database. When Google AI is configured, your message and
            recent history are sent to Google for that response. Requests for public weather,
            exchange-rate or reference information may also be sent to Open-Meteo, Frankfurter or
            Wikipedia. Do not enter passwords, payment details or sensitive personal information
            into chat.
          </p>
          <p className="mt-3">
            See{" "}
            <a className="text-primary-soft" href="https://policies.google.com/privacy">
              Google's privacy information
            </a>{" "}
            and{" "}
            <a className="text-primary-soft" href="https://supabase.com/privacy">
              Supabase's privacy policy
            </a>
            . Provider retention settings are separate from this website and are not asserted here.
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
            Your enquiry and account details are stored with Supabase and our hosting provider,
            which may process data on servers outside Australia. Public visitors cannot read your
            enquiry or profile.
          </p>
        </section>
        <section>
          <h2>Shop purchases</h2>
          <p className="mt-3">
            Purchases in our shop are processed by Shopify. At checkout, Shopify collects your name,
            email, billing details and payment information to complete the order. We never see or
            store your full card details. Shopify handles this data under its own{" "}
            <a className="text-primary-soft" href="https://www.shopify.com/legal/privacy">
              privacy policy
            </a>
            , and we can see order details to provide the product and support.
          </p>
        </section>
        <section>
          <h2>Website visit tracking</h2>
          <p className="mt-3">
            We use Google Analytics to count page visits and see which pages are popular, where
            visitors come from, what device type they use, and whether visitors send an enquiry or
            start a purchase. We do not send names, email addresses, phone numbers, chat text or
            enquiry messages as analytics event data. Google's privacy policy{" "}
            <a className="text-primary-soft" href="https://policies.google.com/privacy">
              policies.google.com/privacy
            </a>{" "}
            explains how it handles analytics data, and you can opt out with{" "}
            <a className="text-primary-soft" href="https://tools.google.com/dlpage/gaoptout">
              Google's browser add-on
            </a>
            .
          </p>
        </section>
        <section>
          <h2>Enquiry emails</h2>
          <p className="mt-3">
            When you send an enquiry we use an email delivery service (Resend) to notify us and to
            send you a confirmation when a verified sender is configured. It processes your contact
            details and message for that purpose only. See{" "}
            <a className="text-primary-soft" href="https://resend.com/legal/privacy-policy">
              Resend's privacy policy
            </a>
            .
          </p>
        </section>
        <section>
          <h2>Cookies and local storage</h2>
          <p className="mt-3">
            Our site uses browser local storage to remember your shopping cart and keep your account
            session signed in. Google Analytics sets first-party cookies (named _ga and _ga_*) that
            last up to two years, to tell returning visitors from new ones. Our hosting's analytics
            also uses a first-party cookie called session-id to group page visits into browsing
            sessions; it expires after 30 minutes and is refreshed when analytics events are sent.
            Our secure checkout uses its own cookies to process orders securely. You can clear
            cookies and site data in your browser settings at any time; your cart will be emptied if
            you do.
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
          <h2>Deleting your account and data</h2>
          <p className="mt-3">
            You can delete your account from Account → Danger zone, or email{" "}
            <a className="text-primary-soft" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            . This removes your Supabase sign-in and private profile. Enquiries you have sent and
            Shopify order records are separate records and are not automatically deleted with your
            account. Contact us to request access, correction or deletion of those records.
          </p>
        </section>
        <section>
          <h2>Who we are</h2>
          <p className="mt-3">
            {site.name} · Founded by {site.founder} · ABN {site.abn} ·{" "}
            <a className="text-primary-soft" href={`mailto:${site.email}`}>
              {site.email}
            </a>{" "}
            · Sydney's Lower North Shore ({site.suburbs.join(", ")}) and Australia-wide online.
          </p>
        </section>
      </article>
    </>
  );
}
