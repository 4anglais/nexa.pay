import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2 } from "lucide-react";
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

function NewEmployeePage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [allowances, setAllowances] = useState<LineItem[]>([]);
  const [deductionItems, setDeductionItems] = useState<LineItem[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
  });

  // 🔥 FIXED ONLY (no UI changes)
  const onSubmit = async (data: EmployeeForm) => {
    setError("");

    try {
      const user = firebase.auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated. Please login again.");
      }

      // EMPLOYEE (IMPORTANT FIX: userId added)
      const employeeRef = await addDoc(collection(firebase.db, "employees"), {
        ...data,
        userId: user.uid, // 🔥 REQUIRED FOR RULES
        allowances: allowances.reduce((s, a) => s + a.amount, 0),
        account_active: Boolean(data.email),
        created_at: new Date().toISOString(),
      });

      // ALLOWANCES (FIX: userId added)
      for (const allowance of allowances.filter((a) => a.type)) {
        await addDoc(collection(firebase.db, "allowances"), {
          employee_id: employeeRef.id,
          userId: user.uid,
          type: allowance.type,
          amount: allowance.amount,
        });
      }

      // DEDUCTIONS (FIX: userId added)
      for (const deduction of deductionItems.filter((d) => d.type)) {
        await addDoc(collection(firebase.db, "deductions"), {
          employee_id: employeeRef.id,
          userId: user.uid,
          type: deduction.type,
          amount: deduction.amount,
        });
      }

      navigate({ to: "/employees" });
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
          {/* BASIC INFO */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && (
                <p className="text-xs text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nrc_or_id">NRC / ID *</Label>
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
              <Label htmlFor="position">Position *</Label>
              <Input id="position" {...register("position")} />
              {errors.position && (
                <p className="text-xs text-destructive">
                  {errors.position.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
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
              <Label htmlFor="basic_salary">Basic Salary *</Label>
              <Input
                id="basic_salary"
                type="number"
                {...register("basic_salary")}
              />
              {errors.basic_salary && (
                <p className="text-xs text-destructive">
                  {errors.basic_salary.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input id="bank_name" {...register("bank_name")} />
            </div>
          </div>

          {/* ALLOWANCES */}
          <div>
            <h3 className="font-bold">Allowances</h3>
            <Button type="button" onClick={addAllowance}>
              <Plus className="w-4 h-4" /> Add
            </Button>

            {allowances.map((a, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Type"
                  value={a.type}
                  onChange={(e) => updateAllowance(i, "type", e.target.value)}
                />
                <Input
                  type="number"
                  value={a.amount}
                  onChange={(e) => updateAllowance(i, "amount", e.target.value)}
                />
                <Button type="button" onClick={() => removeAllowance(i)}>
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>

          {/* DEDUCTIONS */}
          <div>
            <h3 className="font-bold">Deductions</h3>
            <Button type="button" onClick={addDeduction}>
              <Plus className="w-4 h-4" /> Add
            </Button>

            {deductionItems.map((d, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Type"
                  value={d.type}
                  onChange={(e) => updateDeduction(i, "type", e.target.value)}
                />
                <Input
                  type="number"
                  value={d.amount}
                  onChange={(e) => updateDeduction(i, "amount", e.target.value)}
                />
                <Button type="button" onClick={() => removeDeduction(i)}>
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>

          {/* SUBMIT */}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Save Employee
          </Button>
        </form>
      </div>
    </>
  );
}
