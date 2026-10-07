import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, FilterChips, SaveButton, Tag, card } from '@/components/list-ui';
import { useAppState } from '@/context/app-state';
import { COLLEGES } from '@/data/colleges';
import { SCHOLARSHIPS } from '@/data/scholarships';

const TABS = ['Colleges', 'Scholarships'] as const;
type Tab = (typeof TABS)[number];

export default function Saved() {
  const [tab, setTab] = useState<Tab>('Colleges');
  const { savedColleges, savedScholarships, toggleCollege, toggleScholarship } = useAppState();

  const colleges = COLLEGES.filter((c) => savedColleges.includes(c.id));
  const scholarships = SCHOLARSHIPS.filter((s) => savedScholarships.includes(s.id)).sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <FilterChips options={TABS} value={tab} onChange={setTab} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }} showsVerticalScrollIndicator={false}>
        {tab === 'Colleges' &&
          (colleges.length === 0 ? (
            <EmptyState title="No saved colleges" message="Tap the bookmark on a college to keep it here." />
          ) : (
            colleges.map((c) => (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.9}
                onPress={() => router.push(`/college/${c.id}`)}
                style={{ ...card, flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#1E3A8A',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>{c.short}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>{c.name}</Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    {c.city} · {c.type}
                  </Text>
                </View>
                <SaveButton saved onPress={() => toggleCollege(c.id)} />
              </TouchableOpacity>
            ))
          ))}

        {tab === 'Scholarships' &&
          (scholarships.length === 0 ? (
            <EmptyState title="No saved scholarships" message="Tap the bookmark on a scholarship to keep it here." />
          ) : (
            scholarships.map((s) => (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.9}
                onPress={() => router.push(`/scholarship/${s.id}`)}
                style={{ ...card, flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#EFF6FF',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="ribbon-outline" size={22} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>{s.name}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 6 }}>
                    <Tag label={`${s.daysLeft}d left`} tone={s.daysLeft <= 7 ? 'red' : 'blue'} />
                  </View>
                </View>
                <SaveButton saved onPress={() => toggleScholarship(s.id)} />
              </TouchableOpacity>
            ))
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
