import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { checkBackend, type BackendReport } from '@/api/status';
import { AdminScreen } from '@/components/admin-ui';
import { Button, Tag, card } from '@/components/list-ui';
import { useAppState } from '@/context/app-state';

const TABLES = [
  { table: 'profiles', label: 'Signed-up users', icon: 'people-outline' },
  { table: 'colleges', label: 'Colleges', icon: 'school-outline' },
  { table: 'courses', label: 'Courses', icon: 'compass-outline' },
  { table: 'scholarships', label: 'Scholarships', icon: 'ribbon-outline' },
  { table: 'college_programs', label: 'College programs (links)', icon: 'link-outline' },
  { table: 'scholarship_courses', label: 'Scholarship courses (links)', icon: 'link-outline' },
] as const;

const hostOf = (url?: string) => (url ?? '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');

/** Live proof that the app, Supabase Auth and the database are connected. Admin only (it counts every user). */
export default function BackendStatus() {
  const { isAdmin } = useAppState();
  const [report, setReport] = useState<BackendReport | null>(null);
  const [busy, setBusy] = useState(true);
  const [failure, setFailure] = useState('');

  const run = useCallback(async () => {
    setBusy(true);
    setFailure('');
    const result = await checkBackend(TABLES.map((t) => t.table));
    if (result.error !== null) setFailure(result.error);
    else setReport(result.data);
    setBusy(false);
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const problems = report ? [report.authError, ...Object.values(report.tableErrors)].filter(Boolean) : [];
  const healthy = !!report && problems.length === 0;

  return (
    <AdminScreen title="Backend status" subtitle="Progress check" back>
      <View style={{ ...card, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons
            name={failure || problems.length ? 'close-circle' : healthy ? 'checkmark-circle' : 'time-outline'}
            size={28}
            color={failure || problems.length ? '#B91C1C' : healthy ? '#16A34A' : '#64748B'}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>
              {failure || problems.length ? 'Problem found' : healthy ? 'Connected to Supabase' : 'Checking…'}
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{hostOf(process.env.EXPO_PUBLIC_SUPABASE_URL)}</Text>
          </View>
          {healthy && <Tag label={`${report!.ms} ms`} tone="blue" />}
        </View>
        {failure ? <Text style={{ fontSize: 13, color: '#B91C1C' }}>{failure}</Text> : null}
        {problems.map((p) => (
          <Text key={p} style={{ fontSize: 13, color: '#B91C1C' }}>{p}</Text>
        ))}
      </View>

      {report && (
        <>
          <View style={{ ...card, gap: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>Authentication</Text>
            <Text style={{ fontSize: 13, color: '#475569' }}>Signed in as {report.authEmail ?? 'unknown'}</Text>
            <Text style={{ fontSize: 13, color: '#475569' }}>Role: {isAdmin ? 'admin' : 'student'} (from the profiles table)</Text>
          </View>

          <View style={{ ...card, gap: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>Rows in the database</Text>
            {TABLES.map((t) => (
              <View key={t.table} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name={t.icon} size={20} color="#2563EB" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>{t.label}</Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8' }}>table: {t.table}</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: report.tableErrors[t.table] ? '#B91C1C' : '#1E3A8A' }}>
                  {report.tableErrors[t.table] ? 'error' : report.counts[t.table] ?? '?'}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ ...card, gap: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>Latest signup</Text>
            {report.latest ? (
              <>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155' }}>{report.latest.name}</Text>
                <Text style={{ fontSize: 13, color: '#64748B' }}>{report.latest.email}</Text>
                <Text style={{ fontSize: 12, color: '#94A3B8' }}>{new Date(report.latest.created_at).toLocaleString()}</Text>
              </>
            ) : (
              <Text style={{ fontSize: 13, color: '#64748B' }}>No users yet.</Text>
            )}
          </View>

          <Text style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>
            Checked {report.checkedAt.toLocaleTimeString()} · every number is read live from Supabase
          </Text>
        </>
      )}

      <Button label="Check again" icon="refresh" loading={busy} onPress={run} />
    </AdminScreen>
  );
}