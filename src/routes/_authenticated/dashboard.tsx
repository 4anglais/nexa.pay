import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Users, Banknote, FileText, TrendingUp } from "lucide-react";

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
      const [empRes, payslipRes, runRes] = await Promise.all([
        supabase.from("employees").select("id, basic_salary, allowances"),
        supabase.from("payslips").select("id, net_pay"),
        supabase.from("payroll_runs").select("id"),
      ]);

      const employees = empRes.data ?? [];
      const payslips = payslipRes.data ?? [];
      const runs = runRes.data ?? [];

      const monthlyPayroll = employees.reduce(
        (sum, e) => sum + Number(e.basic_salary || 0) + Number(e.allowances || 0),
        0
      );

      setStats({
        totalEmployees: employees.length,
        monthlyPayroll,
        payslipsGenerated: payslips.length,
        payrollRuns: runs.length,
      });
    }
    loadStats();
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(n);

  return (
    <>
      <PageHeader title="Dashboard" description="Welcome to NexaPayslip — your payroll overview" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Employees" value={String(stats.totalEmployees)} icon={Users} />
        <StatCard title="Monthly Payroll" value={formatCurrency(stats.monthlyPayroll)} icon={Banknote} />
        <StatCard title="Payslips Generated" value={String(stats.payslipsGenerated)} icon={FileText} />
        <StatCard title="Payroll Runs" value={String(stats.payrollRuns)} icon={TrendingUp} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-card-foreground">Recent Activity</h2>
          <p className="text-sm font-light italic text-muted-foreground">
            No recent payroll activity. Create your first payroll run to get started.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-card-foreground">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/employees" className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-semibold transition-colors hover:bg-accent">
              <Users className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              <span className="text-card-foreground">Manage Employees</span>
            </Link>
            <Link to="/payroll" className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-semibold transition-colors hover:bg-accent">
              <Banknote className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              <span className="text-card-foreground">Run Payroll</span>
            </Link>
            <Link to="/payslips" className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-semibold transition-colors hover:bg-accent">
              <FileText className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              <span className="text-card-foreground">View Payslips</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
