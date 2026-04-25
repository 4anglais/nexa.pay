import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/android/")({
  beforeLoad: () => {
    throw redirect({ to: "/android/payslips" });
  },
});
