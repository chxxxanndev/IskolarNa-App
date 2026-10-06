import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, FilterChips, SaveButton, SearchBar, Tag, card } from '@/components/list-ui';
import { COLLEGES, type College } from '@/data/colleges';

const FILTERS = ['All', 'Public', 'Private', 'Saved'] as const;
type Filter = (typeof FILTERS)[number];

export default function Colleges() {
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
    return COLLEGES.filter((c) => {
      if (filter === 'Public' || filter === 'Private') {
        if (c.type !== filter) return false;
      }
      if (filter === 'Saved' && !saved.has(c.id)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.short.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.programs.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [query, filter, saved]);

  const renderItem = ({ item }: { item: College }) => {
    const open = openId === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setOpenId(open ? null : item.id)}
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

          <SaveButton saved={saved.has(item.id)} onPress={() => toggleSaved(item.id)} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <Tag label={item.type} tone={item.type === 'Public' ? 'blue' : 'slate'} />
          <Tag label={`${item.programs.length} programs`} tone="slate" />
          <View style={{ flex: 1 }} />
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
        </View>

        {open && (
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#EEF2F7' }}>
            <Text style={{ fontSize: 13, color: '#475569', lineHeight: 19, marginBottom: 14 }}>
              {item.about}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A', marginBottom: 8 }}>
              Programs offered
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {item.programs.map((p) => (
                <Tag key={p} label={p} />
              ))}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search school, city, or program" />
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} />
        <Text style={{ fontSize: 12, color: '#64748B' }}>
          {results.length} {results.length === 1 ? 'college' : 'colleges'} in Zamboanga del Norte
        </Text>
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
