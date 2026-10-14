import { AdminScreen, CrudScreen } from '@/components/admin-ui';
import { useCatalog } from '@/context/catalog';
import type { Student } from '@/data/students';

const NEEDS: Record<string, string> = { yes: 'Needs scholarship', maybe: 'Unsure', no: 'No scholarship' };

export default function AdminStudents() {
  const { students, upsert, remove } = useCatalog();
  return (
    <AdminScreen title="Students" subtitle="Manage">
      <CrudScreen
        title="Students"
        noun="student"
        allowAdd={false}
        items={students}
        fields={[
          { key: 'name', label: 'Name', kind: 'text' },
          { key: 'email', label: 'Email', kind: 'text' },
          { key: 'level', label: 'Level', kind: 'select', options: ['Grade 11', 'Grade 12', 'Graduated'] },
          { key: 'strand', label: 'Strand', kind: 'select', options: ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'Other'] },
          { key: 'municipality', label: 'Municipality', kind: 'text' },
          { key: 'needsScholarship', label: 'Needs a scholarship?', kind: 'select', options: ['yes', 'maybe', 'no'] },
        ]}
        summary={(s) => {
          const x = s as unknown as Student;
          return { title: x.name, sub: x.email, tags: [x.level, x.strand, x.municipality, NEEDS[x.needsScholarship]].filter(Boolean) };
        }}
        searchText={(s) => {
          const x = s as unknown as Student;
          return `${x.name} ${x.email} ${x.level} ${x.strand} ${x.municipality}`;
        }}
        makeId={() => Date.now().toString(36)}
        onSave={(s) => upsert('students', s)}
        onDelete={(id) => remove('students', id)}
      />
    </AdminScreen>
  );
}
