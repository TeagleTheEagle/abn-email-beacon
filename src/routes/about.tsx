import { createFileRoute } from "@tanstack/react-router";
import { Users, Cpu, Sunrise, User } from "lucide-react";
import { PageHeader, Reveal } from "@/components/Reveal";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => seo("About", "Teague Industries is an Australian business founded in 2026 to help small businesses get online properly."),
  component: About,
});

const values = [
  { icon: Users, t: "People", d: "Real support, in plain English." },
  { icon: Cpu, t: "Technology", d: "Modern, fast and AI-assisted." },
  { icon: Sunrise, t: "A Brighter Tomorrow", d: "Helping local businesses grow." },
];

function About() {
  return (
    <>
      <PageHeader label="About" title="Our story" />
      <Reveal className="mx-auto max-w-2xl px-6 text-center text-lg text-muted-foreground">
        <p>
          Teague Industries is an Australian business founded in 2026 to help small businesses get online properly — with honest pricing, a free preview first, and modern tools including AI.
        </p>
      </Reveal>
      <div className="mx-auto mt-20 grid max-w-5xl gap-6 px-6 md:grid-cols-3">
        {values.map(({ icon: I, t, d }, i) => (
          <Reveal key={t} delay={i * 0.08}>
            <div className="glass glass-hover h-full p-8 text-center">
              <I className="mx-auto h-8 w-8 text-primary-soft" aria-hidden="true" />
              <h2 className="mt-6 text-xs tracking-[0.2em]">{t}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-auto mt-20 max-w-3xl px-6">
        <div className="glass flex flex-col items-center gap-8 p-8 sm:flex-row sm:p-10">
          <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2" role="img" aria-label="Founder photo placeholder">
            <User className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="text-center sm:text-left">
            <p className="label">Founder</p>
            <h2 className="mt-3 text-base">Ben Teague, Founder</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Started Teague Industries to give Australian small businesses a better way online: straight talk, fair prices, and work you can see before you pay.
            </p>
          </div>
        </div>
      </Reveal>
    </>
  );
}
