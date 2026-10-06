import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const USER_NAME = 'Student';

const RIASEC = [
  { code: 'R', label: 'Realistic', score: 35 },
  { code: 'I', label: 'Investigative', score: 82 },
  { code: 'A', label: 'Artistic', score: 48 },
  { code: 'S', label: 'Social', score: 61 },
  { code: 'E', label: 'Enterprising', score: 40 },
  { code: 'C', label: 'Conventional', score: 70 },
];

const SCHOLARSHIPS = [
  { id: '1', name: 'CHED Merit Scholarship', grantor: 'CHED', daysLeft: 5 },
  { id: '2', name: 'DOST-SEI Undergraduate Scholarship', grantor: 'DOST-SEI', daysLeft: 12 },
  { id: '3', name: 'Local Government Scholarship', grantor: 'Provincial Govt.', daysLeft: 30 },
];

const COLLEGES = [
  { id: '1', name: 'Jose Rizal Memorial State University', short: 'JRMSU', city: 'Dapitan', type: 'Public' },
  { id: '2', name: 'Andres Bonifacio College', short: 'ABC', city: 'Dipolog', type: 'Private' },
  { id: '3', name: "Saint Vincent's College", short: 'SVC', city: 'Dipolog', type: 'Private' },
  { id: '4', name: 'Dipolog Medical Center College Foundation', short: 'DMCCFI', city: 'Dipolog', type: 'Private' },
];

const ACTIONS = [
  //{ label: 'Course Match', icon: 'compass-outline', route: null },
  { label: 'Scholarships', icon: 'ribbon-outline', route: '/scholarships' },
  { label: 'Colleges', icon: 'school-outline', route: '/colleges' },
  { label: 'Compare', icon: 'git-compare-outline', route: null },
] as const;

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  padding: 18,
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 15,
  elevation: 4,
} as const;

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: '700', color: '#0F172A' }}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#2563EB' }}>See all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DevModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 30,
        }}
      >
        <View style={{ ...card, width: '100%', alignItems: 'center', padding: 26 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: '#EFF6FF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="construct-outline" size={30} color="#2563EB" />
          </View>
          <Text style={{ fontSize: 19, fontWeight: '800', color: '#0F172A', marginBottom: 6 }}>
            Page under development
          </Text>
          <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 22 }}>
            We're still building this feature. Check back soon!
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={{
              height: 48,
              alignSelf: 'stretch',
              borderRadius: 14,
              backgroundColor: '#2563EB',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function Dashboard() {
  const [devOpen, setDevOpen] = useState(false);
  const showDev = () => setDevOpen(true);
  const goScholarships = () => router.push('/scholarships');
  const goColleges = () => router.push('/colleges');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <View>
            <Text style={{ fontSize: 14, color: '#64748B' }}>Welcome back,</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1E3A8A', letterSpacing: -0.5 }}>
              {USER_NAME}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/login')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: '#2563EB',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>
              {USER_NAME.charAt(0)}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={showDev}
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
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 6 }}>
            Not sure where to start?
          </Text>
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
            <Text style={{ flex: 1, marginLeft: 10, color: '#94A3B8', fontSize: 14 }}>
              Describe your interests...
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#2563EB" />
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 26 }}>
          {ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              activeOpacity={0.8}
              onPress={() => (a.route ? router.push(a.route) : showDev())}
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
        </View>

        <SectionHeader title="Your interest profile" onSeeAll={showDev} />
        <View style={{ ...card, marginBottom: 26 }}>
          {RIASEC.map((r, i) => (
            <View
              key={r.code}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i === RIASEC.length - 1 ? 0 : 12 }}
            >
              <Text style={{ width: 96, fontSize: 13, fontWeight: '600', color: '#334155' }}>
                {r.label}
              </Text>
              <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0' }}>
                <View
                  style={{
                    width: `${r.score}%`,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: r.score >= 60 ? '#2563EB' : '#93C5FD',
                  }}
                />
              </View>
              <Text style={{ width: 32, textAlign: 'right', fontSize: 12, color: '#64748B' }}>
                {r.score}
              </Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Closing soon" onSeeAll={goScholarships} />
        <View style={{ ...card, paddingVertical: 6, marginBottom: 26 }}>
          {SCHOLARSHIPS.map((s, i) => {
            const urgent = s.daysLeft <= 7;
            return (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.7}
                onPress={goScholarships}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: i === SCHOLARSHIPS.length - 1 ? 0 : 1,
                  borderBottomColor: '#EEF2F7',
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A' }}>{s.name}</Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{s.grantor}</Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 10,
                    backgroundColor: urgent ? '#FEE2E2' : '#EFF6FF',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: urgent ? '#B91C1C' : '#2563EB' }}>
                    {s.daysLeft} days left
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionHeader title="Colleges in Zamboanga del Norte" onSeeAll={goColleges} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -20 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 12 }}
        >
          {COLLEGES.map((c) => (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.8}
              onPress={goColleges}
              style={{ ...card, width: 190 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: '#1E3A8A',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>{c.short}</Text>
              </View>
              <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', minHeight: 38 }}>
                {c.name}
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>
                {c.city} • {c.type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={{ textAlign: 'center', color: '#94A3B8', fontSize: 11, marginTop: 18 }}>
          Recommendations are advisory. The final decision is yours.
        </Text>
      </ScrollView>

      <DevModal visible={devOpen} onClose={() => setDevOpen(false)} />
    </SafeAreaView>
  );
}
