import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Play } from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

export const Route = createFileRoute("/_authenticated/payroll")({
  component: PayrollPage,
});

// Define types for payroll data
interface Employee {
  id: string;
  full_name: string;
  basic_salary: number;
}

interface Allowance {
  employee_id: string;
  amount: number;
}

interface Deduction {
  employee_id: string;
  amount: number;
}

interface Settings {
  paye_rate: number;
  napsa_rate: number;
  nhima_rate: number;
}

function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [settings, setSettings] = useState<Settings>({
    paye_rate: 0,
    napsa_rate: 5,
    nhima_rate: 1,
  });

  const [month] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [year] = useState(new Date().getFullYear());

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [uid, setUid] = useState<string | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsub = firebase.auth.onAuthStateChanged((user) => {
      setUid(user?.uid ?? null);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!uid) return;

      try {
        // Fetch employees from Firestore
        const empSnap = await getDocs(
          query(
            collection(firebase.db, "employees"),
            where("userId", "==", uid),
          ),
        );

        setEmployees(
          empSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Employee, "id">),
          })),
        );

        // Fetch deductions from Firestore
        const dedSnap = await getDocs(
          query(
            collection(firebase.db, "deductions"),
            where("userId", "==", uid),
          ),
        );

        setDeductions(dedSnap.docs.map((d) => d.data() as Deduction));

        // Fetch allowances from Firestore
        const allowSnap = await getDocs(
          query(
            collection(firebase.db, "allowances"),
            where("userId", "==", uid),
          ),
        );

        setAllowances(allowSnap.docs.map((d) => d.data() as Allowance));

        // Fetch company settings from Firestore
        const settingsSnap = await getDoc(
          doc(firebase.db, "company_settings", uid),
        );

        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as Settings);
        }
      } catch (err) {
        console.error("Firestore load error:", err);
      }
    };

    fetchData();
  }, [uid]);

  const getGross = (emp: Employee) => {
    const totalAllowances = allowances
      .filter((a) => a.employee_id === emp.id)
      .reduce((s, a) => s + Number(a.amount || 0), 0);

    return Number(emp.basic_salary || 0) + totalAllowances;
  };

  const getDeductions = (emp: Employee, gross: number) => {
    const custom = deductions
      .filter((d) => d.employee_id === emp.id)
      .reduce((s, d) => s + Number(d.amount || 0), 0);

    return (
      gross * (settings.paye_rate / 100) +
      gross * (settings.napsa_rate / 100) +
      gross * (settings.nhima_rate / 100) +
      custom
    );
  };

  const runPayroll = async () => {
    if (!uid) {
      setResult("Not logged in");
      return;
    }

    if (!employees.length) {
      setResult("No employees found");
      return;
    }

    setRunning(true);
    setResult(null);

    try {
      const runRef = await addDoc(collection(firebase.db, "payroll_runs"), {
        userId: uid,
        month,
        year,
        created_at: new Date().toISOString(),
      });

      for (const emp of employees) {
        const gross = getGross(emp);
        const ded = getDeductions(emp, gross);

        await addDoc(collection(firebase.db, "payslips"), {
          userId: uid,
          employee_id: emp.id,
          payroll_run_id: runRef.id,
          gross_pay: gross,
          total_deductions: ded,
          net_pay: gross - ded,
          created_at: new Date().toISOString(),
        });
      }

      setResult("Payroll completed successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payroll error";
      setResult(message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader title="Run Payroll" />

      <Button onClick={runPayroll} disabled={running}>
        {running ? <Loader2 className="animate-spin" /> : <Play />}
        Run Payroll
      </Button>

      {result && <p>{result}</p>}

      <table className="w-full text-sm mt-4">
        <thead>
          <tr>
            <th>Employee</th>
            <th className="text-right">Gross</th>
            <th className="text-right">Deductions</th>
            <th className="text-right">Net</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((e) => {
            const gross = getGross(e);
            const ded = getDeductions(e, gross);

            return (
              <tr key={e.id}>
                <td>{e.full_name}</td>
                <td className="text-right">{gross}</td>
                <td className="text-right">{ded}</td>
                <td className="text-right">{gross - ded}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
