// A price people can read from across the room: bold, warm and solid. "From A$1,200" becomes a small
// "from" beside a large amount; monthly prices get "/month" after it.
export function Price({
  price,
  monthly = false,
  size = "md",
  className = "",
}: {
  price: string;
  monthly?: boolean | undefined;
  size?: "md" | "lg";
  className?: string;
}) {
  const from = price.startsWith("From ");
  const amount = from ? price.slice("From ".length) : price;
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 ${className}`}>
      {from && <span className="label">from</span>}
      <span
        className={`font-bold tracking-tight text-accent-warm ${size === "lg" ? "text-4xl" : "text-3xl"}`}
      >
        {amount}
      </span>
      {monthly && <span className="text-sm text-muted-foreground">/month</span>}
    </p>
  );
}
