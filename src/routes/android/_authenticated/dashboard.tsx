import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/routes/_authenticated/dashboard";

export const Route = createFileRoute("/android/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NexaPayslip Android" },
      { name: "description", content: "Your payroll overview" },
    ],
  }),
  component: DashboardPage,
});
