import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";
import { MobileStickyActions } from "./MobileStickyActions";

// BookCallLink renders a TanStack Link that needs a router context.
vi.mock("./BookCallLink", () => ({
  BookCallLink: () => <a href="/book">Book a call</a>,
}));

// jsdom defaults to 1024px wide; the bar only renders below 640px.
const originalInnerWidth = window.innerWidth;

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
}

beforeAll(() => setViewportWidth(390));
afterAll(() => setViewportWidth(originalInnerWidth));

describe("MobileStickyActions", () => {
  it("renders the mobile action bar without crashing", () => {
    render(<MobileStickyActions />);
    expect(screen.getByRole("button", { name: /free preview/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ask jarvis/i })).toBeInTheDocument();
  });

  it("opens the JARVIS sheet and its Open JARVIS Chat button renders", () => {
    render(<MobileStickyActions />);
    fireEvent.click(screen.getByRole("button", { name: /ask jarvis/i }));
    expect(screen.getByRole("button", { name: /open jarvis chat/i })).toBeInTheDocument();
  });

  it("renders nothing on desktop widths", () => {
    setViewportWidth(1280);
    const { container } = render(<MobileStickyActions />);
    expect(container).toBeEmptyDOMElement();
    setViewportWidth(390);
  });
});
