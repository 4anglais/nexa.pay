import { createFileRoute } from "@tanstack/react-router";
import { NewEmployeePage } from "@/routes/_authenticated/employees.new";

export const Route = createFileRoute("/android/_authenticated/employees/new")({
  head: () => ({
    meta: [{ title: "Add Employee — NexaPayslip Android" }],
  }),
  component: NewEmployeePage,
});
