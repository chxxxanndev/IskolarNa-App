// Sample data — the student list is a mock until sign ups are stored in a backend.
export type Student = {
  id: string;
  name: string;
  email: string;
  level: string;
  strand: string;
  municipality: string;
  needsScholarship: string;
};

export const STUDENTS: Student[] = [
  { id: 's1', name: 'Maria Santos', email: 'maria.santos@example.com', level: 'Grade 12', strand: 'STEM', municipality: 'Dipolog City', needsScholarship: 'yes' },
  { id: 's2', name: 'Juan Dela Cruz', email: 'juan.delacruz@example.com', level: 'Grade 11', strand: 'ABM', municipality: 'Dapitan City', needsScholarship: 'maybe' },
  { id: 's3', name: 'Ana Reyes', email: 'ana.reyes@example.com', level: 'Grade 12', strand: 'HUMSS', municipality: 'Polanco', needsScholarship: 'yes' },
  { id: 's4', name: 'Carlo Mendoza', email: 'carlo.mendoza@example.com', level: 'Graduated', strand: 'TVL', municipality: 'Sindangan', needsScholarship: 'no' },
  { id: 's5', name: 'Liza Bautista', email: 'liza.bautista@example.com', level: 'Grade 11', strand: 'STEM', municipality: 'Dipolog City', needsScholarship: 'yes' },
];
