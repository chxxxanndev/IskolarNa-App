import type React from "react";
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, Tag, card } from '@/components/list-ui';
import { COLLEGES } from '@/data/colleges';

const MAX = 3;

export default function Compare() {
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  const [selected, setSelected] = useState<string[]>(
    (ids ?? '')
      .split(',')
      .filter((id) => COLLEGES.some((c) => c.id === id))
      .slice(0, MAX),
  );

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX ? cur : [...cur, id]));

  const chosen = COLLEGES.filter((c) => selected.includes(c.id));
  const programCount = (name: string) => chosen.filter((c) => c.programs.includes(name)).length;
  const allPrograms = Array.from(new Set(chosen.flatMap((c) => c.programs)));

  const Row = ({ label, render }: { label: string; render: (c: (typeof COLLEGES)[number]) => React.ReactNode }) => (
    <View style={{ ...card, padding: 14, marginBottom: 12 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {chosen.map((c) => (
          <View key={c.id} style={{ flex: 1 }}>
            {render(c)}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
          Pick 2 or 3 colleges ({selected.length}/{MAX} selected).
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {COLLEGES.map((c) => {
            const on = selected.includes(c.id);
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => toggle(c.id)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: on ? '#2563EB' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: on ? '#2563EB' : '#E2E8F0',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: on ? '#FFFFFF' : '#475569' }}>{c.short}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {chosen.length < 2 ? (
          <EmptyState title="Choose at least two colleges" message="Select colleges above to see them side by side." />
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              {chosen.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/college/${c.id}`)}
                  style={{ ...card, flex: 1, alignItems: 'center', padding: 14 }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: '#1E3A8A',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>{c.short}</Text>
                  </View>
                  <Text numberOfLines={3} style={{ fontSize: 12, fontWeight: '700', color: '#0F172A', textAlign: 'center' }}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Row label="Type" render={(c) => <Tag label={c.type} tone={c.type === 'Public' ? 'blue' : 'slate'} />} />
            <Row label="City" render={(c) => <Text style={{ fontSize: 13, color: '#334155' }}>{c.city}</Text>} />
            <Row
              label="Programs"
              render={(c) => <Text style={{ fontSize: 20, fontWeight: '800', color: '#2563EB' }}>{c.programs.length}</Text>}
            />
            <Row
              label="Program list"
              render={(c) => (
                <View style={{ gap: 6 }}>
                  {c.programs.map((p) => {
                    const shared = programCount(p) > 1;
                    return (
                      <Text
                        key={p}
                        style={{ fontSize: 12, lineHeight: 16, fontWeight: shared ? '700' : '400', color: shared ? '#2563EB' : '#475569' }}
                      >
                        {p}
                      </Text>
                    );
                  })}
                </View>
              )}
            />
            <Text style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>
              Blue programs are offered by more than one selected college ({allPrograms.filter((p) => programCount(p) > 1).length} shared).
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
