import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { ArrowLeft, CheckCircle2, QrCode, XCircle } from "lucide-react";
import { createVerificationSignature } from "@/lib/utils";

interface QueryParams {
  id: string;
  employee: string;
  period: string;
  net_pay: string;
  issued: string;
  sig: string;
}

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [{ title: "Verify Payslip — NexaPayslip" }],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const [query, setQuery] = useState<QueryParams | null>(null);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryData = {
      id: params.get("id") ?? "",
      employee: params.get("employee") ?? "",
      period: params.get("period") ?? "",
      net_pay: params.get("net_pay") ?? "",
      issued: params.get("issued") ?? "",
      sig: params.get("sig") ?? "",
    };
    setQuery(queryData);

    const payload = `${queryData.id}|${queryData.employee}|${queryData.period}|${queryData.net_pay}|${queryData.issued}`;
    const isValid = createVerificationSignature(payload) === queryData.sig;
    setValid(isValid);
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="Verify Payslip"
        description="Confirm whether the scanned payslip is a valid NexaPayslip document."
      />
      <div className="rounded-[2rem] border border-border/70 bg-white/90 p-8 shadow-2xl backdrop-blur-3xl dark:bg-slate-950/70">
        {query ? (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 shadow-sm dark:bg-slate-900/60 dark:text-slate-100">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Payslip ID
                </p>
                <p className="mt-2 font-semibold break-all">
                  {query.id || "—"}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 shadow-sm dark:bg-slate-900/60 dark:text-slate-100">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Employee
                </p>
                <p className="mt-2 font-semibold">{query.employee || "—"}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 shadow-sm dark:bg-slate-900/60 dark:text-slate-100">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Period
                </p>
                <p className="mt-2 font-semibold">{query.period || "—"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 shadow-sm dark:bg-slate-900/60 dark:text-slate-100">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Net Pay
                </p>
                <p className="mt-2 font-semibold">{query.net_pay || "—"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 shadow-sm dark:bg-slate-900/60 dark:text-slate-100">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Issued
                </p>
                <p className="mt-2 font-semibold">{query.issued || "—"}</p>
              </div>
            </div>
            <div
              className={`rounded-[2rem] border p-8 text-center ${valid ? "border-success/30 bg-success/10 text-success" : "border-destructive/30 bg-destructive/10 text-destructive"}`}
            >
              {valid ? (
                <>
                  <CheckCircle2 className="mx-auto mb-4 h-12 w-12" />
                  <p className="text-xl font-bold">Valid Payslip</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The QR code matches the payslip details and the document is
                    authentic.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="mx-auto mb-4 h-12 w-12" />
                  <p className="text-xl font-bold">Invalid Payslip</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The scanned QR code could not be verified. Check the payslip
                    or contact your payroll administrator.
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Back to Home
                </Button>
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted/20 px-4 py-2 text-sm text-muted-foreground">
                <QrCode className="h-4 w-4" strokeWidth={2} /> Scan a fresh QR
                for validation
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-border/70 bg-slate-50 p-10 text-center text-muted-foreground shadow-sm dark:bg-slate-900/60">
            <p className="text-lg font-semibold">
              No verification payload found.
            </p>
            <p className="mt-2">
              Open this page via the QR code printed on a payslip.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
