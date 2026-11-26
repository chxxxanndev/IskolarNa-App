import { supabase } from "@/api/client";
import { friendlyError, type ApiResult } from "@/api/errors";
import type { RiasecScore } from "@/data/riasec";

// Each student's own data. The database only returns and accepts the signed-in student's rows
// (user_id defaults to the signed-in user), so none of these calls pass a user id.

export type StudentData = {
  savedColleges: string[];
  savedScholarships: string[];
  /** ticked checklist items, keyed by scholarship id */
  prepared: Record<string, string[]>;
  reminders: string[];
  /** the saved Course Match result, or null if the student never ran it */
  riasec: RiasecScore[] | null;
};

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Everything the signed-in student has saved. */
export async function fetchStudentData(): Promise<ApiResult<StudentData>> {
  const userId = await currentUserId();
  if (!userId) return { data: null, error: "Please sign in again." };

  const [colleges, scholarships, progress, reminders, profile] = await Promise.all([
    supabase.from("saved_colleges").select("college_id"),
    supabase.from("saved_scholarships").select("scholarship_id"),
    supabase.from("requirement_progress").select("scholarship_id, requirement"),
    supabase.from("reminders").select("scholarship_id"),
    supabase.from("profiles").select("riasec_scores").eq("id", userId).maybeSingle(),
  ]);
  const failed = [colleges, scholarships, progress, reminders, profile].find((r) => r.error);
  if (failed?.error) return { data: null, error: friendlyError(failed.error.message) };

  const prepared: Record<string, string[]> = {};
  for (const row of (progress.data ?? []) as { scholarship_id: string; requirement: string }[]) {
    (prepared[row.scholarship_id] ??= []).push(row.requirement);
  }
  return {
    data: {
      savedColleges: ((colleges.data ?? []) as { college_id: string }[]).map((r) => r.college_id),
      savedScholarships: ((scholarships.data ?? []) as { scholarship_id: string }[]).map((r) => r.scholarship_id),
      prepared,
      reminders: ((reminders.data ?? []) as { scholarship_id: string }[]).map((r) => r.scholarship_id),
      riasec: (profile.data?.riasec_scores as RiasecScore[] | null) ?? null,
    },
    error: null,
  };
}

/** Adds or removes one row of a simple "student + item" table. */
async function setRow(
  table: "saved_colleges" | "saved_scholarships" | "reminders",
  column: "college_id" | "scholarship_id",
  id: string,
  on: boolean,
): Promise<ApiResult<null>> {
  const { error } = on
    ? await supabase.from(table).upsert({ [column]: id } as Record<string, unknown>)
    : await supabase.from(table).delete().eq(column, id);
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: null, error: null };
}

export const setSavedCollege = (collegeId: string, on: boolean) =>
  setRow("saved_colleges", "college_id", collegeId, on);

export const setSavedScholarship = (scholarshipId: string, on: boolean) =>
  setRow("saved_scholarships", "scholarship_id", scholarshipId, on);

export const setReminder = (scholarshipId: string, on: boolean) =>
  setRow("reminders", "scholarship_id", scholarshipId, on);

/** Ticks or unticks one item of a scholarship's application checklist. */
export async function setRequirement(
  scholarshipId: string,
  requirement: string,
  done: boolean,
): Promise<ApiResult<null>> {
  const { error } = done
    ? await supabase
        .from("requirement_progress")
        .upsert({ scholarship_id: scholarshipId, requirement })
    : await supabase
        .from("requirement_progress")
        .delete()
        .eq("scholarship_id", scholarshipId)
        .eq("requirement", requirement);
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: null, error: null };
}

/** Saves the student's Course Match result on their profile. */
export async function saveRiasec(scores: RiasecScore[]): Promise<ApiResult<null>> {
  const userId = await currentUserId();
  if (!userId) return { data: null, error: "Please sign in again." };
  const { error } = await supabase.from("profiles").update({ riasec_scores: scores }).eq("id", userId);
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: null, error: null };
}