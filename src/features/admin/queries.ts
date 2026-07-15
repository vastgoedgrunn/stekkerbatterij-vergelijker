import "server-only";
import { getAdminDb } from "./db.server";
import type {
  ChangeRequestRow,
  ChangeRequestStatus,
  OfferRow,
  OrderRow,
  ProductRow,
  SupplierRow,
} from "@/lib/db/database.types";

export interface AdminProductRow extends ProductRow {
  brands: { name: string; slug: string } | null;
  suppliers: { name: string; slug: string } | null;
}

export interface AdminOrderRow extends OrderRow {
  order_lines: { id: string; name: string; quantity: number; line_total_cents: number }[];
}

export async function listAdminProducts(): Promise<AdminProductRow[]> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("products")
    .select("*, brands(name, slug), suppliers(name, slug)")
    .is("deleted_at", null)
    .order("name")
    .returns<AdminProductRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminProduct(id: string): Promise<AdminProductRow | null> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("products")
    .select("*, brands(name, slug), suppliers(name, slug)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<AdminProductRow>();
  if (error) throw new Error(error.message);
  return data;
}

export async function listAdminSuppliers(): Promise<SupplierRow[]> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("suppliers")
    .select("*")
    .is("deleted_at", null)
    .order("name")
    .returns<SupplierRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminSupplier(id: string): Promise<SupplierRow | null> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<SupplierRow>();
  if (error) throw new Error(error.message);
  return data;
}

export async function listAdminOrders(limit = 50): Promise<AdminOrderRow[]> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("orders")
    .select("*, order_lines(id, name, quantity, line_total_cents)")
    .order("placed_at", { ascending: false })
    .limit(limit)
    .returns<AdminOrderRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminOrder(id: string): Promise<AdminOrderRow | null> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("orders")
    .select("*, order_lines(id, name, quantity, line_total_cents)")
    .eq("id", id)
    .maybeSingle<AdminOrderRow>();
  if (error) throw new Error(error.message);
  return data;
}

export async function listProductOffers(productId: string): Promise<OfferRow[]> {
  const db = getAdminDb();
  const { data, error } = await db
    .from("offers")
    .select("*")
    .eq("product_id", productId)
    .is("deleted_at", null)
    .order("price_cents")
    .returns<OfferRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listChangeRequests(
  status?: ChangeRequestStatus,
): Promise<ChangeRequestRow[]> {
  const db = getAdminDb();
  let query = db.from("change_requests").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query.returns<ChangeRequestRow[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function countPendingChangeRequests(): Promise<number> {
  const db = getAdminDb();
  const { count, error } = await db
    .from("change_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw new Error(error.message);
  return count ?? 0;
}
