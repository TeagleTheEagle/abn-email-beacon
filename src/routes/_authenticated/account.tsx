"use client";

import { Link, useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Key,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format } from "date-fns";
import {
  changePasswordWithVerification,
  isGoogleOnlyUser,
  sendPasswordSetupLink,
} from "@/lib/account-security";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  business_name: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

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

function PasswordField({
  label,
  type,
  onToggle,
  showPassword,
  name,
  ...props
}: {
  label: string;
  type: "password" | "text";
  onToggle: () => void;
  showPassword: boolean;
  name: string;
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
          autoComplete={name.includes("current") ? "current-password" : "new-password"}
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

function InfoRow({
  label,
  value,
  icon: Icon,
  emptyText = "Not set",
}: {
  label: string;
  value: string | null | undefined;
  icon: React.ComponentType<{ className?: string }>;
  emptyText?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">
          {value || <span className="text-muted-foreground">{emptyText}</span>}
        </p>
      </div>
    </div>
  );
}

function AccountRouteComponent() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();

  // Route guard: session state lives in AuthProvider (client-side), so the
  // redirect happens once it has loaded. Protected routes live in the
  // `_authenticated/` pathless folder; add this effect to each one.
  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/auth", search: { redirect: "/account" }, replace: true });
    }
  }, [loading, user, navigate]);

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "danger">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();
  const [saveSuccess, setSaveSuccess] = useState<string | undefined>();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [passwordSuccess, setPasswordSuccess] = useState<string | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [signOutError, setSignOutError] = useState<string | undefined>();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      business_name: profile?.business_name || "",
      phone: profile?.phone || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    profileForm.reset({
      full_name: profile?.full_name || "",
      business_name: profile?.business_name || "",
      phone: profile?.phone || "",
    });
  }, [profile, user?.id, profileForm]);

  const handleProfileSave = async (data: ProfileForm) => {
    if (!user) return;
    setIsSaving(true);
    setSaveError(undefined);
    setSaveSuccess(undefined);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name || null,
          business_name: data.business_name || null,
          phone: data.phone || null,
        })
        .eq("id", user.id);
      if (error) {
        setSaveError(error.message);
        return;
      }
      const refreshed = await refreshProfile();
      if (refreshed.error) {
        setSaveError(
          "Profile was saved, but the latest details could not be loaded. Refresh the page.",
        );
        return;
      }
      setSaveSuccess("Profile updated successfully");
      setTimeout(() => setSaveSuccess(undefined), 3000);
    } catch {
      setSaveError("Could not update your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (data: PasswordForm) => {
    setIsChangingPassword(true);
    setPasswordError(undefined);
    setPasswordSuccess(undefined);
    try {
      if (!user?.email) {
        setPasswordError("Your session has expired. Please sign in again.");
        return;
      }
      const result = await changePasswordWithVerification(
        supabase.auth,
        user.email,
        data.currentPassword,
        data.newPassword,
        user.id,
      );
      if (!result.success) {
        setPasswordError(result.error);
        return;
      }
      setPasswordSuccess("Password changed successfully");
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(undefined), 3000);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordSetup = async () => {
    if (!user?.email) {
      setPasswordError("Your session has expired. Please sign in again.");
      return;
    }
    setIsChangingPassword(true);
    setPasswordError(undefined);
    setPasswordSuccess(undefined);
    try {
      const result = await sendPasswordSetupLink(
        supabase.auth,
        user.email,
        `${window.location.origin}/reset-password`,
      );
      if (result.success) setPasswordSuccess("Check your email for a secure password setup link.");
      else setPasswordError(result.error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOutEverywhere = async () => {
    setSignOutError(undefined);
    const result = await signOut("global");
    if (result.error) {
      setSignOutError(`Could not sign out everywhere: ${result.error}`);
      return;
    }
    navigate({ to: "/" });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(undefined);

    // Deleting an auth.users row needs the service role key, so it runs
    // server-side; we prove identity with our own session JWT.
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setDeleteError("Please sign in again to confirm.");
      setIsDeleting(false);
      return;
    }

    let response: Response;
    try {
      response = await fetch("/api/delete-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      setDeleteError("Network error. Please try again.");
      setIsDeleting(false);
      return;
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setDeleteError(
        payload["error"] ?? "Could not delete your account. Please contact us for help.",
      );
      setIsDeleting(false);
      return;
    }

    await signOut("local", true);
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl mx-auto px-4 py-12">
          <div className="h-8 bg-surface-2 rounded w-1/4" />
          <div className="h-48 bg-surface-2 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-40 bg-surface-2 rounded" />
            <div className="h-40 bg-surface-2 rounded" />
            <div className="h-40 bg-surface-2 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting to /auth via the effect above
  }

  const displayName = profile?.full_name || profile?.business_name || user.email || "Account";
  const googleOnly = isGoogleOnlyUser(user);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/50 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Client Portal</h1>
              <p className="mt-1 text-muted-foreground">Manage your account and projects</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/enquiries" className="btn-chrome text-sm">
                Enquiry pipeline
              </Link>
              <Link to="/" className="btn-chrome text-sm">
                Back to site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Member since{" "}
                {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "—"}
              </p>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "profile" | "security" | "danger")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 glass-hover">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" aria-hidden="true" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" aria-hidden="true" />
              Security
            </TabsTrigger>
            <TabsTrigger value="danger">
              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Danger zone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6" forceMount>
            <Card className="glass">
              <CardHeader>
                <CardTitle>Profile information</CardTitle>
                <CardDescription>Update your personal and business details</CardDescription>
              </CardHeader>
              <CardContent>
                <FormError message={saveError} />
                <FormSuccess message={saveSuccess} />
                <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="full_name" className="label">
                        Full name
                      </Label>
                      <div className="relative mt-1.5">
                        <User
                          className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          id="full_name"
                          placeholder="Jane Smith"
                          className="field pl-10"
                          {...profileForm.register("full_name")}
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="business_name" className="label">
                        Business name
                      </Label>
                      <div className="relative mt-1.5">
                        <User
                          className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          id="business_name"
                          placeholder="Acme Pty Ltd"
                          className="field pl-10"
                          {...profileForm.register("business_name")}
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="phone" className="label">
                        Phone (Australian format)
                      </Label>
                      <div className="relative mt-1.5">
                        <Phone
                          className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          id="phone"
                          placeholder="+61 4XX XXX XXX"
                          className="field pl-10"
                          {...profileForm.register("phone")}
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border flex justify-end">
                    <Button type="submit" className="btn-primary" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                          Save changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="glass mt-6">
              <CardHeader>
                <CardTitle>Account information</CardTitle>
                <CardDescription>These details cannot be changed here</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                <InfoRow label="Email" value={user.email} icon={Mail} />
                <InfoRow label="User ID" value={user.id} icon={Shield} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6" forceMount>
            <Card className="glass">
              <CardHeader>
                <CardTitle>Change password</CardTitle>
                <CardDescription>
                  {googleOnly
                    ? "This account currently uses Google sign-in"
                    : "Your current password is required to set a new one"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormError message={passwordError} />
                <FormSuccess message={passwordSuccess} />
                {googleOnly ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      You do not need to enter a current password. We can email you a secure link to
                      create one for this account.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePasswordSetup}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Mail className="h-4 w-4" aria-hidden="true" />
                      )}
                      Email me a password setup link
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                    className="space-y-4"
                  >
                    <PasswordField
                      label="Current password"
                      type={showCurrentPassword ? "text" : "password"}
                      onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                      showPassword={showCurrentPassword}
                      {...passwordForm.register("currentPassword")}
                      disabled={isChangingPassword}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="mt-1 text-sm text-destructive" role="alert">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                    <PasswordField
                      label="New password"
                      type={showNewPassword ? "text" : "password"}
                      onToggle={() => setShowNewPassword(!showNewPassword)}
                      showPassword={showNewPassword}
                      {...passwordForm.register("newPassword")}
                      disabled={isChangingPassword}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="mt-1 text-sm text-destructive" role="alert">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                    <PasswordField
                      label="Confirm new password"
                      type={showConfirmPassword ? "text" : "password"}
                      onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                      showPassword={showConfirmPassword}
                      {...passwordForm.register("confirmPassword")}
                      disabled={isChangingPassword}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-destructive" role="alert">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                    <div className="pt-4 border-t border-border flex justify-end">
                      <Button type="submit" className="btn-primary" disabled={isChangingPassword}>
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                            Changing…
                          </>
                        ) : (
                          <>
                            <Key className="mr-2 h-4 w-4" aria-hidden="true" />
                            Change password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="glass mt-6 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                  Delete account
                </CardTitle>
                <CardDescription>
                  Permanently delete your sign-in and private profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This action is irreversible. Your sign-in and profile will be removed. Enquiries
                  and order records are separate and are not deleted automatically.
                </p>
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto"
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Delete my account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Delete account?</DialogTitle>
                      <DialogDescription>
                        This deletes your sign-in and private profile, not separate enquiry or order
                        records. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <FormError message={deleteError} />
                    <div className="flex gap-3 justify-end pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => setIsDeleteDialogOpen(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                            Deleting…
                          </>
                        ) : (
                          "Delete account"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="mt-6" forceMount>
            <Card className="glass border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                  Danger zone
                </CardTitle>
                <CardDescription>Irreversible actions that affect your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h3 className="font-medium text-destructive mb-2 flex items-center gap-2">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete account
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your sign-in and private profile. Separate enquiries and
                    order records are not deleted automatically. This action cannot be undone.
                  </p>
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" disabled={isDeleting}>
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        Delete my account
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Delete account?</DialogTitle>
                        <DialogDescription>
                          This deletes your sign-in and private profile, not separate enquiry or
                          order records. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <FormError message={deleteError} />
                      <div className="flex gap-3 justify-end pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => setIsDeleteDialogOpen(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                              Deleting…
                            </>
                          ) : (
                            "Delete account"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <h3 className="font-medium text-yellow-500 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" aria-hidden="true" />
                    Sign out everywhere
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign out of all devices and invalidate all sessions. You'll need to sign in
                    again on each device.
                  </p>
                  <FormError message={signOutError} />
                  <Button variant="outline" onClick={handleSignOutEverywhere} disabled={isDeleting}>
                    Sign out everywhere
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountRouteComponent,
});
