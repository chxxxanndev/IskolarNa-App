import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ProgressBar, card } from '@/components/list-ui';
import { useAppState } from '@/context/app-state';
import { RIASEC_META, topCodes } from '@/data/riasec';

export default function Profile() {
  const { userName, userEmail, profile, savedColleges, savedScholarships, signOut } = useAppState();
  const top = topCodes(profile);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ ...card, alignItems: 'center', paddingVertical: 24 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: '#2563EB',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '800' }}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>{userName}</Text>
          {userEmail ? <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{userEmail}</Text> : null}
        </View>

        <View style={card}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Your interest type</Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#1E3A8A', letterSpacing: 4, marginVertical: 6 }}>
            {top.join('')}
          </Text>
          <Text style={{ fontSize: 13, color: '#475569', lineHeight: 19 }}>
            {top.map((c) => RIASEC_META[c].label).join(', ')}
          </Text>
        </View>

        <View style={card}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 14 }}>Interest breakdown</Text>
          {profile.map((r, i) => (
            <View key={r.code} style={{ marginBottom: i === profile.length - 1 ? 0 : 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ width: 96, fontSize: 13, fontWeight: '700', color: '#334155' }}>{r.label}</Text>
                <ProgressBar value={r.score} color={r.score >= 60 ? '#2563EB' : '#93C5FD'} />
                <Text style={{ width: 28, textAlign: 'right', fontSize: 12, color: '#64748B' }}>{r.score}</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 17 }}>{RIASEC_META[r.code].blurb}</Text>
            </View>
          ))}
        </View>

        <Button label="Retake Course Match" icon="compass-outline" onPress={() => router.push('/course-match')} />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/saved')}
          style={{ ...card, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <Ionicons name="bookmark-outline" size={22} color="#2563EB" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>Saved items</Text>
            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              {savedColleges.length} colleges · {savedScholarships.length} scholarships
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <Button
          label="Sign out"
          variant="danger"
          icon="log-out-outline"
          onPress={() => {
            signOut();
            router.replace('/login');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
