import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BulletList, Button, EmptyState, ProgressBar, Tag, card } from '@/components/list-ui';
import { useAppState } from '@/context/app-state';
import { SCHOLARSHIPS } from '@/data/scholarships';

export default function ScholarshipDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { savedScholarships, toggleScholarship, prepared, toggleRequirement, reminders, toggleReminder } = useAppState();
  const s = SCHOLARSHIPS.find((x) => x.id === id);

  if (!s) {
    return <EmptyState title="Scholarship not found" message="This scholarship may have been removed." />;
  }

  const saved = savedScholarships.includes(s.id);
  const reminded = reminders.includes(s.id);
  const done = prepared[s.id] ?? [];
  const progress = Math.round((done.length / s.requirements.length) * 100);
  const urgent = s.daysLeft <= 7;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <Stack.Screen options={{ title: s.grantor }} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ ...card, alignItems: 'center', paddingVertical: 24 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: '#EFF6FF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <Ionicons name="ribbon-outline" size={34} color="#2563EB" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>{s.name}</Text>
          <Text style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>{s.grantor}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Tag label={`${s.daysLeft} days left`} tone={urgent ? 'red' : 'blue'} />
            <Tag label={s.level} tone="slate" />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            flex
            variant={saved ? 'primary' : 'secondary'}
            icon={saved ? 'bookmark' : 'bookmark-outline'}
            label={saved ? 'Saved' : 'Save'}
            onPress={() => toggleScholarship(s.id)}
          />
          <Button
            flex
            variant={reminded ? 'primary' : 'secondary'}
            icon={reminded ? 'notifications' : 'notifications-outline'}
            label={reminded ? 'Reminder on' : 'Remind me'}
            onPress={() => toggleReminder(s.id)}
          />
        </View>

        <View style={card}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 8 }}>Benefit</Text>
          <Text style={{ fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 14 }}>{s.benefit}</Text>
          <Text style={{ fontSize: 13, color: '#475569', lineHeight: 20 }}>{s.about}</Text>
        </View>

        <View style={card}>
          <BulletList title="Who can apply" items={s.eligibility} />
        </View>

        <View style={card}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 }}>Application checklist</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <ProgressBar value={progress} color={progress === 100 ? '#16A34A' : '#2563EB'} />
            <Text style={{ fontSize: 12, color: '#64748B' }}>
              {done.length}/{s.requirements.length} ready
            </Text>
          </View>
          {s.requirements.map((req) => {
            const checked = done.includes(req);
            return (
              <TouchableOpacity
                key={req}
                activeOpacity={0.7}
                onPress={() => toggleRequirement(s.id, req)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 }}
              >
                <Ionicons
                  name={checked ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={checked ? '#2563EB' : '#94A3B8'}
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: checked ? '#94A3B8' : '#334155',
                    textDecorationLine: checked ? 'line-through' : 'none',
                  }}
                >
                  {req}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={{ textAlign: 'center', color: '#94A3B8', fontSize: 11 }}>
          Sample data. Confirm deadlines and requirements with the grantor.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
