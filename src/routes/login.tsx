import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { firebase } from "@/integrations/firebase/client";
import {
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

const C = {
  bg: "#131F2F",
  green: "#23F77A",
  red: "#E03B16",
  white: "#FFFFFF",
} as const;

const sans: React.CSSProperties = {
  fontFamily: "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};
const serif: React.CSSProperties = {
  fontFamily: "'DM Serif Display', 'Playfair Display', Georgia, serif",
};

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const loginFeatures = [
  { icon: Zap, label: "Instant payroll processing" },
  { icon: ShieldCheck, label: "Bank-grade security" },
  { icon: Sparkles, label: "Smart ZRA compliance" },
];

const signupFeatures = [
  { icon: Sparkles, label: "Free to get started" },
  { icon: Zap, label: "First payslip in 5 minutes" },
  { icon: ShieldCheck, label: "NAPSA & NHIMA built-in" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const switchMode = (val: boolean) => {
    setIsSignUp(val);
    setError("");
    reset();
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(firebase.auth, provider);
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      setError(e.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(
          firebase.auth,
          data.email,
          data.password,
        );
      } else {
        await signInWithEmailAndPassword(
          firebase.auth,
          data.email,
          data.password,
        );
      }
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      setError(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const features = isSignUp ? signupFeatures : loginFeatures;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: C.bg }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-48 -left-48 h-[560px] w-[560px] rounded-full"
          style={{ background: "rgba(35,247,122,0.07)", filter: "blur(120px)" }}
        />
        <div
          className="absolute -bottom-36 -right-36 h-[400px] w-[400px] rounded-full"
          style={{ background: "rgba(35,247,122,0.05)", filter: "blur(100px)" }}
        />
        <div
          className="absolute top-1/2 left-1/3 -translate-y-1/2 h-64 w-64 rounded-full"
          style={{ background: "rgba(35,247,122,0.04)", filter: "blur(80px)" }}
        />
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-[860px] min-h-[580px] flex overflow-hidden"
        style={{
          borderRadius: "28px",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 0 0 1px rgba(35,247,122,0.05), 0 40px 100px rgba(0,0,0,0.75), 0 12px 48px rgba(35,247,122,0.1), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          className="relative hidden md:flex w-[44%] flex-shrink-0 flex-col overflow-hidden"
          style={{
            borderRadius: "28px 0 0 28px",
            background: "rgba(35,247,122,0.03)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              borderRadius: "28px 0 0 28px",
            }}
          />
          {/* Green glow corner */}
          <div
            className="absolute -top-28 -left-28 h-80 w-80 rounded-full pointer-events-none"
            style={{
              background: "rgba(35,247,122,0.1)",
              filter: "blur(100px)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 h-40 w-40 rounded-full pointer-events-none"
            style={{
              background: "rgba(35,247,122,0.06)",
              filter: "blur(60px)",
            }}
          />
          {/* Edge fade */}
          <div
            className="absolute inset-y-0 right-0 w-12 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(19,31,47,0.25))",
            }}
          />

          <div className="relative z-20 flex flex-col justify-between h-full p-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 flex items-center justify-center font-black text-base shrink-0"
                style={{
                  borderRadius: "12px",
                  backgroundColor: C.green,
                  color: C.bg,
                  boxShadow:
                    "0 4px 20px rgba(35,247,122,0.45), 0 8px 40px rgba(35,247,122,0.2)",
                  ...sans,
                }}
              >
                N
              </div>
              <span
                className="text-sm font-bold tracking-tight"
                style={{ color: C.white, ...sans }}
              >
                NexaPayslip
              </span>
            </div>

            {/* Headline */}
            <div className="flex flex-col gap-4">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: C.green, ...sans }}
              >
                {isSignUp ? "Join today" : "Payroll made simple"}
              </p>

              <div className="relative h-[96px]">
                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    opacity: isSignUp ? 0 : 1,
                    transform: isSignUp ? "translateX(-24px)" : "translateX(0)",
                    transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)",
                  }}
                >
                  <h1
                    className="text-[42px] leading-[1.04] tracking-tight"
                    style={{ color: C.white, fontWeight: 400, ...serif }}
                  >
                    Welcome
                    <br />
                    <em style={{ color: C.green, fontStyle: "italic" }}>
                      back.
                    </em>
                  </h1>
                </div>
                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    opacity: isSignUp ? 1 : 0,
                    transform: isSignUp ? "translateX(0)" : "translateX(24px)",
                    transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)",
                  }}
                >
                  <h1
                    className="text-[42px] leading-[1.04] tracking-tight"
                    style={{ color: C.white, fontWeight: 400, ...serif }}
                  >
                    New
                    <br />
                    <em style={{ color: C.green, fontStyle: "italic" }}>
                      here?
                    </em>
                  </h1>
                </div>
              </div>

              <p
                className="text-sm leading-relaxed max-w-[210px]"
                style={{ color: "rgba(255,255,255,0.45)", ...sans }}
              >
                {isSignUp
                  ? "Set up your company payroll in minutes — no spreadsheets, no stress."
                  : "Your payroll dashboard is ready. Pick up right where you left off."}
              </p>
            </div>

            {/* Feature bullets */}
            <div className="flex flex-col gap-3">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 flex items-center justify-center shrink-0"
                    style={{
                      borderRadius: "10px",
                      background: "rgba(35,247,122,0.1)",
                      border: "1px solid rgba(35,247,122,0.2)",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: C.green }} />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "rgba(255,255,255,0.5)", ...sans }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 relative overflow-hidden">
          {/* LOGIN */}
          <div
            className="absolute inset-0 flex flex-col justify-center px-10 py-10 transition-all duration-500"
            style={{
              opacity: isSignUp ? 0 : 1,
              transform: isSignUp ? "translateX(20px)" : "translateX(0)",
              transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)",
              pointerEvents: isSignUp ? "none" : "auto",
            }}
          >
            <AuthForm
              mode="login"
              error={!isSignUp ? error : ""}
              onGoogle={handleGoogle}
              googleLoading={googleLoading}
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              loading={loading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              onSwitch={() => switchMode(true)}
            />
          </div>

          {/* SIGNUP */}
          <div
            className="absolute inset-0 flex flex-col justify-center px-10 py-10 transition-all duration-500"
            style={{
              opacity: isSignUp ? 1 : 0,
              transform: isSignUp ? "translateX(0)" : "translateX(-20px)",
              transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)",
              pointerEvents: isSignUp ? "auto" : "none",
            }}
          >
            <AuthForm
              mode="signup"
              error={isSignUp ? error : ""}
              onGoogle={handleGoogle}
              googleLoading={googleLoading}
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              loading={loading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              onSwitch={() => switchMode(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthForm({
  mode,
  error,
  onGoogle,
  googleLoading,
  register,
  errors,
  isSubmitting,
  loading,
  showPassword,
  setShowPassword,
  handleSubmit,
  onSubmit,
  onSwitch,
}: {
  mode: "login" | "signup";
  error: string;
  onGoogle: () => void;
  googleLoading: boolean;
  register: any;
  errors: any;
  isSubmitting: boolean;
  loading: boolean;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  handleSubmit: any;
  onSubmit: any;
  onSwitch: () => void;
}) {
  const isSignUp = mode === "signup";

  const inputBase: React.CSSProperties = {
    width: "100%",
    borderRadius: "14px",
    padding: "11px 14px",
    fontSize: "14px",
    outline: "none",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: C.white,
    transition: "border-color 0.2s, box-shadow 0.2s",
    ...sans,
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(35,247,122,0.5)";
    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(35,247,122,0.08)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="w-full max-w-[320px] mx-auto">
      {isSignUp ? (
        <button
          onClick={onSwitch}
          className="inline-flex items-center gap-1.5 mb-8 transition-opacity hover:opacity-70"
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.45)",
            ...sans,
          }}
        >
          <ArrowLeft className="h-3 w-3" /> Back to login
        </button>
      ) : (
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mb-8 transition-opacity hover:opacity-70"
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.45)",
            ...sans,
          }}
        >
          <ArrowLeft className="h-3 w-3" /> Home
        </Link>
      )}

      <p
        className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-2"
        style={{ color: C.green, ...sans }}
      >
        {isSignUp ? "Get started" : "Sign in"}
      </p>
      <h2
        className="tracking-tight mb-1.5"
        style={{
          fontSize: "26px",
          lineHeight: 1.1,
          color: C.white,
          fontWeight: 400,
          ...serif,
        }}
      >
        {isSignUp ? "Create your account" : "Good to see you"}
      </h2>
      <p
        className="text-sm leading-relaxed mb-7"
        style={{ color: "rgba(255,255,255,0.45)", ...sans }}
      >
        {isSignUp
          ? "Join thousands of Zambian businesses on NexaPayslip."
          : "Enter your credentials to access your dashboard."}
      </p>

      {error && (
        <div
          className="mb-5 px-3.5 py-3 text-xs font-semibold"
          style={{
            borderRadius: "14px",
            background: "rgba(224,59,22,0.12)",
            border: "1px solid rgba(224,59,22,0.3)",
            color: C.red,
            ...sans,
          }}
        >
          {error}
        </div>
      )}

      {/* Google button */}
      <button
        type="button"
        onClick={onGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 mb-5 transition-all duration-200 disabled:opacity-60"
        style={{
          borderRadius: "14px",
          padding: "10px 16px",
          background: C.white,
          border: "1.5px solid #e2e2e2",
          color: "#111",
          fontSize: "14px",
          fontWeight: 600,
          cursor: googleLoading ? "not-allowed" : "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
          ...sans,
        }}
        onMouseEnter={(e) => {
          if (!googleLoading)
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.35)";
        }}
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#111" }} />
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" className="shrink-0">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {isSignUp ? "Sign up with Google" : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex-1 h-px"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
        <span
          className="text-xs font-medium"
          style={{ color: "rgba(255,255,255,0.35)", ...sans }}
        >
          or
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            className="block text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "rgba(255,255,255,0.45)", ...sans }}
          >
            Email
          </label>
          <input
            placeholder="you@company.com"
            style={inputBase}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...register("email")}
          />
          {errors.email && (
            <p
              className="text-xs font-semibold"
              style={{ color: C.red, ...sans }}
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            className="block text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "rgba(255,255,255,0.45)", ...sans }}
          >
            Password
          </label>
          <div className="relative">
            <input
              placeholder={isSignUp ? "Min. 6 characters" : "••••••••"}
              type={showPassword ? "text" : "password"}
              style={{ ...inputBase, paddingRight: "40px" }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p
              className="text-xs font-semibold"
              style={{ color: C.red, ...sans }}
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full flex items-center justify-center gap-2 font-bold transition-all duration-200 mt-1 disabled:opacity-60"
          style={{
            borderRadius: "14px",
            padding: "11px 16px",
            background: C.green,
            color: C.bg,
            fontSize: "14px",
            fontWeight: 700,
            border: "none",
            cursor: isSubmitting || loading ? "not-allowed" : "pointer",
            boxShadow:
              "0 4px 20px rgba(35,247,122,0.38), 0 8px 40px rgba(35,247,122,0.18), inset 0 1px 0 rgba(255,255,255,0.15)",
            ...sans,
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting && !loading) {
              e.currentTarget.style.boxShadow =
                "0 6px 28px rgba(35,247,122,0.5), 0 12px 48px rgba(35,247,122,0.25), inset 0 1px 0 rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              "0 4px 20px rgba(35,247,122,0.38), 0 8px 40px rgba(35,247,122,0.18), inset 0 1px 0 rgba(255,255,255,0.15)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading
            ? isSignUp
              ? "Creating account…"
              : "Signing in…"
            : isSignUp
              ? "Create Account"
              : "Sign In"}
        </button>
      </form>

      <p
        className="mt-6 text-center text-xs"
        style={{ color: "rgba(255,255,255,0.4)", ...sans }}
      >
        {isSignUp ? "Already have an account? " : "Don't have an account? "}
        <button
          onClick={onSwitch}
          className="font-bold transition-opacity hover:opacity-80"
          style={{ color: C.green }}
        >
          {isSignUp ? "Sign in" : "Create one →"}
        </button>
      </p>
    </div>
  );
}
