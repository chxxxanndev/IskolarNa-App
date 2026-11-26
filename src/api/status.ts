import { supabase } from "@/api/client";
import { friendlyError, type ApiResult } from "@/api/errors";

export type BackendReport = {
  ms: number; // how long the check took
  authEmail: string | null;
  authError: string;
  counts: Record<string, number | null>; // rows per table
  tableErrors: Record<string, string>; // tables that could not be read
  latest: { name: string; email: string; created_at: string } | null; // newest signup
  checkedAt: Date;
};

/** Reads live from Supabase: who is signed in, how many rows each table has, and the newest signup. */
export async function checkBackend(tables: readonly string[]): Promise<ApiResult<BackendReport>> {
  try {
    const started = Date.now();
    const [auth, latest, ...counted] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("profiles")
        .select("name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(1),
      ...tables.map((t) => supabase.from(t).select("*", { count: "exact", head: true })),
    ]);
    const counts: Record<string, number | null> = {};
    const tableErrors: Record<string, string> = {};
    tables.forEach((t, i) => {
      counts[t] = counted[i].count;
      if (counted[i].error) tableErrors[t] = counted[i].error.message;
    });
    return {
      data: {
        ms: Date.now() - started,
        authEmail: auth.data.user?.email ?? null,
        authError: auth.error?.message ?? "",
        counts,
        tableErrors,
        latest: (latest.data?.[0] as BackendReport["latest"]) ?? null,
        checkedAt: new Date(),
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: friendlyError(e instanceof Error ? e.message : "network") };
  }
}