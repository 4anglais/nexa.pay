import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";

export const Route = createFileRoute("/_authenticated/employees/$employeeId")({
  component: EditEmployeePage,
});

const employeeSchema = z.object({
  full_name: z.string().min(1).max(255),
  nrc_or_id: z.string().min(1).max(100),
  email: z.string().email("Valid email required").optional(),
  position: z.string().min(1).max(255),
  department: z.string().min(1).max(255),
  basic_salary: z.coerce.number().min(0),
  bank_name: z.string().max(255).optional(),
  account_number: z.string().max(100).optional(),
  account_active: z.boolean().optional(),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

interface LineItem {
  id?: string;
  type: string;
  amount: number;
  isNew?: boolean;
}
type LineItemRecord = {
  id: string;
  type: string;
  amount: number | string | null;
};

function EditEmployeePage() {
  const { employeeId } = Route.useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [allowances, setAllowances] = useState<LineItem[]>([]);
  const [deductions, setDeductions] = useState<LineItem[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee data
        const employeeDoc = await getDoc(
          doc(firebase.db, "employees", employeeId),
        );
        if (employeeDoc.exists()) {
          reset(employeeDoc.data() as EmployeeForm);
        }

        // Fetch allowances
        const allowancesQuery = query(
          collection(firebase.db, "allowances"),
          where("employee_id", "==", employeeId),
        );
        const allowancesSnapshot = await getDocs(allowancesQuery);
        const allowancesData = allowancesSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: doc.data().type,
          amount: Number(doc.data().amount),
        }));
        setAllowances(allowancesData);

        // Fetch deductions
        const deductionsQuery = query(
          collection(firebase.db, "deductions"),
          where("employee_id", "==", employeeId),
        );
        const deductionsSnapshot = await getDocs(deductionsQuery);
        const deductionsData = deductionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: doc.data().type,
          amount: Number(doc.data().amount),
        }));
        setDeductions(deductionsData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, reset]);

  const onSubmit = async (data: EmployeeForm) => {
    setError("");
    try {
      // Update employee
      const totalAllowances = allowances.reduce((s, a) => s + a.amount, 0);
      await setDoc(doc(firebase.db, "employees", employeeId), {
        ...data,
        allowances: totalAllowances,
      });

      // Sync allowances
      const allowancesQuery = query(
        collection(firebase.db, "allowances"),
        where("employee_id", "==", employeeId),
      );
      const allowancesSnapshot = await getDocs(allowancesQuery);
      allowancesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      if (allowances.length > 0) {
        for (const allowance of allowances) {
          await addDoc(collection(firebase.db, "allowances"), {
            employee_id: employeeId,
            type: allowance.type,
            amount: allowance.amount,
          });
        }
      }

      // Sync deductions
      const deductionsQuery = query(
        collection(firebase.db, "deductions"),
        where("employee_id", "==", employeeId),
      );
      const deductionsSnapshot = await getDocs(deductionsQuery);
      deductionsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      if (deductions.length > 0) {
        for (const deduction of deductions) {
          await addDoc(collection(firebase.db, "deductions"), {
            employee_id: employeeId,
            type: deduction.type,
            amount: deduction.amount,
          });
        }
      }

      navigate({ to: "/employees" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const addAllowance = () =>
    setAllowances([...allowances, { type: "", amount: 0, isNew: true }]);
  const addDeduction = () =>
    setDeductions([...deductions, { type: "", amount: 0, isNew: true }]);
  const removeAllowance = (i: number) =>
    setAllowances(allowances.filter((_, idx) => idx !== i));
  const removeDeduction = (i: number) =>
    setDeductions(deductions.filter((_, idx) => idx !== i));
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
    const copy = [...deductions];
    if (field === "amount") copy[i].amount = Number(val);
    else copy[i].type = val;
    setDeductions(copy);
  };

  if (loading)
    return (
      <div className="py-12 text-center text-muted-foreground">Loading...</div>
    );

  return (
    <>
      <PageHeader
        title="Edit Employee"
        description="Update employee details, allowances, and deductions"
      />
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-semibold">Full Name</Label>
                <Input {...register("full_name")} />
                {errors.full_name && (
                  <p className="text-xs text-destructive">
                    {errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">NRC / ID</Label>
                <Input {...register("nrc_or_id")} />
                {errors.nrc_or_id && (
                  <p className="text-xs text-destructive">
                    {errors.nrc_or_id.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-semibold">Position</Label>
                <Input {...register("position")} />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Department</Label>
                <Input {...register("department")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-semibold">Basic Salary (ZMW)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("basic_salary")}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Employee Email</Label>
                <Input type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Bank Name</Label>
                <Input {...register("bank_name")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-semibold">Account Number</Label>
                <Input {...register("account_number")} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 pt-6">
                  <input
                    id="account_active"
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    {...register("account_active")}
                  />
                  <label
                    htmlFor="account_active"
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    Account Active
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enable when the employee should have login access.
                </p>
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
                  No allowances added.
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
                    onChange={(e) =>
                      updateAllowance(i, "amount", e.target.value)
                    }
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
              {deductions.length === 0 && (
                <p className="text-sm font-light italic text-muted-foreground">
                  No custom deductions. Statutory rates apply from Settings.
                </p>
              )}
              {deductions.map((d, i) => (
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
                    onChange={(e) =>
                      updateDeduction(i, "amount", e.target.value)
                    }
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
                Update Employee
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
      </div>
    </>
  );
}
