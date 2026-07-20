import type { CommissionType } from "@/lib/db/database.types";
import { businessRules } from "@/config/business-rules";

/** Schat commissie in centen per verkoop (geen garantie, alleen voor analytics/admin). */
export function estimateCommissionCents(input: {
  commissionType: CommissionType | null;
  commissionRate: number | null;
  commissionCentsFixed: number | null;
  priceCents: number;
}): number | null {
  if (input.commissionType === "cpa" && input.commissionCentsFixed != null) {
    return input.commissionCentsFixed;
  }
  if (input.commissionType === "cps" && input.commissionRate != null) {
    return Math.round(input.priceCents * input.commissionRate);
  }
  if (input.commissionRate != null) {
    return Math.round(input.priceCents * input.commissionRate);
  }
  if (input.commissionCentsFixed != null) {
    return input.commissionCentsFixed;
  }
  return null;
}

/**
 * Verwachte commissie per outbound-klik (niet per sale).
 * Klik ≠ koop: vermenigvuldigt met aangenomen click-to-sale.
 */
export function estimateExpectedCommissionPerClickCents(input: {
  commissionType: CommissionType | null;
  commissionRate: number | null;
  commissionCentsFixed: number | null;
  priceCents: number;
  clickToSaleRate?: number;
}): number | null {
  const perSale = estimateCommissionCents(input);
  if (perSale == null) return null;
  const rate = input.clickToSaleRate ?? businessRules.affiliate.assumedClickToSaleRate;
  return Math.round(perSale * rate);
}
