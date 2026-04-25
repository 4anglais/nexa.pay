import { Link, useLocation } from "@tanstack/react-router";
import { appNavItems } from "./app-nav";

export function AppBottomNav() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl px-4 print:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <div className="grid grid-cols-5 gap-1 rounded-[2rem] border border-white/70 bg-white/85 p-2 shadow-[0_20px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
        {appNavItems.map((item) => {
          const active = isActive(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-[1.35rem] px-2 py-2 text-[11px] font-semibold transition-all duration-200 ${
                active
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20"
                  : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-950"
              }`}
            >
              <item.icon className="h-4 w-4" strokeWidth={2.1} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
