import { Capacitor } from "@capacitor/core";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Shield,
  Zap,
  Calculator,
  Users,
  FileText,
  Mail,
  Lock,
  ChevronRight,
  Star,
  CheckCircle2,
  TrendingUp,
  Clock,
  Globe,
  Award,
  BarChart3,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { MAINTENANCE_MODE } from "@/config/app";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) {
      navigate({ to: "/android/payslips", replace: true });
    }
  }, [isNative, navigate]);

  if (isNative) {
    return null;
  }

  return <Landing />;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    icon: Calculator,
    title: "Smart Payroll Runs",
    desc: "Run full payroll — salaries, PAYE, NAPSA & NHIMA — in under 60 seconds.",
    accent: "#14b8a6",
  },
  {
    icon: FileText,
    title: "PDF Payslip Generation",
    desc: "Beautiful, compliant PDF payslips generated instantly and ready to download.",
    accent: "#34d399",
  },
  {
    icon: Mail,
    title: "Email Delivery",
    desc: "Deliver payslips directly to every employee inbox with one click.",
    accent: "#38bdf8",
  },
  {
    icon: Users,
    title: "Employee Management",
    desc: "Centralised employee records, contract history and payroll data.",
    accent: "#a78bfa",
  },
  {
    icon: Lock,
    title: "Secure & Encrypted",
    desc: "End-to-end encrypted payroll data with automated backups.",
    accent: "#f472b6",
  },
];

const FEATURES = [
  {
    icon: Calculator,
    title: "Smart Payroll Runs",
    desc: "Automated salary, PAYE, NAPSA & NHIMA calculations — no spreadsheets, no errors.",
    accent: "#14b8a6",
    tag: "Core",
  },
  {
    icon: Users,
    title: "Employee Management",
    desc: "Centralised records, contracts and payroll history in one beautiful interface.",
    accent: "#34d399",
    tag: "Core",
  },
  {
    icon: Zap,
    title: "Instant Payslips",
    desc: "Professional, branded PDF payslips generated and delivered in seconds.",
    accent: "#38bdf8",
    tag: "Output",
  },
  {
    icon: Shield,
    title: "ZRA Compliant",
    desc: "Built end-to-end for Zambian statutory regulations and all filing periods.",
    accent: "#a78bfa",
    tag: "Legal",
  },
  {
    icon: Mail,
    title: "One-click Delivery",
    desc: "Email payslips to every employee simultaneously with a single action.",
    accent: "#f472b6",
    tag: "Output",
  },
  {
    icon: Lock,
    title: "Encrypted Storage",
    desc: "Bank-grade security with end-to-end encryption and automated backups.",
    accent: "#fb923c",
    tag: "Security",
  },
];

const STATS = [
  { value: "< 60s", label: "Payroll run time" },
  { value: "100%", label: "ZRA compliant" },
  { value: "0 ZMW", label: "Setup fee" },
];

const TICKER_ITEMS = [
  "Payroll in 60 seconds",
  "ZRA Compliant",
  "PDF Payslips",
  "PAYE · NAPSA · NHIMA",
  "Built for Zambia",
  "Zero setup fee",
  "Encrypted storage",
  "One-click delivery",
];

const TESTIMONIALS = [
  {
    name: "Mulenga C.",
    role: "Finance Manager, Lusaka",
    text: "We used to spend 2 days on payroll every month. NexaPayslip does it in under a minute. Game changer.",
    stars: 5,
  },
  {
    name: "Thandiwe M.",
    role: "HR Director, Ndola",
    text: "The ZRA compliance alone was worth it. No more stress about PAYE calculations being wrong.",
    stars: 5,
  },
  {
    name: "Joseph K.",
    role: "CEO, Kitwe SME",
    text: "Setup was instant and the payslips look incredibly professional. Our employees love getting them.",
    stars: 5,
  },
];

const PRICING_FEATURES = [
  "Unlimited payroll runs",
  "PDF payslip generation",
  "Employee management",
  "PAYE, NAPSA & NHIMA auto-calc",
  "ZRA compliant reports",
  "Email payslip delivery",
  "Encrypted data storage",
  "Priority support",
];

const HOW_STEPS = [
  {
    step: "01",
    title: "Add your employees",
    desc: "Import or add employees with salary details, allowances and deductions in minutes.",
    color: "#14b8a6",
    icon: Users,
  },
  {
    step: "02",
    title: "Run payroll in one click",
    desc: "PAYE, NAPSA and NHIMA are calculated automatically. Review the breakdown and confirm.",
    color: "#34d399",
    icon: Zap,
  },
  {
    step: "03",
    title: "Payslips delivered instantly",
    desc: "PDF payslips are generated and sent to each employee's inbox immediately after approval.",
    color: "#38bdf8",
    icon: FileText,
  },
];

const COMPARISON = [
  { feature: "Automated PAYE/NAPSA/NHIMA", us: true, them: false },
  { feature: "ZRA-ready reports", us: true, them: false },
  { feature: "PDF payslip generation", us: true, them: true },
  { feature: "Email delivery", us: true, them: false },
  { feature: "Setup fee", us: "FREE", them: "K2,000+" },
  { feature: "Monthly cost", us: "FREE", them: "K500+" },
  { feature: "Setup time", us: "5 min", them: "1 week" },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300&family=DM+Serif+Display:ital@0;1&display=swap');
  *,*::before,*::after{box-sizing:border-box;}

  @keyframes orbFloat {
    0%,100%{transform:translate(0,0) scale(1);}
    33%{transform:translate(50px,-40px) scale(1.06);}
    66%{transform:translate(-30px,25px) scale(0.96);}
  }
  @keyframes fadeSlideUp {
    from{opacity:0;transform:translateY(32px);}
    to{opacity:1;transform:translateY(0);}
  }
  @keyframes shimmer {
    0%{background-position:-300% center;}
    100%{background-position:300% center;}
  }
  @keyframes pulse-ring {
    0%,100%{transform:scale(1);opacity:0.8;}
    50%{transform:scale(1.6);opacity:0;}
  }
  @keyframes ticker {
    0%{transform:translateX(0);}
    100%{transform:translateX(-50%);}
  }
  @keyframes floatY {
    0%,100%{transform:translateY(0);}
    50%{transform:translateY(-12px);}
  }
  @keyframes countUp {
    from{opacity:0;transform:translateY(10px);}
    to{opacity:1;transform:translateY(0);}
  }
  @keyframes gradientShift {
    0%,100%{background-position:0% 50%;}
    50%{background-position:100% 50%;}
  }
  @keyframes borderGlow {
    0%,100%{box-shadow:0 0 0 0 rgba(20,184,166,0);}
    50%{box-shadow:0 0 0 4px rgba(20,184,166,0.15);}
  }

  .feat-card{
    opacity:0;transform:translateY(48px) scale(0.97);
    transition:opacity 0.8s cubic-bezier(.16,1,.3,1),transform 0.8s cubic-bezier(.16,1,.3,1),box-shadow 0.3s ease,border-color 0.3s ease;
  }
  .feat-card.visible{opacity:1;transform:translateY(0) scale(1);}
  .feat-card:hover{transform:translateY(-6px) scale(1.015) !important;box-shadow:0 24px 48px rgba(0,0,0,0.35) !important;}

  .reveal{opacity:0;transform:translateY(44px);transition:opacity 0.9s cubic-bezier(.16,1,.3,1),transform 0.9s cubic-bezier(.16,1,.3,1);}
  .reveal.visible{opacity:1;transform:translateY(0);}

  .reveal-left{opacity:0;transform:translateX(-40px);transition:opacity 0.9s cubic-bezier(.16,1,.3,1),transform 0.9s cubic-bezier(.16,1,.3,1);}
  .reveal-left.visible{opacity:1;transform:translateX(0);}

  .reveal-right{opacity:0;transform:translateX(40px);transition:opacity 0.9s cubic-bezier(.16,1,.3,1),transform 0.9s cubic-bezier(.16,1,.3,1);}
  .reveal-right.visible{opacity:1;transform:translateX(0);}

  .noise::after{content:'';position:absolute;inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events:none;border-radius:inherit;}

  .nav-link{color:rgba(255,255,255,0.38);text-decoration:none;font-size:0.8rem;transition:color 0.2s;}
  .nav-link:hover{color:rgba(255,255,255,0.88);}

  .cta-primary{
    display:inline-flex;align-items:center;gap:8px;padding:12px 26px;border-radius:14px;
    background:linear-gradient(135deg,rgba(20,184,166,0.25),rgba(52,211,153,0.18));
    border:1px solid rgba(20,184,166,0.45);color:#fff;font-weight:700;font-size:0.88rem;
    text-decoration:none;backdrop-filter:blur(12px);transition:all 0.25s ease;
    box-shadow:0 4px 24px rgba(20,184,166,0.15);
  }
  .cta-primary:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(20,184,166,0.28);background:linear-gradient(135deg,rgba(20,184,166,0.35),rgba(52,211,153,0.28));}

  .cta-ghost{
    display:inline-flex;align-items:center;gap:8px;padding:12px 26px;border-radius:14px;
    background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.11);
    color:rgba(255,255,255,0.6);font-weight:500;font-size:0.88rem;
    text-decoration:none;backdrop-filter:blur(12px);transition:all 0.25s ease;
  }
  .cta-ghost:hover{color:#fff;background:rgba(255,255,255,0.09);}

  .glow-rule{border:none;height:1px;background:linear-gradient(90deg,transparent,rgba(20,184,166,0.3),transparent);}

  .testimonial-card{
    transition:transform 0.3s ease,box-shadow 0.3s ease;
  }
  .testimonial-card:hover{transform:translateY(-4px);}

  .pricing-feature{
    opacity:0;transform:translateX(-16px);
    transition:opacity 0.5s ease,transform 0.5s ease;
  }
  .pricing-feature.visible{opacity:1;transform:translateX(0);}

  .step-connector{
    position:absolute;left:20px;top:100%;width:2px;height:24px;
    background:linear-gradient(to bottom,rgba(20,184,166,0.4),transparent);
  }

  .counter{animation:countUp 0.6s ease both;}

  .float-badge{animation:floatY 4s ease-in-out infinite;}
  .float-badge-delay{animation:floatY 4s 1.5s ease-in-out infinite;}
  .float-badge-delay2{animation:floatY 4s 3s ease-in-out infinite;}

  .animated-border{animation:borderGlow 3s ease-in-out infinite;}

  .gradient-text-animate{
    background:linear-gradient(90deg,#14b8a6,#34d399,#38bdf8,#14b8a6);
    background-size:300% auto;
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    animation:gradientShift 4s linear infinite;
  }
`;

// ─── Glass presets ────────────────────────────────────────────────────────────
const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.045)",
  backdropFilter: "blur(24px) saturate(160%)",
  WebkitBackdropFilter: "blur(24px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.12)",
};
const glassTeal: React.CSSProperties = {
  background: "rgba(20,184,166,0.06)",
  backdropFilter: "blur(28px) saturate(180%)",
  WebkitBackdropFilter: "blur(28px) saturate(180%)",
  border: "1px solid rgba(20,184,166,0.18)",
  boxShadow:
    "0 12px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(20,184,166,0.15)",
};
const glassStrong: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(40px) saturate(200%)",
  WebkitBackdropFilter: "blur(40px) saturate(200%)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow:
    "0 20px 60px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.16)",
};

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.15, className = "reveal") {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("visible");
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

// ─── Orbs ─────────────────────────────────────────────────────────────────────
function Orbs() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          top: "-20%",
          left: "-12%",
          background:
            "radial-gradient(circle,rgba(20,184,166,0.13) 0%,transparent 68%)",
          animation: "orbFloat 16s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          bottom: "-12%",
          right: "-10%",
          background:
            "radial-gradient(circle,rgba(52,211,153,0.11) 0%,transparent 68%)",
          animation: "orbFloat 20s ease-in-out infinite reverse",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: "50%",
          top: "38%",
          left: "42%",
          background:
            "radial-gradient(circle,rgba(56,189,248,0.08) 0%,transparent 70%)",
          animation: "orbFloat 24s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          top: "15%",
          right: "20%",
          background:
            "radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 70%)",
          animation: "orbFloat 19s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "9px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "3.5rem",
          width: "max-content",
          animation: "ticker 32s linear infinite",
        }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: "0.62rem",
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            {item}
            <span
              style={{ marginLeft: "3.5rem", color: "rgba(20,184,166,0.3)" }}
            >
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Maintenance carousel ─────────────────────────────────────────────────────
function MaintenanceCarousel() {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setLeaving(true);
      setTimeout(() => {
        setActive((p) => (p + 1) % SLIDES.length);
        setLeaving(false);
      }, 380);
    }, 4800);
    return () => clearInterval(id);
  }, []);
  const slide = SLIDES[active];
  const Icon = slide.icon;
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <div
        style={{
          ...glassStrong,
          borderRadius: 24,
          padding: "2rem",
          transition: "opacity 0.38s,transform 0.38s",
          opacity: leaving ? 0 : 1,
          transform: leaving
            ? "translateY(12px) scale(0.97)"
            : "translateY(0) scale(1)",
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            background: `${slide.accent}18`,
            border: `1px solid ${slide.accent}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem",
          }}
        >
          <Icon size={22} color={slide.accent} />
        </div>
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.93)",
            marginBottom: "0.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          {slide.title}
        </h3>
        <p
          style={{
            fontSize: "0.85rem",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.45)",
            margin: 0,
          }}
        >
          {slide.desc}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
          marginTop: "1.1rem",
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? 22 : 6,
              height: 6,
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              transition: "all 0.35s",
              background:
                i === active
                  ? "rgba(20,184,166,0.85)"
                  : "rgba(255,255,255,0.18)",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  desc,
  accent,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  accent: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="feat-card noise"
      style={{
        ...glass,
        borderRadius: 22,
        padding: "1.75rem",
        transitionDelay: `${delay}ms`,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle,${accent}18 0%,transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 48,
          background:
            "linear-gradient(to bottom,transparent,rgba(10,17,30,0.55))",
          pointerEvents: "none",
          borderRadius: "0 0 22px 22px",
        }}
      />
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          background: `${accent}14`,
          border: `1px solid ${accent}32`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.1rem",
          boxShadow: `0 4px 18px ${accent}18`,
          position: "relative",
        }}
      >
        <Icon size={19} color={accent} />
      </div>
      <h3
        style={{
          fontSize: "0.95rem",
          fontWeight: 700,
          color: "rgba(255,255,255,0.9)",
          marginBottom: "0.45rem",
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.82rem",
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.42)",
          margin: 0,
          position: "relative",
        }}
      >
        {desc}
      </p>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        ...glassTeal,
        borderRadius: 18,
        padding: "1.5rem 1.1rem",
        textAlign: "center",
        flex: 1,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 20,
          background:
            "linear-gradient(to bottom,rgba(20,184,166,0.08),transparent)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontSize: "clamp(1.5rem,3.5vw,2rem)",
          fontWeight: 800,
          letterSpacing: "-0.045em",
          background:
            "linear-gradient(135deg,#14b8a6 0%,#34d399 60%,rgba(255,255,255,0.7) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.6rem",
          fontFamily: "monospace",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginTop: "0.35rem",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Reveal wrappers ─────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  dir = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  dir?: "up" | "left" | "right";
}) {
  const cls =
    dir === "left"
      ? "reveal-left"
      : dir === "right"
        ? "reveal-right"
        : "reveal";
  const ref = useReveal(0.18, cls);
  return (
    <div ref={ref} className={cls} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────
function TestimonialCard({
  name,
  role,
  text,
  stars,
  delay,
}: {
  name: string;
  role: string;
  text: string;
  stars: number;
  delay: number;
}) {
  const ref = useReveal(0.1);
  return (
    <div
      ref={ref}
      className="reveal testimonial-card"
      style={{
        ...glass,
        borderRadius: 22,
        padding: "1.8rem",
        transitionDelay: `${delay}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(20,184,166,0.08) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", gap: 3, marginBottom: "1rem" }}>
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} size={13} fill="#14b8a6" color="#14b8a6" />
        ))}
      </div>
      <p
        style={{
          fontSize: "0.88rem",
          lineHeight: 1.75,
          color: "rgba(255,255,255,0.62)",
          marginBottom: "1.25rem",
          fontStyle: "italic",
        }}
      >
        "{text}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#14b8a6,#34d399)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 800,
            color: "white",
            flexShrink: 0,
          }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <p
            style={{
              fontSize: "0.83rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.85)",
              margin: 0,
            }}
          >
            {name}
          </p>
          <p
            style={{
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.35)",
              margin: 0,
            }}
          >
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function Landing() {
  const bg: React.CSSProperties = {
    minHeight: "100vh",
    background:
      "linear-gradient(160deg,#060d18 0%,#091422 40%,#0a1a2e 70%,#080f1c 100%)",
    color: "#fff",
    fontFamily: "'DM Sans',system-ui,sans-serif",
    position: "relative",
    overflowX: "hidden",
  };

  // ── MAINTENANCE ──────────────────────────────────────────────────────────────
  if (MAINTENANCE_MODE) {
    return (
      <div style={bg}>
        <style>{GLOBAL_CSS}</style>
        <Orbs />
        <Ticker />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 38px)",
            padding: "3rem 1.5rem",
            gap: "2.5rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              textAlign: "center",
              animation: "fadeSlideUp 0.7s ease both",
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)",
                marginBottom: "1rem",
              }}
            >
              NexaPayslip
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                ...glass,
                borderRadius: 99,
                padding: "6px 18px",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  position: "relative",
                  display: "inline-flex",
                  width: 8,
                  height: 8,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "#f87171",
                    animation: "pulse-ring 2s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#ef4444",
                    display: "inline-block",
                  }}
                />
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Maintenance in progress
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(2.4rem,6vw,4rem)",
                fontWeight: 800,
                lineHeight: 1.07,
                letterSpacing: "-0.04em",
                margin: 0,
              }}
            >
              Back{" "}
              <em
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  background: "linear-gradient(90deg,#14b8a6,#34d399,#14b8a6)",
                  backgroundSize: "300% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 5s linear infinite",
                }}
              >
                shortly
              </em>
              ,
              <br />
              <span
                style={{ color: "rgba(255,255,255,0.22)", fontWeight: 300 }}
              >
                better than ever.
              </span>
            </h1>
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.88rem",
                color: "rgba(255,255,255,0.38)",
                maxWidth: 340,
                lineHeight: 1.7,
              }}
            >
              Upgrading the system to deliver a faster, more reliable payroll
              experience.
            </p>
          </div>
          <div
            style={{
              animation: "fadeSlideUp 0.7s 0.2s ease both",
              width: "100%",
              maxWidth: 420,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <MaintenanceCarousel />
          </div>
          <div
            style={{
              textAlign: "center",
              animation: "fadeSlideUp 0.7s 0.4s ease both",
            }}
          >
            <div
              style={{
                ...glass,
                borderRadius: 12,
                padding: "8px 20px",
                display: "inline-block",
                marginBottom: "0.65rem",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.62rem",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                Expected downtime: 2 – 5 days
              </span>
            </div>
            <br />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.62rem",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              Questions? angelphiri.2021@gmail.com
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── LANDING ──────────────────────────────────────────────────────────────────
  return (
    <div style={bg}>
      <style>{GLOBAL_CSS}</style>
      <Orbs />

      {/* ── Navbar ── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          ...glass,
          borderRadius: 0,
          borderLeft: "none",
          borderRight: "none",
          borderTop: "none",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 1.5rem",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "linear-gradient(135deg,#14b8a6,#34d399)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 900,
                color: "white",
                boxShadow: "0 4px 12px rgba(20,184,166,0.35)",
              }}
            >
              N
            </div>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.78rem",
                letterSpacing: "0.04em",
                fontWeight: 700,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              NexaPayslip
            </span>
          </div>
          <nav style={{ display: "flex", gap: "1.8rem" }}>
            {[
              ["Features", "#features"],
              ["How it works", "#how"],
              ["Reviews", "#reviews"],
              ["Pricing", "#pricing"],
            ].map(([l, h]) => (
              <a key={l} href={h} className="nav-link">
                {l}
              </a>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link
              to="/login"
              style={{
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.42)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 10,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,0.42)";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "transparent";
              }}
            >
              Sign in
            </Link>
            <Link
              to="/login"
              style={{
                fontSize: "0.78rem",
                color: "#fff",
                textDecoration: "none",
                padding: "7px 16px",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                gap: 4,
                background:
                  "linear-gradient(135deg,rgba(20,184,166,0.22),rgba(52,211,153,0.15))",
                border: "1px solid rgba(20,184,166,0.35)",
                transition: "all 0.2s",
                boxShadow: "0 2px 12px rgba(20,184,166,0.15)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 4px 20px rgba(20,184,166,0.28)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 2px 12px rgba(20,184,166,0.15)";
              }}
            >
              Get started <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 10, paddingTop: 56 }}>
        {/* ── HERO ── */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "clamp(5.5rem,13vh,10rem) 1.5rem 5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.6rem",
          }}
        >
          <div
            style={{
              ...glassTeal,
              borderRadius: 99,
              padding: "5px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              animation: "fadeSlideUp 0.7s ease both",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#14b8a6",
                display: "inline-block",
                boxShadow: "0 0 8px #14b8a6",
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Built for Zambia
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.8rem,8vw,5.8rem)",
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.05em",
              margin: 0,
              animation: "fadeSlideUp 0.7s 0.1s ease both",
            }}
          >
            Payroll that moves{" "}
            <span
              className="gradient-text-animate"
              style={{
                fontFamily: "'DM Serif Display',serif",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              at the speed
            </span>
            <br />
            <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>
              of your business.
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(0.9rem,2vw,1.05rem)",
              color: "rgba(255,255,255,0.4)",
              maxWidth: 480,
              lineHeight: 1.78,
              margin: 0,
              animation: "fadeSlideUp 0.7s 0.2s ease both",
            }}
          >
            Generate compliant payslips, manage employees and automate PAYE,
            NAPSA & NHIMA calculations — all in one place.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
              animation: "fadeSlideUp 0.7s 0.3s ease both",
            }}
          >
            <Link to="/login" className="cta-primary">
              Start for free <ArrowRight size={15} />
            </Link>
            <a href="#features" className="cta-ghost">
              See features
            </a>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "0.75rem",
              width: "100%",
              maxWidth: 440,
              animation: "fadeSlideUp 0.7s 0.4s ease both",
            }}
          >
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Floating badges above UI preview */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 700,
              marginTop: "2rem",
              animation: "fadeSlideUp 0.9s 0.55s ease both",
            }}
          >
            {/* Floating badge left */}
            <div
              className="float-badge"
              style={{
                position: "absolute",
                top: -20,
                left: -10,
                zIndex: 10,
                ...glassTeal,
                borderRadius: 12,
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle2 size={14} color="#14b8a6" />
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.8)",
                  whiteSpace: "nowrap",
                }}
              >
                ZRA Compliant
              </span>
            </div>
            {/* Floating badge right */}
            <div
              className="float-badge-delay"
              style={{
                position: "absolute",
                top: -16,
                right: 10,
                zIndex: 10,
                ...glass,
                borderRadius: 12,
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Clock size={14} color="#34d399" />
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.8)",
                  whiteSpace: "nowrap",
                }}
              >
                Ready in 5 min
              </span>
            </div>

            {/* Hero glass UI preview */}
            <div
              style={{
                ...glassStrong,
                borderRadius: 24,
                padding: "1.5rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: "1rem",
                }}
              >
                <div style={{ display: "flex", gap: 5 }}>
                  {["#ef4444", "#f59e0b", "#10b981"].map((c) => (
                    <div
                      key={c}
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: c,
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(255,255,255,0.06)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.58rem",
                    color: "rgba(255,255,255,0.2)",
                    letterSpacing: "0.1em",
                  }}
                >
                  PAYROLL —{" "}
                  {new Date()
                    .toLocaleString("default", { month: "long" })
                    .toUpperCase()}{" "}
                  {new Date().getFullYear()}
                </span>
              </div>

              {/* ── FIX: wrap each row in a single keyed div instead of a fragment ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  gap: "2px 0",
                  fontSize: "0.75rem",
                }}
              >
                {["Employee", "Gross", "Deductions", "Net Pay"].map((h, i) => (
                  <div
                    key={h}
                    style={{
                      padding: "6px 8px",
                      color: "rgba(255,255,255,0.3)",
                      fontSize: "0.6rem",
                      fontFamily: "monospace",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      textAlign: i > 0 ? "right" : "left",
                    }}
                  >
                    {h}
                  </div>
                ))}
                {[
                  ["M. Banda", "K 8,500", "K 935", "K 7,565"],
                  ["C. Phiri", "K 12,000", "K 1,320", "K 10,680"],
                  ["J. Mwale", "K 6,800", "K 748", "K 6,052"],
                  ["R. Tembo", "K 15,400", "K 1,694", "K 13,706"],
                ].map(([name, gross, ded, net]) => (
                  // ── KEY on a single div, not a fragment ──
                  <div key={name} style={{ display: "contents" }}>
                    <div
                      style={{
                        padding: "8px 8px",
                        color: "rgba(255,255,255,0.75)",
                        fontWeight: 600,
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {name}
                    </div>
                    <div
                      style={{
                        padding: "8px 8px",
                        color: "rgba(255,255,255,0.55)",
                        textAlign: "right",
                        fontFamily: "monospace",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {gross}
                    </div>
                    <div
                      style={{
                        padding: "8px 8px",
                        color: "rgba(248,113,113,0.75)",
                        textAlign: "right",
                        fontFamily: "monospace",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {ded}
                    </div>
                    <div
                      style={{
                        padding: "8px 8px",
                        color: "rgba(52,211,153,0.85)",
                        textAlign: "right",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {net}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "55%",
                  background:
                    "linear-gradient(to bottom,transparent 0%,rgba(8,15,26,0.85) 100%)",
                  pointerEvents: "none",
                  borderRadius: "0 0 24px 24px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "1.25rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  ...glassTeal,
                  borderRadius: 99,
                  padding: "10px 22px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 8px 32px rgba(20,184,166,0.22)",
                }}
              >
                <Zap size={13} color="#14b8a6" />
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.88)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Run Payroll
                </span>
                <ArrowRight size={12} color="#14b8a6" />
              </div>
            </div>
          </div>
        </section>

        <Ticker />

        {/* ── FEATURES ── */}
        <section
          id="features"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "7rem 1.5rem" }}
        >
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(20,184,166,0.6)",
                  marginBottom: 14,
                }}
              >
                Features
              </p>
              <h2
                style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: "clamp(2rem,5vw,3.2rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Everything to run payroll,
                <br />
                <em
                  style={{
                    fontStyle: "italic",
                    color: "rgba(255,255,255,0.25)",
                    fontWeight: 300,
                  }}
                >
                  nothing you don't need.
                </em>
              </h2>
            </div>
          </Reveal>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: 60,
                background:
                  "linear-gradient(to right,rgba(6,13,24,0.6),transparent)",
                pointerEvents: "none",
                zIndex: 5,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: 60,
                background:
                  "linear-gradient(to left,rgba(6,13,24,0.6),transparent)",
                pointerEvents: "none",
                zIndex: 5,
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill,minmax(min(100%,270px),1fr))",
                gap: 14,
              }}
            >
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} {...f} delay={i * 80} />
              ))}
            </div>
          </div>
        </section>

        <hr className="glow-rule" style={{ maxWidth: 800, margin: "0 auto" }} />

        {/* ── HOW IT WORKS ── */}
        <section
          id="how"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "7rem 1.5rem" }}
        >
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(20,184,166,0.6)",
                  marginBottom: 14,
                }}
              >
                How it works
              </p>
              <h2
                style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: "clamp(2rem,5vw,3.2rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                From zero to{" "}
                <em style={{ fontStyle: "italic", color: "#14b8a6" }}>paid</em>,
                <br />
                <span
                  style={{ color: "rgba(255,255,255,0.25)", fontWeight: 300 }}
                >
                  in three steps.
                </span>
              </h2>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: 16,
            }}
          >
            {HOW_STEPS.map(({ step, title, desc, color, icon: Icon }, i) => (
              <Reveal key={step} delay={i * 120}>
                <div
                  style={{
                    ...glass,
                    borderRadius: 22,
                    padding: "2rem",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      background: `linear-gradient(to bottom,${color},transparent)`,
                      borderRadius: "3px 0 0 3px",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      background: `radial-gradient(circle,${color}10 0%,transparent 70%)`,
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: `${color}18`,
                        border: `1px solid ${color}35`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} color={color} />
                    </div>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.9)",
                      marginBottom: "0.6rem",
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.84rem",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.42)",
                      margin: 0,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <hr className="glow-rule" style={{ maxWidth: 800, margin: "0 auto" }} />

        {/* ── WHY US + COMPARISON ── */}
        <section
          id="stats"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "7rem 1.5rem" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: 16,
              marginBottom: "5rem",
            }}
          >
            <Reveal dir="left">
              <div
                style={{
                  ...glassTeal,
                  borderRadius: 28,
                  padding: "2.5rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 220,
                    height: 220,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle,rgba(20,184,166,0.12) 0%,transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    background:
                      "linear-gradient(to bottom,transparent,rgba(8,20,36,0.5))",
                    pointerEvents: "none",
                  }}
                />
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.58rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(20,184,166,0.55)",
                    marginBottom: "1rem",
                  }}
                >
                  Why NexaPayslip
                </p>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display',serif",
                    fontSize: "clamp(1.6rem,3vw,2.2rem)",
                    fontWeight: 400,
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: "1.2rem",
                  }}
                >
                  From zero to{" "}
                  <em style={{ fontStyle: "italic", color: "#14b8a6" }}>
                    paid
                  </em>
                  <br />
                  in under a minute.
                </h3>
                <p
                  style={{
                    fontSize: "0.84rem",
                    color: "rgba(255,255,255,0.38)",
                    lineHeight: 1.72,
                    maxWidth: 280,
                  }}
                >
                  No more manual calculations. No more spreadsheet errors. Just
                  one click to run compliant payroll across your entire team.
                </p>

                {/* Mini metrics */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: "1.75rem",
                  }}
                >
                  {[
                    {
                      icon: Clock,
                      val: "< 60s",
                      label: "Payroll time",
                      color: "#14b8a6",
                    },
                    {
                      icon: Globe,
                      val: "ZRA",
                      label: "Fully compliant",
                      color: "#34d399",
                    },
                    {
                      icon: TrendingUp,
                      val: "0 ZMW",
                      label: "Setup cost",
                      color: "#38bdf8",
                    },
                    {
                      icon: Award,
                      val: "100%",
                      label: "Accuracy",
                      color: "#a78bfa",
                    },
                  ].map(({ icon: Icon, val, label, color }) => (
                    <div
                      key={label}
                      style={{
                        ...glass,
                        borderRadius: 12,
                        padding: "0.85rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <Icon size={13} color={color} />
                      <div
                        style={{
                          fontSize: "1rem",
                          fontWeight: 800,
                          color: "rgba(255,255,255,0.88)",
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {val}
                      </div>
                      <div
                        style={{
                          fontSize: "0.62rem",
                          color: "rgba(255,255,255,0.35)",
                          fontFamily: "monospace",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal dir="right" delay={100}>
              <div
                style={{
                  ...glassStrong,
                  borderRadius: 28,
                  padding: "2rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.58rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(20,184,166,0.55)",
                    marginBottom: "1.25rem",
                  }}
                >
                  NexaPayslip vs. Traditional
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr",
                      gap: 8,
                      padding: "6px 8px",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.6rem",
                        fontFamily: "monospace",
                        color: "rgba(255,255,255,0.2)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      Feature
                    </div>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        fontFamily: "monospace",
                        color: "#14b8a6",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        textAlign: "center",
                      }}
                    >
                      Us
                    </div>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        fontFamily: "monospace",
                        color: "rgba(255,255,255,0.2)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        textAlign: "center",
                      }}
                    >
                      Others
                    </div>
                  </div>
                  {COMPARISON.map(({ feature, us, them }, i) => (
                    <div
                      key={feature}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr",
                        gap: 8,
                        padding: "8px 8px",
                        borderRadius: 8,
                        background:
                          i % 2 === 0
                            ? "rgba(255,255,255,0.02)"
                            : "transparent",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {feature}
                      </span>
                      <div style={{ textAlign: "center" }}>
                        {typeof us === "boolean" ? (
                          us ? (
                            <CheckCircle2
                              size={14}
                              color="#14b8a6"
                              style={{ margin: "0 auto" }}
                            />
                          ) : (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "rgba(255,255,255,0.2)",
                              }}
                            >
                              —
                            </span>
                          )
                        ) : (
                          <span
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              color: "#14b8a6",
                            }}
                          >
                            {us}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: "center" }}>
                        {typeof them === "boolean" ? (
                          them ? (
                            <CheckCircle2
                              size={14}
                              color="rgba(255,255,255,0.3)"
                              style={{ margin: "0 auto" }}
                            />
                          ) : (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "rgba(248,113,113,0.5)",
                              }}
                            >
                              ✕
                            </span>
                          )
                        ) : (
                          <span
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              color: "rgba(255,255,255,0.35)",
                            }}
                          >
                            {them}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── Big number stats ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: 12,
            }}
          >
            {[
              {
                icon: BarChart3,
                val: "500+",
                label: "Companies using NexaPayslip",
                color: "#14b8a6",
              },
              {
                icon: Users,
                val: "12k+",
                label: "Employees paid per month",
                color: "#34d399",
              },
              {
                icon: FileText,
                val: "98k+",
                label: "Payslips generated",
                color: "#38bdf8",
              },
              {
                icon: Clock,
                val: "99.9%",
                label: "Uptime guaranteed",
                color: "#a78bfa",
              },
            ].map(({ icon: Icon, val, label, color }, i) => (
              <Reveal key={label} delay={i * 80}>
                <div
                  style={{
                    ...glass,
                    borderRadius: 20,
                    padding: "1.5rem",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -20,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: `radial-gradient(circle,${color}15 0%,transparent 70%)`,
                      pointerEvents: "none",
                    }}
                  />
                  <Icon
                    size={18}
                    color={color}
                    style={{ margin: "0 auto 0.75rem" }}
                  />
                  <div
                    style={{
                      fontSize: "clamp(1.6rem,3vw,2.2rem)",
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {val}
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.35)",
                      marginTop: "0.4rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <hr className="glow-rule" style={{ maxWidth: 800, margin: "0 auto" }} />

        {/* ── TESTIMONIALS ── */}
        <section
          id="reviews"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "7rem 1.5rem" }}
        >
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(20,184,166,0.6)",
                  marginBottom: 14,
                }}
              >
                Reviews
              </p>
              <h2
                style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: "clamp(2rem,5vw,3.2rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Trusted by teams
                <br />
                <em
                  style={{
                    fontStyle: "italic",
                    color: "rgba(255,255,255,0.25)",
                    fontWeight: 300,
                  }}
                >
                  across Zambia.
                </em>
              </h2>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(min(100%,300px),1fr))",
              gap: 14,
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.name} {...t} delay={i * 100} />
            ))}
          </div>
        </section>

        <hr className="glow-rule" style={{ maxWidth: 800, margin: "0 auto" }} />

        {/* ── PRICING ── */}
        <section
          id="pricing"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "7rem 1.5rem" }}
        >
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(20,184,166,0.6)",
                  marginBottom: 14,
                }}
              >
                Pricing
              </p>
              <h2
                style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: "clamp(2rem,5vw,3.2rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Simple, honest
                <br />
                <em style={{ fontStyle: "italic", color: "#14b8a6" }}>
                  pricing.
                </em>
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.38)",
                  marginTop: "1rem",
                  lineHeight: 1.7,
                }}
              >
                No hidden fees. No complicated tiers. Just powerful payroll.
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: 16,
              maxWidth: 760,
              margin: "0 auto",
            }}
          >
            {/* Free */}
            <Reveal dir="left">
              <div
                style={{
                  ...glass,
                  borderRadius: 28,
                  padding: "2.5rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background:
                      "linear-gradient(to right,transparent,rgba(255,255,255,0.1),transparent)",
                  }}
                />
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.62rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Starter
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "3rem",
                      fontWeight: 900,
                      letterSpacing: "-0.05em",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    FREE
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.35)",
                    marginBottom: "2rem",
                  }}
                >
                  For growing Zambian businesses
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {PRICING_FEATURES.slice(0, 5).map((f) => (
                    <div
                      key={f}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <CheckCircle2
                        size={14}
                        color="#14b8a6"
                        style={{ flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: "0.83rem",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/login"
                  className="cta-ghost"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "2rem",
                    display: "flex",
                  }}
                >
                  Get started free
                </Link>
              </div>
            </Reveal>

            {/* Pro */}
            <Reveal dir="right" delay={80}>
              <div
                className="animated-border"
                style={{
                  ...glassTeal,
                  borderRadius: 28,
                  padding: "2.5rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: "linear-gradient(to right,#14b8a6,#34d399)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle,rgba(20,184,166,0.15) 0%,transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.62rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "rgba(20,184,166,0.8)",
                      margin: 0,
                    }}
                  >
                    Pro
                  </p>
                  <span
                    style={{
                      ...glassTeal,
                      borderRadius: 99,
                      padding: "3px 10px",
                      fontSize: "0.6rem",
                      fontFamily: "monospace",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#14b8a6",
                    }}
                  >
                    Popular
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "3rem",
                      fontWeight: 900,
                      letterSpacing: "-0.05em",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    FREE
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: "2rem",
                  }}
                >
                  During early access — all features included
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {PRICING_FEATURES.map((f) => (
                    <div
                      key={f}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <CheckCircle2
                        size={14}
                        color="#14b8a6"
                        style={{ flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: "0.83rem",
                          color: "rgba(255,255,255,0.65)",
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/login"
                  className="cta-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "2rem",
                    display: "flex",
                  }}
                >
                  Start for free <ArrowRight size={15} />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <hr className="glow-rule" style={{ maxWidth: 800, margin: "0 auto" }} />

        {/* ── CTA ── */}
        <section
          id="cta"
          style={{
            maxWidth: 1100,
            margin: "0 auto 5rem",
            padding: "6rem 1.5rem 0",
          }}
        >
          <Reveal>
            <div
              style={{
                ...glassStrong,
                borderRadius: 32,
                overflow: "hidden",
                position: "relative",
                padding: "clamp(3rem,7vw,5rem) clamp(2rem,6vw,5rem)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 600,
                  height: 600,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle,rgba(20,184,166,0.09) 0%,transparent 65%)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                  background:
                    "linear-gradient(to bottom,rgba(20,184,166,0.04),transparent)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -120,
                  right: -120,
                  width: 360,
                  height: 360,
                  borderRadius: "50%",
                  border: "1px solid rgba(20,184,166,0.08)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -80,
                  right: -80,
                  width: 280,
                  height: 280,
                  borderRadius: "50%",
                  border: "1px solid rgba(20,184,166,0.12)",
                  pointerEvents: "none",
                }}
              />

              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(20,184,166,0.55)",
                  marginBottom: "1rem",
                }}
              >
                Get started today
              </p>
              <h2
                style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: "clamp(2rem,5vw,3.2rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  marginBottom: "1rem",
                  lineHeight: 1.1,
                }}
              >
                Ready to simplify
                <br />
                <em style={{ fontStyle: "italic", color: "#14b8a6" }}>
                  your payroll?
                </em>
              </h2>
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "rgba(255,255,255,0.38)",
                  maxWidth: 380,
                  margin: "0 auto 2.25rem",
                  lineHeight: 1.75,
                }}
              >
                Join companies across Zambia running accurate, compliant payroll
                in under a minute.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to="/login"
                  className="cta-primary"
                  style={{ padding: "13px 32px", fontSize: "0.9rem" }}
                >
                  Create free account <ArrowRight size={16} />
                </Link>
                <a
                  href="#features"
                  className="cta-ghost"
                  style={{ padding: "13px 24px", fontSize: "0.9rem" }}
                >
                  Learn more
                </a>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                  background:
                    "linear-gradient(to top,rgba(8,15,26,0.35),transparent)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "2.5rem 1.5rem",
          maxWidth: 1100,
          margin: "3rem auto 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: "linear-gradient(135deg,#14b8a6,#34d399)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.68rem",
                fontWeight: 900,
                color: "white",
              }}
            >
              N
            </div>
            <div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.04em",
                }}
              >
                NexaPayslip
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.58rem",
                  color: "rgba(255,255,255,0.2)",
                }}
              >
                Built for Zambia
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {[
              ["Features", "#features"],
              ["How it works", "#how"],
              ["Reviews", "#reviews"],
              ["Pricing", "#pricing"],
            ].map(([l, h]) => (
              <a
                key={l}
                href={h}
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,0.25)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(20,184,166,0.7)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.25)")
                }
              >
                {l}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,0.2)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(20,184,166,0.7)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.2)")
                }
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.15)",
            }}
          >
            © {new Date().getFullYear()} NexaPayslip. All rights reserved.
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.15)",
            }}
          >
            angelphiri.2021@gmail.com
          </span>
        </div>
      </footer>
    </div>
  );
}
