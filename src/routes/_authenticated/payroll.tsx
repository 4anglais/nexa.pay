import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Play } from "lucide-react";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";

export const Route = createFileRoute("/_authenticated/payroll")({
  head: () => ({ meta: [{ title: "Payroll — NexaPayslip" }] }),
  component: PayrollPage,
});

interface Employee {
  id: string;
  full_name: string;
  basic_salary: number;
  allowances: number;
}

interface Deduction {
  employee_id: string;
  amount: number;
}

interface Allowance {
  employee_id: string;
  amount: number;
}

interface CompanySettings {
  paye_rate: number;
  napsa_rate: number;
  nhima_rate: number;
}

function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({
    paye_rate: 0,
    napsa_rate: 5,
    nhima_rate: 1,
  });

  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0"),
  );
  const [year, setYear] = useState(new Date().getFullYear());

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // 🔐 AUTH CHECK (IMPORTANT FIX)
  const isLoggedIn = () => !!firebase.auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empSnap = await getDocs(collection(firebase.db, "employees"));
        setEmployees(
          empSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Employee, "id">),
          })),
        );

        const dedSnap = await getDocs(collection(firebase.db, "deductions"));
        setDeductions(dedSnap.docs.map((d) => d.data() as Deduction));

        const allowSnap = await getDocs(collection(firebase.db, "allowances"));
        setAllowances(allowSnap.docs.map((d) => d.data() as Allowance));

        const settingsRef = doc(firebase.db, "company_settings", "default");
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as CompanySettings);
        }
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    fetchData();
  }, []);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

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

    const paye = gross * (settings.paye_rate / 100);
    const napsa = gross * (settings.napsa_rate / 100);
    const nhima = gross * (settings.nhima_rate / 100);

    return paye + napsa + nhima + custom;
  };

  const runPayroll = async () => {
    // 🔥 FIX: auth check (THIS IS YOUR MAIN ISSUE)
    if (!isLoggedIn()) {
      setResult("❌ You must be logged in to run payroll.");
      return;
    }

    if (!employees.length) return;

    setRunning(true);
    setResult(null);

    try {
      const runRef = await addDoc(collection(firebase.db, "payroll_runs"), {
        month: months[parseInt(month) - 1],
        year,
        created_at: new Date().toISOString(),
      });

      for (const emp of employees) {
        const gross = getGross(emp);
        const ded = getDeductions(emp, gross);

        await addDoc(collection(firebase.db, "payslips"), {
          employee_id: emp.id,
          payroll_run_id: runRef.id,
          gross_pay: gross,
          total_deductions: ded,
          net_pay: gross - ded,
          created_at: new Date().toISOString(),
        });
      }

      setResult("✅ Payroll completed successfully.");
    } catch (err) {
      console.error("PAYROLL ERROR:", err);
      setResult(
        err instanceof Error ? `❌ ${err.message}` : "❌ Unknown payroll error",
      );
    } finally {
      setRunning(false);
    }
  };

  const format = (n: number) =>
    new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(n);

  return (
    <div className="p-6">
      <PageHeader title="Run Payroll" description="Generate payslips" />

      <div className="space-y-4">
        <div className="border p-4 rounded-lg">
          <div className="flex gap-4 items-end">
            <div>
              <Label>Month</Label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border p-2 rounded"
              >
                {months.map((m, i) => (
                  <option key={m} value={String(i + 1).padStart(2, "0")}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Year</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>

            <Button onClick={runPayroll} disabled={running}>
              {running ? <Loader2 className="animate-spin" /> : <Play />}
              Run Payroll
            </Button>
          </div>

          {result && <p className="mt-2 font-medium">{result}</p>}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-bold mb-2">Preview ({employees.length})</h2>

          <table className="w-full text-sm">
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
                    <td className="text-right">{format(gross)}</td>
                    <td className="text-right">{format(ded)}</td>
                    <td className="text-right font-bold">
                      {format(gross - ded)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
