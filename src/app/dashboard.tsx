import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar, Tag, card } from '@/components/list-ui';
import { MenuButton } from '@/components/sidebar';
import { useAppState } from '@/context/app-state';
import { COLLEGES } from '@/data/colleges';
import { topCodes } from '@/data/riasec';
import { SCHOLARSHIPS } from '@/data/scholarships';

const ACTIONS = [
  { label: 'Course Match', icon: 'compass-outline', route: '/course-match' },
  { label: 'Scholarships', icon: 'ribbon-outline', route: '/scholarships' },
  { label: 'Colleges', icon: 'school-outline', route: '/colleges' },
  { label: 'Compare', icon: 'git-compare-outline', route: '/compare' },
] as const;

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll} hitSlop={10}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#2563EB' }}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Dashboard() {
  const { userName, profile, savedColleges, savedScholarships } = useAppState();
  const savedCount = savedColleges.length + savedScholarships.length;
  const closingSoon = [...SCHOLARSHIPS].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 }}>
            <MenuButton boxed />
            <View style={{ flexShrink: 1 }}>
              <Text style={{ fontSize: 14, color: '#64748B' }}>Welcome back,</Text>
              <Text
                numberOfLines={1}
                style={{ fontSize: 24, fontWeight: '800', color: '#1E3A8A', letterSpacing: -0.5 }}
              >
                {userName}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/saved')}
              accessibilityLabel="Saved items"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E2E8F0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="bookmark-outline" size={20} color="#2563EB" />
              {savedCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: '#2563EB',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>{savedCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/profile')}
              accessibilityLabel="My profile"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: '#2563EB',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>{userName.charAt(0).toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/course-match')}
          style={{
            backgroundColor: '#2563EB',
            borderRadius: 24,
            padding: 22,
            marginBottom: 20,
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 6 }}>Not sure where to start?</Text>
          <Text style={{ color: '#DBEAFE', fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
            Tell IskolarNa what you enjoy and get course, college, and scholarship options.
          </Text>
          <View
            style={{
              height: 48,
              borderRadius: 14,
              backgroundColor: '#FFFFFF',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#2563EB" />
            <Text style={{ flex: 1, marginLeft: 10, color: '#94A3B8', fontSize: 14 }}>Describe your interests...</Text>
            <Ionicons name="arrow-forward" size={18} color="#2563EB" />
          </View>
        </TouchableOpacity>

        {/* Quick actions */}
        {/* <View style={{ flexDirection: 'row', gap: 10, marginBottom: 26 }}>
          {ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              activeOpacity={0.8}
              onPress={() => router.push(a.route)}
              style={{ ...card, flex: 1, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: '#EFF6FF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons name={a.icon} size={22} color="#2563EB" />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#334155' }}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Interest profile */}
        <SectionHeader title="Your interest profile" onSeeAll={() => router.push('/profile')} />
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/profile')} style={{ ...card, marginBottom: 26 }}>
          <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
            Top interests: {topCodes(profile).join(' · ')}
          </Text>
          {profile.map((r, i) => (
            <View
              key={r.code}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: i === profile.length - 1 ? 0 : 12 }}
            >
              <Text style={{ width: 96, fontSize: 13, fontWeight: '600', color: '#334155' }}>{r.label}</Text>
              <ProgressBar value={r.score} color={r.score >= 60 ? '#2563EB' : '#93C5FD'} />
              <Text style={{ width: 28, textAlign: 'right', fontSize: 12, color: '#64748B' }}>{r.score}</Text>
            </View>
          ))}
        </TouchableOpacity>

        {/* Closing soon */}
        <SectionHeader title="Closing soon" onSeeAll={() => router.push('/scholarships')} />
        <View style={{ ...card, paddingVertical: 6, marginBottom: 26 }}>
          {closingSoon.map((s, i) => (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/scholarship/${s.id}`)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: i === closingSoon.length - 1 ? 0 : 1,
                borderBottomColor: '#EEF2F7',
              }}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>{s.name}</Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{s.grantor}</Text>
              </View>
              <Tag label={`${s.daysLeft}d left`} tone={s.daysLeft <= 7 ? 'red' : 'blue'} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Colleges */}
        <SectionHeader title="Colleges in Zamboanga del Norte" onSeeAll={() => router.push('/colleges')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -20 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 8 }}
        >
          {COLLEGES.map((c) => (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.8}
              onPress={() => router.push(`/college/${c.id}`)}
              style={{ ...card, width: 180 }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: '#1E3A8A',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>{c.short}</Text>
              </View>
              <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', minHeight: 36 }}>
                {c.name}
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>
                {c.city} · {c.type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
