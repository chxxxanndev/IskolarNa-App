import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { AdminScreen } from '@/components/admin-ui';
import { ProgressBar, Tag, card } from '@/components/list-ui';
import { useAppState } from '@/context/app-state';
import { useCatalog } from '@/context/catalog';
import { CODES, RIASEC_META } from '@/data/riasec';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const SECTIONS: { label: string; icon: IconName; route: '/admin/colleges' | '/admin/scholarships' | '/admin/courses' | '/admin/students' }[] = [
  { label: 'Colleges', icon: 'school-outline', route: '/admin/colleges' },
  { label: 'Scholarships', icon: 'ribbon-outline', route: '/admin/scholarships' },
  { label: 'Courses', icon: 'compass-outline', route: '/admin/courses' },
  { label: 'Students', icon: 'people-outline', route: '/admin/students' },
];

export default function AdminDashboard() {
  const { userName, signOut } = useAppState();
  const { colleges, scholarships, courses, students } = useCatalog();

  const counts = [colleges.length, scholarships.length, courses.length, students.length];
  const closingSoon = scholarships.filter((s) => s.daysLeft <= 7).sort((a, b) => a.daysLeft - b.daysLeft);
  const strands = Object.entries(
    students.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.strand || 'Other']: (acc[s.strand || 'Other'] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1]);
  const needScholarship = students.filter((s) => s.needsScholarship === 'yes').length;

  return (
    <AdminScreen
      back={false}
      subtitle={`Admin · ${userName}`}
      title="Dashboard"
      right={
        <TouchableOpacity
          onPress={() => {
            signOut();
            router.replace('/login');
          }}
          accessibilityLabel="Sign out"
          style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="log-out-outline" size={20} color="#2563EB" />
        </TouchableOpacity>
      }
    >
      {/* Stat tiles — tap to manage */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {SECTIONS.map((s, i) => (
          <TouchableOpacity
            key={s.route}
            activeOpacity={0.85}
            onPress={() => router.push(s.route)}
            style={{ ...card, width: '47.5%', gap: 10 }}
          >
            <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={s.icon} size={22} color="#2563EB" />
            </View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#1E3A8A' }}>{counts[i]}</Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: -6 }}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Closing soon */}
      <View style={{ ...card, gap: 12 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>Scholarships closing within 7 days</Text>
        {closingSoon.length === 0 ? (
          <Text style={{ fontSize: 13, color: '#64748B' }}>Nothing closing this week.</Text>
        ) : (
          closingSoon.map((s) => (
            <TouchableOpacity key={s.id} onPress={() => router.push('/admin/scholarships')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text numberOfLines={1} style={{ flex: 1, fontSize: 14, fontWeight: '600', color: '#334155' }}>{s.name}</Text>
              <Tag label={`${s.daysLeft}d left`} tone="red" />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Students by strand */}
      <View style={{ ...card, gap: 12 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>Students by strand</Text>
        <Text style={{ fontSize: 13, color: '#64748B' }}>{needScholarship} of {students.length} need a scholarship</Text>
        {strands.map(([strand, n]) => (
          <View key={strand} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ width: 54, fontSize: 13, fontWeight: '600', color: '#475569' }}>{strand}</Text>
            <ProgressBar value={(n / Math.max(students.length, 1)) * 100} />
            <Text style={{ width: 20, fontSize: 13, fontWeight: '700', color: '#1E3A8A', textAlign: 'right' }}>{n}</Text>
          </View>
        ))}
      </View>

      {/* Course coverage per RIASEC type */}
      <View style={{ ...card, gap: 12 }}>
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>Course coverage by interest type</Text>
        {CODES.map((code) => {
          const n = courses.filter((c) => c.codes.includes(code)).length;
          return (
            <View key={code} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ width: 96, fontSize: 13, fontWeight: '600', color: '#475569' }}>{RIASEC_META[code].label}</Text>
              <ProgressBar value={(n / Math.max(courses.length, 1)) * 100} color={n === 0 ? '#B91C1C' : '#2563EB'} />
              <Text style={{ width: 20, fontSize: 13, fontWeight: '700', color: n === 0 ? '#B91C1C' : '#1E3A8A', textAlign: 'right' }}>{n}</Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity onPress={() => router.replace('/dashboard')} style={{ alignSelf: 'center', padding: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#2563EB' }}>Preview the student app</Text>
      </TouchableOpacity>
    </AdminScreen>
  );
}
