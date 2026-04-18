import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "firebase/firestore";

export const Route = createFileRoute("/_authenticated/employees/")({
  head: () => ({
    meta: [
      { title: "Employees — NexaPayslip" },
      { name: "description", content: "Manage your employees" },
    ],
  }),
  component: EmployeesIndexPage,
});

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
}

function EmployeesIndexPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadEmployees = async () => {
    setLoading(true);
    const employeesSnapshot = await getDocs(
      query(collection(firebase.db, "employees"), orderBy("full_name")),
    );
    const employeesData = employeesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Employee[];
    setEmployees(employeesData);
    setLoading(false);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    await deleteDoc(doc(firebase.db, "employees", id));
    loadEmployees();
  };

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase()) ||
      (e.email ?? "").toLowerCase().includes(search.toLowerCase()),
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

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                  Position
                </th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                  Department
                </th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                  Basic Salary
                </th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                  Allowances
                </th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center font-light italic text-muted-foreground"
                  >
                    No employees found. Add your first employee to get started.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50"
                  >
                    <td className="px-4 py-3 font-semibold text-card-foreground">
                      {emp.full_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {emp.position}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {emp.department}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {emp.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${emp.account_active ? "bg-success/10 text-success" : "bg-muted/10 text-muted-foreground"}`}
                      >
                        {emp.account_active ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-card-foreground">
                      {formatCurrency(emp.basic_salary)}
                    </td>
                    <td className="px-4 py-3 text-right text-card-foreground">
                      {formatCurrency(emp.allowances)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to="/employees/$employeeId"
                          params={{ employeeId: emp.id }}
                        >
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(emp.id)}
                        >
                          <Trash2
                            className="h-4 w-4 text-destructive"
                            strokeWidth={1.5}
                          />
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
