"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { businessRules } from "@/config/business-rules";
import { logger } from "@/lib/observability/logger";
import type { ReviewRow } from "@/lib/db/database.types";

const schema = z.object({
  productId: z.string().uuid(),
  productSlug: z.string().min(1),
  rating: z.coerce
    .number()
    .int()
    .min(businessRules.reviews.minRating)
    .max(businessRules.reviews.maxRating),
  title: z.string().trim().max(120).optional(),
  body: z
    .string()
    .trim()
    .min(businessRules.reviews.bodyMinLength, "Je review is te kort.")
    .max(businessRules.reviews.bodyMaxLength),
});

export interface ReviewFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Reviews zijn tijdelijk niet beschikbaar." };
  }

  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Ongeldige invoer." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Log in om een review te plaatsen." };
  }

  const payload = {
    product_id: parsed.data.productId,
    user_id: user.id,
    rating: parsed.data.rating,
    title: parsed.data.title ?? null,
    body: parsed.data.body,
    status: "pending" as const,
  } satisfies Partial<ReviewRow>;

  // supabase-js 2.109 leidt het Insert-type hier te strikt af; de payload is
  // via `satisfies Partial<ReviewRow>` volledig type-gecontroleerd.
  const { error } = await supabase.from("reviews").insert(payload as never);

  if (error) {
    logger.warn("Review opslaan mislukt", { message: error.message });
    return {
      status: "error",
      message: "Kon je review niet opslaan. Mogelijk plaatste je er al een.",
    };
  }

  revalidatePath(`/batterijen/${parsed.data.productSlug}`);
  return {
    status: "success",
    message: "Bedankt! Je review is ontvangen en wordt beoordeeld.",
  };
}
