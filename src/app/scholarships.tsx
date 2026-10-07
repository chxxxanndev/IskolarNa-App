import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppState } from '@/context/app-state';
import { EmptyState, FilterChips, SaveButton, SearchBar, Tag, card } from '@/components/list-ui';
import { SCHOLARSHIPS, type Scholarship } from '@/data/scholarships';

const FILTERS = ['All', 'Closing soon', 'National', 'Local', 'Saved'] as const;
type Filter = (typeof FILTERS)[number];

const URGENT_DAYS = 7;
const CLOSING_SOON_DAYS = 14;

export default function Scholarships() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const { savedScholarships, toggleScholarship } = useAppState();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SCHOLARSHIPS.filter((s) => {
      if (filter === 'National' || filter === 'Local') {
        if (s.level !== filter) return false;
      }
      if (filter === 'Closing soon' && s.daysLeft > CLOSING_SOON_DAYS) return false;
      if (filter === 'Saved' && !savedScholarships.includes(s.id)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.grantor.toLowerCase().includes(q) ||
        s.benefit.toLowerCase().includes(q)
      );
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [query, filter, savedScholarships]);

  const renderItem = ({ item }: { item: Scholarship }) => {
    const urgent = item.daysLeft <= URGENT_DAYS;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/scholarship/${item.id}`)}
        style={{ ...card, marginBottom: 14 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: '#EFF6FF',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="ribbon-outline" size={24} color="#2563EB" />
          </View>

          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{item.grantor}</Text>
          </View>

          <SaveButton saved={savedScholarships.includes(item.id)} onPress={() => toggleScholarship(item.id)} />
        </View>

        <Text style={{ fontSize: 13, color: '#475569', lineHeight: 19, marginTop: 12 }}>{item.benefit}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <Tag label={`${item.daysLeft} days left`} tone={urgent ? 'red' : 'blue'} />
          <Tag label={item.level} tone="slate" />
          <View style={{ flex: 1 }} />
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </View>

      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search scholarship or grantor" />
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
        <Text style={{ fontSize: 12, color: '#64748B' }}>
          {results.length} {results.length === 1 ? 'scholarship' : 'scholarships'}, closest deadline first
        </Text>
      </View>

      <FlatList
        data={results}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        ListEmptyComponent={
          <EmptyState
            title="No scholarships found"
            message={
              filter === 'Saved'
                ? 'Tap the bookmark on a scholarship to save it here.'
                : 'Try a different search or filter.'
            }
          />
        }
        ListFooterComponent={
          <Text style={{ textAlign: 'center', color: '#94A3B8', fontSize: 11, marginTop: 10 }}>
            Sample data. Confirm deadlines and requirements with the grantor.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
