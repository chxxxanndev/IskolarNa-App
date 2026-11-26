import { supabase } from "@/api/client";
import { friendlyError, type ApiResult } from "@/api/errors";
import type { Course } from "@/data/courses";
import type { RiasecCode } from "@/data/riasec";

// Courses table: id (text), name, codes[], about, careers[]. Any text column can be empty in the database.
const COURSE_COLUMNS = "id, name, codes, about, careers";

type CourseRow = {
  id: string;
  name: string;
  codes: string[] | null;
  about: string | null;
  careers: string[] | null;
};

function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    name: row.name,
    codes: (row.codes ?? []) as RiasecCode[],
    about: row.about ?? "",
    careers: row.careers ?? [],
  };
}

/** Every course, A to Z. */
export async function fetchCourses(): Promise<ApiResult<Course[]>> {
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .order("name");
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: (data as CourseRow[]).map(toCourse), error: null };
}

/** Adds the course, or updates it when a course with the same id already exists. */
export async function saveCourse(course: Course): Promise<ApiResult<Course>> {
  const { data, error } = await supabase
    .from("courses")
    .upsert({
      id: course.id,
      name: course.name,
      codes: course.codes,
      about: course.about,
      careers: course.careers,
    })
    .select(COURSE_COLUMNS)
    .single();
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: toCourse(data as CourseRow), error: null };
}

export async function deleteCourse(id: string): Promise<ApiResult<null>> {
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: null, error: null };
}