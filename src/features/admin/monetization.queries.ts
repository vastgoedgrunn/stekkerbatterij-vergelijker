import "server-only";
import { getAdminDb } from "./db.server";
import type { EnergyPartnerRow, LeadRow, OfferClickRow } from "@/lib/db/database.types";

export interface ClickSummaryRow {
  offer_id: string;
  product_name: string;
  merchant_name: string;
  click_count: number;
  last_click_at: string | null;
}

export interface RevenueSummary {
  totalClicks: number;
  clicksLast7Days: number;
  estimatedAffiliateCents: number;
  totalLeads: number;
  newLeads: number;
  paidOrders: number;
  orderRevenueCents: number;
  energyClicks: number;
}

export async function listRecentOfferClicks(limit = 100): Promise<
  (OfferClickRow & {
    products: { name: string } | null;
    merchants: { name: string } | null;
  })[]
> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("offer_clicks")
    .select("*, products(name), merchants(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as (OfferClickRow & {
    products: { name: string } | null;
    merchants: { name: string } | null;
  })[];
}

export async function listClickSummary(): Promise<ClickSummaryRow[]> {
  const db = getAdminDb();
  const { data, error } = await db.rpc("admin_click_summary" as never);
  if (error) {
    const clicks = await listRecentOfferClicks(500);
    const map = new Map<string, ClickSummaryRow>();
    for (const click of clicks) {
      const key = click.offer_id;
      const existing = map.get(key);
      if (existing) {
        existing.click_count += 1;
        if (!existing.last_click_at || click.created_at > existing.last_click_at) {
          existing.last_click_at = click.created_at;
        }
      } else {
        map.set(key, {
          offer_id: click.offer_id,
          product_name: click.products?.name ?? "—",
          merchant_name: click.merchants?.name ?? "—",
          click_count: 1,
          last_click_at: click.created_at,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.click_count - a.click_count);
  }
  return (data ?? []) as ClickSummaryRow[];
}

export async function listAdminLeads(status?: LeadRow["status"]): Promise<LeadRow[]> {
  const db = getAdminDb();
  let query = db.from("leads").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query.returns<LeadRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listEnergyPartners(): Promise<EnergyPartnerRow[]> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("energy_partners")
    .select("*")
    .order("sort_order")
    .returns<EnergyPartnerRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRevenueSummary(): Promise<RevenueSummary> {
  const db = getAdminDb();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [clicksRes, leadsRes, ordersRes, energyRes, offersRes] = await Promise.all([
    db.from("offer_clicks").select("*", { count: "exact", head: true }),
    db.from("leads").select("*", { count: "exact", head: true }),
    db.from("orders").select("total_cents").eq("status", "paid"),
    db.from("energy_clicks").select("*", { count: "exact", head: true }),
    db.from("offers").select("id, price_cents, commission_type, commission_rate, commission_cents_fixed"),
  ]);

  const { count: totalClicks } = clicksRes;
  const { data: recentClicks } = await db
    .from("offer_clicks")
    .select("offer_id")
    .gte("created_at", weekAgo);
  const { count: totalLeads } = leadsRes;
  const { count: newLeads } = await db
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");
  const { data: orders } = ordersRes;
  const { count: energyClicks } = energyRes;
  const { data: offers } = offersRes;

  let estimatedAffiliateCents = 0;
  if (recentClicks && offers) {
    const offerMap = new Map(
      (offers as { id: string; price_cents: number; commission_type: string | null; commission_rate: number | null; commission_cents_fixed: number | null }[]).map(
        (o) => [o.id, o],
      ),
    );
    for (const click of recentClicks as { offer_id: string }[]) {
      const offer = offerMap.get(click.offer_id);
      if (!offer) continue;
      if (offer.commission_type === "cpa" && offer.commission_cents_fixed) {
        estimatedAffiliateCents += offer.commission_cents_fixed;
      } else if (offer.commission_rate) {
        estimatedAffiliateCents += Math.round(offer.price_cents * offer.commission_rate);
      }
    }
  }

  const paidOrders = (orders ?? []) as { total_cents: number }[];
  return {
    totalClicks: totalClicks ?? 0,
    clicksLast7Days: recentClicks?.length ?? 0,
    estimatedAffiliateCents,
    totalLeads: totalLeads ?? 0,
    newLeads: newLeads ?? 0,
    paidOrders: paidOrders.length,
    orderRevenueCents: paidOrders.reduce((s, o) => s + o.total_cents, 0),
    energyClicks: energyClicks ?? 0,
  };
}
