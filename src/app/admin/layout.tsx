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
    <div className="bg-muted/30 flex min-h-dvh flex-col lg:flex-row">
      <AdminNav pendingChanges={pendingChanges} />
      <div className="min-w-0 flex-1">
        <main
          id="main-content"
          className="mx-auto w-full max-w-6xl px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-7 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
