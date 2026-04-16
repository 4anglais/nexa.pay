import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/payslips/")({
  head: () => ({
    meta: [{ title: "Payslips — NexaPayslip" }],
  }),
  component: PayslipsPage,
});

interface PayslipRow {
  id: string;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  created_at: string;
  employees: { full_name: string } | null;
  payroll_runs: { month: string; year: number } | null;
}

function PayslipsPage() {
  const [payslips, setPayslips] = useState<PayslipRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("payslips")
      .select("*, employees(full_name), payroll_runs(month, year)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPayslips((data as unknown as PayslipRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(n);

  return (
    <>
      <PageHeader title="Payslips" description="View generated payslip history" />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-bold text-muted-foreground">Employee</th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground">Period</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">Gross Pay</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">Deductions</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">Net Pay</th>
                <th className="px-4 py-3 text-center font-bold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                    <p className="font-light italic text-muted-foreground">No payslips generated yet. Run payroll to create payslips.</p>
                  </td>
                </tr>
              ) : (
                payslips.map((ps) => (
                  <tr key={ps.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                    <td className="px-4 py-3 font-semibold text-card-foreground">{ps.employees?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ps.payroll_runs ? `${ps.payroll_runs.month} ${ps.payroll_runs.year}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-card-foreground">{formatCurrency(ps.gross_pay)}</td>
                    <td className="px-4 py-3 text-right text-destructive">{formatCurrency(ps.total_deductions)}</td>
                    <td className="px-4 py-3 text-right font-bold text-success">{formatCurrency(ps.net_pay)}</td>
                    <td className="px-4 py-3 text-center">
                      <Link to="/payslips/$payslipId" params={{ payslipId: ps.id }}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" strokeWidth={1.5} /> View
                        </Button>
                      </Link>
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
