import type { CommissionType } from "@/lib/db/database.types";

/** Schat commissie in centen (geen garantie — alleen voor analytics/admin). */
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
