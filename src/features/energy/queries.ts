import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { EnergyPartnerRow } from "@/lib/db/database.types";

export async function listActiveEnergyPartners(): Promise<EnergyPartnerRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("energy_partners")
    .select("*")
    .eq("active", true)
    .order("sort_order")
    .returns<EnergyPartnerRow[]>();
  if (error) return [];
  return data ?? [];
}
