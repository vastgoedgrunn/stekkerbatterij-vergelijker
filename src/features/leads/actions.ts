"use server";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env/server";
import { logger } from "@/lib/observability/logger";

export interface LeadActionResult {
  ok: boolean;
  error?: string;
}

const LEAD_COMMISSION_CENTS = 10000;

export async function submitLeadAction(formData: FormData): Promise<LeadActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || null;
  const postalCode = String(formData.get("postalCode") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const source = String(formData.get("source") ?? "wizard").trim();
  const consent = formData.get("consent");

  if (!email || !consent) {
    return { ok: false, error: "Vul alle verplichte velden in." };
  }

  let qualification: Record<string, unknown> = {};
  try {
    const raw = String(formData.get("qualification") ?? "{}");
    qualification = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    qualification = {};
  }

  if (!isSupabaseConfigured() || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    logger.warn("Lead niet opgeslagen: Supabase niet geconfigureerd", { email });
    return { ok: true };
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("leads").insert({
    source,
    customer_name: name,
    customer_email: email,
    phone,
    postal_code: postalCode,
    qualification,
    status: "new",
    estimated_commission_cents: LEAD_COMMISSION_CENTS,
  } as never);

  if (error) {
    logger.warn("Lead insert mislukt", { message: error.message });
    return { ok: false, error: "Kon je aanvraag niet opslaan. Probeer het later opnieuw." };
  }

  return { ok: true };
}
