import { supabase } from "@/api/client";
import { friendlyError, type ApiResult } from "@/api/errors";
import type { College } from "@/data/colleges";
import type { Course } from "@/data/courses";
import type { RiasecCode } from "@/data/riasec";
import type { Scholarship } from "@/data/scholarships";

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

// ---------------------------------------------------------------------------------------------
// Colleges. The programs a college offers live in the `college_programs` link table; here they
// are turned back into a list of course names so the screens keep reading `college.programs`.
// ---------------------------------------------------------------------------------------------
const COLLEGE_COLUMNS =
  "id, name, short, city, type, tuition, about, college_programs(courses(name))";

type CollegeRow = {
  id: string;
  name: string;
  short: string | null;
  city: string | null;
  type: string;
  tuition: number;
  about: string | null;
  college_programs: { courses: { name: string } | null }[] | null;
};

function toCollege(row: CollegeRow): College {
  const programs = (row.college_programs ?? [])
    .map((link) => link.courses?.name)
    .filter((name): name is string => !!name)
    .sort();
  return {
    id: row.id,
    name: row.name,
    short: row.short ?? "",
    city: row.city ?? "",
    type: row.type === "Private" ? "Private" : "Public",
    tuition: row.tuition,
    about: row.about ?? "",
    programs,
  };
}

/**
 * Makes the link table hold exactly the given courses (by name) for one college or scholarship.
 * Returns an error message, or null when everything was saved.
 */
async function syncCourseLinks(
  table: "college_programs" | "scholarship_courses",
  ownerColumn: "college_id" | "scholarship_id",
  ownerId: string,
  courseNames: string[],
): Promise<string | null> {
  const courses = await supabase.from("courses").select("id").in("name", courseNames);
  if (courses.error) return friendlyError(courses.error.message);
  const courseIds = (courses.data as { id: string }[]).map((c) => c.id);

  // Add the new links first, then remove the ones that were unticked.
  if (courseIds.length > 0) {
    const added = await supabase
      .from(table)
      .upsert(courseIds.map((course_id) => ({ [ownerColumn]: ownerId, course_id })));
    if (added.error) return friendlyError(added.error.message);
  }
  const prune = supabase.from(table).delete().eq(ownerColumn, ownerId);
  const pruned = courseIds.length
    ? await prune.not("course_id", "in", `(${courseIds.map((id) => `"${id}"`).join(",")})`)
    : await prune;
  return pruned.error ? friendlyError(pruned.error.message) : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Every college with the courses it offers, A to Z. */
export async function fetchColleges(): Promise<ApiResult<College[]>> {
  const { data, error } = await supabase
    .from("colleges")
    .select(COLLEGE_COLUMNS)
    .order("name");
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: (data as unknown as CollegeRow[]).map(toCollege), error: null };
}

/**
 * Adds the college, or updates it when its id is already in the database (new colleges get their
 * id from the database). Then makes the offered programs match `college.programs` (course names).
 */
export async function saveCollege(college: College): Promise<ApiResult<College>> {
  const fields = {
    name: college.name,
    short: college.short,
    city: college.city,
    type: college.type,
    tuition: college.tuition,
    about: college.about,
  };
  const saved = await supabase
    .from("colleges")
    .upsert((UUID.test(college.id) ? { id: college.id, ...fields } : fields) as Record<string, unknown>)
    .select("id")
    .single();
  if (saved.error) return { data: null, error: friendlyError(saved.error.message) };
  const collegeId = (saved.data as { id: string }).id;

  const linkError = await syncCourseLinks("college_programs", "college_id", collegeId, college.programs);
  if (linkError) return { data: null, error: linkError };

  const fresh = await supabase
    .from("colleges")
    .select(COLLEGE_COLUMNS)
    .eq("id", collegeId)
    .single();
  if (fresh.error) return { data: null, error: friendlyError(fresh.error.message) };
  return { data: toCollege(fresh.data as unknown as CollegeRow), error: null };
}

export async function deleteCollege(id: string): Promise<ApiResult<null>> {
  const { error } = await supabase.from("colleges").delete().eq("id", id);
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: null, error: null };
}

// ---------------------------------------------------------------------------------------------
// Scholarships. The database stores a `deadline` date; the screens read `daysLeft`, which is
// worked out when the list loads. The courses a scholarship covers live in `scholarship_courses`
// (no rows = open to any course).
// ---------------------------------------------------------------------------------------------
const SCHOLARSHIP_COLUMNS =
  "id, name, grantor, level, benefit, deadline, apply_url, about, eligibility, requirements, scholarship_courses(courses(name))";

type ScholarshipRow = {
  id: string;
  name: string;
  grantor: string | null;
  level: string;
  benefit: string | null;
  deadline: string | null;
  apply_url: string | null;
  about: string | null;
  eligibility: string[] | null;
  requirements: string[] | null;
  scholarship_courses: { courses: { name: string } | null }[] | null;
};

/** Whole days from today until the deadline (yyyy-mm-dd). 0 once it has passed; 365 if none is set. */
function daysUntil(deadline: string | null): number {
  if (!deadline) return 365;
  const [y, m, d] = deadline.split("-").map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86400000));
}

function toScholarship(row: ScholarshipRow): Scholarship {
  const courses = (row.scholarship_courses ?? [])
    .map((link) => link.courses?.name)
    .filter((name): name is string => !!name)
    .sort();
  return {
    id: row.id,
    name: row.name,
    grantor: row.grantor ?? "",
    level: row.level === "Local" ? "Local" : "National",
    benefit: row.benefit ?? "",
    deadline: row.deadline,
    daysLeft: daysUntil(row.deadline),
    applyUrl: row.apply_url ?? "",
    about: row.about ?? "",
    eligibility: row.eligibility ?? [],
    requirements: row.requirements ?? [],
    courses,
  };
}

/** Every scholarship, closing soonest first. */
export async function fetchScholarships(): Promise<ApiResult<Scholarship[]>> {
  const { data, error } = await supabase
    .from("scholarships")
    .select(SCHOLARSHIP_COLUMNS)
    .order("deadline", { nullsFirst: false });
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: (data as unknown as ScholarshipRow[]).map(toScholarship), error: null };
}

/** Adds the scholarship, or updates it when its id is already in the database. */
export async function saveScholarship(s: Scholarship): Promise<ApiResult<Scholarship>> {
  const deadline = (s.deadline ?? "").trim();
  const real = /^\d{4}-\d{2}-\d{2}$/.test(deadline) && !isNaN(new Date(deadline).getTime());
  if (!real) return { data: null, error: "Enter the deadline as year-month-day, like 2026-12-31." };

  const applyUrl = (s.applyUrl ?? "").trim();
  if (applyUrl && !/^https?:\/\/\S+$/i.test(applyUrl))
    return { data: null, error: "The application link must start with http:// or https://" };

  const fields = {
    name: s.name,
    grantor: s.grantor,
    level: s.level,
    benefit: s.benefit,
    deadline,
    apply_url: applyUrl || null,
    about: s.about,
    eligibility: s.eligibility,
    requirements: s.requirements,
  };
  const saved = await supabase
    .from("scholarships")
    .upsert((UUID.test(s.id) ? { id: s.id, ...fields } : fields) as Record<string, unknown>)
    .select("id")
    .single();
  if (saved.error) return { data: null, error: friendlyError(saved.error.message) };
  const scholarshipId = (saved.data as { id: string }).id;

  const linkError = await syncCourseLinks("scholarship_courses", "scholarship_id", scholarshipId, s.courses ?? []);
  if (linkError) return { data: null, error: linkError };

  const fresh = await supabase
    .from("scholarships")
    .select(SCHOLARSHIP_COLUMNS)
    .eq("id", scholarshipId)
    .single();
  if (fresh.error) return { data: null, error: friendlyError(fresh.error.message) };
  return { data: toScholarship(fresh.data as unknown as ScholarshipRow), error: null };
}

export async function deleteScholarship(id: string): Promise<ApiResult<null>> {
  const { error } = await supabase.from("scholarships").delete().eq("id", id);
  if (error) return { data: null, error: friendlyError(error.message) };
  return { data: null, error: null };
}