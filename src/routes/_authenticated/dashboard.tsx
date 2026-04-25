import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import {
  Users,
  Banknote,
  FileText,
  TrendingUp,
  ArrowRight,
  Activity,
  ChevronRight,
} from "lucide-react";
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

const statConfig = [
  {
    key: "totalEmployees",
    title: "Total Employees",
    icon: Users,
    description: "Active staff",
    format: (v: number) => String(v),
    // Teal — matches login accent
    gradient: "from-teal-500/20 to-teal-500/5",
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    border: "border-teal-500/20",
    glow: "bg-teal-500/10",
  },
  {
    key: "monthlyPayroll",
    title: "Monthly Payroll",
    icon: Banknote,
    description: "Total disbursement",
    format: (v: number) =>
      new Intl.NumberFormat("en-ZM", {
        style: "currency",
        currency: "ZMW",
      }).format(v),
    // Emerald — second login accent
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "bg-emerald-500/10",
  },
  {
    key: "payslipsGenerated",
    title: "Payslips Generated",
    icon: FileText,
    description: "Total documents",
    format: (v: number) => String(v),
    gradient: "from-sky-500/20 to-sky-500/5",
    iconColor: "text-sky-500",
    iconBg: "bg-sky-500/10",
    border: "border-sky-500/20",
    glow: "bg-sky-500/10",
  },
  {
    key: "payrollRuns",
    title: "Payroll Runs",
    icon: TrendingUp,
    description: "Completed cycles",
    format: (v: number) => String(v),
    gradient: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "bg-amber-500/10",
  },
];

export function DashboardPage() {
  const location = useLocation();
  const isAndroidRoute = location.pathname.startsWith("/android");
  const [stats, setStats] = useState({
    totalEmployees: 0,
    monthlyPayroll: 0,
    payslipsGenerated: 0,
    payrollRuns: 0,
  });

  const quickActions = [
    {
      to: isAndroidRoute ? "/android/employees" : "/employees",
      icon: Users,
      label: "Manage Employees",
      description: "Add, edit, or remove staff",
      iconColor: "text-teal-500",
      iconBg: "bg-teal-500/10",
      hoverBorder: "hover:border-teal-500/30",
    },
    {
      to: isAndroidRoute ? "/android/payroll" : "/payroll",
      icon: Banknote,
      label: "Run Payroll",
      description: "Process this month's salaries",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
      hoverBorder: "hover:border-emerald-500/30",
    },
    {
      to: isAndroidRoute ? "/android/payslips" : "/payslips",
      icon: FileText,
      label: "View Payslips",
      description: "Browse generated documents",
      iconColor: "text-sky-500",
      iconBg: "bg-sky-500/10",
      hoverBorder: "hover:border-sky-500/30",
    },
  ] as const;

  useEffect(() => {
    async function loadStats() {
      try {
        const uid = firebase.auth.currentUser?.uid;
        if (!uid) return;

        const employeesSnapshot = await getDocs(
          query(
            collection(firebase.db, "employees"),
            where("userId", "==", uid),
          ),
        );
        const employees = employeesSnapshot.docs.map((doc) => doc.data());

        const payslipsSnapshot = await getDocs(
          query(
            collection(firebase.db, "payslips"),
            where("userId", "==", uid),
          ),
        );
        const payslips = payslipsSnapshot.docs.map((doc) => doc.data());

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

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
          <Activity className="h-3 w-3" />
          <span>{currentMonth}</span>
        </div>
        <PageHeader
          title="Dashboard"
          description="Welcome to NexaPayslip — your payroll overview"
        />
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statConfig.map(
          ({
            key,
            title,
            icon: Icon,
            description,
            format,
            gradient,
            iconColor,
            iconBg,
            border,
            glow,
          }) => (
            <div
              key={key}
              className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${gradient} p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              {/* Soft glow orb */}
              <div
                className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full ${glow} blur-2xl`}
              />

              <div className="flex items-start justify-between">
                <div className={`rounded-xl ${iconBg} p-2.5`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {description}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {format(stats[key as keyof typeof stats] as number)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{title}</p>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Activity */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-card-foreground">
              Recent Activity
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              0 events
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-teal-500/60" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">
                No activity yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first payroll run to start seeing activity here.
              </p>
            </div>
            <Link
              to={isAndroidRoute ? "/android/payroll" : "/payroll"}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-500 hover:text-teal-400 transition-colors"
            >
              Run Payroll <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-semibold text-card-foreground mb-5">
            Quick Actions
          </h2>

          <div className="space-y-2">
            {quickActions.map(
              ({
                to,
                icon: Icon,
                label,
                description,
                iconColor,
                iconBg,
                hoverBorder,
              }) => (
                <Link
                  key={to}
                  to={to}
                  className={`group flex items-center gap-3 rounded-xl border border-border/60 p-3.5 transition-all duration-150 hover:bg-accent ${hoverBorder} hover:shadow-sm`}
                >
                  <div className={`rounded-lg ${iconBg} p-2 shrink-0`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground truncate">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
