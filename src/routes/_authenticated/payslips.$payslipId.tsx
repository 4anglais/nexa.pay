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
     LANDSCAPE TICKET CARD — receipt-like, simple design
  ───────────────────────────────────────────── */
  const LandscapeCard = ({ copyLabel }: { copyLabel: string }) => (
    <div
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      className="border-2 border-black bg-white print:border print:shadow-none p-5 text-sm rounded-lg"
    >
      {/* Header */}
      <div className="mb-4 pb-3 border-b-2 border-black text-center">
        <h2 className="font-semibold tracking-tight text-black text-base leading-none">
          {companyName}
        </h2>
        <p className="text-[7px] font-medium text-black uppercase tracking-wider mt-2">
          PAYSLIP {copyLabel.toUpperCase()}
        </p>
        <p className="text-[8px] text-black mt-1 font-medium">{period}</p>
      </div>

      <div className="flex gap-4">
        {/* Left Section */}
        <div className="flex-1">
          {/* Employee Details */}
          <div className="mb-3 pb-3 border-b border-dashed border-black">
            <p className="text-[7px] font-semibold text-black uppercase tracking-wider mb-1">
              Employee
            </p>
            <p className="font-semibold text-black text-sm leading-tight">
              {emp?.full_name ?? "—"}
            </p>
            <p className="text-[7px] text-black font-medium mt-1">
              {emp?.position ?? "—"} • {emp?.department ?? "—"}
            </p>
            <p className="text-[7px] text-black mt-1">
              ID: {emp?.nrc_or_id ?? "—"}
            </p>
          </div>

          {/* Financials Grid */}
          <div className="grid grid-cols-3 gap-3 text-[7px] mb-3">
            {/* Earnings */}
            <div className="border border-black rounded p-2">
              <h3 className="font-semibold text-black uppercase tracking-wider text-[7px] mb-1.5">
                Earnings
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-black font-medium">Basic</span>
                  <span className="font-semibold text-black">
                    {formatCurrency(emp?.basic_salary ?? 0).replace("ZMW ", "")}
                  </span>
                </div>
                {allowances.slice(0, 2).map((a, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-black truncate mr-1 font-medium">
                      {a.type}
                    </span>
                    <span className="font-semibold text-black">
                      {formatCurrency(a.amount).replace("ZMW ", "")}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-black pt-1 mt-1 font-semibold text-black">
                  <span>Gross</span>
                  <span>{formatCurrency(gross).replace("ZMW ", "")}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-black rounded p-2">
              <h3 className="font-semibold text-black uppercase tracking-wider text-[7px] mb-1.5">
                Deductions
              </h3>
              <div className="space-y-1">
                {payeRate > 0 && (
                  <div className="flex justify-between text-[7px]">
                    <span className="text-black font-medium">PAYE</span>
                    <span className="font-semibold text-black">
                      {formatCurrency(paye).replace("ZMW ", "")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[7px]">
                  <span className="text-black font-medium">NAPSA</span>
                  <span className="font-semibold text-black">
                    {formatCurrency(napsa).replace("ZMW ", "")}
                  </span>
                </div>
                <div className="flex justify-between text-[7px]">
                  <span className="text-black font-medium">NHIMA</span>
                  <span className="font-semibold text-black">
                    {formatCurrency(nhima).replace("ZMW ", "")}
                  </span>
                </div>
                {deductions.slice(0, 1).map((d, i) => (
                  <div key={i} className="flex justify-between text-[7px]">
                    <span className="text-black truncate mr-1 font-medium">
                      {d.type}
                    </span>
                    <span className="font-semibold text-black">
                      {formatCurrency(d.amount).replace("ZMW ", "")}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-black pt-1 mt-1 font-semibold text-black text-[7px]">
                  <span>Total</span>
                  <span>
                    {formatCurrency(payslip.total_deductions).replace("ZMW ", "")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="border border-black rounded p-2">
              <h3 className="font-semibold text-black uppercase tracking-wider text-[7px] mb-1.5">
                Payment
              </h3>
              <p className="text-black text-[7px] font-medium">
                {emp?.bank_name || "Bank Transfer"}
              </p>
              <p className="font-mono text-[7px] text-black font-semibold mt-1">
                {emp?.account_number || "•••• •••• ••••"}
              </p>
              <div className="mt-2 pt-1.5 border-t border-black">
                <span className="inline-flex items-center rounded px-2 py-0.5 text-[6px] font-semibold bg-black text-white uppercase tracking-wider">
                  PAID
                </span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-black text-white p-3 rounded">
            <p className="text-[6px] font-medium uppercase tracking-wider opacity-80 mb-1">
              Net Pay
            </p>
            <p className="font-semibold text-lg leading-none">
              {formatCurrency(payslip.net_pay).replace("ZMW ", "")} ZMW
            </p>
          </div>
        </div>

        {/* Right Section - QR */}
        <div className="flex flex-col items-center justify-between py-1 border-l-2 border-black pl-4 min-w-fit">
          <div className="text-center">
            <div className="border-2 border-black bg-white p-2 inline-block rounded">
              <QRCodeSVG value={qrData} size={90} level="M" />
            </div>
            <p className="text-[6px] font-semibold text-black mt-2 uppercase tracking-wider">
              Scan to Verify
            </p>
          </div>
          <div className="text-center mt-3">
            <p className="text-[6px] font-semibold text-black uppercase tracking-wider">
              Ref Code
            </p>
            <p className="font-mono font-semibold text-black tracking-widest text-[9px] mt-1 bg-white border border-black px-2 py-1 rounded">
              {referenceCode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────
     PORTRAIT CARD — receipt-like, simple design
  ───────────────────────────────────────────── */
  const PortraitCard = ({ copyLabel }: { copyLabel: string }) => (
    <div
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      className="border-2 border-black bg-white print:border print:shadow-none p-6 text-sm rounded-lg"
    >
      {/* Header */}
      <div className="mb-5 pb-4 border-b-2 border-black text-center">
        <h2 className="font-semibold tracking-tight text-black text-2xl leading-none">
          {companyName}
        </h2>
        <p className="text-[8px] font-medium text-black uppercase tracking-wider mt-2">
          PAYSLIP {copyLabel.toUpperCase()}
        </p>
        <p className="text-[9px] text-black mt-1 font-medium">{period}</p>
      </div>

      {/* Employee Details */}
      <div className="mb-4 pb-3 border-b border-dashed border-black">
        <div className="grid grid-cols-2 gap-4 text-[10px]">
          <div>
            <p className="font-medium text-black">Employee:</p>
            <p className="text-black">{emp?.full_name ?? "—"}</p>
          </div>
          <div>
            <p className="font-medium text-black">Employee ID:</p>
            <p className="text-black">{emp?.nrc_or_id ?? "—"}</p>
          </div>
          <div>
            <p className="font-medium text-black">Department:</p>
            <p className="text-black">{emp?.department ?? "—"}</p>
          </div>
          <div>
            <p className="font-medium text-black">Position:</p>
            <p className="text-black">{emp?.position ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Earnings & Deductions side by side */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Earnings */}
        <div className="border border-dashed border-black p-3">
          <h3 className="text-[9px] font-semibold text-black uppercase tracking-wider mb-2 pb-1 border-b border-black">
            Earnings
          </h3>
          <div className="space-y-1 text-[9px]">
            <div className="flex justify-between">
              <span className="text-black">Basic Salary</span>
              <span className="font-semibold text-black">
                {formatCurrency(emp?.basic_salary ?? 0).replace("ZMW ", "")}
              </span>
            </div>
            {allowances.map((a, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-black">{a.type}</span>
                <span className="font-semibold text-black">
                  {formatCurrency(a.amount).replace("ZMW ", "")}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-black pt-1 mt-1 font-semibold text-black text-[9px]">
              <span>Gross Pay</span>
              <span>{formatCurrency(gross).replace("ZMW ", "")}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="border border-dashed border-black p-3">
          <h3 className="text-[9px] font-semibold text-black uppercase tracking-wider mb-2 pb-1 border-b border-black">
            Deductions
          </h3>
          <div className="space-y-1 text-[9px]">
            {payeRate > 0 && (
              <div className="flex justify-between">
                <span className="text-black">PAYE</span>
                <span className="font-semibold text-black">
                  {formatCurrency(paye).replace("ZMW ", "")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-black">NAPSA</span>
              <span className="font-semibold text-black">
                {formatCurrency(napsa).replace("ZMW ", "")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">NHIMA</span>
              <span className="font-semibold text-black">
                {formatCurrency(nhima).replace("ZMW ", "")}
              </span>
            </div>
            {deductions.map((d, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-black">{d.type}</span>
                <span className="font-semibold text-black">
                  {formatCurrency(d.amount).replace("ZMW ", "")}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-black pt-1 mt-1 font-semibold text-black text-[9px]">
              <span>Total</span>
              <span>{formatCurrency(payslip.total_deductions).replace("ZMW ", "")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-4 pb-3 border-b border-dashed border-black">
        <h3 className="text-[9px] font-semibold text-black uppercase tracking-wider mb-2">
          Payment Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-[9px]">
          <div>
            <p className="font-medium text-black">Bank:</p>
            <p className="text-black">{emp?.bank_name || "Bank Transfer"}</p>
          </div>
          <div>
            <p className="font-medium text-black">Account:</p>
            <p className="font-mono text-black">{emp?.account_number || "•••• •••• ••••"}</p>
          </div>
        </div>
      </div>

      {/* Net Pay */}
      <div className="border-2 border-black p-4 mb-4 text-center">
        <p className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">
          Net Pay
        </p>
        <p className="font-bold text-black text-2xl">
          {formatCurrency(payslip.net_pay).replace("ZMW ", "")}
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center border border-black px-3 py-1 text-[8px] font-semibold bg-black text-white uppercase tracking-wider">
            PAID
          </span>
        </div>
      </div>

      {/* Reference Footer */}
      <div className="flex items-center justify-between text-[7px] text-slate-500 pt-3 border-t border-slate-300">
        <div>
          <span className="font-black text-slate-600 uppercase tracking-wider">
            Verification Code:{" "}
          </span>
          <span className="font-mono font-black text-slate-900 tracking-widest bg-slate-100 px-2 py-0.5 rounded inline-block ml-1">
            {referenceCode}
          </span>
        </div>
        <span className="text-[6px] text-slate-400">Scan QR above to verify authenticity</span>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────
     Print CSS
  ───────────────────────────────────────────── */
  const landscapePrintCSS = `
    @media print {
      @page {
        size: A4 landscape;
        margin: 0.6cm;
      }
      body { margin: 0; padding: 0; background: white !important; }
      .print-copy-divider {
        border: none;
        border-top: 1px dashed #999;
        margin: 0.4cm 0;
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
