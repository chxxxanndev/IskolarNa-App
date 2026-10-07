import { COLLEGES, type College } from './colleges';
import type { RiasecCode } from './riasec';

// Sample data. `codes` lists the best-fitting interest types, strongest first.
export type Course = {
  id: string;
  name: string;
  codes: RiasecCode[];
  about: string;
  careers: string[];
};

export const COURSES: Course[] = [
  {
    id: 'bsit',
    name: 'BS Information Technology',
    codes: ['I', 'C', 'R'],
    about: 'Build, run, and secure software systems and networks.',
    careers: ['Web developer', 'Systems administrator', 'IT support specialist'],
  },
  {
    id: 'bscs',
    name: 'BS Computer Science',
    codes: ['I', 'C'],
    about: 'Study algorithms, software design, and how computers solve problems.',
    careers: ['Software engineer', 'Data analyst', 'Researcher'],
  },
  {
    id: 'bsed',
    name: 'BS Education',
    codes: ['S', 'A', 'C'],
    about: 'Prepare to teach and guide learners in the classroom.',
    careers: ['Teacher', 'School administrator', 'Curriculum developer'],
  },
  {
    id: 'bseng',
    name: 'BS Engineering',
    codes: ['R', 'I'],
    about: 'Apply math and science to design and build things that work.',
    careers: ['Civil engineer', 'Electrical engineer', 'Project engineer'],
  },
  {
    id: 'bsba',
    name: 'BS Business Administration',
    codes: ['E', 'C'],
    about: 'Learn how to manage teams, markets, and organizations.',
    careers: ['Business manager', 'Entrepreneur', 'Marketing associate'],
  },
  {
    id: 'bsa',
    name: 'BS Accountancy',
    codes: ['C', 'E'],
    about: 'Master financial records, auditing, and taxation.',
    careers: ['Accountant', 'Auditor', 'Financial analyst'],
  },
  {
    id: 'bacom',
    name: 'BA Communication',
    codes: ['A', 'S', 'E'],
    about: 'Tell stories and share ideas through media, writing, and speaking.',
    careers: ['Journalist', 'Content creator', 'Public relations officer'],
  },
  {
    id: 'bscrim',
    name: 'BS Criminology',
    codes: ['R', 'S', 'E'],
    about: 'Study crime, law enforcement, and public safety.',
    careers: ['Police officer', 'Investigator', 'Security manager'],
  },
  {
    id: 'bsn',
    name: 'BS Nursing',
    codes: ['S', 'I'],
    about: 'Provide patient care and support health in the community.',
    careers: ['Registered nurse', 'Community health nurse', 'Clinical instructor'],
  },
  {
    id: 'bsmt',
    name: 'BS Medical Technology',
    codes: ['I', 'R', 'C'],
    about: 'Run laboratory tests that help doctors diagnose illness.',
    careers: ['Medical technologist', 'Lab researcher', 'Quality analyst'],
  },
  {
    id: 'bsm',
    name: 'BS Midwifery',
    codes: ['S', 'I'],
    about: 'Support mothers and newborns through pregnancy and childbirth.',
    careers: ['Midwife', 'Maternal health worker', 'Birthing clinic staff'],
  },
];

export function collegesOffering(course: Course): College[] {
  return COLLEGES.filter((c) => c.programs.includes(course.name));
}

export function courseForProgram(programName: string): Course | undefined {
  return COURSES.find((c) => c.name === programName);
}
