import { createFileRoute, redirect } from "@tanstack/react-router";
import { onAuthStateChanged } from "firebase/auth";
import { AndroidAppLayout } from "@/components/AndroidAppLayout";
import { firebase } from "@/integrations/firebase/client";

export const Route = createFileRoute("/android/_authenticated")({
  beforeLoad: async () => {
    return new Promise<void>((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        unsubscribe();

        if (user) {
          resolve();
        } else {
          reject(redirect({ to: "/android/login" }));
        }
      });
    });
  },
  component: AuthenticatedAndroidLayout,
});

function AuthenticatedAndroidLayout() {
  return <AndroidAppLayout />;
}
