import { useContext, useMemo } from 'react';

import { CatalogContext } from '@/context/catalog';
import { COLLEGES } from '@/data/colleges';
import { COURSES } from '@/data/courses';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { STUDENTS } from '@/data/students';

/** Returns fresh copies of every list (re-renders after each admin change) plus the edit actions. */
export function useCatalog() {
  const ctx = useContext(CatalogContext);
  const courses = useMemo(() => [...COURSES], [ctx?.version]);
  if (!ctx) throw new Error('useCatalog must be used inside <CatalogProvider>');
  return {
    ...ctx,
    colleges: [...COLLEGES],
    scholarships: [...SCHOLARSHIPS],
    courses,
    students: [...STUDENTS],
  };
}