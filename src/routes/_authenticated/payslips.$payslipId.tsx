import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Printer } from "lucide-react";
import Barcode from "react-barcode";
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
type AllowanceRecord = { type: string; amount: number | string | null };
type DeductionRecord = { type: string; amount: number | string | null };

type PrintLayout = "landscape" | "portrait";

function PayslipDetailPage() {
  const { payslipId } = Route.useParams();
  const [payslip, setPayslip] = useState<PayslipDetail | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [allowances, setAllowances] = useState<AllowanceRow[]>([]);
  const [deductions, setDeductions] = useState<DeductionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [printLayout, setPrintLayout] = useState<PrintLayout>("landscape");
  const [verifyUrl, setVerifyUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

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
            (aRes.data ?? []).map((a: AllowanceRecord) => ({
              type: a.type,
              amount: Number(a.amount),
            })),
          );
          setDeductions(
            (dRes.data ?? []).map((d: DeductionRecord) => ({
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

  const derived = useMemo(() => {
    if (!payslip) return null;

    const emp = payslip.employees;
    const run = payslip.payroll_runs;
    const period = run ? `${run.month} ${run.year}` : "—";
    const payload = `${payslip.id}|${emp?.full_name ?? ""}|${period}|${payslip.net_pay}|${payslip.created_at}`;
    const signature = createVerificationSignature(payload);
    const referenceCode = signature.slice(0, 10).toUpperCase();

    return { emp, run, period, signature, referenceCode };
  }, [payslip]);

  useEffect(() => {
    if (!payslip || !derived) return;

    const url = new URL("/verify", window.location.origin);
    url.searchParams.set("id", payslip.id);
    url.searchParams.set("employee", derived.emp?.full_name ?? "");
    url.searchParams.set("period", derived.period);
    url.searchParams.set("net_pay", String(payslip.net_pay));
    url.searchParams.set("issued", payslip.created_at);
    url.searchParams.set("sig", derived.signature);
    setVerifyUrl(url.toString());
  }, [derived, payslip]);

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

  const emp = derived?.emp;
  const run = derived?.run;
  const companyName = company?.company_name ?? "NexaPayslip";
  const period = derived?.period ?? "—";
  const gross = payslip.gross_pay;
  const payeRate = company?.paye_rate ?? 0;
  const napsaRate = company?.napsa_rate ?? 5;
  const nhimaRate = company?.nhima_rate ?? 1;
  const paye = gross * (payeRate / 100);
  const napsa = gross * (napsaRate / 100);
  const nhima = gross * (nhimaRate / 100);

  const referenceCode = derived?.referenceCode ?? "—";
  // Keep the barcode physically short by encoding a short value.
  // The long verify URL is still available in `verifyUrl` if you later want to restore it.
  const barcodeValue = referenceCode;

  const BarcodeMark = ({
    value,
    variant,
  }: {
    value: string;
    variant: "landscape-vertical" | "portrait";
  }) => {
    if (variant === "landscape-vertical") {
      return (
        <div
          style={{
            transform: "rotate(90deg)",
            transformOrigin: "center",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Barcode
            value={value}
            format="CODE128"
            displayValue={false}
            background="transparent"
            lineColor="#0f172a"
            width={0.7}
            height={22}
            margin={0}
          />
        </div>
      );
    }

    return (
      <div className="p-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <Barcode
          value={value}
          format="CODE128"
          displayValue={false}
          background="transparent"
          lineColor="#0f172a"
          width={0.9}
          height={20}
          margin={0}
        />
      </div>
    );
  };

  /* ─────────────────────────────────────────────
     LANDSCAPE CARD — modern ticket design
  ───────────────────────────────────────────── */
  const LandscapeCard = ({ copyLabel }: { copyLabel: string }) => (
    <div
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      className="relative flex overflow-hidden border border-slate-200 bg-white shadow-sm print:border print:shadow-none text-sm rounded-3xl h-[10cm] w-[17.5cm] mx-auto print:scale-90"
    >
      {/* Left Main Section */}
      <div className="flex-1 p-6 flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-bold tracking-tight text-slate-900 text-xl leading-none">
              {companyName}
            </h2>
            <p className="text-[8px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-2">
              Official Payslip — {period}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Type</p>
            <p className="text-[9px] text-slate-900 font-bold mt-1 uppercase tracking-wider italic">
              {copyLabel}
            </p>
          </div>
        </div>

        {/* Employee Details Row */}
        <div className="grid grid-cols-3 gap-4 my-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee</p>
            <p className="font-bold text-slate-900 text-xs">{emp?.full_name ?? "—"}</p>
            <p className="text-[9px] text-slate-500 font-medium">{emp?.position ?? "—"}</p>
          </div>
          <div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Number</p>
            <p className="font-bold text-slate-900 text-xs">{emp?.nrc_or_id ?? "—"}</p>
          </div>
          <div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
            <p className="font-bold text-slate-900 text-xs">{emp?.department ?? "—"}</p>
          </div>
        </div>

        {/* Financials Row */}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <h3 className="text-[8px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-900 pb-1 mb-2">
              Earnings
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-medium">Basic</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(emp?.basic_salary ?? 0).replace("ZMW ", "")}
                </span>
              </div>
              {allowances.map((a, i) => (
                <div key={i} className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-medium">{a.type}</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(a.amount).replace("ZMW ", "")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-900">Gross</span>
                <span className="font-black text-slate-900 text-[11px]">
                  {formatCurrency(gross).replace("ZMW ", "")}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[8px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-900 pb-1 mb-2">
              Deductions
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-medium">Statutory</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(paye + napsa + nhima).replace("ZMW ", "")}
                </span>
              </div>
              {deductions.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-medium">{d.type}</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(d.amount).replace("ZMW ", "")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-900">Total</span>
                <span className="font-bold text-red-600 text-[11px]">
                  {formatCurrency(payslip.total_deductions).replace("ZMW ", "")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay (moved up a bit) */}
        <div className="mt-3 flex justify-end">
          <div className="bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-3">
            <div className="text-right">
              <p className="text-[7px] uppercase tracking-widest opacity-50 font-bold">
                Net Pay
              </p>
              <p className="text-lg font-black">{formatCurrency(payslip.net_pay)}</p>
            </div>
            <div className="h-6 w-[1px] bg-white/20" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
              Paid
            </span>
          </div>
        </div>

        {/* Payment Footer */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
            Ref:{" "}
            <span className="font-mono text-slate-900 tracking-wider">
              {referenceCode}
            </span>
          </p>
        </div>
      </div>

      {/* Vertical Cut Line */}
      <div className="relative h-full py-4">
        <div className="border-l-2 border-dashed border-slate-200 h-full" />
        {/* Semi-circle cutouts (ticket style) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-[var(--color-background)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-7 w-7 rounded-full bg-[var(--color-background)]" />
      </div>

      {/* Right Side Barcode Section (same container where QR was) */}
      <div className="w-[3.4cm] bg-slate-50/50 p-5 flex flex-col items-center justify-between text-center rounded-r-3xl overflow-hidden">
        {/* Top: barcode + vertical reference */}
        <div className="w-full flex items-start justify-center gap-3">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm h-[40mm] w-[16mm] flex items-center justify-center">
            <BarcodeMark value={barcodeValue} variant="landscape-vertical" />
          </div>
          <div className="flex items-center justify-center">
            <div
              className="font-mono text-[10px] font-bold text-slate-900 tracking-wider"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              {referenceCode}
            </div>
          </div>
        </div>

        {/* Bottom: bank details (vertical stack) */}
        <div className="pt-3 border-t border-slate-200 w-full text-left">
          <div className="space-y-2">
            <div>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Bank
              </p>
              <p className="text-[9px] font-bold text-slate-900 leading-tight break-words">
                {emp?.bank_name || "—"}
              </p>
            </div>
            <div>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Account
              </p>
              <p className="text-[9px] font-bold text-slate-900 font-mono leading-tight">
                {emp?.account_number ? `••••${emp.account_number.slice(-4)}` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────
     PORTRAIT CARD — modern sleek design
  ───────────────────────────────────────────── */
  const PortraitCard = ({ copyLabel }: { copyLabel: string }) => (
    <div
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      className="relative overflow-hidden border border-slate-200 bg-white shadow-sm print:border print:shadow-none p-8 text-sm rounded-3xl w-[16cm] mx-auto print:scale-90"
    >
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="font-bold tracking-tight text-slate-900 text-2xl leading-none">
            {companyName}
          </h2>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-3">
            Official Payslip
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period</p>
          <p className="text-sm text-slate-900 font-bold mt-1">{period}</p>
          <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold tracking-wider">
            {copyLabel}
          </p>
        </div>
      </div>

      {/* Employee Details Grid */}
      <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-8 pb-8 border-b border-slate-100">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Employee</p>
          <p className="font-bold text-slate-900 text-base">{emp?.full_name ?? "—"}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{emp?.position ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ID Number</p>
          <p className="font-bold text-slate-900 text-base">{emp?.nrc_or_id ?? "—"}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{emp?.department ?? "—"}</p>
        </div>
      </div>

      {/* Financials Section */}
      <div className="space-y-8 mb-8">
        <div className="grid grid-cols-2 gap-12">
          {/* Earnings */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-900 pb-2 mb-4">
              Earnings
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Basic Salary</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(emp?.basic_salary ?? 0).replace("ZMW ", "")}
                </span>
              </div>
              {allowances.map((a, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">{a.type}</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(a.amount).replace("ZMW ", "")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-3">
                <span className="text-xs font-bold text-slate-900">Gross Pay</span>
                <span className="font-black text-slate-900 text-sm">
                  {formatCurrency(gross).replace("ZMW ", "")}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-900 pb-2 mb-4">
              Deductions
            </h3>
            <div className="space-y-2.5">
              {payeRate > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">PAYE Tax</span>
                  <span className="font-bold text-slate-900 text-red-600">
                    {formatCurrency(paye).replace("ZMW ", "")}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">NAPSA</span>
                <span className="font-bold text-slate-900 text-red-600">
                  {formatCurrency(napsa).replace("ZMW ", "")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">NHIMA</span>
                <span className="font-bold text-slate-900 text-red-600">
                  {formatCurrency(nhima).replace("ZMW ", "")}
                </span>
              </div>
              {deductions.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">{d.type}</span>
                  <span className="font-bold text-slate-900 text-red-600">
                    {formatCurrency(d.amount).replace("ZMW ", "")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-3">
                <span className="text-xs font-bold text-slate-900">Total Deductions</span>
                <span className="font-bold text-red-600 text-sm">
                  {formatCurrency(payslip.total_deductions).replace("ZMW ", "")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay Highlight */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Net Pay</p>
            <p className="text-2xl font-black tracking-tighter">
              {formatCurrency(payslip.net_pay)}
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              Paid
            </div>
            <p className="text-[9px] opacity-40 mt-2 font-mono uppercase tracking-widest">
              Ref: {referenceCode}
            </p>
          </div>
        </div>
      </div>

      {/* Dotted Cut Line */}
      <div className="relative my-10 px-4">
        <div className="border-t-2 border-dashed border-slate-200 w-full" />
        {/* Semi-circle cutouts (ticket style) */}
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[var(--color-background)]" />
        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-[var(--color-background)]" />
      </div>

      {/* Footer / Barcode Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-4 max-w-[60%]">
          <div className="flex gap-4">
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank</p>
              <p className="text-[10px] font-bold text-slate-900">{emp?.bank_name || "—"}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account</p>
              <p className="text-[10px] font-bold text-slate-900 font-mono">{emp?.account_number ? `••••${emp.account_number.slice(-4)}` : "—"}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <BarcodeMark value={barcodeValue} variant="portrait" />
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">
            Reference Code
          </p>
          <p className="mt-1 font-mono text-[11px] font-bold text-slate-900 tracking-wider">
            {referenceCode}
          </p>
        </div>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────
     Print CSS
  ───────────────────────────────────────────── */
  const landscapePrintCSS = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      body { margin: 0; padding: 0; background: white !important; }
      #root { padding: 0; margin: 0; }
      .print-copy-divider {
        border: none;
        border-top: 2px dashed #e2e8f0;
        margin: 1cm 0;
      }
      .hidden-print { display: none !important; }
      .print-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        width: 100%;
        padding: 1cm 0;
      }
    }
  `;

  const portraitPrintCSS = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 0;
      }
      body { margin: 0; padding: 0; background: white !important; }
      #root { padding: 0; margin: 0; }
      .print-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        width: 100%;
        padding: 1cm 0;
      }
    }
  `;

  const previewLabel =
    printLayout === "portrait"
      ? "Portrait — 1 copy per A4 page (Employee Copy)"
      : "Landscape — 2 copies per A4 page (Employee Copy + Department Copy)";

  return (
    <>
      {/* ── Screen controls (hidden on print) ── */}
      <div className="print:hidden">
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <Link to="/payslips">
            <Button variant="ghost" size="sm" className="font-bold">
              <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={2.5} /> Back
            </Button>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            {/* Layout selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">
                Layout:
              </span>
              <Select
                value={printLayout}
                onValueChange={(v) => setPrintLayout(v as PrintLayout)}
              >
                <SelectTrigger className="w-[140px] rounded-xl font-semibold border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">
                    Landscape
                  </SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handlePrint} className="rounded-xl font-bold px-6 shadow-md hover:shadow-lg transition-all">
              <Printer className="h-4 w-4 mr-2" strokeWidth={2.5} /> Print
            </Button>
          </div>
        </div>

        {/* Screen preview */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground text-center mb-3 italic font-medium">
            {previewLabel}
          </p>
          {printLayout === "landscape" ? (
            <div className="mx-auto max-w-[900px] space-y-3">
              <LandscapeCard copyLabel="Employee Copy" />
              <div className="border-t border-dashed border-gray-300 my-1" />
              <LandscapeCard copyLabel="Department Copy" />
            </div>
          ) : (
            <div className="mx-auto max-w-[480px]">
              <PortraitCard copyLabel="Employee Copy" />
            </div>
          )}
        </div>
      </div>

      {/* ── Print CSS ── */}
      <style>
        {printLayout === "portrait" ? portraitPrintCSS : landscapePrintCSS}
      </style>

      {/* ── Print output ── */}
      <div className="hidden print:block" ref={printRef}>
        <div className="print-container">
          {printLayout === "landscape" ? (
            <>
              <LandscapeCard copyLabel="Employee Copy" />
              <div className="print-copy-divider w-[18cm]" />
              <LandscapeCard copyLabel="Department Copy" />
            </>
          ) : (
            <PortraitCard copyLabel="Employee Copy" />
          )}
        </div>
      </div>
    </>
  );
}
