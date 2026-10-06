// Sample data — replace with your backend (e.g. Firestore) when ready.
export type CollegeType = 'Public' | 'Private';

export type College = {
  id: string;
  name: string;
  short: string;
  city: string;
  type: CollegeType;
  about: string;
  programs: string[];
};

export const COLLEGES: College[] = [
  {
    id: '1',
    name: 'Jose Rizal Memorial State University',
    short: 'JRMSU',
    city: 'Dapitan',
    type: 'Public',
    about:
      'A state university serving Zamboanga del Norte with programs in computing, education, engineering, and the sciences.',
    programs: ['BS Information Technology', 'BS Computer Science', 'BS Education', 'BS Engineering'],
  },
  {
    id: '2',
    name: 'Andres Bonifacio College',
    short: 'ABC',
    city: 'Dipolog',
    type: 'Private',
    about:
      'A private college in Dipolog offering a mix of business, education, and technical programs.',
    programs: ['BS Business Administration', 'BS Education', 'BS Information Technology'],
  },
  {
    id: '3',
    name: "Saint Vincent's College",
    short: 'SVC',
    city: 'Dipolog',
    type: 'Private',
    about:
      'A private college in Dipolog with programs in education, business, and the liberal arts.',
    programs: ['BS Education', 'BS Accountancy', 'BA Communication', 'BS Criminology'],
  },
  {
    id: '4',
    name: 'Dipolog Medical Center College Foundation',
    short: 'DMCCFI',
    city: 'Dipolog',
    type: 'Private',
    about:
      'A private college focused on health and allied-health programs, linked to a medical center.',
    programs: ['BS Nursing', 'BS Medical Technology', 'BS Midwifery'],
  },
];
