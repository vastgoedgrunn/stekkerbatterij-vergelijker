import { createSupabasePublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { logger } from "@/lib/observability/logger";
import type { Review } from "./types";

export async function getApprovedReviews(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, title, body, created_at")
    .eq("product_id", productId)
    .eq("status", "approved")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .returns<
      { id: string; rating: number; title: string | null; body: string; created_at: string }[]
    >();

  if (error) {
    logger.warn("Kon reviews niet laden", { message: error.message, productId });
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.created_at,
  }));
}
