import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{ title: "Settings — NexaPayslip" }],
  }),
  component: SettingsPage,
});

const settingsSchema = z.object({
  company_name: z.string().min(1, "Required").max(255),
  paye_rate: z.coerce.number().min(0).max(100),
  napsa_rate: z.coerce.number().min(0).max(100),
  nhima_rate: z.coerce.number().min(0).max(100),
});

type SettingsForm = z.infer<typeof settingsSchema>;

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebase.auth, async (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        try {
          const ref = doc(firebase.db, "company_settings", u.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            reset(snap.data() as SettingsForm);
          }
        } catch (err) {
          console.error("Error loading settings:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [reset]);

  // Save settings to Firestore
  const onSubmit = async (data: SettingsForm) => {
    setError("");
    setSaved(false);

    try {
      if (!user) {
        throw new Error("Authentication not ready. Please wait...");
      }

      await setDoc(doc(firebase.db, "company_settings", user.uid), {
        ...data,
        userId: user.uid,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <>
      <PageHeader
        title="Company Settings"
        description="Configure your company and payroll rates"
      />

      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-4 rounded-lg bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-600">
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input {...register("company_name")} />
            {errors.company_name && (
              <p className="text-xs text-destructive">
                {errors.company_name.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>PAYE Rate</Label>
              <Input type="number" step="0.01" {...register("paye_rate")} />
            </div>

            <div className="space-y-2">
              <Label>NAPSA Rate</Label>
              <Input type="number" step="0.01" {...register("napsa_rate")} />
            </div>

            <div className="space-y-2">
              <Label>NHIMA Rate</Label>
              <Input type="number" step="0.01" {...register("nhima_rate")} />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting || !user}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Settings
          </Button>
        </form>
      </div>
    </>
  );
}
