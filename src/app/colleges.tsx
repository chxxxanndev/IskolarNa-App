import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppState } from '@/context/app-state';
import { EmptyState, FilterChips, SaveButton, SearchBar, Tag, card } from '@/components/list-ui';
import { COLLEGES, type College } from '@/data/colleges';

const FILTERS = ['All', 'Public', 'Private', 'Saved'] as const;
type Filter = (typeof FILTERS)[number];

export default function Colleges() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const { savedColleges, toggleCollege } = useAppState();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COLLEGES.filter((c) => {
      if (filter === 'Public' || filter === 'Private') {
        if (c.type !== filter) return false;
      }
      if (filter === 'Saved' && !savedColleges.includes(c.id)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.short.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.programs.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [query, filter, savedColleges]);

  const renderItem = ({ item }: { item: College }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/college/${item.id}`)}
        style={{ ...card, marginBottom: 14 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: '#1E3A8A',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>{item.short}</Text>
          </View>

          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
              <Ionicons name="location-outline" size={13} color="#64748B" />
              <Text style={{ fontSize: 12, color: '#64748B' }}>{item.city}</Text>
            </View>
          </View>

          <SaveButton saved={savedColleges.includes(item.id)} onPress={() => toggleCollege(item.id)} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <Tag label={item.type} tone={item.type === 'Public' ? 'blue' : 'slate'} />
          <Tag label={`${item.programs.length} programs`} tone="slate" />
          <View style={{ flex: 1 }} />
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </View>

      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search school, city, or program" />
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, color: '#64748B' }}>
            {results.length} {results.length === 1 ? 'college' : 'colleges'} in Zamboanga del Norte
          </Text>
          <TouchableOpacity onPress={() => router.push('/compare')} hitSlop={10}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#2563EB' }}>Compare</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        ListEmptyComponent={
          <EmptyState
            title="No colleges found"
            message={
              filter === 'Saved'
                ? 'Tap the bookmark on a college to save it here.'
                : 'Try a different search or filter.'
            }
          />
        }
        ListFooterComponent={
          <Text style={{ textAlign: 'center', color: '#94A3B8', fontSize: 11, marginTop: 10 }}>
            Sample data. Confirm programs and admissions with each school.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
