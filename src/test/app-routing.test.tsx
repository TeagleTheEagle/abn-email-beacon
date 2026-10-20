import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { isDemoKind } from "@/content/demos";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
  it.each(["cafe", "tradie", "salon", "retail"])("matches the interactive %s demo", (kind) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes(`/demo/${kind}`).at(-1)?.routeId).toBe("/demo/$kind");
    expect(isDemoKind(kind)).toBe(true);
  });
  it("rejects unknown demo names", () => {
    expect(isDemoKind("unknown-business")).toBe(false);
  });
});
