import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { firebase } from "@/integrations/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
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
  if (!error || typeof error !== "object" || !("code" in error)) {
    return error instanceof Error ? error.message : "Authentication failed";
  }

  switch ((error as AuthError).code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Invalid email or password, or Email/Password sign-in is not enabled in Firebase.";
    case "auth/user-not-found":
      return "No account exists for that email address.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "An account with that email already exists.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled before completion.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Authentication.";
    default:
      return error instanceof Error ? error.message : "Authentication failed";
  }
}

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    reset();
  };

  const handleGoogleAuth = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(firebase.auth, provider);
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    setError("");
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
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4 md:p-0 overflow-hidden">
      {/* Back to home */}
      <Link
        to="/"
        className="absolute left-8 top-8 z-50 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="relative flex h-[600px] w-full max-w-[1000px] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* Content Panel (Left/Right) */}
        <div
          className={`absolute inset-y-0 z-20 hidden w-1/2 flex-col items-center justify-center bg-primary p-12 text-primary-foreground transition-all duration-700 ease-in-out md:flex ${
            isSignUp ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tighter">
              {isSignUp ? "New Here?" : "Welcome Back"}
            </h2>
            <p className="mt-4 text-lg opacity-80">
              {isSignUp
                ? "Sign up and start managing your company payroll with ease today."
                : "If you already have an account, just sign in. We've missed you!"}
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="mt-8 h-12 px-10 font-bold"
              onClick={toggleMode}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </div>
        </div>

        {/* Form Panel (Right/Left) */}
        <div
          className={`absolute inset-y-0 flex w-full flex-col justify-center p-8 transition-all duration-700 ease-in-out md:w-1/2 md:p-16 ${
            isSignUp ? "translate-x-0" : "md:translate-x-full"
          }`}
        >
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 md:hidden">
              <h1 className="text-2xl font-black tracking-tighter">
                NexaPayslips
              </h1>
            </div>

            <h2 className="text-3xl font-black tracking-tighter text-foreground">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isSignUp
                ? "Enter your details to register"
                : "Enter your credentials to access your account"}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
              {error && (
                <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  className="h-12 rounded-xl border-border bg-muted/30 focus-visible:ring-primary"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    title="Password"
                    className="font-bold"
                  >
                    Password
                  </Label>
                  {!isSignUp && (
                    <button
                      type="button"
                      className="text-xs font-bold text-muted-foreground hover:text-primary"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-border bg-muted/30 focus-visible:ring-primary"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="mt-4 h-12 w-full rounded-xl text-base font-bold"
                disabled={isSubmitting || isGoogleLoading}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/70" />
                </div>
                <div className="relative flex justify-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  <span className="bg-card px-3">or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-6 h-12 w-full rounded-xl border-border bg-background font-bold"
                disabled={isSubmitting || isGoogleLoading}
                onClick={handleGoogleAuth}
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                    >
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
              </Button>
            </div>

            <div className="mt-8 text-center md:hidden">
              <p className="text-sm text-muted-foreground">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  onClick={toggleMode}
                  className="font-bold text-primary hover:underline"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
