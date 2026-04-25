import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  User,
  Building2,
  CreditCard,
  TrendingUp,
  Minus,
} from "lucide-react";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";

export const Route = createFileRoute("/_authenticated/employees/new")({
  head: () => ({
    meta: [{ title: "Add Employee — NexaPayslip" }],
  }),
  component: NewEmployeePage,
});

const employeeSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(255),
  nrc_or_id: z.string().min(1, "NRC/ID is required").max(100),
  email: z.string().email("Valid email required").optional(),
  position: z.string().min(1, "Position is required").max(255),
  department: z.string().min(1, "Department is required").max(255),
  basic_salary: z.coerce.number().min(0, "Must be positive"),
  bank_name: z.string().max(255).optional(),
  account_number: z.string().max(100).optional(),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

interface LineItem {
  type: string;
  amount: number;
}

function SectionHeading({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`rounded-lg ${color} p-1.5`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h3 className="text-sm font-semibold text-card-foreground">{label}</h3>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export function NewEmployeePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAndroidRoute = location.pathname.startsWith("/android");
  const [error, setError] = useState("");
  const [allowances, setAllowances] = useState<LineItem[]>([]);
  const [deductionItems, setDeductionItems] = useState<LineItem[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeForm>({ resolver: zodResolver(employeeSchema) });

  const onSubmit = async (data: EmployeeForm) => {
    setError("");
    try {
      const user = firebase.auth.currentUser;
      if (!user) throw new Error("User not authenticated. Please login again.");

      const employeeRef = await addDoc(collection(firebase.db, "employees"), {
        ...data,
        userId: user.uid,
        allowances: allowances.reduce((s, a) => s + a.amount, 0),
        account_active: Boolean(data.email),
        created_at: new Date().toISOString(),
      });

      for (const allowance of allowances.filter((a) => a.type)) {
        await addDoc(collection(firebase.db, "allowances"), {
          employee_id: employeeRef.id,
          userId: user.uid,
          type: allowance.type,
          amount: allowance.amount,
        });
      }

      for (const deduction of deductionItems.filter((d) => d.type)) {
        await addDoc(collection(firebase.db, "deductions"), {
          employee_id: employeeRef.id,
          userId: user.uid,
          type: deduction.type,
          amount: deduction.amount,
        });
      }

      navigate({ to: isAndroidRoute ? "/android/employees" : "/employees" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create employee",
      );
    }
  };

  const addAllowance = () =>
    setAllowances([...allowances, { type: "", amount: 0 }]);
  const addDeduction = () =>
    setDeductionItems([...deductionItems, { type: "", amount: 0 }]);
  const removeAllowance = (i: number) =>
    setAllowances(allowances.filter((_, idx) => idx !== i));
  const removeDeduction = (i: number) =>
    setDeductionItems(deductionItems.filter((_, idx) => idx !== i));

  const updateAllowance = (
    i: number,
    field: "type" | "amount",
    val: string,
  ) => {
    const copy = [...allowances];
    if (field === "amount") copy[i].amount = Number(val);
    else copy[i].type = val;
    setAllowances(copy);
  };

  const updateDeduction = (
    i: number,
    field: "type" | "amount",
    val: string,
  ) => {
    const copy = [...deductionItems];
    if (field === "amount") copy[i].amount = Number(val);
    else copy[i].type = val;
    setDeductionItems(copy);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Employee"
        description="Add a new team member to your payroll"
      />

      <div className="mx-auto max-w-3xl">
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <SectionHeading
              icon={User}
              label="Personal Information"
              color="bg-violet-500/10 text-violet-500"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="full_name"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  placeholder="e.g. John Banda"
                  {...register("full_name")}
                  className="rounded-lg"
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="nrc_or_id"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  NRC / ID *
                </Label>
                <Input
                  id="nrc_or_id"
                  placeholder="e.g. 123456/78/1"
                  {...register("nrc_or_id")}
                  className="rounded-lg"
                />
                {errors.nrc_or_id && (
                  <p className="text-xs text-destructive">
                    {errors.nrc_or_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  {...register("email")}
                  className="rounded-lg"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Job Info */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <SectionHeading
              icon={Building2}
              label="Job Details"
              color="bg-sky-500/10 text-sky-500"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="position"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Position *
                </Label>
                <Input
                  id="position"
                  placeholder="e.g. Software Engineer"
                  {...register("position")}
                  className="rounded-lg"
                />
                {errors.position && (
                  <p className="text-xs text-destructive">
                    {errors.position.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="department"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Department *
                </Label>
                <Input
                  id="department"
                  placeholder="e.g. Engineering"
                  {...register("department")}
                  className="rounded-lg"
                />
                {errors.department && (
                  <p className="text-xs text-destructive">
                    {errors.department.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="basic_salary"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Basic Salary (ZMW) *
                </Label>
                <Input
                  id="basic_salary"
                  type="number"
                  placeholder="0.00"
                  {...register("basic_salary")}
                  className="rounded-lg font-mono"
                />
                {errors.basic_salary && (
                  <p className="text-xs text-destructive">
                    {errors.basic_salary.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Banking */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <SectionHeading
              icon={CreditCard}
              label="Banking Details"
              color="bg-amber-500/10 text-amber-500"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="bank_name"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Bank Name
                </Label>
                <Input
                  id="bank_name"
                  placeholder="e.g. Zanaco"
                  {...register("bank_name")}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="account_number"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Account Number
                </Label>
                <Input
                  id="account_number"
                  placeholder="e.g. 0123456789"
                  {...register("account_number")}
                  className="rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Allowances */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-emerald-500/10 text-emerald-500 p-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-card-foreground">
                  Allowances
                </h3>
                {allowances.length > 0 && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {allowances.length}
                  </span>
                )}
                <div className="flex-1 h-px bg-border" />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAllowance}
                className="gap-1.5 rounded-lg text-xs font-semibold"
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>

            {allowances.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No allowances added yet.
              </p>
            ) : (
              <div className="space-y-2">
                {allowances.map((a, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="Type (e.g. Housing)"
                      value={a.type}
                      onChange={(e) =>
                        updateAllowance(i, "type", e.target.value)
                      }
                      className="rounded-lg flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={a.amount || ""}
                      onChange={(e) =>
                        updateAllowance(i, "amount", e.target.value)
                      }
                      className="rounded-lg w-32 font-mono"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAllowance(i)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deductions */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-red-500/10 text-red-500 p-1.5">
                  <Minus className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-card-foreground">
                  Custom Deductions
                </h3>
                {deductionItems.length > 0 && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {deductionItems.length}
                  </span>
                )}
                <div className="flex-1 h-px bg-border" />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDeduction}
                className="gap-1.5 rounded-lg text-xs font-semibold"
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>

            {deductionItems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No custom deductions added yet.
              </p>
            ) : (
              <div className="space-y-2">
                {deductionItems.map((d, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="Type (e.g. Loan)"
                      value={d.type}
                      onChange={(e) =>
                        updateDeduction(i, "type", e.target.value)
                      }
                      className="rounded-lg flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={d.amount || ""}
                      onChange={(e) =>
                        updateDeduction(i, "amount", e.target.value)
                      }
                      className="rounded-lg w-32 font-mono"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDeduction(i)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl px-5"
              onClick={() =>
                navigate({
                  to: isAndroidRoute ? "/android/employees" : "/employees",
                })
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 rounded-xl px-6 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save Employee"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
