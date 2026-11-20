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

import { DEFAULT_PROFILE, type RiasecScore } from "@/data/riasec";
import { supabase } from "@/lib/supabase";

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

/** Turn Supabase's technical messages into something a student can act on. */
const friendlyError = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Incorrect email or password.";
  if (m.includes("already registered"))
    return "An account with this email already exists.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first. Check your inbox.";
  if (m.includes("rate limit"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("network")) return "No internet connection. Please try again.";
  return message;
};

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
    const { data, error } = await supabase
      .from("profiles")
      .select("name, role, level, strand, municipality, needs_scholarship")
      .eq("id", user.id)
      .maybeSingle();
    if (error) console.warn("Could not load profile:", error.message);

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
    setSignedIn(true);
    return role;
  };

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
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) await hydrate(data.session.user);
      if (active) {
        ready.current = true;
        setLoading(false);
      }
    });

    // Only react to sign-out here (including a session that expired or was revoked).
    // Sign-in and sign-up load the profile themselves, so we never call Supabase from inside
    // this callback (doing that can deadlock the auth client).
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        resetLocal();
        if (ready.current) router.replace("/login");
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user)
        return { error: friendlyError(error?.message ?? "Could not sign in.") };
      return { role: await hydrate(data.user) };
    },

    signUp: async (name, email, password, info) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // The database trigger copies these into the new `profiles` row.
        options: {
          data: {
            name,
            level: info.level,
            strand: info.strand,
            municipality: info.municipality,
            needs_scholarship: info.needsScholarship,
          },
        },
      });
      if (error) return { error: friendlyError(error.message) };
      // "Confirm email" is on: the account exists but there is no session until they confirm.
      if (!data.session || !data.user) return { needsConfirmation: true };
      return { role: await hydrate(data.user) };
    },

    signOut: () => {
      resetLocal();
      // 'local' signs out this device only, not every device the student is logged in on.
      void supabase.auth.signOut({ scope: "local" });
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
