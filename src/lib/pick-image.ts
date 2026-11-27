import * as ImagePicker from 'expo-image-picker';

/** A picture chosen from the phone. The bytes come as base64 text, which uploads reliably on every phone. */
export type PickedImage = { base64: string; mimeType: string };

/** Opens the phone's photo library and lets the student crop to `aspect`. Returns null if they cancelled. */
export async function pickImage(aspect: [number, number]): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.6, // keeps files well under the 2 MB limit
    base64: true,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset.base64) return null;
  return { base64: asset.base64, mimeType: asset.mimeType ?? 'image/jpeg' };
}