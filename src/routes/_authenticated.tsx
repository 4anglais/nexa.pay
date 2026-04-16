import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) return;
      // Session may be null during token refresh — fall back to getUser
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw redirect({ to: "/login" });
      }
    } catch (error) {
      // If auth check fails, redirect to login
      if (error instanceof Response) {
        throw error; // Re-throw redirect responses
      }
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <DashboardLayout />;
}
