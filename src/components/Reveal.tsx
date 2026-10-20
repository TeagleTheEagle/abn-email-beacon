import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <header className="relative px-6 pb-16 pt-40 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(59,140,255,0.18),transparent_70%)]" />
      <Reveal>
        <p className="label">{label}</p>
        <h1 className="mx-auto mt-5 max-w-3xl text-2xl text-chrome sm:text-4xl">{title}</h1>
        {sub && <p className="mx-auto mt-6 max-w-xl text-muted-foreground">{sub}</p>}
      </Reveal>
      <div className="chrome-line mx-auto mt-14 max-w-3xl" />
    </header>
  );
}
