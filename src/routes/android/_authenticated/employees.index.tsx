import { createFileRoute } from "@tanstack/react-router";
import {
  EmployeesIndexPageContent,
  fetchEmployees,
} from "@/routes/_authenticated/employees.index";

export const Route = createFileRoute("/android/_authenticated/employees/")({
  head: () => ({
    meta: [
      { title: "Employees — NexaPayslip Android" },
      { name: "description", content: "Manage your employees" },
    ],
  }),
  loader: fetchEmployees,
  component: AndroidEmployeesIndexPage,
});

function AndroidEmployeesIndexPage() {
  const employees = Route.useLoaderData();

  return <EmployeesIndexPageContent initialEmployees={employees || []} />;
}
