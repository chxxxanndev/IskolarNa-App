import { AdminScreen, CrudScreen } from '@/components/admin-ui';
import type { Scholarship } from '@/data/scholarships';
import { useCatalog } from '@/hooks/use-catalog';

export default function AdminScholarships() {
  const { scholarships, courses, upsert, remove } = useCatalog();
  return (
    <AdminScreen title="Scholarships" subtitle="Manage">
      <CrudScreen
        title="Scholarships"
        noun="scholarship"
        items={scholarships}
        picture={{ label: 'Logo or poster', aspect: [1, 1] }}
        fields={[
          { key: 'name', label: 'Name', kind: 'text' },
          { key: 'grantor', label: 'Grantor', kind: 'text' },
          { key: 'level', label: 'Level', kind: 'select', options: ['National', 'Local'] },
          { key: 'benefit', label: 'Benefit (one line)', kind: 'text' },
          { key: 'deadline', label: 'Application deadline (YYYY-MM-DD)', kind: 'text' },
          { key: 'applyUrl', label: 'Application link (where students apply, optional)', kind: 'text', optional: true },
          { key: 'about', label: 'About', kind: 'multiline' },
          { key: 'eligibility', label: 'Eligibility', kind: 'list' },
          { key: 'requirements', label: 'Requirements', kind: 'list' },
          { key: 'courses', label: 'Courses covered (leave empty for any course)', kind: 'multiselect', options: courses.map((c) => c.name), optional: true },
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