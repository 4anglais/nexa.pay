import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  Calculator,
  Users,
  ArrowUpRight,
} from "lucide-react";

import { MAINTENANCE_MODE } from "@/config/app";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const FEATURES = [
  {
    title: "Smart Payroll Runs",
    desc: "Automated salary, PAYE, NAPSA & NHIMA calculations — no spreadsheets.",
    icon: Calculator,
    tag: "Core",
  },
  {
    title: "Employee Management",
    desc: "Centralised employee records, contracts and payroll history in one place.",
    icon: Users,
    tag: "Core",
  },
  {
    title: "Payslip Generation",
    desc: "Professional, downloadable PDF payslips generated in seconds.",
    icon: Zap,
    tag: "Output",
  },
  {
    title: "Compliance Ready",
    desc: "Built end-to-end for Zambian statutory regulations and filing periods.",
    icon: Shield,
    tag: "Legal",
  },
  {
    title: "Instant Sharing",
    desc: "Deliver payslips directly to employee inboxes or download in bulk.",
    icon: CheckCircle2,
    tag: "Output",
  },
  {
    title: "Secure Storage",
    desc: "End-to-end encrypted payroll data with automated backup support.",
    icon: Shield,
    tag: "Security",
  },
];

const STATS = [
  { value: "< 60s", label: "Payroll run time" },
  { value: "100%", label: "ZRA compliant" },
  { value: "0 ZMW", label: "Setup fee" },
];

function LandingPage() {
  // 🔥 Maintenance Mode
  if (MAINTENANCE_MODE) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Background circles */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border" />

        <div className="relative z-10 flex w-full max-w-[480px] flex-col items-center text-center">
          <p className="mb-5 text-[13px] uppercase tracking-[0.12em] text-muted-foreground">
            NexaPayslips
          </p>

          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Maintenance in progress
            </span>
          </div>

          <h1 className="mb-4 text-[42px] font-normal leading-[1.15] tracking-tight text-foreground">
            Back <em className="italic text-muted-foreground">shortly</em>,
            <br />
            better than ever.
          </h1>

          <p className="mb-10 max-w-sm text-[15px] font-light leading-relaxed text-muted-foreground">
            We are upgrading the system to deliver a faster, more reliable
            payroll experience.
          </p>

          <div className="mb-10 w-full overflow-hidden rounded-xl border border-border bg-muted/50">
            {[
              { num: "01", label: "Faster payroll processing" },
              { num: "02", label: "PDF payslip generation" },
              { num: "03", label: "Email delivery system" },
            ].map((item, i, arr) => (
              <div
                key={item.num}
                className={`flex items-center gap-3 px-5 py-3.5 text-left ${
                  i < arr.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="min-w-[20px] font-mono text-[11px] text-muted-foreground/60">
                  {item.num}
                </span>
                <span className="flex-1 text-sm text-foreground">
                  {item.label}
                </span>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Deploying
                </span>
              </div>
            ))}
          </div>

          <div className="mb-8 flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[11px] tracking-wide text-muted-foreground/60">
              Expected downtime: 2 – 5 days
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="font-mono text-xs text-muted-foreground/50">
            Questions? angelphiri.2021@gmail.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <span className="font-mono text-sm font-semibold tracking-tight">
            NexaPayslips
          </span>

          <nav className="hidden items-center gap-8 text-[13px] text-muted-foreground md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#stats"
              className="transition-colors hover:text-foreground"
            >
              Why us
            </a>
            <a href="#cta" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-[13px]">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="text-[13px]">
              <Link to="/login">
                Get started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          {/* Dot grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          <div className="container relative mx-auto px-4 py-28 sm:px-6 sm:py-36">
            {/* Eyebrow */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Built for Zambia
              </span>
            </div>

            <h1 className="max-w-3xl text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[1.08] tracking-tight">
              Payroll that runs{" "}
              <span className="relative inline-block">
                <span className="relative z-10">as fast</span>
                <span
                  className="absolute bottom-1 left-0 -z-0 h-[0.18em] w-full rounded-full bg-primary/20"
                  aria-hidden
                />
              </span>{" "}
              <br className="hidden sm:block" />
              <span className="text-muted-foreground font-normal">
                as your business.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Generate compliant payslips, manage employees and automate PAYE,
              NAPSA & NHIMA calculations — all in one place.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-lg px-6">
                <Link to="/login">
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-lg px-6"
              >
                <a href="#features">See features</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section id="stats" className="border-b border-border bg-muted/30">
          <div className="container mx-auto grid grid-cols-3 divide-x divide-border px-4 sm:px-6">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 py-8"
              >
                <span className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {s.value}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b border-border py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-14 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Features
                </p>
                <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  Everything to run payroll,
                  <br />
                  <span className="font-normal text-muted-foreground">
                    nothing you don't need.
                  </span>
                </h2>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="self-start sm:self-auto"
              >
                <Link to="/login">
                  Explore all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group flex flex-col gap-4 bg-background p-7 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted transition-colors group-hover:border-primary/40 group-hover:bg-primary/5">
                      <f.icon className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                      {f.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-1.5 font-semibold leading-snug">
                      {f.title}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="py-28">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/40 px-8 py-16 text-center sm:px-16">
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/60" />

              <div className="relative z-10">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Get started today
                </p>
                <h2 className="mx-auto max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  Ready to simplify your payroll?
                </h2>
                <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  Join companies across Zambia running accurate, compliant
                  payroll in under a minute.
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg" className="rounded-lg px-7">
                    <Link to="/login">
                      Create free account{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <span className="font-mono text-[12px] text-muted-foreground/60">
            © {new Date().getFullYear()} NexaPayslips. All rights reserved.
          </span>
          <div className="flex gap-6 font-mono text-[12px] text-muted-foreground/60">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <a
              href="mailto:angelphiri.2021@gmail.com"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
