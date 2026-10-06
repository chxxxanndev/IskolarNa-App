import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  padding: 18,
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 15,
  elevation: 4,
} as const;

export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View
      style={{
        height: 50,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
      }}
    >
      <Ionicons name="search-outline" size={18} color="#94A3B8" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        autoCorrect={false}
        style={{ flex: 1, marginLeft: 10, fontSize: 14, color: '#0F172A' }}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={10}>
          <Ionicons name="close-circle" size={18} color="#94A3B8" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -20 }}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
    >
      {options.map((o) => {
        const active = o === value;
        return (
          <TouchableOpacity
            key={o}
            activeOpacity={0.8}
            onPress={() => onChange(o)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: active ? '#2563EB' : '#FFFFFF',
              borderWidth: 1,
              borderColor: active ? '#2563EB' : '#E2E8F0',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#FFFFFF' : '#475569' }}>
              {o}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function Tag({ label, tone = 'blue' }: { label: string; tone?: 'blue' | 'red' | 'slate' }) {
  const tones = {
    blue: { bg: '#EFF6FF', fg: '#2563EB' },
    red: { bg: '#FEE2E2', fg: '#B91C1C' },
    slate: { bg: '#F1F5F9', fg: '#475569' },
  } as const;
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: tones[tone].bg,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '700', color: tones[tone].fg }}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 20 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: '#EFF6FF',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <Ionicons name="search-outline" size={28} color="#2563EB" />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19 }}>{message}</Text>
    </View>
  );
}

export function SaveButton({ saved, onPress }: { saved: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from saved' : 'Save'}
    >
      <Ionicons
        name={saved ? 'bookmark' : 'bookmark-outline'}
        size={22}
        color={saved ? '#2563EB' : '#94A3B8'}
      />
    </TouchableOpacity>
  );
}
