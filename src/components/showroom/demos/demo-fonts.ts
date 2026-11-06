// System font stacks for the showroom demos, so each design gets its own type without loading web
// fonts (the site self-hosts only its own). Pass two of these to DemoRoot as `body` and `heading`.
export const demoFonts = {
  serifClassic: "Georgia, 'Times New Roman', Times, serif",
  serifDidone: "Didot, 'Bodoni MT', 'Bodoni 72', 'Playfair Display', Georgia, serif",
  serifBook: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif",
  sansHumanist: "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  sansGeometric: "'Century Gothic', 'Avenir Next', Avenir, Futura, 'Trebuchet MS', sans-serif",
  sansRounded: "'Trebuchet MS', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  sansCondensed:
    "'Arial Narrow', 'Helvetica Neue Condensed', 'Roboto Condensed', Arial, sans-serif",
  display: "Impact, Haettenschweiler, 'Arial Narrow Bold', 'Franklin Gothic Bold', sans-serif",
  mono: "ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
} as const;
