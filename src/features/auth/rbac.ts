import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser, type CurrentUser } from "@/features/auth/queries";
import type { AppRole } from "@/lib/db/database.types";

/** Rollen die toegang hebben tot het admin-gedeelte. */
export const ADMIN_ACCESS_ROLES: AppRole[] = ["admin", "editor", "merchant_manager"];

export async function getUserRoles(userId: string): Promise<AppRole[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .returns<{ role: AppRole }[]>();
  return data?.map((row) => row.role) ?? [];
}

export function hasAdminAccess(roles: AppRole[]): boolean {
  return roles.some((role) => ADMIN_ACCESS_ROLES.includes(role));
}

export function canManageCatalog(roles: AppRole[]): boolean {
  return roles.some((role) => ["admin", "editor", "merchant_manager"].includes(role));
}

export function canManageOrders(roles: AppRole[]): boolean {
  return roles.some((role) => ["admin", "editor"].includes(role));
}

export function canReviewChanges(roles: AppRole[]): boolean {
  return roles.some((role) => ["admin", "editor"].includes(role));
}

export async function requireAdminUser(): Promise<CurrentUser & { roles: AppRole[] }> {
  const user = await getCurrentUser();
  if (!user) redirect("/account?next=/admin");
  const roles = await getUserRoles(user.id);
  if (!hasAdminAccess(roles)) redirect("/account");
  return { ...user, roles };
}
