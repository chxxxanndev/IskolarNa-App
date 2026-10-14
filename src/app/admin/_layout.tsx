import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { AdminNav } from '@/components/admin-nav';
import { useAppState } from '@/context/app-state';

// Only emails on the allowlist (constants/admin.ts) get past this point.
export default function AdminLayout() {
  const { isAdmin } = useAppState();
  if (!isAdmin) return <Redirect href="/login" />;
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: '#F8FAFF' } }} />
      <AdminNav />
    </View>
  );
}
