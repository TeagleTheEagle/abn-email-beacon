"use client";

import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const searchSchema = z.object({
  code: z.string().optional(),
  type: z.string().optional(),
  redirect: z.string().optional(),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  score = Object.values(checks).filter(Boolean).length;

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-destructive",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];

  return (
    <div className="space-y-2" role="group" aria-label="Password strength">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Strength:</span>
        <span className={`font-medium ${score > 0 ? colors[score - 1] : "text-muted-foreground"}`}>
          {labels[score] || labels[0]}
        </span>
      </div>
      <div
        className="h-1.5 bg-surface-2 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={score * 20}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full transition-all duration-300 ${colors[score - 1] || "bg-transparent"}`}
          style={{ width: `${score * 20}%` }}
        />
      </div>
      <ul className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        {Object.entries(checks).map(([key, passed]) => (
          <li key={key} className="flex items-center gap-1">
            <CheckCircle
              className={`h-3 w-3 ${passed ? "text-green-500" : "text-muted-foreground"}`}
              aria-hidden="true"
            />
            <span className={passed ? "text-green-500" : ""}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <div
      className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-3"
      role="alert"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

function FormSuccess({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <div
      className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded p-3"
      role="status"
    >
      <CheckCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

function ResetPasswordRouteComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/reset-password" });
  const parsedSearch = searchSchema.parse(search);
  const code = parsedSearch.code;
  const type = parsedSearch.type;
  const redirect = parsedSearch.redirect ?? "/_authenticated/account";

  const [isRecovering, setIsRecovering] = useState(true);
  const [recoveryError, setRecoveryError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [formSuccess, setFormSuccess] = useState<string | undefined>();

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const recoverSession = async () => {
      if (!code || type !== "recovery") {
        setIsRecovering(false);
        setRecoveryError("Invalid or missing reset link. Please request a new password reset.");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setRecoveryError(error.message);
      }

      setIsRecovering(false);
    };

    recoverSession();
  }, [code, type]);

  const handleSubmit = async (data: ResetPasswordForm) => {
    setIsSubmitting(true);
    setFormError(undefined);
    setFormSuccess(undefined);

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setFormError(error.message);
      setIsSubmitting(false);
      return;
    }

    setFormSuccess("Password updated! Redirecting to your account…");
    setTimeout(() => navigate({ to: redirect }), 1500);
  };

  if (isRecovering) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6"
            aria-label="Teague Industries home"
          >
            <svg
              className="h-10 w-10 text-primary"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path
                d="M8 16L14 22L24 10"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div className="glass p-8 rounded-xl">
            <Loader2
              className="h-10 w-10 animate-spin text-primary mx-auto mb-4"
              aria-hidden="true"
            />
            <h1 className="font-display text-xl font-bold text-foreground mb-2">
              Verifying reset link…
            </h1>
            <p className="text-muted-foreground">
              Please wait while we validate your password reset link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (recoveryError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6"
            aria-label="Teague Industries home"
          >
            <svg
              className="h-10 w-10 text-primary"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path
                d="M8 16L14 22L24 10"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div className="glass p-8 rounded-xl">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold text-foreground mb-2">
              Invalid reset link
            </h1>
            <p className="text-muted-foreground mb-6">{recoveryError}</p>
            <Link to="/auth" className="btn-chrome inline-flex">
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6"
            aria-label="Teague Industries home"
          >
            <svg
              className="h-10 w-10 text-primary"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path
                d="M8 16L14 22L24 10"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground">Teague Industries</h1>
          <p className="mt-2 text-muted-foreground">Create a new password</p>
        </div>

        <Card className="glass">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Reset password</CardTitle>
            <CardDescription>
              Your new password must be different from previous passwords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormError message={formError} />
            <FormSuccess message={formSuccess} />
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="password" className="label">
                  New password
                </Label>
                <div className="relative mt-1.5">
                  <Lock
                    className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="field pl-10 pr-12"
                    autoComplete="new-password"
                    {...form.register("password")}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="mt-1 text-sm text-destructive" role="alert">
                    {form.formState.errors.password.message}
                  </p>
                )}
                <PasswordStrength password={form.watch("password")} />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="label">
                  Confirm new password
                </Label>
                <div className="relative mt-1.5">
                  <Lock
                    className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="field pl-10 pr-12"
                    autoComplete="new-password"
                    {...form.register("confirmPassword")}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive" role="alert">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Updating password…
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4">
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary-soft hover:text-primary underline">
                <ArrowLeft className="h-4 w-4 inline mr-1" aria-hidden="true" />
                Back to sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordRouteComponent,
});
