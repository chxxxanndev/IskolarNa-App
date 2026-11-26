import { createContext, useEffect, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

import {
  deleteCollege,
  deleteCourse,
  deleteScholarship,
  fetchColleges,
  fetchCourses,
  fetchScholarships,
  saveCollege,
  saveCourse,
  saveScholarship,
} from '@/api/catalog';
import { useAppState } from '@/context/app-state';
import type { College } from '@/data/colleges';
import type { Course } from '@/data/courses';
import type { Scholarship } from '@/data/scholarships';

import { COLLEGES } from '@/data/colleges';
import { COURSES } from '@/data/courses';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { STUDENTS } from '@/data/students';

// Frontend-only "database" for the admin side. The arrays in /data are edited in place, so the
// student screens (which read them directly) show admin changes without any other edits.
// Courses, colleges and scholarships are backed by Supabase: they load after sign-in and admin changes
// are saved there. Students are still in memory until that step is done.
const STORES = { colleges: COLLEGES, scholarships: SCHOLARSHIPS, courses: COURSES, students: STUDENTS };
export type CatalogKind = keyof typeof STORES;

type Catalog = {
  version: number; // changes after every edit or load, so lists can be re-copied
  upsert: (kind: CatalogKind, item: { id: string }) => Promise<void>;
  remove: (kind: CatalogKind, id: string) => Promise<void>;
};

export const CatalogContext = createContext<Catalog | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0); // bump to re-render subscribers after an in-place edit
  const { signedIn } = useAppState();

  // Colleges and scholarships list their courses by name, so reload them whenever a course changes.
  const loadColleges = () =>
    fetchColleges().then((result) => {
      if (result.error !== null) return console.warn('Could not load colleges:', result.error);
      COLLEGES.splice(0, COLLEGES.length, ...result.data);
      setVersion((v) => v + 1);
    });

  const loadScholarships = () =>
    fetchScholarships().then((result) => {
      if (result.error !== null) return console.warn('Could not load scholarships:', result.error);
      SCHOLARSHIPS.splice(0, SCHOLARSHIPS.length, ...result.data);
      setVersion((v) => v + 1);
    });

  // Courses, colleges and scholarships live in Supabase. Reading needs a signed-in user, so load once someone
  // is signed in. If loading fails we keep the sample lists so the app still works.
  useEffect(() => {
    if (!signedIn) return;
    fetchCourses().then((result) => {
      if (result.error !== null) return console.warn('Could not load courses:', result.error);
      COURSES.splice(0, COURSES.length, ...result.data);
      setVersion((v) => v + 1);
    });
    loadColleges();
    loadScholarships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  const value: Catalog = {
    version,
    upsert: async (kind, item) => {
      if (kind === 'courses') {
        const saved = await saveCourse(item as unknown as Course);
        if (saved.error !== null) return Alert.alert('Could not save', saved.error);
        item = saved.data;
      }
      if (kind === 'colleges') {
        const saved = await saveCollege(item as unknown as College);
        if (saved.error !== null) return Alert.alert('Could not save', saved.error);
        item = saved.data;
      }
      if (kind === 'scholarships') {
        const saved = await saveScholarship(item as unknown as Scholarship);
        if (saved.error !== null) return Alert.alert('Could not save', saved.error);
        item = saved.data;
      }
      const list = STORES[kind] as { id: string }[];
      const i = list.findIndex((x) => x.id === item.id);
      if (i >= 0) list[i] = item;
      else list.push(item);
      setVersion((v) => v + 1);
      if (kind === 'courses') {
        // a renamed course changes the names that colleges and scholarships list
        loadColleges();
        loadScholarships();
      }
    },
    remove: async (kind, id) => {
      if (kind === 'courses') {
        const deleted = await deleteCourse(id);
        if (deleted.error !== null) return Alert.alert('Could not delete', deleted.error);
      }
      if (kind === 'colleges') {
        const deleted = await deleteCollege(id);
        if (deleted.error !== null) return Alert.alert('Could not delete', deleted.error);
      }
      if (kind === 'scholarships') {
        const deleted = await deleteScholarship(id);
        if (deleted.error !== null) return Alert.alert('Could not delete', deleted.error);
      }
      const list = STORES[kind] as { id: string }[];
      const i = list.findIndex((x) => x.id === id);
      if (i >= 0) list.splice(i, 1);
      setVersion((v) => v + 1);
      if (kind === 'courses') {
        loadColleges();
        loadScholarships();
      }
    },
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
