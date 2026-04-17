import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

type PrintLayout = "landscape" | "portrait";

function PayslipDetailPage() {
  const { payslipId } = Route.useParams();
  const [payslip, setPayslip] = useState<PayslipDetail | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [allowances, setAllowances] = useState<AllowanceRow[]>([]);
  const [deductions, setDeductions] = useState<DeductionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [printLayout, setPrintLayout] = useState<PrintLayout>("landscape");

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

  const referenceCode = signature.slice(0, 10).toUpperCase();

  /* ─────────────────────────────────────────────
     LANDSCAPE CARD — modern ticket design
  ───────────────────────────────────────────── */
  const LandscapeCard = ({ copyLabel }: { copyLabel: string }) => (
    <div
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      className="relative flex overflow-hidden border border-slate-200 bg-white shadow-sm print:border print:shadow-none text-sm rounded-3xl h-[12cm]"
    >
      {/* Left Main Section */}
      <div className="flex-1 p-8 flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-bold tracking-tight text-slate-900 text-2xl leading-none">
              {companyName}
            </h2>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-2">
              Official Payslip — {period}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Type</p>
            <p className="text-[10px] text-slate-900 font-bold mt-1 uppercase tracking-wider italic">
              {copyLabel}
            </p>
          </div>
        </div>

        {/* Employee Details Row */}
        <div className="grid grid-cols-3 gap-6 my-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee</p>
            <p className="font-bold text-slate-900 text-sm">{emp?.full_name ?? "—"}</p>
            <p className="text-[10px] text-slate-500 font-medium">{emp?.position ?? "—"}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Number</p>
            <p className="font-bold text-slate-900 text-sm">{emp?.nrc_or_id ?? "—"}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
            <p className="font-bold text-slate-900 text-sm">{emp?.department ?? "—"}</p>
          </div>
        </div>

        {/* Financials Row */}
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-2">
            <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-900 pb-1.5 mb-3">
              Earnings
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Basic</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(emp?.basic_salary ?? 0).replace("ZMW ", "")}
                </span>
              </div>
              {allowances.map((a, i) => (
                <div key={i} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-medium">{a.type}</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(a.amount).replace("ZMW ", "")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-900">Gross</span>
                <span className="font-black text-slate-900 text-[12px]">
                  {formatCurrency(gross).replace("ZMW ", "")}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[9px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-900 pb-1.5 mb-3">
              Deductions
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Statutory</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(paye + napsa + nhima).replace("ZMW ", "")}
                </span>
              </div>
              {deductions.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-medium">{d.type}</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(d.amount).replace("ZMW ", "")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-900">Total</span>
                <span className="font-bold text-red-600 text-[12px]">
                  {formatCurrency(payslip.total_deductions).replace("ZMW ", "")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <div className="flex gap-6">
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank</p>
              <p className="text-[10px] font-bold text-slate-900">{emp?.bank_name || "—"}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account</p>
              <p className="text-[10px] font-bold text-slate-900 font-mono">
                {emp?.account_number ? `••••${emp.account_number.slice(-4)}` : "—"}
              </p>
            </div>
          </div>
          <div className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[8px] uppercase tracking-widest opacity-50 font-bold">Net Pay</p>
              <p className="text-xl font-black">{formatCurrency(payslip.net_pay)}</p>
            </div>
            <div className="h-8 w-[1px] bg-white/20" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Paid</span>
          </div>
        </div>
      </div>

      {/* Vertical Cut Line with Semi-Circles */}
      <div className="relative h-full">
        <div className="absolute top-[-48px] left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-slate-50 border border-slate-200 print:bg-white" />
        <div className="absolute bottom-[-48px] left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-slate-50 border border-slate-200 print:bg-white" />
        <div className="border-l-2 border-dashed border-slate-200 h-full" />
      </div>

      {/* Right Side QR Section */}
      <div className="w-[7cm] bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm mb-4">
          <QRCodeSVG value={qrData} size={110} level="H" />
        </div>
        <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-2">Verify Authenticity</h4>
        <p className="text-[9px] text-slate-500 font-medium px-4 leading-relaxed mb-6">
          Scan this code to instantly verify this payslip in our secure portal.
        </p>
        <div className="mt-auto pt-6 border-t border-slate-200 w-full">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reference Code</p>
          <p className="font-mono text-[10px] font-bold text-slate-900 tracking-wider">
            {referenceCode}
          </p>
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
      className="relative overflow-hidden border border-slate-200 bg-white shadow-sm print:border print:shadow-none p-8 text-sm rounded-3xl"
    >
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="font-bold tracking-tight text-slate-900 text-3xl leading-none">
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
            <p className="text-3xl font-black tracking-tighter">
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

      {/* Dotted Cut Line with Semi-Circles */}
      <div className="relative my-10">
        <div className="absolute -left-[48px] top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-50 border border-slate-200 print:bg-white" />
        <div className="absolute -right-[48px] top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-50 border border-slate-200 print:bg-white" />
        <div className="border-t-2 border-dashed border-slate-200 w-full" />
      </div>

      {/* Footer / QR Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-4 max-w-[60%]">
          <div>
            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">Verification</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              This is a digitally generated payslip. You can verify its authenticity by scanning the QR code or visiting our verification portal.
            </p>
          </div>
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
          <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <QRCodeSVG value={qrData} size={80} level="H" />
          </div>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Scan to Verify</p>
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
        margin: 0.5cm;
      }
      body { margin: 0; padding: 0; background: white !important; }
      .print-copy-divider {
        border: none;
        border-top: 2px dashed #e2e8f0;
        margin: 0.8cm 0;
      }
    }
  `;

  const portraitPrintCSS = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 0.6cm;
      }
      body { margin: 0; padding: 0; background: white !important; }
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
                Print layout:
              </span>
              <Select
                value={printLayout}
                onValueChange={(v) => setPrintLayout(v as PrintLayout)}
              >
                <SelectTrigger className="w-[180px] rounded-xl font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">
                    Landscape (2 copies)
                  </SelectItem>
                  <SelectItem value="portrait">Portrait (1 copy)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handlePrint} className="rounded-xl font-bold px-6">
              <Printer className="h-4 w-4 mr-2" strokeWidth={2.5} /> Print
            </Button>
          </div>
        </div>

        {/* Screen preview */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground text-center mb-3 italic">
            {previewLabel}
          </p>
          {printLayout === "landscape" ? (
            <div className="mx-auto max-w-[900px] space-y-3">
              <LandscapeCard copyLabel="Employee Copy" />
              <div className="border-t border-dashed border-gray-400 my-1" />
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
      <div className="hidden print:block">
        {printLayout === "landscape" ? (
          <>
            <LandscapeCard copyLabel="Employee Copy" />
            <hr className="print-copy-divider" />
            <LandscapeCard copyLabel="Department Copy" />
          </>
        ) : (
          <PortraitCard copyLabel="Employee Copy" />
        )}
      </div>
    </>
  );
}
