import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Keyboard, Platform, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNavVisibility } from '@/context/nav-visibility';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ITEMS: { label: string; icon: IconName; activeIcon: IconName; route: '/admin' | '/admin/colleges' | '/admin/scholarships' | '/admin/courses' | '/admin/students' }[] = [
  { label: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid', route: '/admin' },
  { label: 'Colleges', icon: 'school-outline', activeIcon: 'school', route: '/admin/colleges' },
  { label: 'Scholarships', icon: 'ribbon-outline', activeIcon: 'ribbon', route: '/admin/scholarships' },
  { label: 'Courses', icon: 'compass-outline', activeIcon: 'compass', route: '/admin/courses' },
  { label: 'Students', icon: 'people-outline', activeIcon: 'people', route: '/admin/students' },
];

/** Footer tab bar for the admin side. Floats over the bottom edge and hides on scroll, like the student bar. */
export function AdminNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const { translate, barHeight, setBarHeight, setShown } = useNavVisibility();

  // Every tab change starts with the bar visible.
  useEffect(() => {
    setShown(true);
  }, [pathname, setShown]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardOpen) return null;

  return (
    <Animated.View
      accessibilityRole="tablist"
      onLayout={(e) => setBarHeight(e.nativeEvent.layout.height)}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        transform: [{ translateY: translate.interpolate({ inputRange: [0, 1], outputRange: [0, barHeight] }) }],
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingHorizontal: 4,
      }}
    >
      {ITEMS.map((item) => {
        const active = pathname === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            activeOpacity={0.7}
            onPress={() => !active && router.replace(item.route)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 }}
          >
            <Ionicons name={active ? item.activeIcon : item.icon} size={24} color={active ? '#2563EB' : '#64748B'} />
            <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: active ? '800' : '600', color: active ? '#1E3A8A' : '#64748B' }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}
