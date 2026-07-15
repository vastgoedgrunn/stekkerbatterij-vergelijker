import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth/queries";
import { AuthForm } from "@/features/auth/auth-form";
import { SignOutButton } from "@/features/auth/sign-out-button";

export const metadata: Metadata = {
  title: "Mijn account",
  description: "Beheer je account, favorieten en prijsalerts.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <main id="main-content" className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Mijn account</h1>

      {user ? (
        <div className="space-y-4">
          <div className="border-border rounded-xl border p-6">
            <p className="text-muted-foreground text-sm">Ingelogd als</p>
            <p className="font-medium">{user.email ?? "Onbekend"}</p>
          </div>
          <SignOutButton />
        </div>
      ) : (
        <AuthForm />
      )}
    </main>
  );
}
