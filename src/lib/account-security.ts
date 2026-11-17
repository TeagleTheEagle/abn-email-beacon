export interface AccountAuthClient {
  signInWithPassword(credentials: { email: string; password: string }): Promise<{
    data: { session: { access_token: string } | null; user?: { id: string } | null };
    error: Error | null;
  }>;
  updateUser(attributes: { password: string }): Promise<unknown & { error: Error | null }>;
  resetPasswordForEmail(
    email: string,
    options: { redirectTo: string },
  ): Promise<unknown & { error: Error | null }>;
}

export type AccountOperationResult = { success: true } | { success: false; error: string };

export async function changePasswordWithVerification(
  auth: AccountAuthClient,
  email: string,
  currentPassword: string,
  newPassword: string,
  expectedUserId?: string,
): Promise<AccountOperationResult> {
  try {
    // Supabase does not accept a current-password argument on updateUser. Signing in again with the
    // account's own email is the supported credential check and establishes a fresh session.
    const { data, error } = await auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (error) {
      const wrongCredentials = /invalid (?:login )?credentials/i.test(error.message);
      return wrongCredentials
        ? { success: false, error: "Current password is incorrect." }
        : { success: false, error: "Could not verify your current password. Please try again." };
    }
    if (!data.session)
      return { success: false, error: "Your session has expired. Please sign in again." };
    if (expectedUserId && data.user?.id !== expectedUserId)
      return {
        success: false,
        error: "Verified account does not match the signed-in account. Please sign in again.",
      };

    const { error: updateError } = await auth.updateUser({ password: newPassword });
    if (updateError)
      return { success: false, error: "Could not change your password. Please try again." };
    return { success: true };
  } catch {
    return { success: false, error: "Could not verify your current password. Please try again." };
  }
}

export function isGoogleOnlyUser(user: {
  app_metadata: Record<string, unknown>;
  identities?: Array<{ provider: string }>;
}): boolean {
  const metadataProviders = user.app_metadata["providers"];
  const providers = Array.isArray(metadataProviders)
    ? metadataProviders.filter((provider): provider is string => typeof provider === "string")
    : (user.identities ?? []).map((identity) => identity.provider);
  return providers.includes("google") && !providers.includes("email");
}

export async function sendPasswordSetupLink(
  auth: AccountAuthClient,
  email: string,
  redirectTo: string,
): Promise<AccountOperationResult> {
  try {
    const { error } = await auth.resetPasswordForEmail(email, { redirectTo });
    if (error)
      return {
        success: false,
        error: "Could not send the password setup email. Please try again.",
      };
    return { success: true };
  } catch {
    return { success: false, error: "Could not send the password setup email. Please try again." };
  }
}
