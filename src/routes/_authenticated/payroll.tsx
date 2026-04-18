import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Play } from "lucide-react";
import { collection, query, getDocs, addDoc, where } from "firebase/firestore";

export const Route = createFileRoute("/_authenticated/payroll")({
  head: () => ({
    meta: [{ title: "Payroll — NexaPayslip" }],
  }),
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
  type: string;
  amount: number;
}

interface Allowance {
  employee_id: string;
  type: string;
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
  const [allowanceRows, setAllowanceRows] = useState<Allowance[]>([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const employeesSnapshot = await getDocs(
          collection(firebase.db, "employees"),
        );
        const employeesData = employeesSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Employee,
        );
        setEmployees(employeesData);

        // Fetch deductions
        const deductionsSnapshot = await getDocs(
          collection(firebase.db, "deductions"),
        );
        const deductionsData = deductionsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Deduction,
        );
        setDeductions(deductionsData);

        // Fetch allowances
        const allowancesSnapshot = await getDocs(
          collection(firebase.db, "allowances"),
        );
        const allowancesData = allowancesSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Allowance,
        );
        setAllowanceRows(allowancesData);

        // Fetch company settings
        const settingsSnapshot = await getDocs(
          query(collection(firebase.db, "company_settings")),
        );
        if (!settingsSnapshot.empty) {
          const settingsData =
            settingsSnapshot.docs[0].data() as CompanySettings;
          setSettings(settingsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const getEmployeeGross = (emp: Employee) => {
    const empAllowances = allowanceRows.filter((a) => a.employee_id === emp.id);
    const totalAllowances =
      empAllowances.length > 0
        ? empAllowances.reduce((s, a) => s + Number(a.amount), 0)
        : Number(emp.allowances);
    return Number(emp.basic_salary) + totalAllowances;
  };

  const getEmployeeDeductions = (emp: Employee, gross: number) => {
    const empDed = deductions.filter((d) => d.employee_id === emp.id);
    const customTotal = empDed.reduce((s, d) => s + Number(d.amount), 0);
    const paye = gross * (settings.paye_rate / 100);
    const napsa = gross * (settings.napsa_rate / 100);
    const nhima = gross * (settings.nhima_rate / 100);
    return paye + napsa + nhima + customTotal;
  };

  const runPayroll = async () => {
    if (employees.length === 0) return;
    setRunning(true);
    setResult(null);

    try {
      // Create payroll run
      const payrollRunRef = await addDoc(
        collection(firebase.db, "payroll_runs"),
        {
          month: months[parseInt(month) - 1],
          year,
          created_at: new Date().toISOString(),
        },
      );

      const payslips = employees.map((emp) => {
        const gross = getEmployeeGross(emp);
        const totalDeductions = getEmployeeDeductions(emp, gross);
        const netPay = gross - totalDeductions;
        return {
          employee_id: emp.id,
          payroll_run_id: payrollRunRef.id,
          gross_pay: gross,
          total_deductions: totalDeductions,
          net_pay: netPay,
          created_at: new Date().toISOString(),
        };
      });

      // Add payslips
      for (const payslip of payslips) {
        await addDoc(collection(firebase.db, "payslips"), payslip);
      }

      setResult(
        `Payroll run completed! ${payslips.length} payslips generated for ${months[parseInt(month) - 1]} ${year}.`,
      );
    } catch (err) {
      setResult(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setRunning(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(n);

  return (
    <>
      <PageHeader
        title="Run Payroll"
        description="Generate payslips for your employees"
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-card-foreground">
            Select Period
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Month</Label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm font-semibold"
              >
                {months.map((m, i) => (
                  <option key={m} value={String(i + 1).padStart(2, "0")}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Year</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-28"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={runPayroll}
                disabled={running || employees.length === 0}
              >
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" strokeWidth={1.5} />
                )}
                Run Payroll
              </Button>
            </div>
          </div>
          {result && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 text-sm font-semibold ${result.startsWith("Error") ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}
            >
              {result}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-card-foreground">
            Payroll Preview ({employees.length} employees)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                    Gross Pay
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                    Deductions
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                    Net Pay
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const gross = getEmployeeGross(emp);
                  const totalDed = getEmployeeDeductions(emp, gross);
                  return (
                    <tr
                      key={emp.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 font-semibold text-card-foreground">
                        {emp.full_name}
                      </td>
                      <td className="px-4 py-3 text-right text-card-foreground">
                        {formatCurrency(gross)}
                      </td>
                      <td className="px-4 py-3 text-right text-destructive">
                        {formatCurrency(totalDed)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-success">
                        {formatCurrency(gross - totalDed)}
                      </td>
                    </tr>
                  );
                })}
                {employees.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center font-light italic text-muted-foreground"
                    >
                      No employees found. Add employees first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
