import {
  createFileRoute,
  Link,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { firebase } from "@/integrations/firebase/client";
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
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

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
  userId: string;
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

export function PayslipDetailPage() {
  const { payslipId } = Route.useParams();
  return <PayslipDetailPageContent payslipId={payslipId} />;
}

export function PayslipDetailPageContent({
  payslipId,
}: {
  payslipId: string;
}) {
  const location = useLocation();
  const isAndroidRoute = location.pathname.startsWith("/android");
  const [payslip, setPayslip] = useState<PayslipDetail | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [allowances, setAllowances] = useState<AllowanceRow[]>([]);
  const [deductions, setDeductions] = useState<DeductionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [printLayout, setPrintLayout] = useState<PrintLayout>("portrait");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      // FIX: wait for auth to be ready before fetching
      const user = await new Promise<typeof firebase.auth.currentUser>(
        (resolve) => {
          const unsub = firebase.auth.onAuthStateChanged((u) => {
            unsub();
            resolve(u);
          });
        },
      );

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const payslipDoc = await getDoc(
          doc(firebase.db, "payslips", payslipId),
        );
        if (!payslipDoc.exists()) {
          setLoading(false);
          return;
        }

        const payslipData: PayslipDetail = {
          id: payslipDoc.id,
          ...(payslipDoc.data() as Omit<PayslipDetail, "id">),
          employees: null,
          payroll_runs: null,
        };

        // Fetch employee
        if (payslipData.employee_id) {
          const employeeDoc = await getDoc(
            doc(firebase.db, "employees", payslipData.employee_id),
          );
          if (employeeDoc.exists()) {
            payslipData.employees =
              employeeDoc.data() as PayslipDetail["employees"];
          }
        }

        // Fetch payroll run
        if (payslipData.payroll_run_id) {
          const payrollRunDoc = await getDoc(
            doc(firebase.db, "payroll_runs", payslipData.payroll_run_id),
          );
          if (payrollRunDoc.exists()) {
            payslipData.payroll_runs = payrollRunDoc.data() as {
              month: string;
              year: number;
            };
          }
        }

        setPayslip(payslipData);

        // Fetch allowances
        const allowancesSnapshot = await getDocs(
          query(
            collection(firebase.db, "allowances"),
            where("employee_id", "==", payslipData.employee_id),
            where("userId", "==", user.uid),
          ),
        );
        setAllowances(
          allowancesSnapshot.docs.map((d) => ({
            type: d.data().type,
            amount: Number(d.data().amount),
          })),
        );

        // Fetch deductions
        const deductionsSnapshot = await getDocs(
          query(
            collection(firebase.db, "deductions"),
            where("employee_id", "==", payslipData.employee_id),
            where("userId", "==", user.uid),
          ),
        );
        setDeductions(
          deductionsSnapshot.docs.map((d) => ({
            type: d.data().type,
            amount: Number(d.data().amount),
          })),
        );

        // FIX: fetch company_settings by uid (doc ID), not a collection scan.
        // The old query(collection(...)) hit ALL docs and the security rules denied
        // it because resource.data.userId != request.auth.uid for other users' docs.
        const companyDoc = await getDoc(
          doc(firebase.db, "company_settings", user.uid),
        );
        if (companyDoc.exists()) {
          setCompany(companyDoc.data() as CompanySettings);
        }
      } catch (error) {
        console.error("Error fetching payslip data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [payslipId]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
    }).format(n);

  const formatGeneratedDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("en-ZM", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsed);
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading payslip…</p>
      </div>
    );
  }

  if (!payslip) {
    return (
      <>
        <PageHeader
          title="Payslip Not Found"
          description="This payslip does not exist."
        />
        <Link to={isAndroidRoute ? "/android/payslips" : "/payslips"}>
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
  const referenceCode = signature.slice(0, 10).toUpperCase();
  const generatedDate = formatGeneratedDate(payslip.created_at);
  const numberTextClass = "font-mono tabular-nums";

  /* ─────────────────────────────────────────────
     LANDSCAPE CARD
  ───────────────────────────────────────────── */
  const LandscapeCard = ({ copyLabel }: { copyLabel: string }) => (
    <div
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      className="relative flex border border-slate-200 bg-white shadow-sm print:border print:shadow-none text-sm rounded-3xl h-[10.5cm] w-[18cm] mx-auto print:scale-90"
    >
      <div
        className="absolute w-5 h-5 rounded-full z-20"
        style={{
          top: "-10px",
          right: "calc(3.2cm - 2px)",
          background: "#e2e8f0",
          border: "2px dashed #94a3b8",
        }}
      />
      <div
        className="absolute w-5 h-5 rounded-full z-20"
        style={{
          bottom: "-10px",
          right: "calc(3.2cm - 2px)",
          background: "#e2e8f0",
          border: "2px dashed #94a3b8",
        }}
      />

      <div className="flex-1 p-6 flex flex-col justify-between overflow-hidden min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-bold tracking-tight text-slate-900 text-xl leading-none">
              {companyName}
            </h2>
            <p className="text-[8px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1.5">
              Official Payslip — {period}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
              Type
            </p>
            <p className="text-[9px] text-slate-900 font-bold mt-1 uppercase tracking-wider italic">
              {copyLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 my-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Employee
            </p>
            <p className="font-bold text-slate-900 text-xs">
              {emp?.full_name ?? "—"}
            </p>
            <p className="text-[9px] text-slate-500 font-medium">
              {emp?.position ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              ID Number
            </p>
            <p className={`font-bold text-slate-900 text-xs ${numberTextClass}`}>
              {emp?.nrc_or_id ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Department
            </p>
            <p className="font-bold text-slate-900 text-xs">
              {emp?.department ?? "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-[8px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-900 pb-1 mb-2">
              Earnings
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-medium">Basic</span>
                <span className={`font-bold text-slate-900 ${numberTextClass}`}>
                  {formatCurrency(emp?.basic_salary ?? 0).replace("ZMW ", "")}
                </span>
              </div>
              {allowances.map((a, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-[10px]"
                >
                  <span className="text-slate-500 font-medium">{a.type}</span>
                  <span className={`font-bold text-slate-900 ${numberTextClass}`}>
                    {formatCurrency(a.amount).replace("ZMW ", "")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-900">
                  Gross
                </span>
                <span className={`font-black text-slate-900 text-[11px] ${numberTextClass}`}>
                  {formatCurrency(gross).replace("ZMW ", "")}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[8px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-900 pb-1 mb-2">
              Deductions
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-medium">Statutory</span>
                <span className={`font-bold text-red-600 ${numberTextClass}`}>
                  {formatCurrency(paye + napsa + nhima).replace("ZMW ", "")}
                </span>
              </div>
              {deductions.map((d, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-[10px]"
                >
                  <span className="text-slate-500 font-medium">{d.type}</span>
                  <span className={`font-bold text-red-600 ${numberTextClass}`}>
                    {formatCurrency(d.amount).replace("ZMW ", "")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-900">
                  Total
                </span>
                <span className={`font-bold text-red-600 text-[11px] ${numberTextClass}`}>
                  {formatCurrency(payslip.total_deductions).replace("ZMW ", "")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
          <div className="flex gap-4 items-end">
            <div>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Bank
              </p>
              <p className="text-[9px] font-bold text-slate-900">
                {emp?.bank_name || "—"}
              </p>
            </div>
            <div>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Account
              </p>
              <p className={`text-[9px] font-bold text-slate-900 ${numberTextClass}`}>
                {emp?.account_number
                  ? `••••${emp.account_number.slice(-4)}`
                  : "—"}
              </p>
            </div>
            <p className="text-[6px] font-mono text-slate-300 tracking-wider pb-0.5">
              {referenceCode}
            </p>
          </div>
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="text-right">
              <p className="text-[7px] uppercase tracking-widest opacity-50 font-bold">
                Net Pay
              </p>
              <p className={`text-base font-black ${numberTextClass}`}>
                {formatCurrency(payslip.net_pay)}
              </p>
            </div>
            <div className="h-5 w-[1px] bg-white/20" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
              Paid
            </span>
          </div>
        </div>

        <div className="pt-2 text-[8px] text-slate-400 flex items-center justify-between">
          <span>
            Generated: <span className={numberTextClass}>{generatedDate}</span>
          </span>
          <span>Powered by NEXAPAY</span>
        </div>
      </div>

      <div
        className="flex-shrink-0 flex items-center justify-center py-4"
        style={{ width: "18px" }}
      >
        <div className="border-l-2 border-dashed border-slate-300 h-full" />
      </div>

      <div className="w-[3.2cm] bg-slate-50/60 flex flex-col items-center justify-between py-5 px-2 rounded-r-3xl overflow-hidden">
        <p className="text-[6px] font-bold text-slate-400 uppercase tracking-[0.15em]">
          Verify
        </p>
        <div
          className="flex-1 flex items-center justify-center"
          style={{ overflow: "hidden", width: "100%" }}
        >
          <div
            style={{
              transform: "rotate(90deg)",
              transformOrigin: "center center",
            }}
          >
            <Barcode
              value={referenceCode}
              width={1.3}
              height={52}
              displayValue={false}
              background="transparent"
              lineColor="#000000"
              margin={2}
            />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            Ref
          </p>
          <p className="font-mono text-[7px] font-bold text-slate-700 tracking-wider break-all leading-tight">
            {referenceCode}
          </p>
        </div>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────
     PORTRAIT CARD
  ───────────────────────────────────────────── */
  const PortraitCard = ({ copyLabel }: { copyLabel: string }) => (
    <div
      style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      className="relative border border-slate-200 bg-white shadow-sm print:border print:shadow-none text-sm rounded-3xl w-[16cm] mx-auto print:scale-90"
    >
      <div className="p-8 pb-0">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="font-bold tracking-tight text-slate-900 text-2xl leading-none">
              {companyName}
            </h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-2">
              Official Payslip
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Period
            </p>
            <p className={`text-sm text-slate-900 font-bold mt-1 ${numberTextClass}`}>{period}</p>
            <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold tracking-wider">
              {copyLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-5 gap-x-8 mb-6 pb-6 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Employee
            </p>
            <p className="font-bold text-slate-900 text-base">
              {emp?.full_name ?? "—"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {emp?.position ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              ID Number
            </p>
            <p className={`font-bold text-slate-900 text-base ${numberTextClass}`}>
              {emp?.nrc_or_id ?? "—"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {emp?.department ?? "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 mb-6">
          <div>
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-900 pb-2 mb-3">
              Earnings
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Basic Salary</span>
                <span className={`font-bold text-slate-900 ${numberTextClass}`}>
                  {formatCurrency(emp?.basic_salary ?? 0).replace("ZMW ", "")}
                </span>
              </div>
              {allowances.map((a, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-slate-500 font-medium">{a.type}</span>
                  <span className={`font-bold text-slate-900 ${numberTextClass}`}>
                    {formatCurrency(a.amount).replace("ZMW ", "")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
                <span className="text-xs font-bold text-slate-900">
                  Gross Pay
                </span>
                <span className={`font-black text-slate-900 text-sm ${numberTextClass}`}>
                  {formatCurrency(gross).replace("ZMW ", "")}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-900 pb-2 mb-3">
              Deductions
            </h3>
            <div className="space-y-2">
              {payeRate > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">PAYE Tax</span>
                  <span className={`font-bold text-red-600 ${numberTextClass}`}>
                    {formatCurrency(paye).replace("ZMW ", "")}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">NAPSA</span>
                <span className={`font-bold text-red-600 ${numberTextClass}`}>
                  {formatCurrency(napsa).replace("ZMW ", "")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">NHIMA</span>
                <span className={`font-bold text-red-600 ${numberTextClass}`}>
                  {formatCurrency(nhima).replace("ZMW ", "")}
                </span>
              </div>
              {deductions.map((d, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-slate-500 font-medium">{d.type}</span>
                  <span className={`font-bold text-red-600 ${numberTextClass}`}>
                    {formatCurrency(d.amount).replace("ZMW ", "")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
                <span className="text-xs font-bold text-slate-900">
                  Total Deductions
                </span>
                <span className={`font-bold text-red-600 text-sm ${numberTextClass}`}>
                  {formatCurrency(payslip.total_deductions).replace("ZMW ", "")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 text-white flex justify-between items-center mb-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">
              Net Pay
            </p>
            <p className={`text-2xl font-black tracking-tighter ${numberTextClass}`}>
              {formatCurrency(payslip.net_pay)}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="inline-flex items-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              Paid
            </div>
            <p className="text-[7px] opacity-30 font-mono uppercase tracking-widest">
              {referenceCode}
            </p>
          </div>
        </div>
      </div>

      <div className="relative my-0 -mx-0 py-6">
        <div
          className="absolute w-5 h-5 rounded-full z-20"
          style={{
            left: "-10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#e2e8f0",
            border: "2px dashed #94a3b8",
          }}
        />
        <div
          className="absolute w-5 h-5 rounded-full z-20"
          style={{
            right: "-10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#e2e8f0",
            border: "2px dashed #94a3b8",
          }}
        />
        <div className="border-t-2 border-dashed border-slate-200 mx-8" />
      </div>

      <div className="px-8 pb-6 flex items-center justify-between gap-6">
        <div className="space-y-3 flex-1 min-w-0">
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Digitally generated payslip. Scan the barcode or visit our
            verification portal to confirm authenticity.
          </p>
          <div className="flex gap-5">
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Bank
              </p>
              <p className="text-[10px] font-bold text-slate-900">
                {emp?.bank_name || "—"}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Account
              </p>
              <p className={`text-[10px] font-bold text-slate-900 ${numberTextClass}`}>
                {emp?.account_number
                  ? `••••${emp.account_number.slice(-4)}`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="bg-white rounded-xl overflow-hidden">
            <Barcode
              value={referenceCode}
              width={1.6}
              height={48}
              displayValue={false}
              background="transparent"
              lineColor="#000000"
              margin={4}
            />
          </div>
          <p className="font-mono text-[8px] font-bold text-slate-500 tracking-[0.15em] mt-1.5">
            {referenceCode}
          </p>
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Scan to Verify
          </p>
        </div>
      </div>

      <div className="px-8 pb-6 -mt-2 text-[10px] text-slate-400 flex items-center justify-between">
        <span>
          Generated: <span className={numberTextClass}>{generatedDate}</span>
        </span>
        <span>Powered by NEXAPAY</span>
      </div>
    </div>
  );

  const commonPrintCSS = `
    @media print {
      @page { size: A4 portrait; margin: 0; }
      body { margin: 0; padding: 0; background: white !important; }
      #root { padding: 0; margin: 0; }
      .print-copy-divider { border: none; border-top: 2px dashed #e2e8f0; margin: 0.8cm 0; }
      .hidden-print { display: none !important; }
      .print-container {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; min-height: 100vh; width: 100%; padding: 1cm 0; gap: 0;
      }
    }
  `;

  const previewLabel =
    printLayout === "portrait"
      ? "Employee Copy"
      : "Employee and Department Copy";

  return (
    <>
      <div className="print:hidden">
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <Link to={isAndroidRoute ? "/android/payslips" : "/payslips"}>
            <Button variant="ghost" size="sm" className="font-bold">
              <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={2.5} /> Back
            </Button>
          </Link>

          <div className="ml-auto flex items-center gap-3">
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
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handlePrint}
              className="rounded-xl font-bold px-6 shadow-md hover:shadow-lg transition-all"
            >
              <Printer className="h-4 w-4 mr-2" strokeWidth={2.5} /> Print
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-muted-foreground text-center mb-4 italic font-medium">
            {previewLabel}
          </p>
          {printLayout === "landscape" ? (
            <div className="mx-auto max-w-[900px] space-y-4">
              <LandscapeCard copyLabel="Employee Copy" />
              <div className="border-t border-dashed border-gray-300" />
              <LandscapeCard copyLabel="Department Copy" />
            </div>
          ) : (
            <div className="mx-auto max-w-[520px]">
              <PortraitCard copyLabel="Employee Copy" />
            </div>
          )}
        </div>
      </div>

      <style>{commonPrintCSS}</style>

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
