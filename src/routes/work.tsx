import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Reveal } from "@/components/Reveal";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/content/projects";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/work")({
  head: () => seo("/work", "Our Work", "Websites and stores built by Teague Industries for Australian businesses."),
  component: Work,
});

function Work() {
  return (
    <>
      <PageHeader label="Portfolio" title="Our work" sub="Explore our live store and interactive concepts. Every demo is labelled — no invented client work." />
      <h2 className="sr-only">Projects and interactive demos</h2>
      <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}><ProjectCard project={p} /></Reveal>
        ))}
      </div>
    </>
  );
}
