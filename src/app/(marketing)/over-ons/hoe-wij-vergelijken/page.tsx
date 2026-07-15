import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/patterns/section";
import { Card } from "@/components/ui/card";
import { RANKING_VERSION } from "@/features/comparison/ranking";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Hoe wij vergelijken",
  description:
    "Onze transparante methodologie voor het rangschikken van stekkerbatterijen — geen black box.",
  alternates: { canonical: "/over-ons/hoe-wij-vergelijken" },
  openGraph: {
    title: "Hoe wij vergelijken",
    url: `${siteConfig.url}/over-ons/hoe-wij-vergelijken`,
  },
};

const criteria = [
  {
    title: "Capaciteit vs. verbruik",
    text: "We vergelijken de batterijcapaciteit met je geschatte jaarverbruik. Te klein levert weinig voordeel; te groot is onnodig duur.",
  },
  {
    title: "Prijs & budget",
    text: "Modellen binnen je budget scoren hoger. We tonen altijd de laagste actuele prijs per aanbieder.",
  },
  {
    title: "Zonnepanelen & vermogen",
    text: "Met zonnepanelen weegt het vermogen (kW) zwaarder — zo vang je overschot beter op.",
  },
  {
    title: "Uitbreidbaarheid",
    text: "Als je later wilt uitbreiden, geven uitbreidbare modellen extra punten.",
  },
  {
    title: "Reviews",
    text: "Goed beoordeelde producten door echte gebruikers krijgen een bonus in de ranking.",
  },
];

export default function HowWeComparePage() {
  return (
    <main>
      <Container className="py-10 sm:py-14">
        <Link
          href="/over-ons"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft className="size-4" /> Over ons
        </Link>
        <SectionHeading
          className="mt-6 max-w-3xl"
          eyebrow="Methodologie"
          title="Hoe wij vergelijken"
          description="Onze beslishulp en rankings zijn geen black box. Dit zijn de criteria die we gebruiken."
        />
        <p className="text-muted-foreground mt-2 text-sm">Rankingversie {RANKING_VERSION}</p>
      </Container>

      <Section className="pt-0">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            {criteria.map((item) => (
              <Card key={item.title} className="p-5">
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.text}</p>
              </Card>
            ))}
          </div>

          <Card className="mt-8 p-6">
            <h2 className="font-semibold">Advertenties & affiliate</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Gesponsorde aanbiedingen zijn duidelijk gelabeld als &quot;Advertentie&quot;. Als je
              via onze links koopt, kunnen wij een vergoeding ontvangen — dat verandert niets aan
              onze ranking. We sturen je altijd naar de aanbieder voor de actuele prijs en
              voorwaarden.
            </p>
          </Card>
        </Container>
      </Section>
    </main>
  );
}
