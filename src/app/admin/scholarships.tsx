import { AdminScreen, CrudScreen } from '@/components/admin-ui';
import { useCatalog } from '@/context/catalog';
import type { Scholarship } from '@/data/scholarships';

export default function AdminScholarships() {
  const { scholarships, upsert, remove } = useCatalog();
  return (
    <AdminScreen title="Scholarships" subtitle="Manage">
      <CrudScreen
        title="Scholarships"
        noun="scholarship"
        items={scholarships}
        fields={[
          { key: 'name', label: 'Name', kind: 'text' },
          { key: 'grantor', label: 'Grantor', kind: 'text' },
          { key: 'level', label: 'Level', kind: 'select', options: ['National', 'Local'] },
          { key: 'benefit', label: 'Benefit (one line)', kind: 'text' },
          { key: 'daysLeft', label: 'Days left to apply', kind: 'number' },
          { key: 'about', label: 'About', kind: 'multiline' },
          { key: 'eligibility', label: 'Eligibility', kind: 'list' },
          { key: 'requirements', label: 'Requirements', kind: 'list' },
        ]}
        summary={(s) => {
          const x = s as unknown as Scholarship;
          return { title: x.name, sub: `${x.grantor} · ${x.level} · ${x.daysLeft} days left`, tags: [x.benefit] };
        }}
        searchText={(s) => {
          const x = s as unknown as Scholarship;
          return `${x.name} ${x.grantor} ${x.level} ${x.benefit}`;
        }}
        makeId={() => Date.now().toString(36)}
        onSave={(s) => upsert('scholarships', s)}
        onDelete={(id) => remove('scholarships', id)}
      />
    </AdminScreen>
  );
}
