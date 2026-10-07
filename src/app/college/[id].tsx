import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, Tag, card } from '@/components/list-ui';
import { useAppState } from '@/context/app-state';
import { COLLEGES } from '@/data/colleges';
import { courseForProgram } from '@/data/courses';
import { RIASEC_META } from '@/data/riasec';
import { SCHOLARSHIPS } from '@/data/scholarships';

export default function CollegeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { savedColleges, toggleCollege } = useAppState();
  const college = COLLEGES.find((c) => c.id === id);

  if (!college) {
    return <EmptyState title="College not found" message="This college may have been removed." />;
  }

  const saved = savedColleges.includes(college.id);
  const scholarships = [...SCHOLARSHIPS].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 2);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <Stack.Screen options={{ title: college.short }} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ ...card, alignItems: 'center', paddingVertical: 24 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: '#1E3A8A',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>{college.short}</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>{college.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <Ionicons name="location-outline" size={14} color="#64748B" />
            <Text style={{ fontSize: 13, color: '#64748B' }}>{college.city}, Zamboanga del Norte</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Tag label={college.type} tone={college.type === 'Public' ? 'blue' : 'slate'} />
            <Tag label={`${college.programs.length} programs`} tone="slate" />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            flex
            variant={saved ? 'primary' : 'secondary'}
            icon={saved ? 'bookmark' : 'bookmark-outline'}
            label={saved ? 'Saved' : 'Save'}
            onPress={() => toggleCollege(college.id)}
          />
          <Button
            flex
            variant="secondary"
            icon="git-compare-outline"
            label="Compare"
            onPress={() => router.push({ pathname: '/compare', params: { ids: college.id } })}
          />
        </View>

        <View style={card}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 8 }}>About</Text>
          <Text style={{ fontSize: 13, color: '#475569', lineHeight: 20 }}>{college.about}</Text>
        </View>

        <View style={card}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 }}>Programs offered</Text>
          {college.programs.map((p, i) => {
            const course = courseForProgram(p);
            return (
              <View
                key={p}
                style={{
                  paddingVertical: 12,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: '#EEF2F7',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{p}</Text>
                {course && (
                  <>
                    <Text style={{ fontSize: 12, color: '#64748B', marginTop: 3, lineHeight: 17 }}>{course.about}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {course.codes.slice(0, 2).map((code) => (
                        <Tag key={code} label={RIASEC_META[code].label} />
                      ))}
                    </View>
                  </>
                )}
              </View>
            );
          })}
        </View>

        <View style={card}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 }}>Scholarships to explore</Text>
          {scholarships.map((s, i) => (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/scholarship/${s.id}`)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderTopWidth: 1,
                borderTopColor: '#EEF2F7',
                marginTop: i === 0 ? 8 : 0,
              }}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{s.name}</Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{s.grantor}</Text>
              </View>
              <Tag label={`${s.daysLeft}d left`} tone={s.daysLeft <= 7 ? 'red' : 'blue'} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ textAlign: 'center', color: '#94A3B8', fontSize: 11 }}>
          Sample data. Confirm programs and admissions with the school.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
