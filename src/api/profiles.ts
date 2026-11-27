import { supabase } from "@/api/client";
import { friendlyError, type ApiResult } from "@/api/errors";
import { uploadImage } from "@/api/images";
import type { PickedImage } from "@/lib/pick-image";

/** One row of the `profiles` table (the columns the app reads). Any column can be empty. */
export type ProfileRow = {
  name: string | null;
  role: string | null;
  level: string | null;
  strand: string | null;
  municipality: string | null;
  needs_scholarship: string | null;
  avatar_url: string | null;
};

/** The signed-in student's profile. `data` is null when they have no row yet. */
export async function getProfile(
  userId: string,
): Promise<ApiResult<ProfileRow | null>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("name, role, level, strand, municipality, needs_scholarship, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: data as ProfileRow | null, error: null };
}

/** Uploads the chosen profile picture and saves its link on the student's profile. */
export async function saveAvatar(userId: string, image: PickedImage): Promise<ApiResult<string>> {
  const uploaded = await uploadImage("avatars", `${userId}/avatar`, image);
  if (uploaded.error !== null) return uploaded;
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: uploaded.data })
    .eq("id", userId);
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: uploaded.data, error: null };
}