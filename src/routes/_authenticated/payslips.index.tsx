import {
  createFileRoute,
  Link,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { FileText, Eye, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  collection,
  query,
  getDocs,
  where,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

export const Route = createFileRoute("/_authenticated/payslips/")({
  head: () => ({
    meta: [{ title: "Payslips — NexaPayslip" }],
  }),
  component: PayslipsPage,
});

type PayslipRow = {
  id: string;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  created_at: string;
  employee_id: string;
  payroll_run_id: string;
  userId: string;
  employees?: { full_name: string };
  payroll_runs?: { month: string; year: number };
};

type EmployeePayslips = {
  employeeId: string;
  employeeName: string;
  payslips: PayslipRow[];
};

export function PayslipsPage() {
  const location = useLocation();
  const isAndroidRoute = location.pathname.startsWith("/android");
  const [employeePayslips, setEmployeePayslips] = useState<EmployeePayslips[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ───────────────── AUTH ───────────────── */
  useEffect(() => {
    const unsub = firebase.auth.onAuthStateChanged((user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  /* ───────────────── FETCH ───────────────── */
  useEffect(() => {
    if (!uid) return;

    const fetchPayslips = async () => {
      setLoading(true);

      try {
        const snapshot = await getDocs(
          query(
            collection(firebase.db, "payslips"),
            where("userId", "==", uid),
          ),
        );

        const employeeIds = new Set<string>();
        const runIds = new Set<string>();

        const rawPayslips: PayslipRow[] = snapshot.docs.map((d) => {
          const data = d.data() as Omit<PayslipRow, "id">;

          if (data.employee_id) employeeIds.add(data.employee_id);
          if (data.payroll_run_id) runIds.add(data.payroll_run_id);

          return { id: d.id, ...data };
        });

        rawPayslips.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        const empMap = new Map<string, { full_name: string }>();

        await Promise.all(
          Array.from(employeeIds).map(async (id) => {
            try {
              const snap = await getDoc(doc(firebase.db, "employees", id));
              if (snap.exists() && snap.data().userId === uid) {
                empMap.set(id, { full_name: snap.data().full_name });
              }
            } catch {
              return null;
            }
          }),
        );

        const runMap = new Map<string, { month: string; year: number }>();

        await Promise.all(
          Array.from(runIds).map(async (id) => {
            try {
              const snap = await getDoc(doc(firebase.db, "payroll_runs", id));
              if (snap.exists() && snap.data().userId === uid) {
                runMap.set(id, {
                  month: snap.data().month,
                  year: snap.data().year,
                });
              }
            } catch {
              return null;
            }
          }),
        );

        const map = new Map<string, EmployeePayslips>();

        for (const ps of rawPayslips) {
          ps.employees = empMap.get(ps.employee_id);
          ps.payroll_runs = runMap.get(ps.payroll_run_id);

          const name = ps.employees?.full_name ?? "Unknown Employee";

          if (!map.has(ps.employee_id)) {
            map.set(ps.employee_id, {
              employeeId: ps.employee_id,
              employeeName: name,
              payslips: [],
            });
          }

          map.get(ps.employee_id)!.payslips.push(ps);
        }

        const result = Array.from(map.values());

        setEmployeePayslips(result);
        setExpanded(new Set(result.map((e) => e.employeeId)));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [uid]);

  /* ───────────────── DELETE ───────────────── */
  const handleDelete = async (payslipId: string) => {
    if (!confirm("Delete this payslip permanently?")) return;

    try {
      setDeletingId(payslipId);

      await deleteDoc(doc(firebase.db, "payslips", payslipId));

      // remove from UI instantly
      setEmployeePayslips((prev) =>
        prev
          .map((emp) => ({
            ...emp,
            payslips: emp.payslips.filter((p) => p.id !== payslipId),
          }))
          .filter((emp) => emp.payslips.length > 0),
      );
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete payslip");
    } finally {
      setDeletingId(null);
    }
  };

  /* ───────────────── HELPERS ───────────────── */
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(n);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalPayslips = employeePayslips.reduce(
    (s, e) => s + e.payslips.length,
    0,
  );

  /* ───────────────── UI ───────────────── */
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payslips"
        description="View generated payslip history"
      />

      {loading ? (
        <div className="py-20 text-center">Loading…</div>
      ) : employeePayslips.length === 0 ? (
        <div className="py-20 text-center">No payslips</div>
      ) : (
        <>
          <div className="flex gap-3 text-xs">
            <span>{employeePayslips.length} employees</span>
            <span>{totalPayslips} payslips</span>
          </div>

          {employeePayslips.map((emp) => {
            const isOpen = expanded.has(emp.employeeId);

            return (
              <div key={emp.employeeId} className="border rounded-2xl">
                <button
                  onClick={() => toggleExpand(emp.employeeId)}
                  className="w-full flex justify-between p-4"
                >
                  <div>
                    <p className="font-semibold">{emp.employeeName}</p>
                    <p className="text-xs">{emp.payslips.length} payslips</p>
                  </div>

                  {isOpen ? <ChevronDown /> : <ChevronRight />}
                </button>

                {isOpen &&
                  emp.payslips.map((ps) => (
                    <div
                      key={ps.id}
                      className="border-t p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">
                          {ps.payroll_runs
                            ? `${ps.payroll_runs.month}/${ps.payroll_runs.year}`
                            : "—"}
                        </p>
                        <p className="text-xs">
                          {new Date(ps.created_at).toLocaleDateString("en-ZM")}
                        </p>
                      </div>

                      <div className="flex gap-6 text-xs">
                        <span>{fmt(ps.gross_pay)}</span>
                        <span className="text-red-500">
                          -{fmt(ps.total_deductions)}
                        </span>
                        <span className="text-green-600 font-bold">
                          {fmt(ps.net_pay)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={
                            isAndroidRoute
                              ? "/android/payslips/$payslipId"
                              : "/payslips/$payslipId"
                          }
                          params={{ payslipId: ps.id }}
                        >
                          <Button size="sm" variant="outline">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(ps.id)}
                          disabled={deletingId === ps.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
