import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Keyboard, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNavVisibility } from '@/context/nav-visibility';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type NavItem = {
  label: string;
  icon: IconName;
  activeIcon: IconName;
  route: '/dashboard' | '/course-match' | '/colleges' | '/scholarships' | '/compare';
  /** path prefixes that light this tab up (so detail pages keep their parent tab active) */
  match: string[];
};

const ITEMS: NavItem[] = [
  { label: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/dashboard', match: ['/dashboard'] },
  { label: 'Match', icon: 'compass-outline', activeIcon: 'compass', route: '/course-match', match: ['/course-match'] },
  { label: 'Colleges', icon: 'school-outline', activeIcon: 'school', route: '/colleges', match: ['/colleges', '/college'] },
  {
    label: 'Scholarships',
    icon: 'ribbon-outline',
    activeIcon: 'ribbon',
    route: '/scholarships',
    match: ['/scholarships', '/scholarship'],
  },
  { label: 'Compare', icon: 'git-compare-outline', activeIcon: 'git-compare', route: '/compare', match: ['/compare'] },
];

// Signed-in screens that don't have their own tab (reached from the Home header) still show the bar.
const NO_TAB_BUT_SHOW_BAR = ['/saved', '/profile'];

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some((m) => pathname === m || pathname.startsWith(`${m}/`));

/**
 * Bottom navigation bar (Messenger / Facebook style). Mounted once in
 * `app/_layout.tsx`. It floats over the bottom of the screen so it can slide away
 * while the student scrolls down (see `context/nav-visibility.tsx`). Only shows on
 * signed-in screens and is hidden while the keyboard is open.
 */
export function BottomNav() {
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

  const onSignedInScreen =
    ITEMS.some((i) => matches(pathname, i.match)) || matches(pathname, NO_TAB_BUT_SHOW_BAR);

  if (!onSignedInScreen || keyboardOpen) return null;

  const go = (item: NavItem) => {
    if (pathname === item.route) return;

    if (item.route === '/dashboard') {
      // Home is the root of the signed-in stack, so go back to it instead of stacking a copy.
      router.dismissTo('/dashboard');
    } else if (pathname === '/dashboard') {
      router.push(item.route);
    } else {
      // Switching between tabs: replace, so Back still returns to Home.
      router.replace(item.route);
    }
  };

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
        const active = matches(pathname, item.match);
        return (
          <TouchableOpacity
            key={item.route}
            activeOpacity={0.7}
            onPress={() => go(item)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 }}
          >
            <Ionicons name={active ? item.activeIcon : item.icon} size={24} color={active ? '#2563EB' : '#64748B'} />
            <Text
              numberOfLines={1}
              style={{
                fontSize: 10,
                fontWeight: active ? '800' : '600',
                color: active ? '#1E3A8A' : '#64748B',
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}
