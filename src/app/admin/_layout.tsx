import { Redirect, Stack } from "expo-router";
import { View } from "react-native";

import { AdminNav } from "@/components/admin-nav";
import { useAppState } from "@/context/app-state";

// Only users whose profile has role = 'admin' get past this point.
// (The database enforces the same rule with RLS, so this is just for navigation.)
export default function AdminLayout() {
  const { isAdmin, loading } = useAppState();
  if (loading) return null;
  if (!isAdmin) return <Redirect href="/login" />;
  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFF" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 220,
          contentStyle: { backgroundColor: "#F8FAFF" },
        }}
      />
      <AdminNav />
    </View>
  );
}
