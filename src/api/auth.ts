import type { User } from "@supabase/supabase-js";

import { supabase } from "@/api/client";
import { friendlyError, type ApiResult } from "@/api/errors";

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  level: string;
  strand: string;
  municipality: string;
  needsScholarship: string;
};

export type SignUpOutcome =
  | { user: User; needsConfirmation: false }
  | { user: null; needsConfirmation: true };

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<ApiResult<User>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user)
    return {
      data: null,
      error: friendlyError(error?.message ?? "Could not sign in."),
    };
  return { data: data.user, error: null };
}

export async function signUpWithEmail(
  input: SignUpInput,
): Promise<ApiResult<SignUpOutcome>> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    // The database trigger copies these into the new `profiles` row.
    options: {
      data: {
        name: input.name,
        level: input.level,
        strand: input.strand,
        municipality: input.municipality,
        needs_scholarship: input.needsScholarship,
      },
    },
  });
  if (error) return { data: null, error: friendlyError(error.message) };
  // "Confirm email" is on: the account exists but there is no session until they confirm.
  if (!data.session || !data.user)
    return { data: { user: null, needsConfirmation: true }, error: null };
  return { data: { user: data.user, needsConfirmation: false }, error: null };
}

/** Signs out this device only, not every device the student is logged in on. */
export function signOutLocal() {
  return supabase.auth.signOut({ scope: "local" });
}

/** The user from the saved session, or null when nobody is signed in. */
export async function getSessionUser(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

/**
 * Calls `callback` whenever the user is signed out (including a session that expired or was revoked).
 * Returns a function that stops listening. The callback must never call Supabase itself:
 * doing that from inside this listener can deadlock the auth client.
 */
export function onSignedOut(callback: () => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") callback();
  });
  return () => data.subscription.unsubscribe();
}

/** Emails a one-time code for resetting the password. The error may say how many seconds to wait. */
export async function requestPasswordCode(email: string): Promise<ApiResult<null>> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: null, error: null };
}

/** Checks the emailed code. A correct code also starts a short session so the password can be changed. */
export async function verifyResetCode(email: string, token: string): Promise<ApiResult<null>> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
  if (error) {
    const wrongOrExpired = /expired|invalid/i.test(error.message);
    return {
      data: null,
      error: wrongOrExpired
        ? "That code is wrong or has expired. Request a new one."
        : friendlyError(error.message),
    };
  }
  return { data: null, error: null };
}

/** Sets a new password for the signed-in user (used right after the reset code is verified). */
export async function updatePassword(password: string): Promise<ApiResult<null>> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    const reused = /different from the old/i.test(error.message);
    return {
      data: null,
      error: reused ? "Choose a password you haven't used before." : friendlyError(error.message),
    };
  }
  return { data: null, error: null };
}