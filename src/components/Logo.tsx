import { useId } from "react";

export function Logo({ className = "", glow = false }: { className?: string; glow?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 120 110"
      className={className}
      role="img"
      aria-label="Teague Industries logo"
      style={glow ? { filter: "drop-shadow(0 0 18px rgba(59,140,255,0.75)) drop-shadow(0 0 4px rgba(140,194,255,0.9))" } : undefined}
    >
      <defs>
        <linearGradient id={`c${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#F4F8FF" />
          <stop offset="0.5" stopColor="#A9B8D0" />
          <stop offset="1" stopColor="#5B6B86" />
        </linearGradient>
        <linearGradient id={`h${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5B6B86" />
          <stop offset="0.5" stopColor="#F4F8FF" />
          <stop offset="1" stopColor="#5B6B86" />
        </linearGradient>
      </defs>
      {/* Crossbar with chamfered ends */}
      <path d="M8 6 H112 L104 22 H16 Z" fill={`url(#c${id})`} />
      <path d="M8 6 H112 L110 10 H10 Z" fill={`url(#h${id})`} opacity="0.9" />
      {/* Stem with pointed bottom */}
      <path d="M48 26 H72 V88 L60 104 L48 88 Z" fill={`url(#c${id})`} />
      <path d="M60 26 H72 V88 L60 104 Z" fill="#5B6B86" opacity="0.45" />
      <path d="M48 26 H72" stroke="#04060B" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}
