import { createFileRoute } from "@tanstack/react-router";
import { PayrollPage } from "@/routes/_authenticated/payroll";

export const Route = createFileRoute("/android/_authenticated/payroll")({
  component: PayrollPage,
});
