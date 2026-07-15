import type { Metadata } from "next";
import { requireAdminUser } from "@/features/auth/rbac";
import { countPendingChangeRequests } from "@/features/admin/queries";
import { AdminNav } from "@/features/admin/components/admin-nav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();
  let pendingChanges = 0;
  try {
    pendingChanges = await countPendingChangeRequests();
  } catch {
    pendingChanges = 0;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminNav pendingChanges={pendingChanges} />
      <div className="min-w-0 flex-1 px-6 py-8">{children}</div>
    </div>
  );
}
