import {
  createFileRoute,
  Link,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  where,
} from "firebase/firestore";

interface Employee {
  id: string;
  full_name: string;
  nrc_or_id: string;
  position: string;
  department: string;
  email: string | null;
  account_active: boolean;
  basic_salary: number;
  allowances: number;
  userId: string;
}

export async function fetchEmployees() {
  const user = firebase.auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(firebase.db, "employees"),
    where("userId", "==", user.uid),
    orderBy("full_name"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Employee[];
}

export const Route = createFileRoute("/_authenticated/employees/")({
  head: () => ({
    meta: [
      { title: "Employees — NexaPayslip" },
      { name: "description", content: "Manage your employees" },
    ],
  }),
  loader: fetchEmployees,
  component: EmployeesIndexPage,
});

// Dept color helpers
const DEPT_COLORS: Record<string, { bg: string; text: string }> = {};
const PALETTE = [
  { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
  { bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400" },
  { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  { bg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400" },
  { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
];
let paletteIndex = 0;
function getDeptColor(dept: string) {
  if (!DEPT_COLORS[dept]) {
    DEPT_COLORS[dept] = PALETTE[paletteIndex % PALETTE.length];
    paletteIndex++;
  }
  return DEPT_COLORS[dept];
}

export function EmployeesIndexPage() {
  const loaderEmployees = Route.useLoaderData();

  return <EmployeesIndexPageContent initialEmployees={loaderEmployees || []} />;
}

export function EmployeesIndexPageContent({
  initialEmployees,
}: {
  initialEmployees: Employee[];
}) {
  const location = useLocation();
  const isAndroidRoute = location.pathname.startsWith("/android");
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setEmployees(initialEmployees || []);
  }, [initialEmployees]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await deleteDoc(doc(firebase.db, "employees", id));
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      router.invalidate();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filtered = employees.filter((e) =>
    [e.full_name, e.department, e.position, e.email ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(n);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your team members"
        actions={
          <Link to={isAndroidRoute ? "/android/employees/new" : "/employees/new"}>
            <Button className="gap-2 rounded-xl px-4 font-semibold">
              <Plus className="h-4 w-4" strokeWidth={2} /> Add Employee
            </Button>
          </Link>
        }
      />

      {/* Search + count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, department, position…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-medium shrink-0">
          {filtered.length} employee{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {[
                  "Employee",
                  "Position",
                  "Department",
                  "Email",
                  "Status",
                  "Salary",
                  "Allowances",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                      ["Salary", "Allowances", ""].includes(h)
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {search
                            ? "No employees match your search"
                            : "No employees yet"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {search
                            ? "Try a different search term."
                            : "Add your first employee to get started."}
                        </p>
                      </div>
                      {!search && (
                        <Link
                          to={
                            isAndroidRoute
                              ? "/android/employees/new"
                              : "/employees/new"
                          }
                        >
                          <Button size="sm" className="gap-1.5 rounded-lg mt-1">
                            <Plus className="h-3.5 w-3.5" /> Add Employee
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const deptColor = getDeptColor(emp.department);
                  return (
                    <tr
                      key={emp.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Name + Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {emp.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-card-foreground leading-tight">
                              {emp.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {emp.nrc_or_id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-5 py-4 text-card-foreground">
                        {emp.position}
                      </td>

                      {/* Department badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deptColor.bg} ${deptColor.text}`}
                        >
                          {emp.department}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {emp.email || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            emp.account_active
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              emp.account_active
                                ? "bg-emerald-500"
                                : "bg-muted-foreground"
                            }`}
                          />
                          {emp.account_active ? "Active" : "Pending"}
                        </span>
                      </td>

                      {/* Salary */}
                      <td className="px-5 py-4 text-right font-mono text-card-foreground font-medium">
                        {fmt(emp.basic_salary)}
                      </td>

                      {/* Allowances */}
                      <td className="px-5 py-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {fmt(emp.allowances)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={
                              isAndroidRoute
                                ? "/android/employees/$employeeId"
                                : "/employees/$employeeId"
                            }
                            params={{ employeeId: emp.id }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(emp.id)}
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
