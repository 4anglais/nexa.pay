import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/android/_authenticated/payslips")({
  component: () => <Outlet />,
});
