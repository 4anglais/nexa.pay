import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { firebase } from "@/integrations/firebase/client";
import { PageHeader } from "@/components/PageHeader";
import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  doc,
  getDoc,
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

function PayslipsPage() {
  const [employeePayslips, setEmployeePayslips] = useState<EmployeePayslips[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = firebase.auth.onAuthStateChanged((user) => {
      setUid(user?.uid ?? null);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const fetchPayslips = async () => {
      try {
        const payslipsQuery = query(
          collection(firebase.db, "payslips"),
          where("userId", "==", uid),
          orderBy("created_at", "desc"),
        );

        const snapshot = await getDocs(payslipsQuery);

        const payslipsData: PayslipRow[] = [];

        for (const d of snapshot.docs) {
          const data = d.data() as Omit<PayslipRow, "id">;

          const payslip: PayslipRow = {
            id: d.id,
            ...data,
          };

          if (payslip.employee_id) {
            const empSnap = await getDoc(
              doc(firebase.db, "employees", payslip.employee_id),
            );
            if (empSnap.exists()) {
              payslip.employees = empSnap.data() as any;
            }
          }

          if (payslip.payroll_run_id) {
            const runSnap = await getDoc(
              doc(firebase.db, "payroll_runs", payslip.payroll_run_id),
            );
            if (runSnap.exists()) {
              payslip.payroll_runs = runSnap.data() as any;
            }
          }

          payslipsData.push(payslip);
        }

        const map = new Map<string, EmployeePayslips>();

        payslipsData.forEach((ps) => {
          const empId = ps.employee_id;
          const name = ps.employees?.full_name || "Unknown";

          if (!map.has(empId)) {
            map.set(empId, {
              employeeId: empId,
              employeeName: name,
              payslips: [],
            });
          }

          map.get(empId)!.payslips.push(ps);
        });

        setEmployeePayslips(Array.from(map.values()));
      } catch (error) {
        console.error("Error fetching payslips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [uid]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(n);

  return (
    <>
      <PageHeader
        title="Payslips"
        description="View generated payslip history"
      />

      {loading ? (
        <div className="p-6">Loading...</div>
      ) : employeePayslips.length === 0 ? (
        <div className="p-6">No payslips found</div>
      ) : (
        employeePayslips.map((employee) => (
          <div key={employee.employeeId} className="p-4 border-b">
            <h3>{employee.employeeName}</h3>

            {employee.payslips.map((ps) => (
              <div key={ps.id} className="border p-3 mt-2">
                <div>
                  {ps.payroll_runs?.month} {ps.payroll_runs?.year}
                </div>

                <div>Gross: {formatCurrency(ps.gross_pay)}</div>
                <div>Deductions: {formatCurrency(ps.total_deductions)}</div>
                <div>Net: {formatCurrency(ps.net_pay)}</div>

                <Link to="/payslips/$payslipId" params={{ payslipId: ps.id }}>
                  <Button size="sm">
                    <Eye /> View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ))
      )}
    </>
  );
}
