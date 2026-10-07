import { createContext, useContext, useState, type ReactNode } from 'react';

import { DEFAULT_PROFILE, type RiasecScore } from '@/data/riasec';

// Frontend-only state. Swap the bodies of these actions for backend calls later.
type AppState = {
  userName: string;
  userEmail: string;
  signIn: (name: string, email: string) => void;
  signOut: () => void;

  profile: RiasecScore[];
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
  const [profile, setProfile] = useState<RiasecScore[]>(DEFAULT_PROFILE);
  const [savedColleges, setSavedColleges] = useState<string[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<string[]>([]);
  const [prepared, setPrepared] = useState<Record<string, string[]>>({});
  const [reminders, setReminders] = useState<string[]>([]);

  const value: AppState = {
    userName,
    userEmail,
    signIn: (name, email) => {
      setUserName(name || 'Student');
      setUserEmail(email);
    },
    signOut: () => {
      setUserName('Student');
      setUserEmail('');
      setProfile(DEFAULT_PROFILE);
      setSavedColleges([]);
      setSavedScholarships([]);
      setPrepared({});
      setReminders([]);
    },
    profile,
    setProfile,
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
