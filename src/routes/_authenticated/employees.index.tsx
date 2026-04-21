import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
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

/* ---------------- SAFE FETCH (NO AUTH RACE BUG) ---------------- */
async function fetchEmployees() {
  const user = firebase.auth.currentUser;

  if (!user) return [];

  const q = query(
    collection(firebase.db, "employees"),
    where("userId", "==", user.uid),
    orderBy("full_name"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Employee[];
}

/* ---------------- ROUTE ---------------- */
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

/* ---------------- PAGE ---------------- */
function EmployeesIndexPage() {
  const router = useRouter();
  const loaderEmployees = Route.useLoaderData();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");

  /* IMPORTANT: sync loader safely */
  useEffect(() => {
    setEmployees(loaderEmployees || []);
  }, [loaderEmployees]);

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

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(n);

  return (
    <>
      <PageHeader
        title="Employees"
        description="Manage your team members"
        actions={
          <Link to="/employees/new">
            <Button>
              <Plus className="h-4 w-4" strokeWidth={1.5} /> Add Employee
            </Button>
          </Link>
        }
      />

      {/* SEARCH */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-right">Status</th>
                <th className="px-4 py-3 text-right">Salary</th>
                <th className="px-4 py-3 text-right">Allowances</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    No employees found
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-muted/40">
                    <td className="px-4 py-3 font-semibold">{emp.full_name}</td>
                    <td className="px-4 py-3">{emp.position}</td>
                    <td className="px-4 py-3">{emp.department}</td>
                    <td className="px-4 py-3">{emp.email || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          emp.account_active
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        {emp.account_active ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(emp.basic_salary)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(emp.allowances)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to="/employees/$employeeId"
                          params={{ employeeId: emp.id }}
                        >
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(emp.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
