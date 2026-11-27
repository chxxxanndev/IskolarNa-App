import { Image } from 'react-native';

/** The IskolarNa badge. It already contains the app name, so don't repeat the name next to it. */
export function Logo({ size = 120 }: { size?: number }) {
  return <Image source={require('@/assets/images/logo.png')} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel="IskolarNa" />;
}