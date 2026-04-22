import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

import { MAINTENANCE_MODE } from "@/config/app";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

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

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300&family=DM+Serif+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes orbFloat {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(50px,-40px) scale(1.06); }
    66%      { transform:translate(-30px,25px) scale(0.96); }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(32px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position:-300% center; }
    100% { background-position:300% center; }
  }
  @keyframes pulse-ring {
    0%,100% { transform:scale(1); opacity:0.8; }
    50%     { transform:scale(1.6); opacity:0; }
  }
  @keyframes ticker {
    0%   { transform:translateX(0); }
    100% { transform:translateX(-50%); }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .feat-card {
    opacity: 0;
    transform: translateY(48px) scale(0.97);
    transition:
      opacity 0.8s cubic-bezier(.16,1,.3,1),
      transform 0.8s cubic-bezier(.16,1,.3,1),
      box-shadow 0.3s ease,
      border-color 0.3s ease;
  }
  .feat-card.visible { opacity:1; transform:translateY(0) scale(1); }
  .feat-card:hover { transform:translateY(-6px) scale(1.015) !important; }

  .reveal {
    opacity: 0;
    transform: translateY(44px);
    transition: opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1);
  }
  .reveal.visible { opacity:1; transform:translateY(0); }

  /* Progressive blur overlay utility */
  .blur-fade-bottom {
    -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  }
  .blur-fade-top {
    -webkit-mask-image: linear-gradient(to top, black 60%, transparent 100%);
    mask-image: linear-gradient(to top, black 60%, transparent 100%);
  }

  /* Noise texture overlay */
  .noise::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    border-radius: inherit;
  }

  .nav-link { color: rgba(255,255,255,0.38); text-decoration:none; font-size:0.8rem; transition: color 0.2s; }
  .nav-link:hover { color: rgba(255,255,255,0.88); }

  .cta-primary {
    display:inline-flex; align-items:center; gap:8px;
    padding:12px 26px; border-radius:14px;
    background: linear-gradient(135deg, rgba(20,184,166,0.25), rgba(52,211,153,0.18));
    border: 1px solid rgba(20,184,166,0.45);
    color:#fff; font-weight:700; font-size:0.88rem;
    text-decoration:none; backdrop-filter:blur(12px);
    transition: all 0.25s ease;
    box-shadow: 0 4px 24px rgba(20,184,166,0.15);
  }
  .cta-primary:hover {
    transform:translateY(-2px);
    box-shadow: 0 12px 36px rgba(20,184,166,0.28);
    background: linear-gradient(135deg, rgba(20,184,166,0.35), rgba(52,211,153,0.28));
  }

  .cta-ghost {
    display:inline-flex; align-items:center; gap:8px;
    padding:12px 26px; border-radius:14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.11);
    color:rgba(255,255,255,0.6); font-weight:500; font-size:0.88rem;
    text-decoration:none; backdrop-filter:blur(12px);
    transition: all 0.25s ease;
  }
  .cta-ghost:hover { color:#fff; background: rgba(255,255,255,0.09); }

  /* Horizontal rule with glow */
  .glow-rule {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(20,184,166,0.3), transparent);
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

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
      {/* Primary teal orb — matches app accent */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          top: "-20%",
          left: "-12%",
          background:
            "radial-gradient(circle, rgba(20,184,166,0.13) 0%, transparent 68%)",
          animation: "orbFloat 16s ease-in-out infinite",
        }}
      />
      {/* Emerald secondary */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          bottom: "-12%",
          right: "-10%",
          background:
            "radial-gradient(circle, rgba(52,211,153,0.11) 0%, transparent 68%)",
          animation: "orbFloat 20s ease-in-out infinite reverse",
        }}
      />
      {/* Subtle blue accent */}
      <div
        style={{
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: "50%",
          top: "38%",
          left: "42%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
          animation: "orbFloat 24s ease-in-out infinite",
        }}
      />
      {/* Tiny violet hint */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          top: "15%",
          right: "20%",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)",
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
          transition: "opacity 0.38s, transform 0.38s",
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
      ([entry]) => {
        if (entry.isIntersecting) {
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
      {/* Accent glow in corner */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Progressive blur at bottom of card — masks content edge */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 48,
          background:
            "linear-gradient(to bottom, transparent, rgba(10,17,30,0.55))",
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
      {/* Progressive blur top edge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 20,
          background:
            "linear-gradient(to bottom, rgba(20,184,166,0.08), transparent)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontSize: "clamp(1.5rem,3.5vw,2rem)",
          fontWeight: 800,
          letterSpacing: "-0.045em",
          background:
            "linear-gradient(135deg, #14b8a6 0%, #34d399 60%, rgba(255,255,255,0.7) 100%)",
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

// ─── Section reveal wrapper ───────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useReveal(0.18);
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function LandingPage() {
  const bg: React.CSSProperties = {
    minHeight: "100vh",
    background:
      "linear-gradient(160deg, #060d18 0%, #091422 40%, #0a1a2e 70%, #080f1c 100%)",
    color: "#fff",
    fontFamily: "'DM Sans', system-ui, sans-serif",
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
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "linear-gradient(135deg, #14b8a6, #34d399)",
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
              ["Why us", "#stats"],
              ["Pricing", "#cta"],
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
                  "linear-gradient(135deg, rgba(20,184,166,0.22), rgba(52,211,153,0.15))",
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
          {/* Badge */}
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

          {/* Headline */}
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
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontStyle: "italic",
                fontWeight: 400,
                background:
                  "linear-gradient(135deg, #14b8a6 0%, #34d399 50%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
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

          {/* CTA row */}
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

          {/* Stats row */}
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

          {/* Hero glass panel — fake UI preview with progressive blur */}
          <div
            style={{
              animation: "fadeSlideUp 0.9s 0.55s ease both",
              width: "100%",
              maxWidth: 700,
              marginTop: "2rem",
            }}
          >
            <div
              style={{
                ...glassStrong,
                borderRadius: 24,
                padding: "1.5rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top label bar */}
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
                  PAYROLL — APRIL 2025
                </span>
              </div>

              {/* Fake table rows */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  gap: "2px 0",
                  fontSize: "0.75rem",
                }}
              >
                <div
                  style={{
                    padding: "6px 8px",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "0.6rem",
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Employee
                </div>
                <div
                  style={{
                    padding: "6px 8px",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "0.6rem",
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Gross
                </div>
                <div
                  style={{
                    padding: "6px 8px",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "0.6rem",
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Deductions
                </div>
                <div
                  style={{
                    padding: "6px 8px",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "0.6rem",
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Net Pay
                </div>
                {[
                  ["M. Banda", "K 8,500", "K 935", "K 7,565"],
                  ["C. Phiri", "K 12,000", "K 1,320", "K 10,680"],
                  ["J. Mwale", "K 6,800", "K 748", "K 6,052"],
                  ["R. Tembo", "K 15,400", "K 1,694", "K 13,706"],
                ].map(([name, gross, ded, net]) => (
                  <>
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
                  </>
                ))}
              </div>

              {/* Progressive blur mask fading the table bottom — key effect */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "55%",
                  background:
                    "linear-gradient(to bottom, transparent 0%, rgba(8,15,26,0.85) 100%)",
                  pointerEvents: "none",
                  borderRadius: "0 0 24px 24px",
                }}
              />

              {/* Floating action button overlay */}
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
                  fontFamily: "'DM Serif Display', serif",
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

          {/* Feature grid with progressive blur on sides */}
          <div style={{ position: "relative" }}>
            {/* Left blur fade */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: 60,
                background:
                  "linear-gradient(to right, rgba(6,13,24,0.6), transparent)",
                pointerEvents: "none",
                zIndex: 5,
              }}
            />
            {/* Right blur fade */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: 60,
                background:
                  "linear-gradient(to left, rgba(6,13,24,0.6), transparent)",
                pointerEvents: "none",
                zIndex: 5,
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(100%,270px),1fr))",
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

        {/* ── SOCIAL PROOF / HOW IT WORKS ── */}
        <section
          id="stats"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "7rem 1.5rem" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {/* Left: big glass statement card */}
            <Reveal>
              <div
                style={{
                  ...glassTeal,
                  borderRadius: 28,
                  padding: "2.5rem",
                  position: "relative",
                  overflow: "hidden",
                  gridRow: "span 1",
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
                      "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
                {/* Progressive blur bottom */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    background:
                      "linear-gradient(to bottom, transparent, rgba(8,20,36,0.5))",
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
                    fontFamily: "'DM Serif Display', serif",
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
              </div>
            </Reveal>

            {/* Right: stacked process steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  step: "01",
                  title: "Add your employees",
                  desc: "Import or add employees with their salary details, allowances and deductions.",
                  color: "#14b8a6",
                },
                {
                  step: "02",
                  title: "Run payroll in one click",
                  desc: "PAYE, NAPSA and NHIMA are calculated automatically. Review and confirm.",
                  color: "#34d399",
                },
                {
                  step: "03",
                  title: "Payslips delivered instantly",
                  desc: "PDF payslips are generated and sent to each employee's inbox immediately.",
                  color: "#38bdf8",
                },
              ].map(({ step, title, desc, color }, i) => (
                <Reveal key={step} delay={i * 100}>
                  <div
                    style={{
                      ...glass,
                      borderRadius: 18,
                      padding: "1.25rem 1.4rem",
                      display: "flex",
                      gap: "1rem",
                      alignItems: "flex-start",
                      transition: "all 0.25s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Step accent line */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: `linear-gradient(to bottom, ${color}, transparent)`,
                        borderRadius: "3px 0 0 3px",
                      }}
                    />
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: color,
                        opacity: 0.7,
                        paddingTop: 2,
                        flexShrink: 0,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {step}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.88)",
                          marginBottom: "0.3rem",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {title}
                      </p>
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "rgba(255,255,255,0.38)",
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
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
              {/* Background orb */}
              <div
                style={{
                  position: "absolute",
                  width: 600,
                  height: 600,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(20,184,166,0.09) 0%, transparent 65%)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  pointerEvents: "none",
                }}
              />

              {/* Top progressive blur band */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                  background:
                    "linear-gradient(to bottom, rgba(20,184,166,0.04), transparent)",
                  pointerEvents: "none",
                }}
              />

              {/* Decorative teal ring */}
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
                  fontFamily: "'DM Serif Display', serif",
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

              {/* Bottom blur fade */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 80,
                  background:
                    "linear-gradient(to top, rgba(8,15,26,0.35), transparent)",
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
          padding: "2rem 1.5rem",
          maxWidth: 1100,
          margin: "3rem auto 0",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "linear-gradient(135deg, #14b8a6, #34d399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.6rem",
              fontWeight: 900,
              color: "white",
            }}
          >
            N
          </div>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.62rem",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.04em",
            }}
          >
            © {new Date().getFullYear()} NexaPayslip
          </span>
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Privacy", "Terms", "Contact"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                fontFamily: "monospace",
                fontSize: "0.62rem",
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
      </footer>
    </div>
  );
}
