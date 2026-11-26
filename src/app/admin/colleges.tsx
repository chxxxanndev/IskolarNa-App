import { AdminScreen, CrudScreen } from '@/components/admin-ui';
import { formatTuition, type College } from '@/data/colleges';
import { useCatalog } from '@/hooks/use-catalog';

export default function AdminColleges() {
  const { colleges, courses, upsert, remove } = useCatalog();
  return (
    <AdminScreen title="Colleges" subtitle="Manage">
      <CrudScreen
        title="Colleges"
        noun="college"
        items={colleges}
        fields={[
          { key: 'name', label: 'Full name', kind: 'text' },
          { key: 'short', label: 'Short name', kind: 'text' },
          { key: 'city', label: 'City', kind: 'text' },
          { key: 'type', label: 'Type', kind: 'select', options: ['Public', 'Private'] },
          { key: 'tuition', label: 'Tuition per semester (₱, 0 = free)', kind: 'number' },
          { key: 'about', label: 'About', kind: 'multiline' },
          { key: 'programs', label: 'Programs offered', kind: 'multiselect', options: courses.map((c) => c.name) },
        ]}
        summary={(c) => {
          const x = c as unknown as College;
          return { title: x.name, sub: `${x.short} · ${x.city} · ${x.type}`, tags: [`Tuition: ${formatTuition(x.tuition)}`, ...x.programs] };
        }}
        searchText={(c) => {
          const x = c as unknown as College;
          return `${x.name} ${x.short} ${x.city} ${x.programs.join(' ')}`;
        }}
        makeId={() => Date.now().toString(36)}
        onSave={(c) => upsert('colleges', c)}
        onDelete={(id) => remove('colleges', id)}
      />
    </AdminScreen>
  );
}