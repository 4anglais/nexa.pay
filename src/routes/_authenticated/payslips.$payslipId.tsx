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
     LANDSCAPE TICKET CARD — compact, fits 2 per A4 landscape
  ───────────────────────────────────────────── */
  const LandscapeCard = ({ copyLabel }: { copyLabel: string }) => (
    <div
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      className="border border-black bg-white print:border print:shadow-none p-4 text-sm"
    >
      {/* Copy label strip */}
      <div className="mb-2 pb-1 border-b border-black flex items-center justify-between">
        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-black">
          {copyLabel}
        </span>
        <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">
          {period}
        </span>
      </div>

      <div className="flex gap-5">
        {/* Left Section */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-3 pb-2 border-b border-gray-300">
            <h2 className="font-black tracking-tight text-black text-lg leading-none">
              {companyName}
            </h2>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
              Official Payslip — {period}
            </p>
            <p className="text-[7px] text-gray-400 mt-0.5">
              REF: {payslip.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Employee Details */}
          <div className="mb-2">
            <p className="text-[7px] font-black text-gray-500 uppercase tracking-wider mb-0.5">
              Employee
            </p>
            <p className="font-black text-black text-xs leading-tight">
              {emp?.full_name ?? "—"}
            </p>
            <p className="text-[8px] text-gray-500">
              {emp?.position ?? "—"} · {emp?.department ?? "—"}
            </p>
            <p className="font-mono text-[7px] text-gray-400 mt-0.5">
              ID: {emp?.nrc_or_id ?? "—"}
            </p>
          </div>

          {/* Financials Grid */}
          <div className="grid grid-cols-3 gap-2 text-[7px]">
            {/* Earnings */}
            <div>
              <h3 className="font-black text-gray-500 uppercase tracking-wider mb-1">
                Earnings
              </h3>
              <div className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Basic</span>
                  <span className="font-bold text-black">
                    {formatCurrency(emp?.basic_salary ?? 0).replace("ZMW ", "")}
                  </span>
                </div>
                {allowances.slice(0, 2).map((a, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-500 truncate mr-1">
                      {a.type}
                    </span>
                    <span className="font-bold text-black">
                      {formatCurrency(a.amount).replace("ZMW ", "")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-black pt-0.5 mt-0.5 font-black text-black">
                <span>Gross</span>
                <span>{formatCurrency(gross).replace("ZMW ", "")}</span>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="font-black text-gray-500 uppercase tracking-wider mb-1">
                Deductions
              </h3>
              <div className="space-y-0.5">
                {payeRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">PAYE</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(paye).replace("ZMW ", "")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">NAPSA</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(napsa).replace("ZMW ", "")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NHIMA</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(nhima).replace("ZMW ", "")}
                  </span>
                </div>
                {deductions.slice(0, 1).map((d, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-500 truncate mr-1">
                      {d.type}
                    </span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(d.amount).replace("ZMW ", "")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-black pt-0.5 mt-0.5 font-black text-red-600">
                <span>Total</span>
                <span>
                  {formatCurrency(payslip.total_deductions).replace("ZMW ", "")}
                </span>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h3 className="font-black text-gray-500 uppercase tracking-wider mb-1">
                Payment
              </h3>
              <p className="text-gray-500 text-[7px]">
                {emp?.bank_name || "Bank Transfer"}
              </p>
              <p className="font-mono text-[7px] text-gray-400 mt-0.5">
                {emp?.account_number || "•••• •••• ••••"}
              </p>
              <div className="mt-1 pt-1 border-t border-gray-300">
                <span className="inline-flex items-center rounded-sm bg-black px-1.5 py-0.5 text-[6px] font-black text-white tracking-widest">
                  PAID
                </span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-black p-2 text-white mt-2">
            <p className="text-[6px] font-black uppercase tracking-widest opacity-60">
              Net Take Home (ZMW)
            </p>
            <p className="font-black text-base mt-0.5 leading-none">
              {formatCurrency(payslip.net_pay).replace("ZMW ", "")}
            </p>
          </div>
        </div>

        {/* Right Section - QR */}
        <div className="flex flex-col items-center justify-between py-1 border-l border-gray-300 pl-4 min-w-fit">
          <div className="text-center">
            <div className="border border-gray-300 bg-white p-1.5 inline-block">
              <QRCodeSVG value={qrData} size={80} level="M" />
            </div>
            <p className="text-[6px] font-black text-black mt-1 uppercase tracking-widest">
              VERIFY
            </p>
          </div>
          <div className="text-center mt-2">
            <p className="text-[7px] font-black text-gray-500 uppercase tracking-wider">
              Ref Code
            </p>
            <p className="font-mono font-black text-black tracking-widest text-[9px] mt-0.5">
              {referenceCode}
            </p>
            <p className="text-[6px] text-gray-400 mt-0.5">Scan to verify</p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────
     PORTRAIT CARD — full detail, fits 1 per A4 portrait
  ───────────────────────────────────────────── */
  const PortraitCard = ({ copyLabel }: { copyLabel: string }) => (
    <div
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      className="border border-black bg-white print:border print:shadow-none p-5 text-sm"
    >
      {/* Copy label strip */}
      <div className="mb-3 pb-2 border-b-2 border-black flex items-center justify-between">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-black">
          {copyLabel}
        </span>
        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
          {period}
        </span>
      </div>

      {/* Header */}
      <div className="mb-4 pb-3 border-b border-gray-300 flex items-start justify-between">
        <div>
          <h2 className="font-black tracking-tight text-black text-xl leading-none">
            {companyName}
          </h2>
          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            Official Payslip — {period}
          </p>
          <p className="text-[7px] text-gray-400 mt-0.5">
            REF: {payslip.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="border border-gray-300 bg-white p-1.5">
          <QRCodeSVG value={qrData} size={60} level="M" />
        </div>
      </div>

      {/* Employee Details */}
      <div className="mb-4 p-3 bg-gray-100 border border-gray-300">
        <p className="text-[7px] font-black text-gray-500 uppercase tracking-wider mb-1">
          Employee Details
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[8px]">
          <div>
            <span className="text-gray-500">Name: </span>
            <span className="font-black text-black">
              {emp?.full_name ?? "—"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">ID: </span>
            <span className="font-mono font-bold text-black">
              {emp?.nrc_or_id ?? "—"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Position: </span>
            <span className="font-bold text-black">{emp?.position ?? "—"}</span>
          </div>
          <div>
            <span className="text-gray-500">Department: </span>
            <span className="font-bold text-black">
              {emp?.department ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Earnings & Deductions side by side */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Earnings */}
        <div>
          <h3 className="text-[7px] font-black text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-black">
            Earnings
          </h3>
          <div className="space-y-1 text-[8px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Basic Salary</span>
              <span className="font-bold text-black">
                {formatCurrency(emp?.basic_salary ?? 0)}
              </span>
            </div>
            {allowances.map((a, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-500">{a.type}</span>
                <span className="font-bold text-black">
                  {formatCurrency(a.amount)}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-black pt-1 mt-1 font-black text-black text-[8px]">
              <span>Gross Pay</span>
              <span>{formatCurrency(gross)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="text-[7px] font-black text-gray-500 uppercase tracking-wider mb-2 pb-1 border-b border-black">
            Deductions
          </h3>
          <div className="space-y-1 text-[8px]">
            {payeRate > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">PAYE ({payeRate}%)</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(paye)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">NAPSA ({napsaRate}%)</span>
              <span className="font-bold text-red-600">
                {formatCurrency(napsa)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">NHIMA ({nhimaRate}%)</span>
              <span className="font-bold text-red-600">
                {formatCurrency(nhima)}
              </span>
            </div>
            {deductions.map((d, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-500">{d.type}</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(d.amount)}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-black pt-1 mt-1 font-black text-red-600 text-[8px]">
              <span>Total Deductions</span>
              <span>{formatCurrency(payslip.total_deductions)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-4 text-[8px] p-2 border border-gray-300 bg-gray-50">
        <h3 className="text-[7px] font-black text-gray-500 uppercase tracking-wider mb-1">
          Payment Details
        </h3>
        <div className="flex gap-6">
          <div>
            <span className="text-gray-500">Bank: </span>
            <span className="font-bold text-black">
              {emp?.bank_name || "Bank Transfer"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Account: </span>
            <span className="font-mono font-bold text-black">
              {emp?.account_number || "•••• •••• ••••"}
            </span>
          </div>
        </div>
      </div>

      {/* Net Pay */}
      <div className="bg-black p-4 text-white mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[7px] font-black uppercase tracking-widest opacity-60">
              Net Take Home (ZMW)
            </p>
            <p className="font-black text-2xl mt-0.5 leading-none">
              {formatCurrency(payslip.net_pay).replace("ZMW ", "")}
            </p>
          </div>
          <span className="inline-flex items-center border border-white/40 px-3 py-1 text-[8px] font-black tracking-widest">
            PAID
          </span>
        </div>
      </div>

      {/* Reference */}
      <div className="flex items-center justify-between text-[7px] text-gray-400">
        <div>
          <span className="font-black text-gray-500 uppercase tracking-wider">
            Ref:{" "}
          </span>
          <span className="font-mono font-black text-black tracking-widest">
            {referenceCode}
          </span>
        </div>
        <span>Scan QR code above to verify authenticity</span>
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
