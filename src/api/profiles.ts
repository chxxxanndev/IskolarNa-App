import { supabase } from "@/api/client";
import { friendlyError, type ApiResult } from "@/api/errors";

/** One row of the `profiles` table (the columns the app reads). Any column can be empty. */
export type ProfileRow = {
  name: string | null;
  role: string | null;
  level: string | null;
  strand: string | null;
  municipality: string | null;
  needs_scholarship: string | null;
};

/** The signed-in student's profile. `data` is null when they have no row yet. */
export async function getProfile(
  userId: string,
): Promise<ApiResult<ProfileRow | null>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("name, role, level, strand, municipality, needs_scholarship")
    .eq("id", userId)
    .maybeSingle();
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: data as ProfileRow | null, error: null };
}