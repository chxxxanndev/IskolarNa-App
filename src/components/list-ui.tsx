import { Ionicons } from "@expo/vector-icons";
import type React from "react";
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

export function ProgressBar({ value, color = '#2563EB' }: { value: number; color?: string }) {
  return (
    <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0' }}>
      <View
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  flex = false,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  flex?: boolean;
}) {
  const styles = {
    primary: { bg: '#2563EB', fg: '#FFFFFF', border: '#2563EB' },
    secondary: { bg: '#FFFFFF', fg: '#2563EB', border: '#BFDBFE' },
    danger: { bg: '#FFFFFF', fg: '#B91C1C', border: '#FECACA' },
  }[variant];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={{
        flex: flex ? 1 : undefined,
        height: 50,
        borderRadius: 14,
        backgroundColor: styles.bg,
        borderWidth: 1,
        borderColor: styles.border,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon && <Ionicons name={icon} size={18} color={styles.fg} />}
      <Text style={{ color: styles.fg, fontSize: 15, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function BulletList({
  title,
  items,
  icon = 'checkmark-circle-outline',
}: {
  title: string;
  items: string[];
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View>
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 10 }}>{title}</Text>
      {items.map((it) => (
        <View key={it} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
          <Ionicons name={icon} size={16} color="#2563EB" style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, color: '#475569', lineHeight: 19 }}>{it}</Text>
        </View>
      ))}
    </View>
  );
}
