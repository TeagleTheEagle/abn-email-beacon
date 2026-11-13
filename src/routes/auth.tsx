"use client";

import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
    businessName: z.string().min(2, "Business name must be at least 2 characters").optional(),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const FORGOT_PASSWORD_SCHEMA = z.object({
  email: z.string().email("Enter a valid email address"),
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
  );
}

function PasswordField({
  label,
  name,
  type,
  onToggle,
  showPassword,
  ...props
}: {
  label: string;
  name: string;
  type: "password" | "text";
  onToggle: () => void;
  showPassword: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Label htmlFor={name} className="label">
        {label}
      </Label>
      <div className="relative mt-1.5">
        <Input
          id={name}
          name={name}
          type={type}
          className="field pr-12"
          autoComplete={name === "password" ? "current-password" : "new-password"}
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
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

function OAuthButton({
  provider,
  label,
  onClick,
  disabled,
}: {
  provider: "google";
  label: string;
  onClick: () => Promise<void>;
  disabled: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      onClick={onClick}
      disabled={disabled}
      aria-busy={disabled}
    >
      {provider === "google" && <GoogleIcon className="h-5 w-5" />}
      {label}
    </Button>
  );
}

function AuthRouteComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const parsedSearch = searchSchema.parse(search);
  const { user, loading: authLoading } = useAuth();
  const requestedRedirect = parsedSearch.redirect;
  const redirect =
    requestedRedirect && requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "/account";

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [formSuccess, setFormSuccess] = useState<string | undefined>();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState<string | undefined>();
  const [forgotSuccess, setForgotSuccess] = useState<string | undefined>();

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", businessName: "", email: "", password: "", confirmPassword: "" },
  });

  const forgotForm = useForm<z.infer<typeof FORGOT_PASSWORD_SCHEMA>>({
    resolver: zodResolver(FORGOT_PASSWORD_SCHEMA),
    defaultValues: { email: "" },
  });

  const handleSignIn = async (data: SignInForm) => {
    setIsSubmitting(true);
    setFormError(undefined);
    setFormSuccess(undefined);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setFormError(error.message);
      setIsSubmitting(false);
      return;
    }

    setFormSuccess("Welcome back! Redirecting…");
    setTimeout(() => navigate({ to: redirect }), 800);
  };

  const handleSignUp = async (data: SignUpForm) => {
    setIsSubmitting(true);
    setFormError(undefined);
    setFormSuccess(undefined);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          business_name: data.businessName,
        },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      setFormError(error.message);
      setIsSubmitting(false);
      return;
    }

    setFormSuccess(
      "Check your email to confirm your account. You'll be redirected after confirmation.",
    );
    setTimeout(() => navigate({ to: redirect }), 3000);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setFormError(undefined);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });

    if (error) {
      setFormError(error.message);
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (data: z.infer<typeof FORGOT_PASSWORD_SCHEMA>) => {
    setIsForgotSubmitting(true);
    setForgotError(undefined);
    setForgotSuccess(undefined);

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setForgotError(error.message);
      setIsForgotSubmitting(false);
      return;
    }

    setForgotSuccess("Password reset link sent! Check your inbox.");
    setIsForgotSubmitting(false);
    setTimeout(() => setIsForgotPasswordOpen(false), 2000);
  };

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
          <p className="mt-2 text-muted-foreground">Sign in to your client portal</p>
        </div>

        <Card className="glass">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Client Portal</CardTitle>
            <CardDescription>
              Access your projects, manage your account, and track progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "signin" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 glass-hover">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              {activeTab === "signin" && (
                <TabsContent value="signin" className="mt-6 space-y-4" forceMount>
                  <FormError message={formError} />
                  <FormSuccess message={formSuccess} />
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="label">
                        Email
                      </Label>
                      <div className="relative mt-1.5">
                        <Mail
                          className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="field pl-10"
                          autoComplete="email"
                          {...signInForm.register("email")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {signInForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-destructive" role="alert">
                          {signInForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <PasswordField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      onToggle={() => setShowPassword(!showPassword)}
                      showPassword={showPassword}
                      {...signInForm.register("password")}
                      disabled={isSubmitting}
                    />
                    {signInForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-destructive" role="alert">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          {...signInForm.register("remember")}
                        />
                        <span>Remember me</span>
                      </label>
                      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-sm text-primary-soft hover:text-primary underline"
                          >
                            Forgot password?
                          </button>
                        </DialogTrigger>
                        <DialogContent className="glass max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Reset your password</DialogTitle>
                            <DialogDescription>
                              Enter your email and we'll send you a link to create a new password.
                            </DialogDescription>
                          </DialogHeader>
                          <form
                            onSubmit={forgotForm.handleSubmit(handleForgotPassword)}
                            className="space-y-4"
                          >
                            <FormError message={forgotError} />
                            <FormSuccess message={forgotSuccess} />
                            <div>
                              <Label htmlFor="forgot-email" className="label">
                                Email
                              </Label>
                              <div className="relative mt-1.5">
                                <Mail
                                  className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground"
                                  aria-hidden="true"
                                />
                                <Input
                                  id="forgot-email"
                                  type="email"
                                  placeholder="you@example.com"
                                  className="field pl-10"
                                  autoComplete="email"
                                  {...forgotForm.register("email")}
                                  disabled={isForgotSubmitting}
                                />
                              </div>
                              {forgotForm.formState.errors.email && (
                                <p className="mt-1 text-sm text-destructive" role="alert">
                                  {forgotForm.formState.errors.email.message}
                                </p>
                              )}
                            </div>
                            <Button type="submit" className="w-full" disabled={isForgotSubmitting}>
                              {isForgotSubmitting ? (
                                <>
                                  <Loader2
                                    className="mr-2 h-4 w-4 animate-spin"
                                    aria-hidden="true"
                                  />
                                  Sending…
                                </>
                              ) : (
                                "Send reset link"
                              )}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Button
                      type="submit"
                      className="w-full btn-primary"
                      disabled={isSubmitting || authLoading}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                          Signing in…
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </form>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <OAuthButton
                    provider="google"
                    label="Continue with Google"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting || authLoading}
                  />
                </TabsContent>
              )}

              {activeTab === "signup" && (
                <TabsContent value="signup" className="mt-6 space-y-4" forceMount>
                  <FormError message={formError} />
                  <FormSuccess message={formSuccess} />
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="fullName" className="label">
                          Full name (optional)
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Jane Smith"
                          className="field"
                          {...signUpForm.register("fullName")}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessName" className="label">
                          Business name (optional)
                        </Label>
                        <Input
                          id="businessName"
                          placeholder="Acme Pty Ltd"
                          className="field"
                          {...signUpForm.register("businessName")}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="label">
                        Email
                      </Label>
                      <div className="relative mt-1.5">
                        <Mail
                          className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="field pl-10"
                          autoComplete="email"
                          {...signUpForm.register("email")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {signUpForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-destructive" role="alert">
                          {signUpForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <PasswordField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      onToggle={() => setShowPassword(!showPassword)}
                      showPassword={showPassword}
                      {...signUpForm.register("password")}
                      disabled={isSubmitting}
                    />
                    {signUpForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-destructive" role="alert">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                    <PasswordField
                      label="Confirm password"
                      type={showConfirmPassword ? "text" : "password"}
                      onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                      showPassword={showConfirmPassword}
                      {...signUpForm.register("confirmPassword")}
                      disabled={isSubmitting}
                    />
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-destructive" role="alert">
                        {signUpForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="w-full btn-primary"
                      disabled={isSubmitting || authLoading}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                          Creating account…
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </form>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <OAuthButton
                    provider="google"
                    label="Continue with Google"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting || authLoading}
                  />
                  <p className="mt-6 text-center text-xs text-muted-foreground">
                    By creating an account, you agree to our{" "}
                    <Link to="/terms" className="underline hover:text-foreground">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="underline hover:text-foreground">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4">
            <p className="text-center text-sm text-muted-foreground">
              Questions?{" "}
              <Link to="/contact" className="text-primary-soft hover:text-primary underline">
                Contact us
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/auth")({
  component: AuthRouteComponent,
});
