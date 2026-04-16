import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

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

type EmployeeForm = z.input<typeof employeeSchema>;

interface LineItem {
  type: string;
  amount: number;
}

function NewEmployeePage() {
  const navigate = useNavigate();
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
    const totalAllowances = allowances.reduce((s, a) => s + a.amount, 0);
    const { data: emp, error: empErr } = await supabase
      .from("employees")
      .insert({
        ...data,
        allowances: totalAllowances,
        account_active: Boolean(data.email),
      })
      .select()
      .single();
    if (empErr || !emp) {
      setError(empErr?.message ?? "Failed to create employee");
      return;
    }

    // Insert allowances
    if (allowances.length > 0) {
      await supabase
        .from("allowances")
        .insert(
          allowances
            .filter((a) => a.type)
            .map((a) => ({
              employee_id: emp.id,
              type: a.type,
              amount: a.amount,
            })),
        );
    }
    // Insert deductions
    if (deductionItems.length > 0) {
      await supabase
        .from("deductions")
        .insert(
          deductionItems
            .filter((d) => d.type)
            .map((d) => ({
              employee_id: emp.id,
              type: d.type,
              amount: d.amount,
            })),
        );
    }

    navigate({ to: "/employees" });
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
    <>
      <PageHeader
        title="Add Employee"
        description="Add a new team member to your payroll"
      />

      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="font-semibold">
                Full Name *
              </Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && (
                <p className="text-xs text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nrc_or_id" className="font-semibold">
                NRC / ID Number *
              </Label>
              <Input id="nrc_or_id" {...register("nrc_or_id")} />
              {errors.nrc_or_id && (
                <p className="text-xs text-destructive">
                  {errors.nrc_or_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="position" className="font-semibold">
                Position *
              </Label>
              <Input id="position" {...register("position")} />
              {errors.position && (
                <p className="text-xs text-destructive">
                  {errors.position.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="font-semibold">
                Department *
              </Label>
              <Input id="department" {...register("department")} />
              {errors.department && (
                <p className="text-xs text-destructive">
                  {errors.department.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="basic_salary" className="font-semibold">
                Basic Salary (ZMW) *
              </Label>
              <Input
                id="basic_salary"
                type="number"
                step="0.01"
                {...register("basic_salary")}
              />
              {errors.basic_salary && (
                <p className="text-xs text-destructive">
                  {errors.basic_salary.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">
                Employee Email
              </Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Optional: used to track employee accounts.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name" className="font-semibold">
                Bank Name
              </Label>
              <Input id="bank_name" {...register("bank_name")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account_number" className="font-semibold">
                Account Number
              </Label>
              <Input id="account_number" {...register("account_number")} />
            </div>
          </div>

          {/* Allowances */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-card-foreground">
                Allowances
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAllowance}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add
              </Button>
            </div>
            {allowances.length === 0 && (
              <p className="text-sm font-light italic text-muted-foreground">
                No allowances added yet.
              </p>
            )}
            {allowances.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <Input
                  placeholder="e.g. Housing"
                  value={a.type}
                  onChange={(e) => updateAllowance(i, "type", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={a.amount || ""}
                  onChange={(e) => updateAllowance(i, "amount", e.target.value)}
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAllowance(i)}
                >
                  <Trash2
                    className="h-4 w-4 text-destructive"
                    strokeWidth={1.5}
                  />
                </Button>
              </div>
            ))}
          </div>

          {/* Deductions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-card-foreground">
                Deductions
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDeduction}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add
              </Button>
            </div>
            {deductionItems.length === 0 && (
              <p className="text-sm font-light italic text-muted-foreground">
                No custom deductions. Statutory rates apply from Settings.
              </p>
            )}
            {deductionItems.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <Input
                  placeholder="e.g. Loan"
                  value={d.type}
                  onChange={(e) => updateDeduction(i, "type", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={d.amount || ""}
                  onChange={(e) => updateDeduction(i, "amount", e.target.value)}
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDeduction(i)}
                >
                  <Trash2
                    className="h-4 w-4 text-destructive"
                    strokeWidth={1.5}
                  />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Employee
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/employees" })}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
