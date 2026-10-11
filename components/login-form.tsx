"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { markCurrentUserAsGuest } from "@/lib/queries/profiles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const deactivated = searchParams.get("error");
    if (deactivated === "deactivated") {
      setError("Your account has been deactivated. Contact an administrator.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsGoogleLoading(false);
    }
  };

  /**
   * Guest mode via Supabase Anonymous Sign-In.
   * IMPORTANT: Enable Anonymous Sign-Ins in the Supabase Dashboard:
   * Authentication → Providers → Anonymous → Enable.
   */
  const handleGuestLogin = async () => {
    const supabase = createClient();
    setIsGuestLoading(true);
    setError(null);

    try {
      const { error: anonError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            is_guest: true,
            full_name: "Guest",
          },
        },
      });

      if (anonError) {
        console.error("Anonymous sign-in error:", anonError);
        setError(
          "Guest sign-in is not available right now. Please sign up instead.",
        );
        setIsGuestLoading(false);
        return;
      }

      await markCurrentUserAsGuest();
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Anonymous sign-in error:", err);
      setError(
        "Guest sign-in is not available right now. Please sign up instead.",
      );
      setIsGuestLoading(false);
    }
  };

  // Auto-start guest flow when landing from "Try as guest"
  useEffect(() => {
    if (searchParams.get("guest") === "1") {
      void handleGuestLogin();
    }
    // Intentionally once on mount for ?guest=1 deep link
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isGuestLoading}
            className="flex h-11 min-h-[44px] w-full items-center justify-center gap-3 rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 min-h-[44px]"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 min-h-[44px]"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="h-11 min-h-[44px] w-full"
                disabled={isLoading || isGuestLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="h-11 min-h-[44px] w-full text-muted-foreground"
            disabled={isGuestLoading || isLoading}
            onClick={() => void handleGuestLogin()}
          >
            {isGuestLoading ? "Starting guest session…" : "Continue as guest →"}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Guest progress is not saved. Sign in anytime to keep your streak.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
