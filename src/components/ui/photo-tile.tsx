import { useState, type ReactNode } from 'react';
import { Image, View, type ViewStyle } from 'react-native';

/** A small rounded tile that shows a picture when there is one, and `children` (a letter or icon) when there is none or it fails to load. */
export function PhotoTile({
  uri,
  size,
  radius,
  backgroundColor,
  style,
  children,
}: {
  uri?: string;
  size: number;
  radius: number;
  backgroundColor: string;
  style?: ViewStyle;
  children: ReactNode;
}) {
  const [brokenUri, setBrokenUri] = useState('');
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', ...style }}>
      {children}
      {uri && uri !== brokenUri ? (
        <Image
          source={{ uri }}
          onError={() => setBrokenUri(uri)}
          style={{ position: 'absolute', width: size, height: size, backgroundColor: '#E2E8F0' }}
        />
      ) : null}
    </View>
  );
}