import "server-only";
import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";

function getDb() {
  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service role vereist voor publish.");
  }
  return createSupabaseServiceClient();
}

export type PublishResult =
  { published: true; slug: string } | { published: false; reason: string };

/**
 * Publiceer product alleen met image + minstens één actieve offer met link status ok
 * (of force=true na owner-approve).
 */
export async function publishProductIfReady(
  productId: string,
  options?: { force?: boolean },
): Promise<PublishResult> {
  const db = getDb();
  const force = options?.force ?? false;

  const { data: product, error } = await db
    .from("products")
    .select("id, slug, name, image_path, status")
    .eq("id", productId)
    .is("deleted_at", null)
    .maybeSingle<{
      id: string;
      slug: string;
      name: string;
      image_path: string | null;
      status: string;
    }>();

  if (error || !product) {
    return { published: false, reason: "Product niet gevonden" };
  }

  if (!product.image_path) {
    return { published: false, reason: "Geen image_path" };
  }

  const { data: offers } = await db
    .from("offers")
    .select("id, affiliate_link_status, affiliate_url, affiliate_deeplink, price_cents")
    .eq("product_id", productId)
    .is("deleted_at", null)
    .returns<
      {
        id: string;
        affiliate_link_status: string | null;
        affiliate_url: string | null;
        affiliate_deeplink: string | null;
        price_cents: number;
      }[]
    >();

  const okOffers = (offers ?? []).filter(
    (o) =>
      o.affiliate_link_status === "ok" &&
      o.price_cents > 0 &&
      Boolean(o.affiliate_deeplink ?? o.affiliate_url),
  );

  if (!force && okOffers.length === 0) {
    return {
      published: false,
      reason: "Geen geverifieerde ok-offer met prijs (SKU-match gate)",
    };
  }

  if (product.status !== "published") {
    const { error: updError } = await db
      .from("products")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", productId);
    if (updError) {
      return { published: false, reason: updError.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/batterijen");
  revalidatePath(`/batterijen/${product.slug}`);
  revalidatePath("/admin/catalog");

  return { published: true, slug: product.slug };
}
