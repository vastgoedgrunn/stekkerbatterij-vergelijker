import type { Metadata } from "next";
import { getProducts } from "@/features/products/queries";
import { DecisionWizard } from "@/features/comparison/decision-wizard";
import { businessRules } from "@/config/business-rules";

export const metadata: Metadata = {
  title: "Beslishulp: welke stekkerbatterij past bij jou?",
  description:
    "Beantwoord een paar vragen over je verbruik, zonnepanelen en budget en ontvang een persoonlijk advies voor de beste stekkerbatterij.",
  alternates: { canonical: "/beslishulp" },
};

export default async function DecisionAidPage() {
  const { items } = await getProducts({ pageSize: businessRules.catalog.maxPageSize });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Vind jouw ideale stekkerbatterij</h1>
        <p className="text-muted-foreground mt-2">
          Beantwoord vier korte vragen en ontvang een onafhankelijk advies op maat.
        </p>
      </header>

      {items.length > 0 ? (
        <DecisionWizard products={items} />
      ) : (
        <p className="text-muted-foreground text-center">
          Er zijn nog geen producten beschikbaar om een advies op te baseren.
        </p>
      )}
    </main>
  );
}
