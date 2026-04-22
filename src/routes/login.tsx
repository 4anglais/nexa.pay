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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient blobs — teal/emerald matches the app's accent palette */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-teal-500/[0.07] blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/[0.07] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-teal-400/[0.04] blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-[860px] min-h-[580px] rounded-3xl border border-border bg-card shadow-2xl flex overflow-hidden">
        {/* ── LEFT PANEL ── */}
        <div className="relative hidden md:flex w-[44%] flex-shrink-0 flex-col overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950/40 via-background/10 to-background dark:from-teal-950/60" />
          {/* Subtle grid using border token */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
          {/* Teal glow */}
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-teal-500/[0.12] blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-4 h-48 w-48 rounded-full bg-emerald-500/[0.08] blur-2xl pointer-events-none" />
          {/* Progressive blur at right edge — blends into right panel */}
          <div className="absolute inset-y-0 right-0 w-14 bg-gradient-to-r from-transparent to-card/80 pointer-events-none z-10" />

          <div className="relative z-20 flex flex-col justify-between h-full p-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-teal-500/25">
                N
              </div>
              <span className="text-sm font-bold text-foreground tracking-tight">
                NexaPayslip
              </span>
            </div>

            {/* Headline — cross-fades on mode switch */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-500 transition-all duration-500">
                {isSignUp ? "Join today" : "Payroll made simple"}
              </p>

              {/* Fixed-height container so layout doesn't shift */}
              <div className="relative h-[92px]">
                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    opacity: isSignUp ? 0 : 1,
                    transform: isSignUp ? "translateX(-24px)" : "translateX(0)",
                    transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)",
                  }}
                >
                  <h1 className="text-[38px] font-bold leading-[1.08] tracking-tight text-foreground">
                    Welcome
                    <br />
                    <span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">
                      back.
                    </span>
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
                  <h1 className="text-[38px] font-bold leading-[1.08] tracking-tight text-foreground">
                    New
                    <br />
                    <span className="bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">
                      here?
                    </span>
                  </h1>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-[210px] transition-all duration-500">
                {isSignUp
                  ? "Set up your company payroll in minutes — no spreadsheets, no stress."
                  : "Your payroll dashboard is ready. Pick up right where you left off."}
              </p>
            </div>

            {/* Feature bullets */}
            <div className="flex flex-col gap-3">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-teal-500" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
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

  return (
    <div className="w-full max-w-[320px] mx-auto">
      {isSignUp ? (
        <button
          onClick={onSwitch}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="h-3 w-3" /> Back to login
        </button>
      ) : (
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="h-3 w-3" /> Home
        </Link>
      )}

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-500 mb-2">
        {isSignUp ? "Get started" : "Sign in"}
      </p>
      <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1.5">
        {isSignUp ? "Create your account" : "Good to see you"}
      </h2>
      <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
        {isSignUp
          ? "Join thousands of Zambian businesses on NexaPayslip."
          : "Enter your credentials to access your dashboard."}
      </p>

      {error && (
        <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-xs font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2.5 rounded-xl mb-5 font-semibold"
        onClick={onGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
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
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email
          </Label>
          <Input
            placeholder="you@company.com"
            className="rounded-xl"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              placeholder={isSignUp ? "Min. 6 characters" : "••••••••"}
              type={showPassword ? "text" : "password"}
              className="rounded-xl pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full rounded-xl gap-2 font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-500/20 border-0 mt-1"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading
            ? isSignUp
              ? "Creating account…"
              : "Signing in…"
            : isSignUp
              ? "Create Account"
              : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {isSignUp ? "Already have an account? " : "Don't have an account? "}
        <button
          onClick={onSwitch}
          className="font-bold text-teal-500 hover:text-teal-400 transition-colors"
        >
          {isSignUp ? "Sign in" : "Create one →"}
        </button>
      </p>
    </div>
  );
}
