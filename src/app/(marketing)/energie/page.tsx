import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/patterns/section";
import { AffiliateDisclosure } from "@/components/patterns/affiliate-disclosure";
import { listActiveEnergyPartners } from "@/features/energy/queries";
import { EnergyPartnerCard } from "@/features/energy/energy-partner-card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Dynamisch energiecontract vergelijken",
  description:
    "Vergelijk dynamische energiecontracten die goed samengaan met een thuisbatterij. Laad goedkoop, gebruik duur.",
  alternates: { canonical: "/energie" },
  openGraph: {
    title: "Energiecontract vergelijken",
    description: "Dynamisch contract + batterij = maximale besparing.",
    url: `${siteConfig.url}/energie`,
  },
};

export default async function EnergiePage() {
  const partners = await listActiveEnergyPartners();

  return (
    <main>
      <Container className="py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Dynamisch energiecontract &amp; batterij
          </h1>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Met een dynamisch contract wisselen je stroomprijzen per uur. Combineer dat met een
            stekkerbatterij: laad op goedkope uren, ontlaad tijdens piek. Zo haal je meer uit je
            opslag.
          </p>
          <Link
            href="/gidsen/dynamisch-contract-batterij"
            className="text-primary mt-4 inline-block text-sm font-medium hover:underline"
          >
            Lees onze gids over dynamische contracten →
          </Link>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
          {partners.map((partner) => (
            <EnergyPartnerCard
              key={partner.id}
              slug={partner.slug}
              name={partner.name}
              description={partner.description}
            />
          ))}
        </div>

        <AffiliateDisclosure className="mx-auto mt-10 max-w-3xl" />
      </Container>
    </main>
  );
}
