import { createFileRoute } from "@tanstack/react-router";
import { PayslipsPage } from "@/routes/_authenticated/payslips.index";

export const Route = createFileRoute("/android/_authenticated/payslips/")({
  head: () => ({
    meta: [{ title: "Payslips — NexaPayslip Android" }],
  }),
  component: PayslipsPage,
});
