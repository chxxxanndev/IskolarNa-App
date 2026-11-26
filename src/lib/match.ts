import { COURSES, type Course } from '@/data/courses';
import { QUESTIONS } from '@/data/questions';
import { CODES, RIASEC_META, topCodes, type RiasecCode, type RiasecScore } from '@/data/riasec';

// Frontend-only keyword matcher. Replace with the AI / backend call later,
// keeping the same `analyzeInterests` return shape so screens don't change.
const KEYWORDS: Record<RiasecCode, string[]> = {
  R: ['build', 'fix', 'repair', 'machine', 'outdoor', 'tool', 'engine', 'hands-on', 'electric', 'sport', 'security', 'police'],
  I: ['science', 'research', 'analy', 'solve', 'puzzle', 'math', 'cod', 'program', 'computer', 'data', 'experiment', 'curious', 'biology', 'laborator'],
  A: ['art', 'draw', 'design', 'writ', 'music', 'creative', 'story', 'film', 'photo', 'perform', 'media'],
  S: ['help', 'teach', 'people', 'care', 'communit', 'child', 'health', 'counsel', 'volunteer', 'patient', 'mother'],
  E: ['lead', 'business', 'sell', 'startup', 'manage', 'persuade', 'money', 'entrepreneur', 'negotiat', 'market'],
  C: ['organiz', 'detail', 'number', 'account', 'spreadsheet', 'plan', 'record', 'schedule', 'system', 'tax'],
};

export type CourseMatch = { course: Course; percent: number; reasons: RiasecCode[] };

export type MatchResult = {
  profile: RiasecScore[];
  courses: CourseMatch[];
};

const WEIGHTS = [0.5, 0.3, 0.2];

export function analyzeInterests(text: string): MatchResult | null {
  const lower = text.toLowerCase();
  const hits = {} as Record<RiasecCode, number>;
  let total = 0;
  for (const code of CODES) {
    hits[code] = KEYWORDS[code].filter((k) => lower.includes(k)).length;
    total += hits[code];
  }
  if (total === 0) return null;

  const profile: RiasecScore[] = CODES.map((code) => ({
    code,
    label: RIASEC_META[code].label,
    score: hits[code] === 0 ? 20 : Math.min(95, 35 + hits[code] * 20),
  }));
  return { profile, courses: rankCourses(profile, (code) => hits[code] > 0) };
}

/** Best 4 courses for an interest profile. `isReason` marks which interest types to credit in the result. */
function rankCourses(profile: RiasecScore[], isReason: (code: RiasecCode) => boolean): CourseMatch[] {
  const scoreOf = (code: RiasecCode) => profile.find((p) => p.code === code)!.score;
  return COURSES.map((course) => {
    const used = course.codes.slice(0, WEIGHTS.length);
    const weightSum = used.reduce((sum, _, i) => sum + WEIGHTS[i], 0);
    const raw = used.reduce((sum, code, i) => sum + scoreOf(code) * WEIGHTS[i], 0) / weightSum;
    return { course, percent: Math.round(raw), reasons: used.filter(isReason) };
  })
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 4);
}

/** Quiz version: `answers[i]` is 1..5 for QUESTIONS[i]. Each interest type gets a score from 10 to 95. */
export function analyzeAnswers(answers: number[]): MatchResult {
  const sums = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<RiasecCode, number>;
  const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<RiasecCode, number>;
  QUESTIONS.forEach((q, i) => {
    sums[q.code] += answers[i] ?? 3;
    counts[q.code] += 1;
  });
  const profile: RiasecScore[] = CODES.map((code) => {
    const lowest = counts[code];
    const highest = counts[code] * 5;
    const share = (sums[code] - lowest) / (highest - lowest);
    return { code, label: RIASEC_META[code].label, score: Math.round(10 + share * 85) };
  });
  const strongest = topCodes(profile, 3);
  return { profile, courses: rankCourses(profile, (code) => strongest.includes(code)) };
}

export const INTEREST_SUGGESTIONS = [
  'I love coding and solving puzzles',
  'I enjoy helping and teaching people',
  'I like business and leading a team',
  'I like drawing and creative writing',
];