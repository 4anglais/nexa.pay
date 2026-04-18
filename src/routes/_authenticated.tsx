import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { firebase } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        unsubscribe();
        if (user) {
          resolve();
        } else {
          reject(redirect({ to: "/login" }));
        }
      });
    });
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <DashboardLayout />;
}
