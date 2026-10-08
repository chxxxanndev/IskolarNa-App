import { Stack } from 'expo-router';

import { MenuButton, Sidebar } from '@/components/sidebar';
import { AppStateProvider } from '@/context/app-state';
import { SidebarProvider } from '@/context/sidebar';

// Screens you only see after logging in get the hamburger in the header.
const withMenu = (title: string) => ({
  title,
  headerRight: () => <MenuButton />,
});

export default function RootLayout() {
  return (
    <AppStateProvider>
      <SidebarProvider>
        <Stack
          screenOptions={{
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
          <Stack.Screen name="dashboard" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="course-match" options={withMenu('Course Match')} />
          <Stack.Screen name="colleges" options={withMenu('Colleges')} />
          <Stack.Screen name="scholarships" options={withMenu('Scholarships')} />
          <Stack.Screen name="compare" options={withMenu('Compare colleges')} />
          <Stack.Screen name="profile" options={withMenu('My profile')} />
          <Stack.Screen name="saved" options={withMenu('Saved')} />
          <Stack.Screen name="college/[id]" options={withMenu('College')} />
          <Stack.Screen name="scholarship/[id]" options={withMenu('Scholarship')} />
        </Stack>

        {/* Lives at the root so every signed-in screen can open it */}
        <Sidebar />
      </SidebarProvider>
    </AppStateProvider>
  );
}
