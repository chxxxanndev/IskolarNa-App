import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/list-ui';
import { useAppState } from '@/context/app-state';

/** Shown once right after sign up. Both buttons lead into the app; Match is just optional. */
export default function Welcome() {
  const { userName } = useAppState();

  const takeMatch = () => {
    // Land on Home first so Back from Match returns there.
    router.replace('/dashboard');
    router.push('/course-match');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            backgroundColor: '#2563EB',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginBottom: 22,
          }}
        >
          <Ionicons name="compass" size={36} color="#FFFFFF" />
        </View>

        <Text style={{ fontSize: 26, fontWeight: '800', color: '#1E3A8A', textAlign: 'center', letterSpacing: -0.5 }}>
          Welcome, {userName}!
        </Text>
        <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginTop: 10, marginBottom: 32 }}>
          Tell us what you enjoy and we'll suggest courses, colleges, and scholarships that fit you. It takes about a minute.
        </Text>

        <View style={{ gap: 12 }}>
          <Button label="Take Course Match" icon="compass-outline" onPress={takeMatch} />
          <Button label="Skip for now" variant="secondary" onPress={() => router.replace('/dashboard')} />
        </View>

        <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 18 }}>
          You can take it anytime from the Match tab.
        </Text>
      </View>
    </SafeAreaView>
  );
}
