import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import type { DiscoveredCandidate } from "./types";

type Db = SupabaseClient<Database>;

/** Insert of update catalog_candidate op source+external_id (of url). */
export async function persistCandidateRow(
  db: Db,
  input: {
    runId: string;
    candidate: DiscoveredCandidate;
    matchScore: number;
    matchNotes: string;
    status: "matched" | "needs_review";
  },
): Promise<string | null> {
  const { runId, candidate, matchScore, matchNotes, status } = input;
  const externalId = candidate.externalId ?? candidate.url;

  const { data: existing } = await db
    .from("catalog_candidates")
    .select("id")
    .eq("source", candidate.source)
    .eq("external_id", externalId)
    .is("deleted_at", null)
    .maybeSingle<{ id: string }>();

  const payload = {
    run_id: runId,
    source: candidate.source,
    external_id: externalId,
    brand_slug: candidate.brandSlug,
    raw_title: candidate.rawTitle,
    raw_description: candidate.rawDescription ?? null,
    capacity_kwh: candidate.capacityKwh ?? null,
    power_kw: candidate.powerKw ?? null,
    url: candidate.url,
    image_url: candidate.imageUrl ?? null,
    price_cents: candidate.priceCents ?? null,
    currency: candidate.currency ?? "EUR",
    match_score: matchScore,
    match_notes: matchNotes,
    status,
    payload: (candidate.payload ?? {}) as never,
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };

  if (existing) {
    const { error } = await db
      .from("catalog_candidates")
      .update(payload as never)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return existing.id;
  }

  const { data: inserted, error } = await db
    .from("catalog_candidates")
    .insert(payload as never)
    .select("id")
    .single<{ id: string }>();
  if (error) throw new Error(error.message);
  return inserted?.id ?? null;
}
