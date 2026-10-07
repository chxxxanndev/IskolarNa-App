import { Stack } from 'expo-router';

import { AppStateProvider } from '@/context/app-state';

export default function RootLayout() {
  return (
    <AppStateProvider>
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
        <Stack.Screen name="course-match" options={{ title: 'Course Match' }} />
        <Stack.Screen name="colleges" options={{ title: 'Colleges' }} />
        <Stack.Screen name="scholarships" options={{ title: 'Scholarships' }} />
        <Stack.Screen name="compare" options={{ title: 'Compare colleges' }} />
        <Stack.Screen name="profile" options={{ title: 'My profile' }} />
        <Stack.Screen name="saved" options={{ title: 'Saved' }} />
        <Stack.Screen name="college/[id]" options={{ title: 'College' }} />
        <Stack.Screen name="scholarship/[id]" options={{ title: 'Scholarship' }} />
      </Stack>
    </AppStateProvider>
  );
}
