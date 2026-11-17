import { Suspense } from "react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { showroomDemos } from "@/components/showroom/demos";
import {
  getShowroomDesign,
  isShowroomSlug,
  showroomDesigns,
  showroomSlugs,
} from "@/content/showroom";

// Routes are matched without rendering, as in app-routing.test.tsx.
const router = () => createRouter({ routeTree, context: { queryClient: new QueryClient() } });

afterEach(() => {
  cleanup();
});

describe("Website designs showroom", () => {
  it("matches the gallery at /demos", () => {
    expect(router().matchRoutes("/demos").at(-1)?.routeId).toBe("/demos/");
  });
  it("lists twelve designs with unique ids and slugs", () => {
    expect(showroomDesigns).toHaveLength(12);
    expect(new Set(showroomSlugs).size).toBe(12);
    expect(new Set(showroomDesigns.map((d) => d.id)).size).toBe(12);
  });
  it.each(showroomSlugs)("matches and lazy-loads the live demo /demos/%s", async (slug) => {
    expect(router().matchRoutes(`/demos/${slug}`).at(-1)?.routeId).toBe("/demos/$slug");
    expect(isShowroomSlug(slug)).toBe(true);
    const Demo = showroomDemos[slug];
    expect(Demo).toBeTypeOf("object");
    const design = getShowroomDesign(slug);
    render(
      <Suspense fallback={<p>Loading {design.title}…</p>}>
        <Demo design={design} />
      </Suspense>,
    );
    expect(
      await screen.findByRole("region", {
        name: `${design.businessName}: demonstration website`,
      }),
    ).toBeTruthy();
    expect(
      screen.getByText(new RegExp(`${design.businessName} is a fictional business`, "i")),
    ).toBeTruthy();
  });
  it("rejects unknown slugs, including object prototype names", () => {
    expect(isShowroomSlug("unknown-design")).toBe(false);
    expect(isShowroomSlug("constructor")).toBe(false);
  });
});
