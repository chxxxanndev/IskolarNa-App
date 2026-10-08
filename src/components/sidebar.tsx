import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppState } from '@/context/app-state';
import { useSidebar } from '@/context/sidebar';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type NavItem = {
  label: string;
  icon: IconName;
  route: '/dashboard' | '/course-match' | '/colleges' | '/scholarships' | '/compare' | '/saved' | '/profile';
  /** path prefixes that should light this item up (so detail pages keep their parent active) */
  match: string[];
};

const EXPLORE: NavItem[] = [
  { label: 'Home', icon: 'home-outline', route: '/dashboard', match: ['/dashboard'] },
  { label: 'Course Match', icon: 'compass-outline', route: '/course-match', match: ['/course-match'] },
  { label: 'Colleges', icon: 'school-outline', route: '/colleges', match: ['/colleges', '/college'] },
  { label: 'Scholarships', icon: 'ribbon-outline', route: '/scholarships', match: ['/scholarships', '/scholarship'] },
  { label: 'Compare', icon: 'git-compare-outline', route: '/compare', match: ['/compare'] },
];

const YOU: NavItem[] = [
  { label: 'Saved', icon: 'bookmark-outline', route: '/saved', match: ['/saved'] },
  { label: 'My profile', icon: 'person-outline', route: '/profile', match: ['/profile'] },
];

/** Hamburger button. `boxed` = white rounded square (for the dashboard), otherwise a bare icon (for stack headers). */
export function MenuButton({ boxed = false }: { boxed?: boolean }) {
  const { open } = useSidebar();

  if (boxed) {
    return (
      <TouchableOpacity
        onPress={open}
        accessibilityLabel="Open menu"
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons name="menu" size={22} color="#1E3A8A" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={open} accessibilityLabel="Open menu" hitSlop={10}>
      <Ionicons name="menu" size={26} color="#1E3A8A" />
    </TouchableOpacity>
  );
}

export function Sidebar() {
  const { isOpen, close } = useSidebar();
  const { userName, userEmail, savedColleges, savedScholarships, signOut } = useAppState();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const panelWidth = Math.min(320, Math.round(width * 0.82));
  const useNative = Platform.OS !== 'web';

  const progress = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const savedCount = savedColleges.length + savedScholarships.length;

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      Animated.timing(progress, { toValue: 1, duration: 220, useNativeDriver: useNative }).start();
    } else {
      setConfirmingLogout(false);
      Animated.timing(progress, { toValue: 0, duration: 180, useNativeDriver: useNative }).start(({ finished }) => {
        if (finished) setVisible(false);
      });
    }
  }, [isOpen, progress, useNative]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-panelWidth, 0] });

  const isActive = (item: NavItem) => item.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));

  const go = (item: NavItem) => {
    close();
    if (isActive(item) && pathname === item.route) return;

    if (item.route === '/dashboard') {
      // Home is the root of the signed-in stack, so go back to it instead of stacking a copy.
      router.dismissTo('/dashboard');
    } else if (pathname === '/dashboard') {
      router.push(item.route);
    } else {
      // Switching between sections: replace, so Back still returns to the dashboard.
      router.replace(item.route);
    }
  };

  const handleLogout = () => {
    close();
    signOut();
    router.replace('/login');
  };

  const renderItem = (item: NavItem) => {
    const active = isActive(item);
    const showBadge = item.route === '/saved' && savedCount > 0;

    return (
      <TouchableOpacity
        key={item.route}
        activeOpacity={0.7}
        onPress={() => go(item)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          paddingVertical: 13,
          paddingHorizontal: 14,
          borderRadius: 14,
          marginBottom: 4,
          backgroundColor: active ? '#EFF6FF' : 'transparent',
        }}
      >
        <Ionicons name={item.icon} size={22} color={active ? '#2563EB' : '#64748B'} />
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: active ? '800' : '600',
            color: active ? '#1E3A8A' : '#334155',
          }}
        >
          {item.label}
        </Text>
        {showBadge && (
          <View
            style={{
              minWidth: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: '#2563EB',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 6,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>{savedCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <View style={StyleSheet.absoluteFill}>
        {/* Dimmed backdrop: tap anywhere outside the panel to close */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.45)', opacity: progress }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close menu" />
        </Animated.View>

        {/* Panel */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: panelWidth,
            backgroundColor: '#FFFFFF',
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 12,
            transform: [{ translateX }],
            shadowColor: '#0F172A',
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 16,
          }}
        >
          {/* Header: brand + close */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginBottom: 18,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  backgroundColor: '#2563EB',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>I</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#1E3A8A', letterSpacing: -0.3 }}>IskolarNa</Text>
            </View>
            <TouchableOpacity onPress={close} hitSlop={10} accessibilityLabel="Close menu">
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* User card -> opens profile */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => go(YOU[1])}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginHorizontal: 16,
              padding: 14,
              borderRadius: 18,
              backgroundColor: '#F8FAFF',
              borderWidth: 1,
              borderColor: '#E2E8F0',
              marginBottom: 18,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: '#2563EB',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>
                {userName}
              </Text>
              {userEmail ? (
                <Text numberOfLines={1} style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  {userEmail}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>

          {/* Nav */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={sectionLabel}>Explore</Text>
            {EXPLORE.map(renderItem)}

            <Text style={[sectionLabel, { marginTop: 14 }]}>You</Text>
            {YOU.map(renderItem)}
          </ScrollView>

          {/* Log out (pinned to the bottom, with an inline confirmation) */}
          <View style={{ paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF2F7' }}>
            {confirmingLogout ? (
              <View style={{ backgroundColor: '#FEF2F2', borderRadius: 16, padding: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#991B1B', marginBottom: 12 }}>
                  Log out of IskolarNa?
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setConfirmingLogout(false)}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#334155' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleLogout}
                    accessibilityLabel="Confirm log out"
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: '#DC2626',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Log out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setConfirmingLogout(true)}
                accessibilityLabel="Log out"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingVertical: 13,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                }}
              >
                <Ionicons name="log-out-outline" size={22} color="#DC2626" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#DC2626' }}>Log out</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const sectionLabel = {
  fontSize: 11,
  fontWeight: '800',
  color: '#94A3B8',
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 8,
  marginLeft: 6,
} as const;
