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
    <div className="bg-muted/20 flex min-h-screen">
      <AdminNav pendingChanges={pendingChanges} />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <main id="main-content" className="mx-auto w-full max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
}
