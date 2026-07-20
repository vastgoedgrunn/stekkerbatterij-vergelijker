import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import { discoverCatalogCandidates } from "./discover";
import { scoreSkuMatch } from "./match-sku";
import { persistCandidateRow } from "./persist-candidate";
import { publishProductIfReady } from "./publish.server";
import { refreshBolOfferPrices } from "./refresh-bol-prices.server";
import { upsertProductFromCandidate } from "./upsert-product.server";
import type { PipelineStats } from "./types";

function getDb() {
  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service role vereist voor discovery pipeline.");
  }
  return createSupabaseServiceClient();
}

export type PipelineResult = {
  runId: string;
  stats: PipelineStats;
  bolConfigured: boolean;
  bolDetail: string;
  priceRefresh?: {
    updated: number;
    needsApproval: number;
    outOfStock: number;
    checked: number;
  };
};

/**
 * Volledige discovery-run: discover → score → upsert high-confidence →
 * verify → publish wanneer ok-offer klaar. Lage scores → needs_review.
 */
export async function runCatalogDiscoveryPipeline(input?: {
  triggerSource?: string;
}): Promise<PipelineResult> {
  const db = getDb();
  const stats: PipelineStats = {
    discovered: 0,
    highConfidence: 0,
    needsReview: 0,
    upserted: 0,
    published: 0,
    verifiedOk: 0,
    verifiedBroken: 0,
    errors: [],
  };

  const { data: run, error: runError } = await db
    .from("catalog_runs")
    .insert({
      trigger_source: input?.triggerSource ?? "automation",
      stats: {},
    } as never)
    .select("id")
    .single<{ id: string }>();

  if (runError || !run) {
    throw new Error(runError?.message ?? "Kon catalog_run niet starten");
  }

  const { candidates, bolStatus } = await discoverCatalogCandidates();
  stats.discovered = candidates.length;

  const { data: products } = await db
    .from("products")
    .select("id, name, slug, capacity_kwh, brand_id")
    .is("deleted_at", null)
    .returns<
      {
        id: string;
        name: string;
        slug: string;
        capacity_kwh: number | null;
        brand_id: string;
      }[]
    >();

  const { data: brands } = await db
    .from("brands")
    .select("id, slug")
    .is("deleted_at", null)
    .returns<{ id: string; slug: string }[]>();

  const brandSlugById = new Map((brands ?? []).map((b) => [b.id, b.slug]));

  for (const candidate of candidates) {
    try {
      const existing =
        products?.find((p) => {
          const brandSlug = brandSlugById.get(p.brand_id) ?? null;
          if (candidate.brandSlug && brandSlug !== candidate.brandSlug) return false;
          const score = scoreSkuMatch(candidate, {
            name: p.name,
            capacityKwh: p.capacity_kwh,
            brandSlug,
          });
          return score.score >= 0.7;
        }) ?? null;

      const match = scoreSkuMatch(
        candidate,
        existing
          ? {
              name: existing.name,
              capacityKwh: existing.capacity_kwh,
              brandSlug: brandSlugById.get(existing.brand_id) ?? null,
            }
          : null,
      );

      const status = match.highConfidence ? "matched" : "needs_review";
      if (match.highConfidence) stats.highConfidence += 1;
      else stats.needsReview += 1;

      const candidateId = await persistCandidateRow(db, {
        runId: run.id,
        candidate,
        matchScore: match.score,
        matchNotes: match.notes.join("; "),
        status,
      });

      if (!match.highConfidence || !candidateId) {
        continue;
      }

      const upserted = await upsertProductFromCandidate(candidate);
      stats.upserted += 1;
      if (upserted.outboundStatus === "ok") stats.verifiedOk += 1;
      if (upserted.outboundStatus === "broken") stats.verifiedBroken += 1;

      await db
        .from("catalog_candidates")
        .update({
          status: "upserted",
          product_id: upserted.productId,
          offer_id: upserted.offerId,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", candidateId);

      const published = await publishProductIfReady(upserted.productId);
      if (published.published) {
        stats.published += 1;
        await db
          .from("catalog_candidates")
          .update({ status: "published", updated_at: new Date().toISOString() } as never)
          .eq("id", candidateId);
      }
    } catch (error) {
      stats.errors.push(
        `${candidate.rawTitle}: ${error instanceof Error ? error.message : "onbekend"}`,
      );
    }
  }

  let priceRefresh: PipelineResult["priceRefresh"];
  try {
    const prices = await refreshBolOfferPrices();
    priceRefresh = {
      updated: prices.updated,
      needsApproval: prices.needsApproval,
      outOfStock: prices.outOfStock,
      checked: prices.checked,
    };
    if (prices.needsApproval > 0) {
      stats.errors.push(
        `Bol prijsrefresh: ${prices.needsApproval} offer(s) >10% verschil, wacht op verification gate`,
      );
    }
  } catch (error) {
    stats.errors.push(
      `Bol prijsrefresh: ${error instanceof Error ? error.message : "onbekend"}`,
    );
  }

  await db
    .from("catalog_runs")
    .update({
      finished_at: new Date().toISOString(),
      stats: { ...stats, priceRefresh } as never,
      error_message: stats.errors.length > 0 ? stats.errors.slice(0, 5).join(" | ") : null,
    } as never)
    .eq("id", run.id);

  return {
    runId: run.id,
    stats,
    bolConfigured: bolStatus.configured,
    bolDetail: bolStatus.detail,
    priceRefresh,
  };
}
