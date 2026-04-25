import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/android")({
  component: AndroidRootRoute,
});

function AndroidRootRoute() {
  return <Outlet />;
}
