import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Play,
  CheckCircle2,
  AlertCircle,
  User,
  TrendingUp,
  Minus,
  Plus,
} from "lucide-react";
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

export function PayrollPage() {
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
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [uid, setUid] = useState<string | null>(null);

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

        const dedSnap = await getDocs(
          query(
            collection(firebase.db, "deductions"),
            where("userId", "==", uid),
          ),
        );
        setDeductions(dedSnap.docs.map((d) => d.data() as Deduction));

        const allowSnap = await getDocs(
          query(
            collection(firebase.db, "allowances"),
            where("userId", "==", uid),
          ),
        );
        setAllowances(allowSnap.docs.map((d) => d.data() as Allowance));

        const settingsSnap = await getDoc(
          doc(firebase.db, "company_settings", uid),
        );
        if (settingsSnap.exists()) setSettings(settingsSnap.data() as Settings);
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

  const getDeductionsTotal = (emp: Employee, gross: number) => {
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
      setResult({ type: "error", message: "Not logged in" });
      return;
    }
    if (!employees.length) {
      setResult({ type: "error", message: "No employees found" });
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
        const ded = getDeductionsTotal(emp, gross);
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

      setResult({
        type: "success",
        message: `Payroll completed — ${employees.length} payslip(s) generated`,
      });
    } catch (err: unknown) {
      setResult({
        type: "error",
        message: err instanceof Error ? err.message : "Payroll error",
      });
    } finally {
      setRunning(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(n);

  const totals = employees.reduce(
    (acc, emp) => {
      const gross = getGross(emp);
      const ded = getDeductionsTotal(emp, gross);
      return {
        gross: acc.gross + gross,
        ded: acc.ded + ded,
        net: acc.net + (gross - ded),
      };
    },
    { gross: 0, ded: 0, net: 0 },
  );

  const currentPeriod = new Date(year, parseInt(month) - 1).toLocaleString(
    "default",
    {
      month: "long",
      year: "numeric",
    },
  );

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Period: {currentPeriod}
          </span>
          <PageHeader
            title="Run Payroll"
            description="Review employees and process this month's salaries"
          />
        </div>

        <Button
          onClick={runPayroll}
          disabled={running || !employees.length}
          className="gap-2 rounded-xl px-5 h-10 font-semibold shrink-0"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing…
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Run Payroll
            </>
          )}
        </Button>
      </div>

      {/* Result banner */}
      {result && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
            result.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {result.message}
        </div>
      )}

      {/* Summary cards */}
      {employees.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total Gross",
              value: fmt(totals.gross),
              icon: TrendingUp,
              color: "text-sky-500",
              bg: "bg-sky-500/10",
              border: "border-sky-500/20",
            },
            {
              label: "Total Deductions",
              value: fmt(totals.ded),
              icon: Minus,
              color: "text-red-500",
              bg: "bg-red-500/10",
              border: "border-red-500/20",
            },
            {
              label: "Total Net Pay",
              value: fmt(totals.net),
              icon: Plus,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
            },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`rounded-2xl border ${border} bg-card p-4 shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`${bg} rounded-lg p-1.5`}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {label}
                </span>
              </div>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Employee table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-card-foreground">
            Employee Breakdown
          </h2>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {employees.length} employee{employees.length !== 1 ? "s" : ""}
          </span>
        </div>

        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">
                No employees found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add employees first to run payroll.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Net Pay
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp, i) => {
                  const gross = getGross(emp);
                  const ded = getDeductionsTotal(emp, gross);
                  const net = gross - ded;

                  return (
                    <tr
                      key={emp.id}
                      className="transition-colors hover:bg-muted/30"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {emp.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <span className="font-medium text-card-foreground">
                            {emp.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-card-foreground">
                        {fmt(gross)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-red-500">
                        −{fmt(ded)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                          {fmt(net)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals footer */}
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/40">
                  <td className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Totals
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-card-foreground">
                    {fmt(totals.gross)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-red-500">
                    −{fmt(totals.ded)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {fmt(totals.net)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
