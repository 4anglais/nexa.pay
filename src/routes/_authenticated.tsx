import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { firebase } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    if ("authStateReady" in firebase.auth) {
      await firebase.auth.authStateReady();

      if (!firebase.auth.currentUser) {
        throw redirect({ to: "/login" });
      }

      return;
    }

    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(firebase.auth, () => {
        unsubscribe();
        resolve();
      });
    });

    if (!firebase.auth.currentUser) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <DashboardLayout />;
}
