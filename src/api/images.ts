import { supabase } from "@/api/client";
import { friendlyError, type ApiResult } from "@/api/errors";
import type { PickedImage } from "@/lib/pick-image";

export type ImageBucket = "avatars" | "catalog-images";

const MAX_BYTES = 2 * 1024 * 1024; // the same limit the buckets enforce

/**
 * Uploads a picture chosen on the phone to `path` in a bucket, replacing any picture already there.
 * Returns the public link to store in the database.
 */
export async function uploadImage(bucket: ImageBucket, path: string, image: PickedImage): Promise<ApiResult<string>> {
  try {
    const text = atob(image.base64);
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
    if (bytes.length === 0) return { data: null, error: "That picture could not be read. Try another one." };
    if (bytes.length > MAX_BYTES)
      return { data: null, error: "That picture is too large. Choose one under 2 MB." };

    const contentType = ["image/png", "image/webp"].includes(image.mimeType) ? image.mimeType : "image/jpeg";
    const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType, upsert: true });
    if (error) return { data: null, error: friendlyError(error.message) };

    // The same path is reused for a new picture, so add a changing suffix to stop old copies being shown.
    const link = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    return { data: `${link}?v=${Date.now()}`, error: null };
  } catch {
    return { data: null, error: "Could not upload the picture. Check your connection and try again." };
  }
}