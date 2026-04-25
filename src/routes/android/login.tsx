import { Capacitor } from "@capacitor/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { firebase } from "@/integrations/firebase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

export const Route = createFileRoute("/android/login")({
  component: AndroidLoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

type FormData = z.infer<typeof schema>;

// ─── Shared style tokens ────────────────────────────────────────────────────
const C = {
  bg: "#0d1825",
  card: "rgba(255,255,255,0.04)",
  green: "#23F77A",
  red: "#E03B16",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.45)",
  border: "rgba(255,255,255,0.09)",
} as const;

const sans: React.CSSProperties = {
  fontFamily: "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};

function AndroidLoginPage() {
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isSignUp = mode === "signup";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const unsubscribe = firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        navigate({ to: "/android/payslips", replace: true });
      }
    });
    return unsubscribe;
  }, [navigate]);

  // Reset form when switching modes
  useEffect(() => {
    reset();
    setError("");
    setShowPassword(false);
  }, [mode, reset]);

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      if (isNative) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        console.log("ANDROID USER:", result);
        navigate({ to: "/android/payslips", replace: true });
      } else {
        setError("Google sign-in is only available in the mobile app.");
      }
    } catch (err: unknown) {
      console.error("Google login error:", err);
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setError("");
    setEmailLoading(true);
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
      navigate({ to: "/android/payslips", replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
      console.error("Auth error:", msg);
    } finally {
      setEmailLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "16px",
    padding: "14px 16px",
    fontSize: "15px",
    outline: "none",
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${C.border}`,
    color: C.white,
    WebkitAppearance: "none",
    ...sans,
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Ambient glow background */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(35,247,122,0.07)",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-20%",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "rgba(35,247,122,0.04)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "400px",
          padding: "0 20px",
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              height: "52px",
              width: "52px",
              borderRadius: "16px",
              backgroundColor: C.green,
              color: C.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "22px",
              marginBottom: "12px",
              boxShadow:
                "0 4px 24px rgba(35,247,122,0.4), 0 8px 48px rgba(35,247,122,0.18)",
              ...sans,
            }}
          >
            N
          </div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.green,
              ...sans,
            }}
          >
            NexaPayslip
          </p>
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: C.white,
              lineHeight: 1.15,
              marginBottom: "8px",
              ...sans,
            }}
          >
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p style={{ fontSize: "14px", color: C.muted, ...sans }}>
            {isSignUp
              ? "Set up your payroll account in minutes."
              : "Sign in to access your payroll dashboard."}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              borderRadius: "14px",
              padding: "12px 16px",
              marginBottom: "16px",
              background: "rgba(224,59,22,0.12)",
              border: "1px solid rgba(224,59,22,0.3)",
              color: C.red,
              fontSize: "13px",
              fontWeight: 600,
              textAlign: "center",
              ...sans,
            }}
          >
            {error}
          </div>
        )}

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || emailLoading}
          style={{
            width: "100%",
            borderRadius: "16px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: C.white,
            border: "none",
            color: "#111",
            fontSize: "15px",
            fontWeight: 700,
            cursor: googleLoading || emailLoading ? "not-allowed" : "pointer",
            opacity: googleLoading || emailLoading ? 0.6 : 1,
            boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
            marginBottom: "16px",
            minHeight: "52px",
            ...sans,
          }}
        >
          {googleLoading ? (
            <Loader2
              style={{ height: "18px", width: "18px", color: "#111" }}
              className="animate-spin"
            />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              style={{ flexShrink: 0 }}
            >
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
          {googleLoading
            ? "Connecting…"
            : isSignUp
              ? "Sign up with Google"
              : "Continue with Google"}
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: C.border }} />
          <span
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.3)",
              ...sans,
            }}
          >
            or
          </span>
          <div style={{ flex: 1, height: "1px", background: C.border }} />
        </div>

        {/* Email / Password form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.muted,
                marginBottom: "6px",
                ...sans,
              }}
            >
              Email
            </label>
            <input
              placeholder="you@company.com"
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              style={inputStyle}
              {...register("email")}
            />
            {errors.email && (
              <p
                style={{
                  color: C.red,
                  fontSize: "12px",
                  fontWeight: 600,
                  marginTop: "5px",
                  ...sans,
                }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.muted,
                marginBottom: "6px",
                ...sans,
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                placeholder={isSignUp ? "Min. 6 characters" : "••••••••"}
                type={showPassword ? "text" : "password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                style={{ ...inputStyle, paddingRight: "48px" }}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? (
                  <EyeOff style={{ height: "18px", width: "18px" }} />
                ) : (
                  <Eye style={{ height: "18px", width: "18px" }} />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                style={{
                  color: C.red,
                  fontSize: "12px",
                  fontWeight: 600,
                  marginTop: "5px",
                  ...sans,
                }}
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={emailLoading || googleLoading}
            style={{
              width: "100%",
              borderRadius: "16px",
              padding: "14px 16px",
              background: C.green,
              color: C.bg,
              fontSize: "15px",
              fontWeight: 700,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: emailLoading || googleLoading ? "not-allowed" : "pointer",
              opacity: emailLoading || googleLoading ? 0.65 : 1,
              minHeight: "52px",
              marginTop: "4px",
              boxShadow:
                "0 4px 20px rgba(35,247,122,0.35), 0 8px 40px rgba(35,247,122,0.15)",
              ...sans,
            }}
          >
            {emailLoading && (
              <Loader2
                style={{ height: "18px", width: "18px" }}
                className="animate-spin"
              />
            )}
            {emailLoading
              ? isSignUp
                ? "Creating account…"
                : "Signing in…"
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        {/* Switch mode */}
        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "13px",
            color: C.muted,
            ...sans,
          }}
        >
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => setMode(isSignUp ? "login" : "signup")}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: C.green,
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              ...sans,
            }}
          >
            {isSignUp ? "Sign in" : "Create one →"}
          </button>
        </p>

        {/* Footer note */}
        <p
          style={{
            marginTop: "28px",
            textAlign: "center",
            fontSize: "11px",
            color: "rgba(255,255,255,0.25)",
            lineHeight: 1.6,
            ...sans,
          }}
        >
          Signing in connects your Google account to the{" "}
          <span style={{ color: "rgba(255,255,255,0.4)" }}>/android/...</span>{" "}
          workspace.
        </p>
      </div>
    </div>
  );
}
