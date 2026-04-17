import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";

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

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

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

  const onSubmit = async (data: AuthFormData) => {
    setError("");
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
      }
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
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
              <h1 className="text-2xl font-black tracking-tighter">NexaPayslips</h1>
            </div>
            
            <h2 className="text-3xl font-black tracking-tighter text-foreground">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isSignUp ? "Enter your details to register" : "Enter your credentials to access your account"}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
              {error && (
                <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@company.com" 
                  className="h-12 rounded-xl border-border bg-muted/30 focus-visible:ring-primary"
                  {...register("email")} 
                />
                {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" title="Password" className="font-bold">Password</Label>
                  {!isSignUp && (
                    <button type="button" className="text-xs font-bold text-muted-foreground hover:text-primary">
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
                {errors.password && <p className="text-xs font-medium text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="mt-4 h-12 w-full rounded-xl text-base font-bold" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </form>

            <div className="mt-8 text-center md:hidden">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
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
