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
import {
  collection,
  query,
  getDocs,
  setDoc,
  doc,
  addDoc,
} from "firebase/firestore";

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
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsSnapshot = await getDocs(
          query(collection(firebase.db, "company_settings")),
        );
        if (!settingsSnapshot.empty) {
          const settingsData = settingsSnapshot.docs[0].data() as SettingsForm;
          setSettingsId(settingsSnapshot.docs[0].id);
          reset(settingsData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setLoading(false);
      }
    };

    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: SettingsForm) => {
    setError("");
    setSaved(false);

    try {
      if (settingsId) {
        await setDoc(doc(firebase.db, "company_settings", settingsId), data);
      } else {
        const newDocRef = await addDoc(
          collection(firebase.db, "company_settings"),
          data,
        );
        setSettingsId(newDocRef.id);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    }
  };

  if (loading)
    return (
      <div className="py-12 text-center text-muted-foreground">Loading...</div>
    );

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
          <div className="mb-4 rounded-lg bg-success/10 px-4 py-3 text-sm font-semibold text-success">
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company_name" className="font-semibold">
              Company Name
            </Label>
            <Input id="company_name" {...register("company_name")} />
            {errors.company_name && (
              <p className="text-xs text-destructive">
                {errors.company_name.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-card-foreground">
              Statutory Deduction Rates (%)
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="paye_rate" className="font-semibold">
                  PAYE Rate
                </Label>
                <Input
                  id="paye_rate"
                  type="number"
                  step="0.01"
                  {...register("paye_rate")}
                />
                {errors.paye_rate && (
                  <p className="text-xs text-destructive">
                    {errors.paye_rate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="napsa_rate" className="font-semibold">
                  NAPSA Rate
                </Label>
                <Input
                  id="napsa_rate"
                  type="number"
                  step="0.01"
                  {...register("napsa_rate")}
                />
                {errors.napsa_rate && (
                  <p className="text-xs text-destructive">
                    {errors.napsa_rate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nhima_rate" className="font-semibold">
                  NHIMA Rate
                </Label>
                <Input
                  id="nhima_rate"
                  type="number"
                  step="0.01"
                  {...register("nhima_rate")}
                />
                {errors.nhima_rate && (
                  <p className="text-xs text-destructive">
                    {errors.nhima_rate.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" strokeWidth={1.5} />
            )}
            Save Settings
          </Button>
        </form>
      </div>
    </>
  );
}
