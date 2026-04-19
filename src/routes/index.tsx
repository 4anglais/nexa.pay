import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Shield, Zap, Calculator, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter">NexaPayslips</span>
          </div>
          <nav className="hidden space-x-8 text-sm font-medium md:flex">
            <a href="#features" className="transition-colors hover:text-primary/60">Features</a>
            <a href="#solutions" className="transition-colors hover:text-primary/60">Solutions</a>
            <a href="#pricing" className="transition-colors hover:text-primary/60">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="font-semibold">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="font-bold">
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Payroll management <br />
                <span className="text-muted-foreground">reimagined for speed.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Streamline your company's payroll, generate professional payslips, and manage employees with the most modern platform built for Zambia.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-8 text-base font-bold">
                  <Link to="/login">
                    Start for free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">No credit card required</p>
              </div>
            </div>
          </div>
          
          {/* Background element */}
          <div className="absolute top-0 -z-10 h-full w-full opacity-5">
            <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary blur-[120px]" />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-border/40 py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to run payroll</h2>
              <p className="mt-4 text-muted-foreground">Powerful features to automate your monthly administrative tasks.</p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Smart Payroll Runs",
                  desc: "Calculate salaries, allowances, and statutory deductions in seconds with our automated engine.",
                  icon: Calculator
                },
                {
                  title: "Employee Directory",
                  desc: "Manage all your staff data, bank details, and NRC information in one secure centralized place.",
                  icon: Users
                },
                {
                  title: "Professional Payslips",
                  desc: "Generate clean, modern payslips with QR code verification for your employees to download.",
                  icon: Zap
                },
                {
                  title: "Statutory Compliance",
                  desc: "Built-in calculations for NAPSA, NHIMA, and PAYE following latest Zambian regulations.",
                  icon: Shield
                },
                {
                  title: "Instant Distribution",
                  desc: "Send payslips directly to employees or print them in batches with a single click.",
                  icon: CheckCircle2
                },
                {
                  title: "Secure Storage",
                  desc: "All your records are encrypted and backed up, ensuring data privacy and historical access.",
                  icon: Shield
                }
              ].map((f, i) => (
                <div key={i} className="group rounded-2xl border border-border/50 bg-background p-8 transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 border-t border-border/40">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12">
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to simplify your payroll?</h2>
              <p className="mx-auto mt-4 max-w-xl opacity-90">
                Join hundreds of businesses using NexaPayslips to manage their payroll efficiently every month.
              </p>
              <div className="mt-10 flex justify-center">
                <Button asChild size="lg" variant="secondary" className="h-12 px-8 font-bold text-primary">
                  <Link to="/login">Create your account now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            {/* Info on Left */}
            <div className="max-w-xs">
              <h2 className="text-xl font-black tracking-tighter mb-4">NexaPayslips</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The leading payroll management platform for modern businesses in Zambia. 
                Simplifying administrative tasks so you can focus on growth.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Email: hello@nexapayslips.com<br />
                Location: Lusaka, Zambia
              </p>
            </div>

            {/* Socials & Links on Right */}
            <div className="flex flex-col gap-8 md:text-right">
              <div className="flex gap-6 md:justify-end">
                <a href="#" className="text-sm font-semibold hover:underline">Twitter</a>
                <a href="#" className="text-sm font-semibold hover:underline">LinkedIn</a>
                <a href="#" className="text-sm font-semibold hover:underline">Facebook</a>
              </div>
              <div className="flex gap-6 md:justify-end text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground">Privacy Policy</a>
                <a href="#" className="hover:text-foreground">Terms of Service</a>
                <a href="#" className="hover:text-foreground">Contact Us</a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 border-t border-border/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} NexaPayslips. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Built for speed. Designed for excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
