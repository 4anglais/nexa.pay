import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { AppBottomNav } from "./AppBottomNav";
import { appNavItems } from "./app-nav";
import { Button } from "./ui/button";
import { firebase } from "@/integrations/firebase/client";
import { useStatusBar } from "@/hooks/useStatusBar";

export function AndroidAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeItem = appNavItems.find(
    (item) =>
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`),
  );

  // Set the status bar to dark for non-dashboard pages on Android
  useStatusBar({
    backgroundColor: "#0d1825",
    style: "DARK",
    overlaysWebView: false,
    navigationBarColor: "#0d1825",
    navigationBarDarkIcons: false,
  });

  const handleLogout = async () => {
    await signOut(firebase.auth);
    navigate({ to: "/android/login", replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,#eef6ff_0%,#f8fbff_42%,#f3f8ff_100%)] text-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.16),transparent_55%)]"></div>

      <div className="relative min-h-screen">
        <header
          className="sticky top-0 z-30 border-b border-white/60 bg-white/72 backdrop-blur-2xl print:hidden"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)",
          }}
        >
          <div className="flex items-center justify-between gap-4 px-4 pb-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-900/15">
                N
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700/70">
                  NexaPayslip
                </p>
                <h1 className="text-base font-semibold text-slate-950">
                  {activeItem?.label ?? "Workspace"}
                </h1>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="rounded-2xl border border-slate-200/80 bg-white/75 px-4 text-slate-700 shadow-sm backdrop-blur-xl hover:bg-slate-950 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" strokeWidth={2.2} />
              Sign Out
            </Button>
          </div>
        </header>

        <main
          className="w-full px-4 pt-6 sm:px-6 print:p-0"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 7.5rem)",
          }}
        >
          <Outlet />
        </main>

        <AppBottomNav />
      </div>
    </div>
  );
}
