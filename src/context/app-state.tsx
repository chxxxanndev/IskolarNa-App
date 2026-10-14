import { createContext, useContext, useState, type ReactNode } from 'react';

import { isAdminEmail } from '@/constants/admin';
import { DEFAULT_PROFILE, type RiasecScore } from '@/data/riasec';

// Frontend-only state. Swap the bodies of these actions for backend calls later.
export type StudentInfo = {
  /** 'Grade 11' | 'Grade 12' | 'Graduated' | '' (not answered) */
  level: string;
  /** 'STEM' | 'ABM' | 'HUMSS' | 'GAS' | 'TVL' | 'Other' | '' */
  strand: string;
  /** free text, e.g. 'Dipolog City' */
  municipality: string;
  /** 'yes' | 'maybe' | 'no' | '' */
  needsScholarship: string;
};

export const EMPTY_STUDENT_INFO: StudentInfo = { level: '', strand: '', municipality: '', needsScholarship: '' };

type AppState = {
  userName: string;
  userEmail: string;
  /** true when the signed-in email is on the admin allowlist (see constants/admin.ts) */
  isAdmin: boolean;
  signIn: (name: string, email: string, info?: StudentInfo) => void;
  signOut: () => void;

  /** Optional answers collected at sign up. Empty strings = skipped. */
  studentInfo: StudentInfo;

  /** Sample values until the student runs Course Match; check `hasMatched` before showing it as real data. */
  profile: RiasecScore[];
  hasMatched: boolean;
  setProfile: (profile: RiasecScore[]) => void;

  savedColleges: string[];
  savedScholarships: string[];
  toggleCollege: (id: string) => void;
  toggleScholarship: (id: string) => void;

  /** requirement checklist progress, keyed by scholarship id */
  prepared: Record<string, string[]>;
  toggleRequirement: (scholarshipId: string, requirement: string) => void;

  reminders: string[];
  toggleReminder: (scholarshipId: string) => void;
};

const AppStateContext = createContext<AppState | null>(null);

const toggleIn = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState('Student');
  const [userEmail, setUserEmail] = useState('');
  const [studentInfo, setStudentInfo] = useState<StudentInfo>(EMPTY_STUDENT_INFO);
  const [profile, setProfileState] = useState<RiasecScore[]>(DEFAULT_PROFILE);
  const [hasMatched, setHasMatched] = useState(false);
  const [savedColleges, setSavedColleges] = useState<string[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<string[]>([]);
  const [prepared, setPrepared] = useState<Record<string, string[]>>({});
  const [reminders, setReminders] = useState<string[]>([]);

  const value: AppState = {
    userName,
    userEmail,
    isAdmin: isAdminEmail(userEmail),
    signIn: (name, email, info) => {
      setUserName(name || 'Student');
      setUserEmail(email);
      setStudentInfo(info ?? EMPTY_STUDENT_INFO);
    },
    signOut: () => {
      setUserName('Student');
      setUserEmail('');
      setStudentInfo(EMPTY_STUDENT_INFO);
      setProfileState(DEFAULT_PROFILE);
      setHasMatched(false);
      setSavedColleges([]);
      setSavedScholarships([]);
      setPrepared({});
      setReminders([]);
    },
    studentInfo,
    profile,
    hasMatched,
    setProfile: (p) => {
      setProfileState(p);
      setHasMatched(true);
    },
    savedColleges,
    savedScholarships,
    toggleCollege: (id) => setSavedColleges((l) => toggleIn(l, id)),
    toggleScholarship: (id) => setSavedScholarships((l) => toggleIn(l, id)),
    prepared,
    toggleRequirement: (sid, req) =>
      setPrepared((p) => ({ ...p, [sid]: toggleIn(p[sid] ?? [], req) })),
    reminders,
    toggleReminder: (id) => setReminders((l) => toggleIn(l, id)),
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
