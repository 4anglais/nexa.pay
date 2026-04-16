import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "./AppSidebar";

export function DashboardLayout() {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#eef6ff_0%,#f7fbff_100%)] text-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),transparent_60%)]" />
      <div className="relative flex min-h-screen">
        <div className="print:hidden">
          <AppSidebar />
        </div>
        <main className="flex-1 overflow-auto py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 print:p-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
