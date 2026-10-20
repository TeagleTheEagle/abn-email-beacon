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
        <section><h2>Deleting your data</h2><p className="mt-3">Email <a className="text-primary-soft" href={`mailto:${site.email}`}>{site.email}</a> and we'll delete your details.</p></section>
      </article>
    </>
  );
}
