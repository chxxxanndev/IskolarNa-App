import type { User } from "@supabase/supabase-js";
import { router } from "expo-router";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Alert } from "react-native";

import {
  getSessionUser,
  onSignedOut,
  signInWithPassword,
  signOutLocal,
  signUpWithEmail,
} from "@/api/auth";
import type { ApiResult } from "@/api/errors";
import { getProfile } from "@/api/profiles";
import {
  fetchStudentData,
  saveRiasec,
  setReminder,
  setRequirement,
  setSavedCollege,
  setSavedScholarship,
} from "@/api/student-data";
import { DEFAULT_PROFILE, type RiasecScore } from "@/data/riasec";

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

export const EMPTY_STUDENT_INFO: StudentInfo = {
  level: "",
  strand: "",
  municipality: "",
  needsScholarship: "",
};

/** Result of signIn / signUp. Exactly one of these is meaningful. */
export type AuthResult = {
  error?: string;
  role?: "student" | "admin";
  /** true when the project requires email confirmation, so there is no session yet */
  needsConfirmation?: boolean;
};

type AppState = {
  /** true until the saved session (if any) has been checked on app start */
  loading: boolean;
  signedIn: boolean;
  userName: string;
  userEmail: string;
  /** comes from profiles.role in Supabase */
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    name: string,
    email: string,
    password: string,
    info: StudentInfo,
  ) => Promise<AuthResult>;
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
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [userName, setUserName] = useState("Student");
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentInfo, setStudentInfo] =
    useState<StudentInfo>(EMPTY_STUDENT_INFO);
  const [profile, setProfileState] = useState<RiasecScore[]>(DEFAULT_PROFILE);
  const [hasMatched, setHasMatched] = useState(false);
  const [savedColleges, setSavedColleges] = useState<string[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<string[]>([]);
  const [prepared, setPrepared] = useState<Record<string, string[]>>({});
  const [reminders, setReminders] = useState<string[]>([]);

  const ready = useRef(false);

  /** Load this user's row from the `profiles` table into state. Returns their role. */
  const hydrate = async (user: User): Promise<"student" | "admin"> => {
    const { data, error } = await getProfile(user.id);
    if (error !== null) console.warn("Could not load profile:", error);

    const fullName =
      data?.name ??
      (user.user_metadata?.name as string | undefined) ??
      "Student";
    const role = data?.role === "admin" ? "admin" : "student";
    setUserName(fullName.trim().split(" ")[0] || "Student");
    setUserEmail(user.email ?? "");
    setIsAdmin(role === "admin");
    setStudentInfo({
      level: data?.level ?? "",
      strand: data?.strand ?? "",
      municipality: data?.municipality ?? "",
      needsScholarship: data?.needs_scholarship ?? "",
    });
    // This student's saved items and Course Match result
    const mine = await fetchStudentData();
    if (mine.error !== null) console.warn("Could not load saved data:", mine.error);
    else {
      setSavedColleges(mine.data.savedColleges);
      setSavedScholarships(mine.data.savedScholarships);
      setPrepared(mine.data.prepared);
      setReminders(mine.data.reminders);
      if (mine.data.riasec) {
        setProfileState(mine.data.riasec);
        setHasMatched(true);
      }
    }
    setSignedIn(true);
    return role;
  };

  /** Runs a save in the background; if it fails, puts the screen back and tells the student. */
  const persist = (request: Promise<ApiResult<null>>, undo: () => void) =>
    request.then((result) => {
      if (result.error === null) return;
      undo();
      Alert.alert("Could not save", result.error);
    });

  const resetLocal = () => {
    setSignedIn(false);
    setUserName("Student");
    setUserEmail("");
    setIsAdmin(false);
    setStudentInfo(EMPTY_STUDENT_INFO);
    setProfileState(DEFAULT_PROFILE);
    setHasMatched(false);
    setSavedColleges([]);
    setSavedScholarships([]);
    setPrepared({});
    setReminders([]);
  };

  useEffect(() => {
    let active = true;

    // App start: restore the saved session, if there is one.
    getSessionUser().then(async (user) => {
      if (user) await hydrate(user);
      if (active) {
        ready.current = true;
        setLoading(false);
      }
    });

    // Only react to sign-out here. Sign-in and sign-up load the profile themselves.
    const stopListening = onSignedOut(() => {
      resetLocal();
      if (ready.current) router.replace("/login");
    });

    return () => {
      active = false;
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AppState = {
    loading,
    signedIn,
    userName,
    userEmail,
    isAdmin,

    signIn: async (email, password) => {
      const result = await signInWithPassword(email, password);
      if (result.error !== null) return { error: result.error };
      return { role: await hydrate(result.data) };
    },

    signUp: async (name, email, password, info) => {
      const result = await signUpWithEmail({
        name,
        email,
        password,
        ...info,
      });
      if (result.error !== null) return { error: result.error };
      if (result.data.needsConfirmation) return { needsConfirmation: true };
      return { role: await hydrate(result.data.user) };
    },

    signOut: () => {
      resetLocal();
      void signOutLocal();
    },

    studentInfo,
    profile,
    hasMatched,
    setProfile: (p) => {
      setProfileState(p);
      setHasMatched(true);
      void persist(saveRiasec(p), () => {});
    },
    savedColleges,
    savedScholarships,
    toggleCollege: (id) => {
      const on = !savedColleges.includes(id);
      setSavedColleges((l) => toggleIn(l, id));
      void persist(setSavedCollege(id, on), () => setSavedColleges((l) => toggleIn(l, id)));
    },
    toggleScholarship: (id) => {
      const on = !savedScholarships.includes(id);
      setSavedScholarships((l) => toggleIn(l, id));
      void persist(setSavedScholarship(id, on), () => setSavedScholarships((l) => toggleIn(l, id)));
    },
    prepared,
    toggleRequirement: (sid, req) => {
      const done = !(prepared[sid] ?? []).includes(req);
      const flip = () => setPrepared((p) => ({ ...p, [sid]: toggleIn(p[sid] ?? [], req) }));
      flip();
      void persist(setRequirement(sid, req, done), flip);
    },
    reminders,
    toggleReminder: (id) => {
      const on = !reminders.includes(id);
      setReminders((l) => toggleIn(l, id));
      void persist(setReminder(id, on), () => setReminders((l) => toggleIn(l, id)));
    },
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx)
    throw new Error("useAppState must be used inside <AppStateProvider>");
  return ctx;
}