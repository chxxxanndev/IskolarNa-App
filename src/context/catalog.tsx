import { createContext, useContext, useState, type ReactNode } from 'react';

import { COLLEGES } from '@/data/colleges';
import { COURSES } from '@/data/courses';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { STUDENTS } from '@/data/students';

// Frontend-only "database" for the admin side. The arrays in /data are edited in place, so the
// student screens (which read them directly) show admin changes without any other edits.
// Swap `upsert` / `remove` for backend calls later.
const STORES = { colleges: COLLEGES, scholarships: SCHOLARSHIPS, courses: COURSES, students: STUDENTS };
export type CatalogKind = keyof typeof STORES;

type Catalog = {
  upsert: (kind: CatalogKind, item: { id: string }) => void;
  remove: (kind: CatalogKind, id: string) => void;
};

const CatalogContext = createContext<Catalog | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [, setVersion] = useState(0); // bump to re-render subscribers after an in-place edit

  const value: Catalog = {
    upsert: (kind, item) => {
      const list = STORES[kind] as { id: string }[];
      const i = list.findIndex((x) => x.id === item.id);
      if (i >= 0) list[i] = item;
      else list.push(item);
      setVersion((v) => v + 1);
    },
    remove: (kind, id) => {
      const list = STORES[kind] as { id: string }[];
      const i = list.findIndex((x) => x.id === id);
      if (i >= 0) list.splice(i, 1);
      setVersion((v) => v + 1);
    },
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

/** Returns fresh copies of every list (re-renders after each admin change) plus the edit actions. */
export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside <CatalogProvider>');
  return {
    ...ctx,
    colleges: [...COLLEGES],
    scholarships: [...SCHOLARSHIPS],
    courses: [...COURSES],
    students: [...STUDENTS],
  };
}
