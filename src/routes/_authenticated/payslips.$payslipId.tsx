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
  const [printMode, setPrintMode] = useState<"single" | "duplicate">("single");

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

  const ReceiptCard = ({ compact }: { compact?: boolean }) => (
    <div
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      className={`rounded-3xl border border-slate-200/80 bg-white/90 shadow-2xl shadow-slate-900/10 print:rounded-none print:border-0 print:bg-white print:shadow-none print:pb-4 ${compact ? "p-4 text-[10px] print:p-3" : "p-10 text-sm"}`}
    >
      {/* Header */}
      <div
        className={`flex justify-between items-start border-b border-border ${compact ? "pb-3 mb-3" : "pb-6 mb-0"}`}
      >
        <div>
          <h2
            className={`font-black tracking-tighter text-foreground ${compact ? "text-base" : "text-3xl"}`}
          >
            {companyName}
          </h2>
          <p
            className={`mt-1 font-bold text-muted-foreground uppercase tracking-widest ${compact ? "text-[8px]" : "text-[10px]"}`}
          >
            Official Payslip
          </p>
        </div>
        <div className="text-right">
          <p
            className={`font-black text-foreground ${compact ? "text-sm" : "text-xl"}`}
          >
            {period}
          </p>
          <p
            className={`text-muted-foreground ${compact ? "text-[8px]" : "text-[10px]"}`}
          >
            REF: {payslip.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Employee & Summary */}
      <div
        className={`grid grid-cols-2 ${compact ? "gap-4 py-3 mb-3" : "gap-8 py-8 mb-0"} border-b border-border`}
      >
        <div className={`space-y-${compact ? "0.5" : "1"}`}>
          <p
            className={`font-bold text-muted-foreground uppercase tracking-wider ${compact ? "text-[8px]" : "text-[10px]"}`}
          >
            Employee Details
          </p>
          <p
            className={`font-black text-foreground ${compact ? "text-sm" : "text-base"}`}
          >
            {emp?.full_name ?? "—"}
          </p>
          <p
            className={`text-muted-foreground ${compact ? "text-[9px]" : "text-sm"}`}
          >
            {emp?.position ?? "—"}
          </p>
          <p
            className={`text-muted-foreground ${compact ? "text-[9px]" : "text-sm"}`}
          >
            {emp?.department ?? "—"}
          </p>
          <p
            className={`font-mono ${compact ? "text-[8px] mt-1" : "text-xs mt-2"}`}
          >
            ID: {emp?.nrc_or_id ?? "—"}
          </p>
        </div>
        <div className={`space-y-${compact ? "0.5" : "1"} text-right`}>
          <p
            className={`font-bold text-muted-foreground uppercase tracking-wider ${compact ? "text-[8px]" : "text-[10px]"}`}
          >
            Payment Info
          </p>
          <p
            className={`text-muted-foreground ${compact ? "text-[9px]" : "text-sm"}`}
          >
            {emp?.bank_name || "Bank Transfer"}
          </p>
          <p className={`font-mono ${compact ? "text-[8px]" : "text-xs"}`}>
            {emp?.account_number || "•••• •••• ••••"}
          </p>
          <div className={compact ? "pt-1" : "pt-2"}>
            <span
              className={`inline-flex items-center rounded-full bg-success/10 px-${compact ? "2" : "2.5"} py-${compact ? "0.25" : "0.5"} text-${compact ? "[8px]" : "[10px]"} font-bold text-success`}
            >
              PAID
            </span>
          </div>
        </div>
      </div>

      {/* Financials */}
      <div
        className={`grid grid-cols-2 ${compact ? "gap-6 py-3 mb-3" : "gap-12 py-8 mb-0"}`}
      >
        {/* Earnings */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Earnings
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Basic Salary</span>
              <span className="font-bold">
                {formatCurrency(emp?.basic_salary ?? 0)}
              </span>
            </div>
            {allowances.length > 0 ? (
              allowances.map((a, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {a.type || "Allowance"}
                  </span>
                  <span className="font-bold">{formatCurrency(a.amount)}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Allowances</span>
                <span className="font-bold">
                  {formatCurrency(emp?.allowances ?? 0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-black text-foreground">
            <span>Gross Pay</span>
            <span>{formatCurrency(gross)}</span>
          </div>
        </div>

        {/* Deductions */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Deductions
          </h3>
          <div className="space-y-2">
            {payeRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  PAYE ({payeRate}%)
                </span>
                <span className="font-bold text-destructive">
                  -{formatCurrency(paye)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                NAPSA ({napsaRate}%)
              </span>
              <span className="font-bold text-destructive">
                -{formatCurrency(napsa)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                NHIMA ({nhimaRate}%)
              </span>
              <span className="font-bold text-destructive">
                -{formatCurrency(nhima)}
              </span>
            </div>
            {deductions.map((d, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">{d.type}</span>
                <span className="font-bold text-destructive">
                  -{formatCurrency(d.amount)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-black text-foreground">
            <span>Total Deductions</span>
            <span className="text-destructive">
              {formatCurrency(payslip.total_deductions)}
            </span>
          </div>
        </div>
      </div>

      {/* Net Pay Highlight */}
      <div
        className={`rounded-2xl bg-primary p-${compact ? "3" : "6"} text-primary-foreground ${compact ? "mt-3 mb-3" : "mt-4 mb-0"}`}
      >
        <div
          className={`flex items-center ${compact ? "flex-col gap-1.5 text-center" : "justify-between"}`}
        >
          <div>
            <p
              className={`font-black uppercase tracking-widest opacity-70 ${compact ? "text-[8px]" : "text-[10px]"}`}
            >
              Net Take Home
            </p>
            <p className={`opacity-50 ${compact ? "text-[8px]" : "text-xs"}`}>
              ZMW
            </p>
          </div>
          <p className={`font-black ${compact ? "text-xl" : "text-4xl"}`}>
            {formatCurrency(payslip.net_pay)}
          </p>
        </div>
      </div>

      {/* Footer / Verification */}
      <div
        className={`rounded-3xl border border-slate-200/80 bg-slate-50/80 ${compact ? "p-3 mt-3" : "p-6 mt-8"} shadow-sm dark:bg-slate-950/90 dark:border-slate-700/40`}
      >
        <div
          className={`flex ${compact ? "flex-col gap-2" : "flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"}`}
        >
          <div>
            <div
              className={`inline-flex items-center gap-1 font-bold uppercase tracking-[0.24em] text-muted-foreground ${compact ? "text-[8px]" : "text-[10px]"}`}
            >
              <ShieldCheck
                className={`${compact ? "h-3 w-3" : "h-4 w-4"}`}
                strokeWidth={1.75}
              />
              Verification Code
            </div>
            <p
              className={`uppercase tracking-[0.24em] text-muted-foreground ${compact ? "text-[8px] mt-1.5" : "mt-3 text-[10px]"}`}
            >
              Reference
            </p>
            <p
              className={`font-mono font-bold text-slate-900 dark:text-white tracking-widest ${compact ? "text-sm" : "text-lg"}`}
            >
              {referenceCode}
            </p>
            <p
              className={`text-muted-foreground ${compact ? "text-[8px] mt-0.5" : "mt-2 text-[10px]"}`}
            >
              Scan QR or enter code
            </p>
          </div>
          <div
            className={`flex items-center gap-${compact ? "2" : "3"} rounded-3xl bg-white/80 p-${compact ? "2" : "3"} shadow-sm dark:bg-slate-900/70`}
          >
            <div
              className={`rounded-2xl border border-slate-200/70 bg-white p-${compact ? "1.5" : "3"} dark:border-slate-700/50 dark:bg-slate-950`}
            >
              <QRCodeSVG value={qrData} size={compact ? 48 : 80} level="M" />
            </div>
            <div className="space-y-0.5">
              <p
                className={`font-semibold text-slate-900 dark:text-slate-100 ${compact ? "text-[8px]" : "text-xs"}`}
              >
                Scan to Verify
              </p>
              <p
                className={`text-muted-foreground ${compact ? "text-[8px]" : "text-[11px]"}`}
              >
                QR Signature
              </p>
            </div>
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
          <div className="ml-auto flex items-center gap-3">
            <select
              value={printMode}
              onChange={(e) =>
                setPrintMode(e.target.value as "single" | "duplicate")
              }
              className="h-10 rounded-xl border border-border bg-background px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
            >
              <option value="single">Single Layout</option>
              <option value="duplicate">Vertical Duplicate</option>
            </select>
            <Button onClick={handlePrint} className="rounded-xl font-bold px-6">
              <Printer className="h-4 w-4 mr-2" strokeWidth={2.5} /> Print
            </Button>
          </div>
        </div>
      </div>

      {/* Screen view — always single */}
      <div className="mx-auto max-w-[800px] print:hidden mb-20">
        <ReceiptCard />
      </div>

      {/* Print view — conditional layout */}
      <div className="hidden print:block">
        {printMode === "duplicate" ? (
          <div className="flex flex-col gap-0 print:max-w-[760px] print:mx-auto">
            <ReceiptCard compact />
            <ReceiptCard compact />
          </div>
        ) : (
          <div className="mx-auto print:max-w-[760px]">
            <ReceiptCard />
          </div>
        )}
      </div>
    </>
  );
}
