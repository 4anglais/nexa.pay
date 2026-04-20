import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
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
    desc: "Run full payroll — salaries, PAYE, NAPSA & NHIMA — in under 60 seconds. Zero spreadsheets.",
    accent: "#38bdf8",
  },
  {
    icon: FileText,
    title: "PDF Payslip Generation",
    desc: "Beautiful, compliant PDF payslips generated instantly and ready to download or share.",
    accent: "#a78bfa",
  },
  {
    icon: Mail,
    title: "Email Delivery",
    desc: "Deliver payslips directly to every employee inbox with one click. No manual sending.",
    accent: "#34d399",
  },
  {
    icon: Users,
    title: "Employee Management",
    desc: "Centralised employee records, contract history and payroll data — always up to date.",
    accent: "#fb923c",
  },
  {
    icon: Lock,
    title: "Secure & Encrypted",
    desc: "End-to-end encrypted payroll data with automated backups. Your data stays safe.",
    accent: "#f472b6",
  },
];

const FEATURES = [
  {
    icon: Calculator,
    title: "Smart Payroll Runs",
    desc: "Automated salary, PAYE, NAPSA & NHIMA calculations — no spreadsheets, no errors.",
    accent: "#38bdf8",
    tag: "Core",
  },
  {
    icon: Users,
    title: "Employee Management",
    desc: "Centralised records, contracts and payroll history in one beautiful interface.",
    accent: "#a78bfa",
    tag: "Core",
  },
  {
    icon: Zap,
    title: "Instant Payslips",
    desc: "Professional, branded PDF payslips generated and delivered in seconds.",
    accent: "#34d399",
    tag: "Output",
  },
  {
    icon: Shield,
    title: "ZRA Compliant",
    desc: "Built end-to-end for Zambian statutory regulations and all filing periods.",
    accent: "#fb923c",
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
    accent: "#facc15",
    tag: "Security",
  },
];

const STATS = [
  { value: "< 60s", label: "Payroll run time" },
  { value: "100%", label: "ZRA compliant" },
  { value: "0 ZMW", label: "Setup fee" },
];

// ─── Shared glass styles ──────────────────────────────────────────────────────
const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.16)",
};

const glassStrong: React.CSSProperties = {
  background: "rgba(255,255,255,0.09)",
  backdropFilter: "blur(32px) saturate(200%)",
  WebkitBackdropFilter: "blur(32px) saturate(200%)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow:
    "0 16px 48px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.20)",
};

// ─── Global keyframes injected once ──────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  @keyframes orbFloat {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(40px,-30px) scale(1.05); }
    66%      { transform:translate(-20px,20px) scale(0.97); }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes pulse-ring {
    0%,100% { transform:scale(1); opacity:0.7; }
    50%     { transform:scale(1.4); opacity:0; }
  }
  @keyframes ticker {
    0%   { transform:translateX(0); }
    100% { transform:translateX(-50%); }
  }
  @keyframes slideReveal {
    from { opacity:0; transform:translateY(12px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  /* Apple-style scroll reveal */
  .feat-card {
    opacity: 0;
    transform: translateY(60px) scale(0.96);
    transition: opacity 0.75s cubic-bezier(.16,1,.3,1),
                transform 0.75s cubic-bezier(.16,1,.3,1),
                box-shadow 0.3s ease;
  }
  .feat-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  .feat-card:hover {
    transform: translateY(-5px) scale(1.01) !important;
  }
  .feat-section-title {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1);
  }
  .feat-section-title.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

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
          width: 700,
          height: 700,
          borderRadius: "50%",
          top: "-15%",
          left: "-10%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.16) 0%, transparent 70%)",
          animation: "orbFloat 14s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          bottom: "-10%",
          right: "-8%",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.16) 0%, transparent 70%)",
          animation: "orbFloat 18s ease-in-out infinite reverse",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          top: "40%",
          left: "38%",
          background:
            "radial-gradient(circle, rgba(52,211,153,0.10) 0%, transparent 70%)",
          animation: "orbFloat 22s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
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

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "10px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "3rem",
          width: "max-content",
          animation: "ticker 30s linear infinite",
        }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: "0.68rem",
              fontFamily: "monospace",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {item}
            <span
              style={{ marginLeft: "3rem", color: "rgba(255,255,255,0.12)" }}
            >
              ·
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
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[active];
  const Icon = slide.icon;

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <div
        style={{
          ...glassStrong,
          borderRadius: 24,
          padding: "2rem",
          transition: "opacity 0.38s ease, transform 0.38s ease",
          opacity: leaving ? 0 : 1,
          transform: leaving
            ? "translateY(14px) scale(0.97)"
            : "translateY(0) scale(1)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: `${slide.accent}18`,
            border: `1px solid ${slide.accent}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem",
            boxShadow: `0 4px 20px ${slide.accent}22`,
          }}
        >
          <Icon size={22} color={slide.accent} />
        </div>
        <h3
          style={{
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            marginBottom: "0.55rem",
            letterSpacing: "-0.02em",
          }}
        >
          {slide.title}
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.5)",
            margin: 0,
          }}
        >
          {slide.desc}
        </p>
      </div>

      {/* Progress dots */}
      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
          marginTop: "1.25rem",
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? 24 : 7,
              height: 7,
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              transition: "all 0.35s ease",
              background:
                i === active
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(255,255,255,0.2)",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Scroll-reveal feature card ───────────────────────────────────────────────
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
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="feat-card"
      style={{
        ...glass,
        borderRadius: 20,
        padding: "1.6rem",
        transitionDelay: `${delay}ms`,
        cursor: "default",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          background: `${accent}15`,
          border: `1px solid ${accent}35`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.1rem",
          boxShadow: `0 4px 16px ${accent}18`,
        }}
      >
        <Icon size={19} color={accent} />
      </div>
      <h3
        style={{
          fontSize: "0.95rem",
          fontWeight: 600,
          color: "rgba(255,255,255,0.92)",
          marginBottom: "0.45rem",
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.82rem",
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.45)",
          margin: 0,
        }}
      >
        {desc}
      </p>
    </div>
  );
}

// ─── Stat glass card ──────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        ...glass,
        borderRadius: 16,
        padding: "1.4rem 1rem",
        textAlign: "center",
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: "clamp(1.5rem,3.5vw,2rem)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          background:
            "linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.55) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.65rem",
          fontFamily: "monospace",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          marginTop: "0.3rem",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Scroll-reveal section title ──────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
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
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="feat-section-title">
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function LandingPage() {
  const bgStyle: React.CSSProperties = {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #080d1a 0%, #0c1526 45%, #0f172a 100%)",
    color: "#fff",
    fontFamily: "'Outfit', 'SF Pro Display', system-ui, sans-serif",
    position: "relative",
    overflowX: "hidden",
  };

  // ── MAINTENANCE ─────────────────────────────────────────────────────────────
  if (MAINTENANCE_MODE) {
    return (
      <div style={bgStyle}>
        <style>{GLOBAL_CSS}</style>
        <Orbs />
        <Ticker />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 40px)",
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
                fontSize: "0.68rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                marginBottom: "1rem",
              }}
            >
              NexaPayslips
            </div>

            {/* Pulsing badge */}
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
                  fontSize: "0.62rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Maintenance in progress
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.4rem,6vw,4rem)",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.04em",
                margin: 0,
              }}
            >
              Back{" "}
              <em
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  background: "linear-gradient(90deg,#7dd3fc,#a78bfa,#7dd3fc)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 4s linear infinite",
                }}
              >
                shortly
              </em>
              ,
              <br />
              <span
                style={{ color: "rgba(255,255,255,0.28)", fontWeight: 300 }}
              >
                better than ever.
              </span>
            </h1>
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.4)",
                maxWidth: 360,
                lineHeight: 1.65,
              }}
            >
              We are upgrading the system to deliver a faster, more reliable
              payroll experience.
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
                padding: "9px 20px",
                display: "inline-block",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                Expected downtime: 2 – 5 days
              </span>
            </div>
            <br />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.25)",
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
    <div style={bgStyle}>
      <style>{GLOBAL_CSS}</style>
      <Orbs />

      {/* Navbar */}
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
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.82rem",
              letterSpacing: "0.06em",
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            NexaPayslips
          </span>

          <nav style={{ display: "flex", gap: "2rem" }}>
            {[
              ["Features", "#features"],
              ["Why us", "#stats"],
              ["Pricing", "#cta"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.42)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.9)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.42)")
                }
              >
                {label}
              </a>
            ))}
          </nav>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link
              to="/login"
              style={{
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.45)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 10,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,0.45)";
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
                background: "rgba(255,255,255,0.11)",
                border: "1px solid rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(255,255,255,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(255,255,255,0.11)";
              }}
            >
              Get started <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 10, paddingTop: 56 }}>
        {/* Hero */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "clamp(5rem,12vh,9rem) 1.5rem 5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              ...glass,
              borderRadius: 99,
              padding: "5px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              animation: "fadeSlideUp 0.7s ease both",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#34d399",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              Built for Zambia
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.8rem,7.5vw,5.5rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.048em",
              margin: 0,
              animation: "fadeSlideUp 0.7s 0.1s ease both",
            }}
          >
            Payroll that moves{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg,#7dd3fc 0%,#818cf8 50%,#c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              at the speed
            </span>
            <br />
            <span style={{ color: "rgba(255,255,255,0.28)", fontWeight: 300 }}>
              of your business.
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(0.9rem,2vw,1.05rem)",
              color: "rgba(255,255,255,0.42)",
              maxWidth: 500,
              lineHeight: 1.75,
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
            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "13px 28px",
                borderRadius: 14,
                background:
                  "linear-gradient(135deg,rgba(125,211,252,0.22) 0%,rgba(129,140,248,0.22) 100%)",
                border: "1px solid rgba(125,211,252,0.32)",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
                backdropFilter: "blur(12px)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 14px 36px rgba(125,211,252,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              }}
            >
              Start for free <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "13px 28px",
                borderRadius: 14,
                ...glass,
                color: "rgba(255,255,255,0.65)",
                fontSize: "0.9rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(255,255,255,0.65)";
              }}
            >
              See features
            </a>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "1rem",
              width: "100%",
              maxWidth: 460,
              animation: "fadeSlideUp 0.7s 0.4s ease both",
            }}
          >
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </section>

        <Ticker />

        {/* Features — Apple-style scroll reveal */}
        <section
          id="features"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 1.5rem" }}
        >
          <SectionTitle>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.28)",
                  marginBottom: 14,
                }}
              >
                Features
              </p>
              <h2
                style={{
                  fontSize: "clamp(1.9rem,4.5vw,3rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.038em",
                  margin: 0,
                  lineHeight: 1.12,
                }}
              >
                Everything to run payroll,
                <br />
                <span
                  style={{ color: "rgba(255,255,255,0.28)", fontWeight: 300 }}
                >
                  nothing you don't need.
                </span>
              </h2>
            </div>
          </SectionTitle>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%,280px),1fr))",
              gap: 16,
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 90} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          id="cta"
          style={{ maxWidth: 1100, margin: "0 auto 5rem", padding: "0 1.5rem" }}
        >
          <div
            style={{
              ...glassStrong,
              borderRadius: 28,
              padding: "clamp(2.5rem,6vw,4.5rem) clamp(1.5rem,5vw,4rem)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 500,
                height: 500,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(129,140,248,0.10) 0%,transparent 65%)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                pointerEvents: "none",
              }}
            />
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)",
                marginBottom: "1rem",
              }}
            >
              Get started today
            </p>
            <h2
              style={{
                fontSize: "clamp(1.8rem,4vw,2.8rem)",
                fontWeight: 700,
                letterSpacing: "-0.035em",
                marginBottom: "1rem",
              }}
            >
              Ready to simplify your payroll?
            </h2>
            <p
              style={{
                fontSize: "0.88rem",
                color: "rgba(255,255,255,0.4)",
                maxWidth: 400,
                margin: "0 auto 2rem",
                lineHeight: 1.7,
              }}
            >
              Join companies across Zambia running accurate, compliant payroll
              in under a minute.
            </p>
            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 30px",
                borderRadius: 14,
                background:
                  "linear-gradient(135deg,rgba(125,211,252,0.2) 0%,rgba(192,132,252,0.2) 100%)",
                border: "1px solid rgba(192,132,252,0.32)",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
                backdropFilter: "blur(12px)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 16px 40px rgba(192,132,252,0.22)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              }}
            >
              Create free account <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "1.5rem",
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.65rem",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          © {new Date().getFullYear()} NexaPayslips. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Privacy", "Terms", "Contact"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.22)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.22)")
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
