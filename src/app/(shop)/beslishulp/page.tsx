import type { Metadata } from "next";
import { getProducts } from "@/features/products/queries";
import { DecisionWizard } from "@/features/comparison/decision-wizard";
import { AffiliateDisclosure } from "@/components/patterns/affiliate-disclosure";
import { businessRules } from "@/config/business-rules";
import { siteConfig } from "@/config/site";

const title = "Beslishulp: welke stekkerbatterij past bij jou?";
const description =
  "Beantwoord een paar vragen over verbruik, zonnepanelen en budget. Wij adviseren stekkerbatterij of vaste thuisbatterij met offerte.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/beslishulp" },
  openGraph: {
    title,
    description,
    url: `${siteConfig.url}/beslishulp`,
    type: "website",
    siteName: siteConfig.name,
  },
};

export default async function DecisionAidPage() {
  const { items } = await getProducts({ pageSize: businessRules.catalog.maxPageSize });

  return (
    <main id="main-content" className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)] opacity-50" />
      <div className="relative mx-auto w-full max-w-3xl px-4 py-14">
        <header className="mb-10 text-center">
          <span className="border-border/70 bg-card/60 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold backdrop-blur">
            Persoonlijk advies
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Vind jouw ideale stekkerbatterij
          </h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-lg">
            Beantwoord vijf korte stappen. We adviseren een stekkerbatterij of een vaste
            thuisbatterij met installatie.
          </p>
        </header>

        {items.length > 0 ? (
          <>
            <DecisionWizard products={items} />
            <AffiliateDisclosure className="mt-8" />
          </>
        ) : (
          <p className="text-muted-foreground text-center">
            Er zijn nog geen producten beschikbaar om een advies op te baseren.
          </p>
        )}
      </div>
    </main>
  );
}
