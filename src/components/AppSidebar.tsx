import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Banknote,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/payroll", label: "Payroll", icon: Banknote },
  { to: "/payslips", label: "Payslips", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const NavContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center px-6">
        <span className="text-xl font-black tracking-tighter text-foreground">
          NexaPayslips
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon
                className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 ${active ? "animate-pulse" : ""}`}
                strokeWidth={1.75}
              />
              {item.label}
              {active && (
                <div className="absolute left-0 h-6 w-1 rounded-r-full bg-primary-foreground/50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/10">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 rounded-xl px-4 py-6 text-sm font-bold text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" strokeWidth={2.5} />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-slate-950 shadow-xl shadow-slate-900/15 ring-1 ring-white/80 backdrop-blur-xl md:hidden"
      >
        {mobileOpen ? (
          <X className="h-5 w-5" strokeWidth={1.75} />
        ) : (
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        )}
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm transition-opacity duration-500 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 rounded-tr-3xl rounded-br-3xl glass-sidebar transition-all duration-500 ease-in-out md:relative md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}
