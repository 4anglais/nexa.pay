import { createFileRoute } from "@tanstack/react-router";
import { PayslipDetailPageContent } from "@/routes/_authenticated/payslips.$payslipId";

export const Route = createFileRoute(
  "/android/_authenticated/payslips/$payslipId",
)({
  head: () => ({
    meta: [{ title: "Payslip Detail — NexaPayslip Android" }],
  }),
  component: AndroidPayslipDetailPage,
});

function AndroidPayslipDetailPage() {
  const { payslipId } = Route.useParams();

  return <PayslipDetailPageContent payslipId={payslipId} />;
}
