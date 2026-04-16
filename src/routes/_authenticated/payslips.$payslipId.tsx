import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createVerificationSignature } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/payslips/$payslipId")({
  head: () => ({
    meta: [{ title: "Payslip Detail — NexaPayslip" }],
  }),
  component: PayslipDetailPage,
});

interface PayslipDetail {
  id: string;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  created_at: string;
  pdf_url: string | null;
  employee_id: string;
  payroll_run_id: string;
  employees: {
    full_name: string;
    nrc_or_id: string;
    position: string;
    department: string;
    basic_salary: number;
    allowances: number;
    bank_name: string | null;
    account_number: string | null;
  } | null;
  payroll_runs: { month: string; year: number } | null;
}

interface CompanySettings {
  company_name: string;
  paye_rate: number;
  napsa_rate: number;
  nhima_rate: number;
}

interface AllowanceRow {
  type: string;
  amount: number;
}
interface DeductionRow {
  type: string;
  amount: number;
}

function PayslipDetailPage() {
  const { payslipId } = Route.useParams();
  const [payslip, setPayslip] = useState<PayslipDetail | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [allowances, setAllowances] = useState<AllowanceRow[]>([]);
  const [deductions, setDeductions] = useState<DeductionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase
        .from("payslips")
        .select(
          "*, employees(full_name, nrc_or_id, position, department, basic_salary, allowances, bank_name, account_number), payroll_runs(month, year)",
        )
        .eq("id", payslipId)
        .single(),
      supabase.from("company_settings").select("*").limit(1).single(),
    ]).then(([psRes, coRes]) => {
      if (psRes.data) {
        const ps = psRes.data as unknown as PayslipDetail;
        setPayslip(ps);
        // Load per-employee allowances and deductions
        Promise.all([
          supabase
            .from("allowances")
            .select("type, amount")
            .eq("employee_id", ps.employee_id),
          supabase
            .from("deductions")
            .select("type, amount")
            .eq("employee_id", ps.employee_id),
        ]).then(([aRes, dRes]) => {
          setAllowances(
            (aRes.data ?? []).map((a: any) => ({
              type: a.type,
              amount: Number(a.amount),
            })),
          );
          setDeductions(
            (dRes.data ?? []).map((d: any) => ({
              type: d.type,
              amount: Number(d.amount),
            })),
          );
        });
      }
      if (coRes.data) setCompany(coRes.data as unknown as CompanySettings);
      setLoading(false);
    });
  }, [payslipId]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(n);

  const handlePrint = () => window.print();

  if (loading)
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading payslip...
      </div>
    );

  if (!payslip) {
    return (
      <>
        <PageHeader
          title="Payslip Not Found"
          description="This payslip does not exist."
        />
        <Link to="/payslips">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back
          </Button>
        </Link>
      </>
    );
  }

  const emp = payslip.employees;
  const run = payslip.payroll_runs;
  const companyName = company?.company_name ?? "NexaPayslip";
  const period = run ? `${run.month} ${run.year}` : "—";
  const gross = payslip.gross_pay;
  const payeRate = company?.paye_rate ?? 0;
  const napsaRate = company?.napsa_rate ?? 5;
  const nhimaRate = company?.nhima_rate ?? 1;
  const paye = gross * (payeRate / 100);
  const napsa = gross * (napsaRate / 100);
  const nhima = gross * (nhimaRate / 100);
  const customDeductionTotal = deductions.reduce((s, d) => s + d.amount, 0);

  const payload = `${payslip.id}|${emp?.full_name ?? ""}|${period}|${payslip.net_pay}|${payslip.created_at}`;
  const signature = createVerificationSignature(payload);
  const qrData = JSON.stringify({
    id: payslip.id,
    employee: emp?.full_name,
    period,
    net_pay: payslip.net_pay,
    issued: payslip.created_at,
    sig: signature,
  });

  const params = new URLSearchParams({
    id: payslip.id,
    employee: emp?.full_name ?? "",
    period,
    net_pay: String(payslip.net_pay),
    issued: payslip.created_at,
    sig: signature,
  });
  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify?${params.toString()}`
      : "";

  const referenceCode = signature.slice(0, 10).toUpperCase();

  const TicketCard = () => (
    <div
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      className="border border-slate-200/80 bg-white/90 shadow-2xl shadow-slate-900/10 print:border print:shadow-none print:bg-white p-6 text-sm"
    >
      {/* Landscape Ticket Layout */}
      <div className="flex gap-6">
        {/* Left Section - Employee & Financials */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-4 pb-3 border-b border-border">
            <h2 className="font-thin tracking-tighter text-foreground text-2xl">
              {companyName}
            </h2>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
              Official Payslip — {period}
            </p>
            <p className="text-[8px] text-muted-foreground mt-1">
              REF: {payslip.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Employee Details */}
          <div className="mb-3">
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Employee
            </p>
            <p className="font-bold text-foreground text-sm">
              {emp?.full_name ?? "—"}
            </p>
            <p className="text-[9px] text-muted-foreground">
              {emp?.position ?? "—"} • {emp?.department ?? "—"}
            </p>
            <p className="font-mono text-[8px] text-muted-foreground mt-1">
              ID: {emp?.nrc_or_id ?? "—"}
            </p>
          </div>

          {/* Financials Grid */}
          <div className="grid grid-cols-3 gap-3 text-[8px]">
            {/* Earnings Column */}
            <div>
              <h3 className="font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Earnings
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Basic</span>
                  <span className="font-bold">
                    {formatCurrency(emp?.basic_salary ?? 0).replace("ZMW ", "")}
                  </span>
                </div>
                {allowances.length > 0 ? (
                  allowances.slice(0, 1).map((a, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-muted-foreground truncate mr-1">
                        {a.type}
                      </span>
                      <span className="font-bold">
                        {formatCurrency(a.amount).replace("ZMW ", "")}
                      </span>
                    </div>
                  ))
                ) : null}
              </div>
              <div className="flex justify-between border-t border-border pt-1 mt-1 font-bold">
                <span>Gross</span>
                <span>{formatCurrency(gross).replace("ZMW ", "")}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div>
              <h3 className="font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Deductions
              </h3>
              <div className="space-y-1">
                {payeRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PAYE</span>
                    <span className="font-bold text-destructive">
                      {formatCurrency(paye).replace("ZMW ", "")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NAPSA</span>
                  <span className="font-bold text-destructive">
                    {formatCurrency(napsa).replace("ZMW ", "")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NHIMA</span>
                  <span className="font-bold text-destructive">
                    {formatCurrency(nhima).replace("ZMW ", "")}
                  </span>
                </div>
              </div>
              <div className="flex justify-between border-t border-border pt-1 mt-1 font-bold text-destructive">
                <span>Total</span>
                <span>{formatCurrency(payslip.total_deductions).replace("ZMW ", "")}</span>
              </div>
            </div>

            {/* Payment Column */}
            <div>
              <h3 className="font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Payment
              </h3>
              <p className="text-muted-foreground text-[7px]">
                {emp?.bank_name || "Bank Transfer"}
              </p>
              <p className="font-mono text-[7px] text-muted-foreground mt-1">
                {emp?.account_number || "•••• •••• ••••"}
              </p>
              <div className="mt-2 pt-2 border-t border-border">
                <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[7px] font-bold text-success">
                  PAID
                </span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="rounded-xl bg-primary p-3 text-primary-foreground mt-3">
            <p className="text-[7px] font-bold uppercase tracking-widest opacity-70">
              Net Take Home (ZMW)
            </p>
            <p className="font-black text-lg mt-1">
              {formatCurrency(payslip.net_pay).replace("ZMW ", "")}
            </p>
          </div>
        </div>

        {/* Right Section - QR Code & Verification */}
        <div className="flex flex-col items-center justify-between py-2 border-l border-border pl-6 min-w-fit">
          <div className="text-center">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-slate-700/50 dark:bg-slate-950 inline-block">
              <QRCodeSVG value={qrData} size={96} level="M" />
            </div>
            <p className="text-[7px] font-semibold text-slate-900 dark:text-slate-100 mt-2">
              VERIFY
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
              Reference Code
            </p>
            <p className="font-mono font-bold text-slate-900 dark:text-white tracking-widest text-xs mt-1">
              {referenceCode}
            </p>
            <p className="text-[7px] text-muted-foreground mt-1">
              Scan QR to verify
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Screen controls */}
      <div className="print:hidden">
        <div className="mb-8 flex items-center gap-3">
          <Link to="/payslips">
            <Button variant="ghost" size="sm" className="font-bold">
              <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={2.5} /> Back
            </Button>
          </Link>
          <div className="ml-auto">
            <Button onClick={handlePrint} className="rounded-xl font-bold px-6">
              <Printer className="h-4 w-4 mr-2" strokeWidth={2.5} /> Print
            </Button>
          </div>
        </div>
      </div>

      {/* Screen view */}
      <div className="mx-auto max-w-[1200px] print:hidden mb-20">
        <TicketCard />
      </div>

      {/* Print view — landscape ticket on one page */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
      <div className="hidden print:block">
        <TicketCard />
      </div>
    </>
  );
}
