import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAppState } from "@/context/app-state";

// App entry: wait for the saved session to be checked, then send the user where they belong.
export default function Index() {
  const { loading, signedIn, isAdmin } = useAppState();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFF",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!signedIn) return <Redirect href="/login" />;
  return <Redirect href={isAdmin ? "/admin" : "/dashboard"} />;
}
