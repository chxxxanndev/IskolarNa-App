import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavScroll } from '@/context/nav-visibility';
import { Button, EmptyState, SearchBar, Tag, card } from '@/components/list-ui';

/** Shared page shell for every admin screen: back button, title, scrollable body. */
export function AdminScreen({
  title,
  subtitle,
  back = false,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  children: ReactNode;
}) {
  const nav = useNavScroll();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <ScrollView
        {...nav.scrollProps}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: nav.bottomPad, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {back && (
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/admin'))}
              accessibilityLabel="Back"
              style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name="chevron-back" size={20} color="#2563EB" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            {subtitle ? <Text style={{ fontSize: 13, color: '#64748B' }}>{subtitle}</Text> : null}
            <Text numberOfLines={1} style={{ fontSize: 24, fontWeight: '800', color: '#1E3A8A', letterSpacing: -0.5 }}>
              {title}
            </Text>
          </View>
          {right}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Generic list + add/edit/delete screen ----------

export type FieldDef = {
  key: string;
  label: string;
  kind: 'text' | 'multiline' | 'number' | 'select' | 'multiselect' | 'list';
  options?: readonly string[];
  hint?: string;
  optional?: boolean;
};

type Row = { id: string } & Record<string, unknown>;
type FormValues = Record<string, string | string[]>;

const toForm = (item: Row | null, fields: FieldDef[]): FormValues =>
  Object.fromEntries(
    fields.map((f) => {
      const v = item?.[f.key];
      if (f.kind === 'list') return [f.key, Array.isArray(v) ? v.join('\n') : ''];
      if (f.kind === 'multiselect') return [f.key, Array.isArray(v) ? (v as string[]) : []];
      return [f.key, v === undefined || v === null ? (f.options?.[0] && f.kind === 'select' ? f.options[0] : '') : String(v)];
    }),
  );

const fromForm = (values: FormValues, fields: FieldDef[]) =>
  Object.fromEntries(
    fields.map((f) => {
      const v = values[f.key];
      if (f.kind === 'list') return [f.key, String(v).split('\n').map((x) => x.trim()).filter(Boolean)];
      if (f.kind === 'number') return [f.key, Number(v) || 0];
      if (f.kind === 'multiselect') return [f.key, v];
      return [f.key, String(v).trim()];
    }),
  );

const inputBox = { borderWidth: 1, borderColor: '#DBE3F0', borderRadius: 14, backgroundColor: '#F8FAFC', paddingHorizontal: 16 } as const;

function ChipPicker({ options, value, onToggle }: { options: readonly string[]; value: string[]; onToggle: (o: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const active = value.includes(o);
        return (
          <TouchableOpacity
            key={o}
            activeOpacity={0.8}
            onPress={() => onToggle(o)}
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: active ? '#2563EB' : '#FFFFFF', borderWidth: 1, borderColor: active ? '#2563EB' : '#E2E8F0' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#FFFFFF' : '#475569' }}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function CrudScreen({
  title,
  noun,
  items,
  fields,
  summary,
  searchText,
  makeId,
  onSave,
  onDelete,
  allowAdd = true,
}: {
  title: string;
  noun: string;
  items: Row[];
  fields: FieldDef[];
  summary: (item: Row) => { title: string; sub?: string; tags?: string[] };
  searchText: (item: Row) => string;
  makeId: (values: Record<string, unknown>) => string;
  onSave: (item: Row) => void;
  onDelete: (id: string) => void;
  allowAdd?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<Row | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => searchText(i).toLowerCase().includes(q)) : items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query]);

  const open = (row: Row | 'new') => {
    setValues(toForm(row === 'new' ? null : row, fields));
    setError('');
    setEditing(row);
  };

  const save = () => {
    const missing = fields.filter((f) => !f.optional && f.kind !== 'number' && (Array.isArray(values[f.key]) ? values[f.key].length === 0 : !String(values[f.key]).trim()));
    if (missing.length) return setError(`Please fill in: ${missing.map((m) => m.label).join(', ')}.`);
    const data = fromForm(values, fields);
    const id = editing === 'new' ? makeId(data) : (editing as Row).id;
    onSave({ ...(editing === 'new' ? {} : (editing as Row)), ...data, id });
    setEditing(null);
  };

  return (
    <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder={`Search ${title.toLowerCase()}`} />
        </View>
        {allowAdd && (
          <TouchableOpacity
            onPress={() => open('new')}
            accessibilityLabel={`Add ${noun}`}
            style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={{ fontSize: 13, color: '#64748B' }}>
        {results.length} {noun}
        {results.length === 1 ? '' : 's'}
      </Text>

      {results.length === 0 ? (
        <EmptyState title={`No ${noun}s found`} message="Try a different search, or add a new one." />
      ) : (
        results.map((item) => {
          const s = summary(item);
          return (
            <View key={item.id} style={{ ...card, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>{s.title}</Text>
                  {s.sub ? <Text style={{ fontSize: 13, color: '#64748B', marginTop: 3, lineHeight: 18 }}>{s.sub}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => open(item)} hitSlop={8} accessibilityLabel={`Edit ${s.title}`}>
                  <Ionicons name="create-outline" size={22} color="#2563EB" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setToDelete(item)} hitSlop={8} accessibilityLabel={`Delete ${s.title}`}>
                  <Ionicons name="trash-outline" size={22} color="#B91C1C" />
                </TouchableOpacity>
              </View>
              {s.tags && s.tags.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {s.tags.map((t) => (
                    <Tag key={t} label={t} tone="slate" />
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}

      {/* Add / edit form */}
      <Modal visible={editing !== null} animationType="slide" onRequestClose={() => setEditing(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E3A8A' }}>
                {editing === 'new' ? `Add ${noun}` : `Edit ${noun}`}
              </Text>
              <TouchableOpacity onPress={() => setEditing(null)} hitSlop={10} accessibilityLabel="Close">
                <Ionicons name="close" size={26} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
              <View style={{ ...card, padding: 22 }}>
                {fields.map((f) => (
                  <View key={f.key} style={{ marginBottom: 18 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 }}>{f.label}</Text>
                    {f.kind === 'select' && (
                      <ChipPicker options={f.options ?? []} value={[String(values[f.key])]} onToggle={(o) => setValues((v) => ({ ...v, [f.key]: o }))} />
                    )}
                    {f.kind === 'multiselect' && (
                      <ChipPicker
                        options={f.options ?? []}
                        value={values[f.key] as string[]}
                        onToggle={(o) =>
                          setValues((v) => {
                            const cur = v[f.key] as string[];
                            return { ...v, [f.key]: cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o] };
                          })
                        }
                      />
                    )}
                    {(f.kind === 'text' || f.kind === 'number') && (
                      <View style={{ ...inputBox, height: 54, justifyContent: 'center' }}>
                        <TextInput
                          value={String(values[f.key] ?? '')}
                          onChangeText={(t) => setValues((v) => ({ ...v, [f.key]: t }))}
                          keyboardType={f.kind === 'number' ? 'numeric' : 'default'}
                          placeholderTextColor="#94A3B8"
                          style={{ fontSize: 15, color: '#0F172A' }}
                        />
                      </View>
                    )}
                    {(f.kind === 'multiline' || f.kind === 'list') && (
                      <View style={{ ...inputBox, minHeight: f.kind === 'list' ? 110 : 96, paddingVertical: 12 }}>
                        <TextInput
                          value={String(values[f.key] ?? '')}
                          onChangeText={(t) => setValues((v) => ({ ...v, [f.key]: t }))}
                          multiline
                          textAlignVertical="top"
                          placeholderTextColor="#94A3B8"
                          style={{ fontSize: 15, color: '#0F172A', minHeight: 70 }}
                        />
                      </View>
                    )}
                    {f.kind === 'list' && <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>One item per line</Text>}
                    {f.hint ? <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>{f.hint}</Text> : null}
                  </View>
                ))}
                {error ? <Text style={{ color: '#B91C1C', fontSize: 13, fontWeight: '600', marginBottom: 12, textAlign: 'center' }}>{error}</Text> : null}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button label="Cancel" variant="secondary" flex onPress={() => setEditing(null)} />
                  <Button label="Save" icon="checkmark" flex onPress={save} />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Delete confirmation (own modal so it also works on web, where Alert has no buttons) */}
      <Modal visible={toDelete !== null} transparent animationType="fade" onRequestClose={() => setToDelete(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: 24 }}>
          <View style={{ ...card, padding: 22, gap: 6 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>Delete this {noun}?</Text>
            <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 12 }}>
              {toDelete ? summary(toDelete).title : ''} will be removed. This can’t be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" flex onPress={() => setToDelete(null)} />
              <Button
                label="Delete"
                variant="danger"
                icon="trash-outline"
                flex
                onPress={() => {
                  if (toDelete) onDelete(toDelete.id);
                  setToDelete(null);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
