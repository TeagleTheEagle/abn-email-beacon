import { cloneElement, isValidElement, useId, type ReactElement } from "react";

// A labelled form field that wires its id, required state and error text to the control inside.
// A label ending in "*" marks the field as required.
export function Field({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string | undefined;
  className?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const required = label.trim().endsWith("*");
  return (
    <label htmlFor={id} className={`block ${className}`}>
      <span className="label mb-2 block">{label}</span>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<Record<string, unknown>>, {
            id,
            "aria-invalid": error ? true : undefined,
            "aria-required": required || undefined,
            "aria-describedby": error ? `${id}-error` : undefined,
          })
        : children}
      {error && (
        <span id={`${id}-error`} role="alert" className="mt-1 block text-xs text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}
