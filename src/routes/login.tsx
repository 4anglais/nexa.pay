import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { firebase } from "@/integrations/firebase/client";
import { Loader2, ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import {
  type AuthError,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — NexaPayslips" },
      { name: "description", content: "Sign in to your NexaPayslips account" },
    ],
  }),
  component: LoginPage,
});

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type AuthFormData = z.infer<typeof authSchema>;

function getAuthErrorMessage(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error))
    return error instanceof Error ? error.message : "Authentication failed";
  switch ((error as AuthError).code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Invalid email or password.";
    case "auth/user-not-found":
      return "No account found for that email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "An account with that email already exists.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase.";
    default:
      return error instanceof Error ? error.message : "Authentication failed";
  }
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  teal: "#2dd4bf",
  tealDim: "#14b8a6",
  tealGlow: "rgba(45,212,191,0.15)",
  tealBorder: "rgba(45,212,191,0.28)",
  silver: "rgba(220,228,235,0.90)",
  silverMid: "rgba(190,202,212,0.55)",
  silverDim: "rgba(160,175,188,0.32)",
  bg0: "#080e14",
  bg1: "#0b1520",
  bg2: "#0e1c2a",
  white10: "rgba(255,255,255,0.10)",
  white14: "rgba(255,255,255,0.14)",
};

const glass: React.CSSProperties = {
  background: "rgba(14,28,42,0.55)",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: `1px solid ${C.white14}`,
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09)",
};

const glassStrong: React.CSSProperties = {
  background: "rgba(11,21,32,0.72)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  border: `1px solid ${C.white14}`,
  boxShadow:
    "0 24px 64px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.10)",
};

const LOGIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  @keyframes orbFloat {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(36px,-28px) scale(1.04); }
    66%      { transform:translate(-18px,18px) scale(0.97); }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes panelIn {
    from { opacity:0; transform:translateX(18px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  .lp-input {
    width:100%; height:48px;
    background: rgba(14,28,42,0.60);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    color: rgba(220,228,235,0.90);
    font-size: 0.88rem;
    font-family: 'Outfit', system-ui, sans-serif;
    padding: 0 14px 0 44px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .lp-input::placeholder { color: rgba(160,175,188,0.30); }
  .lp-input:focus {
    border-color: rgba(45,212,191,0.45);
    box-shadow: 0 0 0 3px rgba(45,212,191,0.10);
    background: rgba(14,28,42,0.80);
  }
  .lp-input.pr { padding-right: 44px; }

  .lp-btn-primary {
    width:100%; height:48px; border-radius:12px; border:none; cursor:pointer;
    background: #2dd4bf;
    color: #080e14; font-size:0.9rem; font-weight:700;
    font-family:'Outfit',system-ui,sans-serif;
    display:flex; align-items:center; justify-content:center; gap:8px;
    box-shadow: 0 4px 20px rgba(45,212,191,0.28);
    transition: all 0.22s ease;
  }
  .lp-btn-primary:hover:not(:disabled) {
    background: #14b8a6;
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(45,212,191,0.38);
  }
  .lp-btn-primary:disabled { opacity:0.45; cursor:not-allowed; }

  .lp-btn-google {
    width:100%; height:48px; border-radius:12px; cursor:pointer;
    background: rgba(14,28,42,0.50);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(190,202,212,0.75); font-size:0.88rem; font-weight:500;
    font-family:'Outfit',system-ui,sans-serif;
    display:flex; align-items:center; justify-content:center; gap:10px;
    transition: all 0.22s ease;
  }
  .lp-btn-google:hover:not(:disabled) {
    background: rgba(14,28,42,0.80);
    border-color: rgba(255,255,255,0.20);
    color: rgba(220,228,235,0.90);
  }
  .lp-btn-google:disabled { opacity:0.45; cursor:not-allowed; }

  .lp-toggle {
    background:none; border:none; cursor:pointer; padding:0;
    color: #2dd4bf; font-size:0.82rem; font-weight:600;
    font-family:'Outfit',system-ui,sans-serif;
    transition: color 0.2s;
  }
  .lp-toggle:hover { color: #67e8f9; text-decoration:underline; }
  .spin { animation: spin 1s linear infinite; }
`;

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthFormData>({ resolver: zodResolver(authSchema) });

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    reset();
  };

  const handleGoogleAuth = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      const p = new GoogleAuthProvider();
      p.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(firebase.auth, p);
      navigate({ to: "/dashboard" });
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    setError("");
    try {
      if (isSignUp)
        await createUserWithEmailAndPassword(
          firebase.auth,
          data.email,
          data.password,
        );
      else
        await signInWithEmailAndPassword(
          firebase.auth,
          data.email,
          data.password,
        );
      navigate({ to: "/dashboard" });
    } catch (e) {
      setError(getAuthErrorMessage(e));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(150deg,${C.bg0} 0%,${C.bg1} 50%,${C.bg2} 100%)`,
        fontFamily: "'Outfit','SF Pro Display',system-ui,sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{LOGIN_CSS}</style>

      {/* Orbs */}
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
            width: 600,
            height: 600,
            borderRadius: "50%",
            top: "-18%",
            left: "-10%",
            background:
              "radial-gradient(circle,rgba(20,184,166,0.12) 0%,transparent 68%)",
            animation: "orbFloat 16s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            bottom: "-14%",
            right: "-8%",
            background:
              "radial-gradient(circle,rgba(45,212,191,0.08) 0%,transparent 68%)",
            animation: "orbFloat 20s ease-in-out infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            top: "35%",
            right: "22%",
            background:
              "radial-gradient(circle,rgba(190,202,212,0.04) 0%,transparent 68%)",
            animation: "orbFloat 26s ease-in-out infinite",
          }}
        />
      </div>

      {/* Back */}
      <Link
        to="/"
        style={{
          position: "absolute",
          top: 22,
          left: 22,
          zIndex: 50,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.76rem",
          color: C.silverDim,
          textDecoration: "none",
          ...glass,
          borderRadius: 10,
          padding: "6px 12px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = C.silver;
          (e.currentTarget as HTMLAnchorElement).style.borderColor =
            C.tealBorder;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color = C.silverDim;
          (e.currentTarget as HTMLAnchorElement).style.borderColor = C.white14;
        }}
      >
        <ArrowLeft size={13} /> Back
      </Link>

      {/* Main card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          width: "100%",
          maxWidth: 940,
          minHeight: 575,
          borderRadius: 26,
          overflow: "hidden",
          ...glassStrong,
          animation: "fadeSlideUp 0.65s ease both",
        }}
      >
        {/* Left — branding */}
        <div
          style={{
            width: "42%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 2.5rem",
            borderRight: `1px solid ${C.white10}`,
            background: "rgba(8,14,20,0.35)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* teal orb inside panel */}
          <div
            style={{
              position: "absolute",
              width: 380,
              height: 380,
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              background: `radial-gradient(circle,${C.tealGlow} 0%,transparent 65%)`,
              pointerEvents: "none",
              transition: "opacity 0.8s",
            }}
          />

          <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
            {/* Logo */}
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 18,
                background: C.tealGlow,
                border: `1px solid ${C.tealBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.6rem",
                boxShadow: `0 8px 28px rgba(45,212,191,0.18), inset 0 1px 0 rgba(255,255,255,0.12)`,
              }}
            >
              <span
                style={{
                  fontSize: "1.55rem",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: C.teal,
                }}
              >
                N
              </span>
            </div>

            <p
              style={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.silverDim,
                marginBottom: "0.45rem",
              }}
            >
              NexaPayslips
            </p>

            <h2
              style={{
                fontSize: "clamp(1.55rem,2.5vw,2.1rem)",
                fontWeight: 700,
                letterSpacing: "-0.038em",
                lineHeight: 1.1,
                margin: "0 0 0.9rem",
                color: C.silver,
              }}
            >
              {isSignUp ? "Start your journey" : "Welcome back"}
            </h2>
            <p
              style={{
                fontSize: "0.83rem",
                color: C.silverMid,
                lineHeight: 1.65,
                maxWidth: 210,
                margin: "0 auto 1.8rem",
              }}
            >
              {isSignUp
                ? "Join companies across Zambia managing payroll with ease."
                : "Sign in to manage your payroll, employees and payslips."}
            </p>

            <button
              onClick={toggleMode}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 22px",
                borderRadius: 11,
                background: "rgba(45,212,191,0.08)",
                border: `1px solid ${C.tealBorder}`,
                color: C.teal,
                fontSize: "0.82rem",
                fontWeight: 500,
                fontFamily: "'Outfit',system-ui,sans-serif",
                cursor: "pointer",
                transition: "all 0.2s",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  C.tealGlow;
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  `0 4px 16px rgba(45,212,191,0.18)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(45,212,191,0.08)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              {isSignUp ? "Already have an account?" : "New here? Sign up"}
            </button>

            {/* Tag pills */}
            <div
              style={{
                display: "flex",
                gap: 5,
                justifyContent: "center",
                marginTop: "2.2rem",
                flexWrap: "wrap",
              }}
            >
              {["PAYE", "NAPSA", "NHIMA", "PDF"].map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.56rem",
                    letterSpacing: "0.1em",
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "rgba(45,212,191,0.06)",
                    border: `1px solid rgba(45,212,191,0.16)`,
                    color: `rgba(45,212,191,0.45)`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "3rem clamp(1.5rem,4vw,3.5rem)",
            animation: "panelIn 0.5s 0.15s ease both",
          }}
        >
          <div style={{ maxWidth: 350, width: "100%" }}>
            <h2
              style={{
                fontSize: "1.65rem",
                fontWeight: 700,
                letterSpacing: "-0.038em",
                margin: "0 0 0.35rem",
                color: C.silver,
              }}
            >
              {isSignUp ? "Create account" : "Sign in"}
            </h2>
            <p
              style={{
                fontSize: "0.82rem",
                color: C.silverMid,
                margin: "0 0 1.8rem",
              }}
            >
              {isSignUp
                ? "Enter your details to get started"
                : "Enter your credentials to continue"}
            </p>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.10)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 11,
                  padding: "9px 14px",
                  marginBottom: "1.1rem",
                  fontSize: "0.81rem",
                  color: "rgba(252,165,165,0.88)",
                }}
              >
                {error}
              </div>
            )}

            {/* Google */}
            <button
              className="lp-btn-google"
              onClick={handleGoogleAuth}
              disabled={isSubmitting || isGoogleLoading}
              style={{ marginBottom: "1.1rem" }}
            >
              {isGoogleLoading ? (
                <Loader2 size={17} className="spin" />
              ) : (
                <>
                  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M21.35 11.1H12v2.98h5.38c-.23 1.48-1.07 2.74-2.28 3.59v2.98h3.69c2.16-1.99 3.41-4.93 3.41-8.4 0-.71-.06-1.41-.17-2.05Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 21c2.7 0 4.96-.9 6.61-2.43l-3.69-2.98c-1.03.69-2.34 1.1-3.92 1.1-3 0-5.54-2.02-6.45-4.74H.74v3.08A9.99 9.99 0 0 0 12 21Z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.55 11.95A6 6 0 0 1 5.2 10c0-.68.12-1.34.35-1.95V4.97H.74A10 10 0 0 0 0 10c0 1.62.39 3.15 1.08 4.5l4.47-2.55Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 3.98c1.47 0 2.79.51 3.82 1.5l2.86-2.86C16.95.99 14.69 0 12 0A9.99 9.99 0 0 0 .74 4.97l4.81 3.08c.91-2.72 3.45-4.07 6.45-4.07Z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "1.1rem",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: C.white10 }} />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.58rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: C.silverDim,
                }}
              >
                or
              </span>
              <div style={{ flex: 1, height: "1px", background: C.white10 }} />
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              {/* Email */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.73rem",
                    fontWeight: 600,
                    color: C.silverMid,
                    marginBottom: 5,
                    letterSpacing: "0.02em",
                  }}
                >
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={14}
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: C.silverDim,
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    className="lp-input"
                    type="email"
                    placeholder="admin@company.com"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "rgba(252,165,165,0.82)",
                      marginTop: 3,
                    }}
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.73rem",
                      fontWeight: 600,
                      color: C.silverMid,
                      letterSpacing: "0.02em",
                    }}
                  >
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.7rem",
                        color: `rgba(45,212,191,0.65)`,
                        fontFamily: "'Outfit',system-ui,sans-serif",
                        padding: 0,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          C.teal;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          `rgba(45,212,191,0.65)`;
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={14}
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: C.silverDim,
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    className="lp-input pr"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: C.silverDim,
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        C.silver;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        C.silverDim;
                    }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "rgba(252,165,165,0.82)",
                      marginTop: 3,
                    }}
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="lp-btn-primary"
                disabled={isSubmitting || isGoogleLoading}
                style={{ marginTop: "0.2rem" }}
              >
                {isSubmitting ? (
                  <Loader2 size={17} className="spin" />
                ) : isSignUp ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p
              style={{
                marginTop: "1.4rem",
                textAlign: "center",
                fontSize: "0.78rem",
                color: C.silverDim,
              }}
            >
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              <button className="lp-toggle" onClick={toggleMode}>
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
