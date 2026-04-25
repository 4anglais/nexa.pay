import {
  Banknote,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

export const appNavItems = [
  { to: "/android/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/android/employees", label: "Employees", icon: Users },
  { to: "/android/payroll", label: "Payroll", icon: Banknote },
  { to: "/android/payslips", label: "Payslips", icon: FileText },
  { to: "/android/settings", label: "Settings", icon: Settings },
] as const;
