import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, FilterChips, SaveButton, SearchBar, Tag, card } from '@/components/list-ui';
import { SCHOLARSHIPS, type Scholarship } from '@/data/scholarships';

const FILTERS = ['All', 'Closing soon', 'National', 'Local', 'Saved'] as const;
type Filter = (typeof FILTERS)[number];

const URGENT_DAYS = 7;
const CLOSING_SOON_DAYS = 14;

function Checklist({ title, items, icon }: { title: string; items: string[]; icon: 'checkmark-circle-outline' | 'document-text-outline' }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A', marginBottom: 8 }}>{title}</Text>
      {items.map((it) => (
        <View key={it} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
          <Ionicons name={icon} size={16} color="#2563EB" style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, color: '#475569', lineHeight: 18 }}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Scholarships() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const toggleSaved = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SCHOLARSHIPS.filter((s) => {
      if (filter === 'National' || filter === 'Local') {
        if (s.level !== filter) return false;
      }
      if (filter === 'Closing soon' && s.daysLeft > CLOSING_SOON_DAYS) return false;
      if (filter === 'Saved' && !saved.has(s.id)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.grantor.toLowerCase().includes(q) ||
        s.benefit.toLowerCase().includes(q)
      );
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [query, filter, saved]);

  const renderItem = ({ item }: { item: Scholarship }) => {
    const open = openId === item.id;
    const urgent = item.daysLeft <= URGENT_DAYS;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setOpenId(open ? null : item.id)}
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

          <SaveButton saved={saved.has(item.id)} onPress={() => toggleSaved(item.id)} />
        </View>

        <Text style={{ fontSize: 13, color: '#475569', lineHeight: 19, marginTop: 12 }}>{item.benefit}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <Tag label={`${item.daysLeft} days left`} tone={urgent ? 'red' : 'blue'} />
          <Tag label={item.level} tone="slate" />
          <View style={{ flex: 1 }} />
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
        </View>

        {open && (
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#EEF2F7' }}>
            <Text style={{ fontSize: 13, color: '#475569', lineHeight: 19, marginBottom: 14 }}>
              {item.about}
            </Text>
            <Checklist title="Who can apply" items={item.eligibility} icon="checkmark-circle-outline" />
            <Checklist title="What to prepare" items={item.requirements} icon="document-text-outline" />
          </View>
        )}
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
