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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Save,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Percent,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Settings2,
} from "lucide-react";
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
  company_address: z.string().max(500).optional(),
  company_phone: z.string().max(30).optional(),
  company_email: z.string().email("Invalid email").or(z.literal("")).optional(),
  company_website: z.string().max(255).optional(),
  payroll_frequency: z.enum(["monthly", "bi-weekly", "weekly"]),
  fiscal_year_start: z.coerce.number().min(1).max(12),
  paye_rate: z.coerce.number().min(0).max(100),
  napsa_rate: z.coerce.number().min(0).max(100),
  napsa_ceiling: z.coerce.number().min(0),
  nhima_rate: z.coerce.number().min(0).max(100),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SECTION_HEADER_CLASS =
  "flex items-center gap-2.5 text-sm font-semibold text-foreground mb-4";

function SectionCard({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${accent} bg-card p-6 shadow-sm`}
    >
      {children}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      payroll_frequency: "monthly",
      fiscal_year_start: 1,
      paye_rate: 25,
      napsa_rate: 5,
      napsa_ceiling: 1221.80,
      nhima_rate: 1,
    },
  });

  const payrollFrequency = watch("payroll_frequency");
  const fiscalYearStart = watch("fiscal_year_start");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebase.auth, async (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        try {
          const ref = doc(firebase.db, "company_settings", u.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            reset({
              payroll_frequency: "monthly",
              fiscal_year_start: 1,
              paye_rate: 25,
              napsa_rate: 5,
              napsa_ceiling: 1221.80,
              nhima_rate: 1,
              ...(snap.data() as SettingsForm),
            });
          }
        } catch (err) {
          console.error("Error loading settings:", err);
        }
      }
    });

    return () => unsubscribe();
  }, [reset]);

  const onSubmit = async (data: SettingsForm) => {
    setError("");
    setSaved(false);

    try {
      if (!user) throw new Error("Not authenticated. Please wait...");

      await setDoc(doc(firebase.db, "company_settings", user.uid), {
        ...data,
        userId: user.uid,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading settings…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
          <Settings2 className="h-3 w-3" />
          <span>Configuration</span>
        </div>
        <PageHeader
          title="Company Settings"
          description="Manage your company profile and payroll configuration"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm font-medium text-teal-600 dark:text-teal-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Company Profile ─────────────────────────────────── */}
        <SectionCard accent="border-teal-500/20">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl" />

          <div className={SECTION_HEADER_CLASS}>
            <div className="rounded-lg bg-teal-500/10 p-1.5">
              <Building2 className="h-4 w-4 text-teal-500" />
            </div>
            Company Profile
          </div>

          <div className="space-y-4">
            <Field label="Company Name" error={errors.company_name?.message}>
              <Input
                {...register("company_name")}
                placeholder="Acme Corporation Ltd."
                className="bg-background/60"
              />
            </Field>

            <Field label="Physical Address" error={errors.company_address?.message}>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("company_address")}
                  placeholder="123 Cairo Road, Lusaka, Zambia"
                  className="bg-background/60 pl-8"
                />
              </div>
            </Field>

            <FieldRow>
              <Field label="Phone Number" error={errors.company_phone?.message}>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("company_phone")}
                    placeholder="+260 97X XXX XXX"
                    className="bg-background/60 pl-8"
                  />
                </div>
              </Field>

              <Field label="Company Email" error={errors.company_email?.message}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("company_email")}
                    placeholder="payroll@company.com"
                    className="bg-background/60 pl-8"
                  />
                </div>
              </Field>
            </FieldRow>

            <Field label="Website" error={errors.company_website?.message}>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("company_website")}
                  placeholder="https://www.yourcompany.com"
                  className="bg-background/60 pl-8"
                />
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* ── Payroll Configuration ───────────────────────────── */}
        <SectionCard accent="border-emerald-500/20">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

          <div className={SECTION_HEADER_CLASS}>
            <div className="rounded-lg bg-emerald-500/10 p-1.5">
              <CalendarClock className="h-4 w-4 text-emerald-500" />
            </div>
            Payroll Configuration
          </div>

          <div className="space-y-4">
            <FieldRow>
              <Field label="Payroll Frequency">
                <Select
                  value={payrollFrequency}
                  onValueChange={(v) =>
                    setValue("payroll_frequency", v as SettingsForm["payroll_frequency"])
                  }
                >
                  <SelectTrigger className="bg-background/60">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Fiscal Year Start Month">
                <Select
                  value={String(fiscalYearStart)}
                  onValueChange={(v) =>
                    setValue("fiscal_year_start", Number(v))
                  }
                >
                  <SelectTrigger className="bg-background/60">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldRow>
          </div>
        </SectionCard>

        {/* ── Statutory Rates ─────────────────────────────────── */}
        <SectionCard accent="border-sky-500/20">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-500/10 blur-2xl" />

          <div className={SECTION_HEADER_CLASS}>
            <div className="rounded-lg bg-sky-500/10 p-1.5">
              <Percent className="h-4 w-4 text-sky-500" />
            </div>
            Statutory Rates
          </div>

          <p className="mb-4 text-xs text-muted-foreground">
            ZRA-compliant rates applied during payroll calculations. Edit only if regulations have changed.
          </p>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="PAYE Rate (%)" error={errors.paye_rate?.message}>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register("paye_rate")}
                    className="bg-background/60 pr-8"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </Field>

              <Field label="NAPSA Rate (%)" error={errors.napsa_rate?.message}>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register("napsa_rate")}
                    className="bg-background/60 pr-8"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </Field>

              <Field label="NHIMA Rate (%)" error={errors.nhima_rate?.message}>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register("nhima_rate")}
                    className="bg-background/60 pr-8"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </Field>
            </div>

            <Separator />

            <Field
              label="NAPSA Monthly Ceiling (ZMW)"
              error={errors.napsa_ceiling?.message}
            >
              <div className="relative sm:max-w-xs">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  ZMW
                </span>
                <Input
                  type="number"
                  step="0.01"
                  {...register("napsa_ceiling")}
                  className="bg-background/60 pl-12"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum monthly NAPSA contribution cap (default: ZMW 1,221.80)
              </p>
            </Field>
          </div>
        </SectionCard>

        {/* ── Save ────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-teal-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !user}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
