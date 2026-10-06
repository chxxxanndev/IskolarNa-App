import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerStyle: {height: 400} }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      <Stack.Screen name="colleges" options={{ title: 'Colleges' }} />
      <Stack.Screen name="scholarships" options={{ title: 'Scholarships' }} />
      {/* <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} /> */}
    </Stack>
  );
}