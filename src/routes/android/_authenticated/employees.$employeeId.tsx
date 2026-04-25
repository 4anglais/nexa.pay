import { createFileRoute } from "@tanstack/react-router";
import { EditEmployeePageContent } from "@/routes/_authenticated/employees.$employeeId";

export const Route = createFileRoute(
  "/android/_authenticated/employees/$employeeId",
)({
  component: AndroidEditEmployeePage,
});

function AndroidEditEmployeePage() {
  const { employeeId } = Route.useParams();

  return <EditEmployeePageContent employeeId={employeeId} />;
}
