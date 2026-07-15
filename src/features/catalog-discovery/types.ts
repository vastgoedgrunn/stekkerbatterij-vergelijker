import type { CatalogCandidateSource } from "@/lib/db/database.types";

/** Ruwe discovery-hit voordat DB-upsert. */
export type DiscoveredCandidate = {
  source: CatalogCandidateSource;
  externalId: string | null;
  brandSlug: string | null;
  rawTitle: string;
  rawDescription?: string | null;
  capacityKwh?: number | null;
  powerKw?: number | null;
  url: string;
  imageUrl?: string | null;
  priceCents?: number | null;
  currency?: string;
  payload?: Record<string, unknown>;
};

export type SkuMatchResult = {
  score: number;
  notes: string[];
  highConfidence: boolean;
};

export type OutboundVerifyResult = {
  ok: boolean;
  status: "ok" | "pending" | "broken";
  note: string;
  pageTitle?: string | null;
};

export type PipelineStats = {
  discovered: number;
  highConfidence: number;
  needsReview: number;
  upserted: number;
  published: number;
  verifiedOk: number;
  verifiedBroken: number;
  errors: string[];
};

export const HIGH_CONFIDENCE_MATCH_SCORE = 0.85;
