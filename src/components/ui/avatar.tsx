import { useState } from 'react';
import { Image, Text, View } from 'react-native';

/** A profile picture, or the first letter of the name on a blue tile when there is no picture. */
export function Avatar({ uri, name, size, radius }: { uri?: string; name: string; size: number; radius: number }) {
  const [brokenUri, setBrokenUri] = useState(''); // a picture that failed to load falls back to the letter tile
  if (uri && uri !== brokenUri)
    return <Image source={{ uri }} onError={() => setBrokenUri(uri)} style={{ width: size, height: size, borderRadius: radius, backgroundColor: '#E2E8F0' }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontSize: size * 0.42, fontWeight: '800' }}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}