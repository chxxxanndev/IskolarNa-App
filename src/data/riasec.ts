export type RiasecCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export type RiasecScore = { code: RiasecCode; label: string; score: number };

export const CODES: RiasecCode[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export const RIASEC_META: Record<RiasecCode, { label: string; blurb: string }> = {
  R: { label: 'Realistic', blurb: 'Hands-on and practical. Enjoys tools, machines, and the outdoors.' },
  I: { label: 'Investigative', blurb: 'Curious and analytical. Enjoys research and solving problems.' },
  A: { label: 'Artistic', blurb: 'Creative and expressive. Enjoys design, writing, and the arts.' },
  S: { label: 'Social', blurb: 'Caring and people-oriented. Enjoys teaching and helping others.' },
  E: { label: 'Enterprising', blurb: 'Persuasive and driven. Enjoys leading and starting ventures.' },
  C: { label: 'Conventional', blurb: 'Organized and detail-minded. Enjoys structure, data, and planning.' },
};

// Starting profile shown before the student runs Course Match (sample values).
export const DEFAULT_PROFILE: RiasecScore[] = [
  { code: 'R', label: 'Realistic', score: 35 },
  { code: 'I', label: 'Investigative', score: 82 },
  { code: 'A', label: 'Artistic', score: 48 },
  { code: 'S', label: 'Social', score: 61 },
  { code: 'E', label: 'Enterprising', score: 40 },
  { code: 'C', label: 'Conventional', score: 70 },
];

export function topCodes(profile: RiasecScore[], n = 3): RiasecCode[] {
  return [...profile]
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((p) => p.code);
}
