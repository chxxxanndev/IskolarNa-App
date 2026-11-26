/** Turn Supabase's technical messages into something a student can act on. */
export const friendlyError = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Incorrect email or password.";
  if (m.includes("already registered"))
    return "An account with this email already exists.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first. Check your inbox.";
  if (m.includes("rate limit"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("network")) return "No internet connection. Please try again.";
  return message;
};

/** What every function in src/api returns: the data, or a message a student can read. Never both. */
export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };