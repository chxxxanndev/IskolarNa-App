// Sample data — deadlines and requirements must be confirmed with each grantor.
export type ScholarshipLevel = 'National' | 'Local';

export type Scholarship = {
  id: string;
  name: string;
  grantor: string;
  level: ScholarshipLevel;
  benefit: string;
  daysLeft: number;
  about: string;
  eligibility: string[];
  requirements: string[];
};

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: '1',
    name: 'CHED Merit Scholarship',
    grantor: 'CHED',
    level: 'National',
    benefit: 'Financial assistance for academically strong students',
    daysLeft: 5,
    about: 'Merit-based support for high-performing students enrolled in recognized institutions.',
    eligibility: ['Filipino citizen', 'Graduating or current senior high school student', 'Strong academic standing'],
    requirements: ['Application form', 'Report card / transcript', 'Proof of income or certificate of indigency', 'Birth certificate'],
  },
  {
    id: '2',
    name: 'DOST-SEI Undergraduate Scholarship',
    grantor: 'DOST-SEI',
    level: 'National',
    benefit: 'Tuition, allowance, and other benefits for S&T courses',
    daysLeft: 12,
    about: 'For students pursuing priority science and technology degree programs.',
    eligibility: ['Filipino citizen', 'Strong grades in science and math', 'Pass the scholarship qualifying exam', 'Enrolling in a priority S&T course'],
    requirements: ['Application form', 'Certified grades', 'Birth certificate', 'Proof of family income'],
  },
  {
    id: '3',
    name: 'Local Government Scholarship',
    grantor: 'Provincial Govt.',
    level: 'Local',
    benefit: 'Varies by local government unit',
    daysLeft: 30,
    about: 'Support for residents of the province enrolling in partner schools.',
    eligibility: ['Resident of the province', 'Meets minimum grade requirement', 'Financial need'],
    requirements: ['Application letter', 'Certificate of residency', 'Grades', 'Certificate of indigency'],
  },
  {
    id: '4',
    name: 'Tertiary Education Subsidy (TES)',
    grantor: 'CHED / UniFAST',
    level: 'National',
    benefit: 'Financial subsidy for students in state and local colleges',
    daysLeft: 18,
    about: 'Helps cover education-related costs for students in need.',
    eligibility: ['Filipino citizen', 'Enrolled in a participating school', 'Priority for low-income households'],
    requirements: ['Application through your school', 'Proof of enrollment', 'Proof of household income'],
  },
  {
    id: '5',
    name: 'Municipal Educational Assistance',
    grantor: 'Municipal Govt.',
    level: 'Local',
    benefit: 'Varies by municipality',
    daysLeft: 45,
    about: 'Small grants from your municipality for qualified local students.',
    eligibility: ['Resident of the municipality', 'Enrolled or enrolling in college'],
    requirements: ['Barangay certificate', 'Proof of enrollment', 'Valid ID'],
  },
];
