import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import type { CatalogCandidateRow, CatalogRunRow } from "@/lib/db/database.types";

function getDb() {
  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Admin-database niet geconfigureerd.");
  }
  return createSupabaseServiceClient();
}

export async function listCatalogCandidates(limit = 50): Promise<CatalogCandidateRow[]> {
  const db = getDb();
  const { data, error } = await db
    .from("catalog_candidates")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<CatalogCandidateRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listRecentCatalogRuns(limit = 10): Promise<CatalogRunRow[]> {
  const db = getDb();
  const { data, error } = await db
    .from("catalog_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit)
    .returns<CatalogRunRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCatalogCandidateById(id: string): Promise<CatalogCandidateRow | null> {
  const db = getDb();
  const { data, error } = await db
    .from("catalog_candidates")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<CatalogCandidateRow>();
  if (error) throw new Error(error.message);
  return data;
}
