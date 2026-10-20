import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Project } from "@/content/projects";

export function ProjectCard({ project: p }: { project: Project }) {
  const isExternal = p.link?.external;
  const inner = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-[var(--radius)] bg-surface-2">
        {p.image ? (
          <img src={p.image} alt={p.imageAlt ?? p.title} loading="lazy" width={1280} height={800} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_center,var(--surface-2),var(--background))]">
            <Sparkles className="h-8 w-8 text-primary-soft" aria-hidden="true" />
            <span className="label">Coming soon</span>
          </div>
        )}
        {p.tag && (
          <span className="absolute left-4 top-4 rounded-full border border-border bg-background/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-primary-soft backdrop-blur">
            {p.tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="label !text-[10px]">{p.category}</p>
        <h3 className="mt-3 text-xs tracking-[0.18em]">{p.title}</h3>
        <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.description}</p>
        {p.link && (
          <span className="mt-5 inline-flex items-center gap-1 text-sm text-primary-soft">
            {p.link.label} <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </>
  );
  const cls = "group glass glass-hover flex h-full flex-col";
  if (!p.link) return <div className={cls}>{inner}</div>;
  if (isExternal)
    return <a href={p.link.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>;
  return <Link to={p.link.href as "/contact"} className={cls}>{inner}</Link>;
}
