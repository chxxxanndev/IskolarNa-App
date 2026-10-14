import { Stack } from 'expo-router';
import { View } from 'react-native';

import { BottomNav } from '@/components/bottom-nav';
import { AppStateProvider } from '@/context/app-state';
import { CatalogProvider } from '@/context/catalog';
import { NavVisibilityProvider } from '@/context/nav-visibility';

// Navigation lives in the bottom bar now, so signed-in screens just get a title.
const withTitle = (title: string) => ({ title });

export default function RootLayout() {
  return (
    <AppStateProvider>
      <CatalogProvider>
      <NavVisibilityProvider>
      <View style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
        <Stack
          screenOptions={{
            animation: 'fade', // smooth cross-fade between screens (tabs, login, detail pages)
            animationDuration: 220,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#F8FAFF' },
            headerTintColor: '#1E3A8A',
            headerTitleStyle: { fontWeight: '800' },
            contentStyle: { backgroundColor: '#F8FAFF' },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" options={{ title: 'Reset password' }} />
          <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="course-match" options={withTitle('Course Match')} />
          <Stack.Screen name="colleges" options={withTitle('Colleges')} />
          <Stack.Screen name="scholarships" options={withTitle('Scholarships')} />
          <Stack.Screen name="compare" options={withTitle('Compare colleges')} />
          <Stack.Screen name="profile" options={withTitle('My profile')} />
          <Stack.Screen name="saved" options={withTitle('Saved')} />
          <Stack.Screen name="college/[id]" options={withTitle('College')} />
          <Stack.Screen name="scholarship/[id]" options={withTitle('Scholarship')} />
        </Stack>

        {/* Bottom tab bar, floats over the bottom edge and hides on scroll (signed-in screens only) */}
        <BottomNav />
      </View>
      </NavVisibilityProvider>
      </CatalogProvider>
    </AppStateProvider>
  );
}
