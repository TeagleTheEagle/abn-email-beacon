import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileStickyActions } from "./MobileStickyActions";

let pathname = "/";
vi.mock("@tanstack/react-router", () => ({
  useLocation: () => pathname,
}));

afterEach(() => {
  cleanup();
  pathname = "/";
});

describe("MobileStickyActions", () => {
  it("renders one coordinated enquiry and assistant action bar", () => {
    render(<MobileStickyActions />);
    expect(screen.getByRole("region", { name: "Quick actions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /free preview/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ask jarvis/i })).toBeInTheDocument();
  });

  it("marks controls unavailable before hydration attaches their listeners", () => {
    const html = renderToString(<MobileStickyActions />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("disabled");
  });

  it("uses an accessible sheet for the preview form and closes with Escape", () => {
    render(<MobileStickyActions />);
    const trigger = screen.getByRole("button", { name: /free preview/i });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Business name" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays off forms, accounts and demo experiences", () => {
    pathname = "/contact";
    const { rerender } = render(<MobileStickyActions />);
    expect(screen.queryByRole("region", { name: "Quick actions" })).not.toBeInTheDocument();
    pathname = "/demos";
    rerender(<MobileStickyActions />);
    expect(screen.queryByRole("region", { name: "Quick actions" })).not.toBeInTheDocument();
  });
});
