import { createFileRoute } from "@tanstack/react-router";
import { isAllowedRequestOrigin } from "@/lib/request-security";

// Server-side self-service account deletion. Deleting an auth.users row needs
// the service role key, so the browser client cannot do it — the caller proves
// their identity by presenting their own session JWT, and we delete the user
// that JWT belongs to (never anyone else).
export const Route = createFileRoute("/api/delete-account")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAllowedRequestOrigin(request)) {
          return Response.json({ error: "Forbidden origin" }, { status: 403 });
        }

        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token || token.length < 20) {
          return Response.json({ error: "Please sign in again to confirm." }, { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Identity check: getUser validates the JWT and returns its owner.
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
        if (userError || !userData?.user) {
          return Response.json(
            { error: "Session expired. Sign in again and retry." },
            { status: 401 },
          );
        }

        // Row-level deletion: profiles CASCADE from auth.users (0001_profiles_table.sql).
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        if (deleteError) {
          console.error("[delete-account] Failed for user:", userData.user.id, deleteError);
          return Response.json(
            { error: "Could not delete your account. Please contact us for help." },
            { status: 500 },
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
