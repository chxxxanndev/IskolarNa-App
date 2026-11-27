import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, MatchPrompt, ProgressBar, card } from '@/components/list-ui';
import { Avatar } from '@/components/ui/avatar';
import { useAppState } from '@/context/app-state';
import { useNavScroll } from '@/context/nav-visibility';
import { RIASEC_META, topCodes } from '@/data/riasec';
import { pickImage } from '@/lib/pick-image';

export default function Profile() {
  const nav = useNavScroll();
  const { userName, userEmail, avatarUrl, setAvatar, studentInfo, profile, hasMatched, savedColleges, savedScholarships, signOut } = useAppState();
  const NEEDS: Record<string, string> = { yes: 'Needs a scholarship', maybe: 'Not sure about scholarships', no: 'No scholarship needed' };
  const about = [
    studentInfo.level,
    studentInfo.strand && `${studentInfo.strand} strand`,
    studentInfo.municipality,
    NEEDS[studentInfo.needsScholarship],
  ].filter(Boolean) as string[];
  const top = topCodes(profile);
  const [uploading, setUploading] = useState(false);

  const changePicture = async () => {
    const picked = await pickImage([1, 1]);
    if (!picked) return;
    setUploading(true);
    const error = await setAvatar(picked);
    setUploading(false);
    if (error) Alert.alert('Could not update picture', error);
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: nav.bottomPad, gap: 16 }} {...nav.scrollProps} showsVerticalScrollIndicator={false}>
        <View style={{ ...card, alignItems: 'center', paddingVertical: 24 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={uploading}
            onPress={changePicture}
            accessibilityLabel="Change profile picture"
            style={{ marginBottom: 12, opacity: uploading ? 0.5 : 1 }}
          >
            <Avatar uri={avatarUrl} name={userName} size={88} radius={26} />
            <View style={{ position: 'absolute', right: -4, bottom: -4, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DBE3F0', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={uploading ? 'time-outline' : 'camera-outline'} size={16} color="#2563EB" />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>{userName}</Text>
          {userEmail ? <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{userEmail}</Text> : null}
          {about.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              {about.map((a) => (
                <View key={a} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: '#EFF6FF' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB' }}>{a}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {hasMatched ? (
          <>
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
          </>
        ) : (
          <MatchPrompt />
        )}

        {hasMatched && (
          <Button label="Retake Course Match" icon="compass-outline" onPress={() => router.push('/course-match')} />
        )}

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