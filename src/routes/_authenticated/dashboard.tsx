import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Users, Banknote, FileText, TrendingUp } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NexaPayslip" },
      { name: "description", content: "Your payroll overview" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    monthlyPayroll: 0,
    payslipsGenerated: 0,
    payrollRuns: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const uid = firebase.auth.currentUser?.uid;
        if (!uid) return;

        // EMPLOYEES
        const employeesSnapshot = await getDocs(
          query(
            collection(firebase.db, "employees"),
            where("userId", "==", uid),
          ),
        );

        const employees = employeesSnapshot.docs.map((doc) => doc.data());

        // PAYSLIPS
        const payslipsSnapshot = await getDocs(
          query(
            collection(firebase.db, "payslips"),
            where("userId", "==", uid),
          ),
        );

        const payslips = payslipsSnapshot.docs.map((doc) => doc.data());

        // PAYROLL RUNS
        const runsSnapshot = await getDocs(
          query(
            collection(firebase.db, "payroll_runs"),
            where("userId", "==", uid),
          ),
        );

        const runs = runsSnapshot.docs.map((doc) => doc.data());

        const monthlyPayroll = employees.reduce(
          (sum, e) =>
            sum + Number(e.basic_salary || 0) + Number(e.allowances || 0),
          0,
        );

        setStats({
          totalEmployees: employees.length,
          monthlyPayroll,
          payslipsGenerated: payslips.length,
          payrollRuns: runs.length,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    }

    loadStats();
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(n);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome to NexaPayslip — your payroll overview"
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={String(stats.totalEmployees)}
          icon={Users}
        />
        <StatCard
          title="Monthly Payroll"
          value={formatCurrency(stats.monthlyPayroll)}
          icon={Banknote}
        />
        <StatCard
          title="Payslips Generated"
          value={String(stats.payslipsGenerated)}
          icon={FileText}
        />
        <StatCard
          title="Payroll Runs"
          value={String(stats.payrollRuns)}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-card-foreground">
            Recent Activity
          </h2>
          <p className="text-sm font-light italic text-muted-foreground">
            No recent payroll activity. Create your first payroll run to get
            started.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-card-foreground">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <Link
              to="/employees"
              className="flex items-center gap-3 rounded-lg border p-3 text-sm font-semibold hover:bg-accent"
            >
              <Users className="h-4 w-4" />
              Manage Employees
            </Link>

            <Link
              to="/payroll"
              className="flex items-center gap-3 rounded-lg border p-3 text-sm font-semibold hover:bg-accent"
            >
              <Banknote className="h-4 w-4" />
              Run Payroll
            </Link>

            <Link
              to="/payslips"
              className="flex items-center gap-3 rounded-lg border p-3 text-sm font-semibold hover:bg-accent"
            >
              <FileText className="h-4 w-4" />
              View Payslips
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
