import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/employees")({
  component: EmployeesLayout,
});

function EmployeesLayout() {
  return <Outlet />;
}
