import { AdminScreen, CrudScreen } from '@/components/admin-ui';
import { useCatalog } from '@/context/catalog';
import type { Course } from '@/data/courses';
import { CODES, RIASEC_META } from '@/data/riasec';

export default function AdminCourses() {
  const { courses, upsert, remove } = useCatalog();
  return (
    <AdminScreen title="Courses" subtitle="Manage · Course Match">
      <CrudScreen
        title="Courses"
        noun="course"
        items={courses}
        fields={[
          { key: 'name', label: 'Course name', kind: 'text' },
          {
            key: 'codes',
            label: 'Best-fit interest types (tap in order, strongest first)',
            kind: 'multiselect',
            options: CODES,
            hint: 'R Realistic · I Investigative · A Artistic · S Social · E Enterprising · C Conventional. The order you tap sets how Course Match weighs them.',
          },
          { key: 'about', label: 'About', kind: 'multiline' },
          { key: 'careers', label: 'Careers', kind: 'list' },
        ]}
        summary={(c) => {
          const x = c as unknown as Course;
          return { title: x.name, sub: x.codes.map((k) => RIASEC_META[k].label).join(' · '), tags: x.careers };
        }}
        searchText={(c) => {
          const x = c as unknown as Course;
          return `${x.name} ${x.codes.join(' ')} ${x.careers.join(' ')}`;
        }}
        makeId={(v) => String(v.name).toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12) || Date.now().toString(36)}
        onSave={(c) => upsert('courses', c)}
        onDelete={(id) => remove('courses', id)}
      />
    </AdminScreen>
  );
}
