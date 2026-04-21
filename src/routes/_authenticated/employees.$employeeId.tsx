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
import { getAuth } from "firebase/auth";

export const Route = createFileRoute("/_authenticated/employees/$employeeId")({
  component: EditEmployeePage,
});

const employeeSchema = z.object({
  full_name: z.string().min(1).max(255),
  nrc_or_id: z.string().min(1).max(100),
  email: z.string().email().optional(),
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
        // Fetch employee
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

        setAllowances(
          allowancesSnapshot.docs.map((d) => ({
            id: d.id,
            type: d.data().type,
            amount: Number(d.data().amount),
          })),
        );

        // Fetch deductions
        const deductionsQuery = query(
          collection(firebase.db, "deductions"),
          where("employee_id", "==", employeeId),
        );

        const deductionsSnapshot = await getDocs(deductionsQuery);

        setDeductions(
          deductionsSnapshot.docs.map((d) => ({
            id: d.id,
            type: d.data().type,
            amount: Number(d.data().amount),
          })),
        );

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, reset]);

  const onSubmit = async (data: EmployeeForm) => {
    setError("");

    // Get authenticated user
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      const totalAllowances = allowances.reduce((s, a) => s + a.amount, 0);

      // Update employee
      await setDoc(doc(firebase.db, "employees", employeeId), {
        ...data,
        allowances: totalAllowances,
      });

      // Remove existing allowances
      const allowancesQuery = query(
        collection(firebase.db, "allowances"),
        where("employee_id", "==", employeeId),
        where("userId", "==", user.uid),
      );

      const allowancesSnapshot = await getDocs(allowancesQuery);

      allowancesSnapshot.forEach(async (d) => {
        await deleteDoc(d.ref);
      });

      // Add allowances
      for (const allowance of allowances) {
        await addDoc(collection(firebase.db, "allowances"), {
          employee_id: employeeId,
          userId: user.uid,
          type: allowance.type,
          amount: allowance.amount,
        });
      }

      // Remove existing deductions
      const deductionsQuery = query(
        collection(firebase.db, "deductions"),
        where("employee_id", "==", employeeId),
        where("userId", "==", user.uid),
      );

      const deductionsSnapshot = await getDocs(deductionsQuery);

      deductionsSnapshot.forEach(async (d) => {
        await deleteDoc(d.ref);
      });

      // Add deductions
      for (const deduction of deductions) {
        await addDoc(collection(firebase.db, "deductions"), {
          employee_id: employeeId,
          userId: user.uid,
          type: deduction.type,
          amount: deduction.amount,
        });
      }

      navigate({ to: "/employees" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageHeader title="Edit Employee" description="Update employee details" />

      <div className="max-w-3xl">
        {error && <div>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Label>Full Name</Label>
          <Input {...register("full_name")} />

          <Label>NRC / ID</Label>
          <Input {...register("nrc_or_id")} />

          <Label>Position</Label>
          <Input {...register("position")} />

          <Label>Department</Label>
          <Input {...register("department")} />

          <Label>Basic Salary</Label>
          <Input type="number" {...register("basic_salary")} />

          <Button type="submit" disabled={isSubmitting}>
            Update
          </Button>
        </form>
      </div>
    </>
  );
}
