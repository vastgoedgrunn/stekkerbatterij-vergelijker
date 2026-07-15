import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Calculator, Coins, Gauge, ArrowRight } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/patterns/section";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { TerugverdientijdCalculator } from "@/features/calculators/terugverdientijd-calculator";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Terugverdientijd & jaarbesparing berekenen",
  description:
    "Bereken transparant de geschatte terugverdientijd en jaarbesparing van een stekkerbatterij. Pas alle aannames zelf aan: prijs, verbruik, capaciteit en tarieven.",
  alternates: { canonical: "/tools/terugverdientijd" },
  openGraph: {
    title: "Terugverdientijd-calculator stekkerbatterij",
    description:
      "Schat de terugverdientijd en jaarbesparing van je stekkerbatterij met een transparant, aanpasbaar rekenmodel.",
    url: `${siteConfig.url}/tools/terugverdientijd`,
  },
};

const uitleg = [
  {
    icon: Gauge,
    title: "Verschoven energie",
    text: "We schatten hoeveel kWh de batterij per jaar verschuift: het minimum van wat de capaciteit fysiek kan (capaciteit × 365 × cyclusfactor) en wat je zelf kunt verbruiken (jaarverbruik × aandeel).",
  },
  {
    icon: Coins,
    title: "Jaarbesparing",
    text: "Per verschoven kWh bespaar je het verschil tussen je stroomprijs en je terugleververgoeding. Dat verschil × de verschoven kWh is de geschatte jaarbesparing.",
  },
  {
    icon: Calculator,
    title: "Terugverdientijd",
    text: "De aanschafprijs gedeeld door de jaarbesparing geeft de geschatte terugverdientijd in jaren. Zonder positieve besparing is die niet te bepalen.",
  },
];

export default function TerugverdientijdPage() {
  return (
    <main>
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              Gratis rekentool
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Terugverdientijd & jaarbesparing berekenen
            </h1>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Benieuwd wanneer een stekkerbatterij zichzelf terugverdient? Vul je situatie in en zie
              direct een <strong>indicatieve</strong> schatting van je jaarbesparing en
              terugverdientijd. Alle aannames pas je zelf aan.
            </p>
          </div>
        </Container>
      </div>

      <Section>
        <Container>
          <TerugverdientijdCalculator />
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <SectionHeading
            eyebrow="Zo rekenen we"
            title="Transparant rekenmodel"
            description="We tonen precies hoe de schatting tot stand komt. Het zijn aannames, geen garantie, die je zelf kunt bijstellen."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {uitleg.map((item) => (
              <Card key={item.title} className="p-6">
                <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{item.text}</p>
              </Card>
            ))}
          </div>
          <p className="text-muted-foreground mt-6 max-w-3xl text-sm leading-relaxed">
            Let op: dit model houdt bewust geen rekening met prijsstijgingen, batterijdegradatie,
            rente of fiscale regelingen zoals saldering en subsidies. Die kunnen je werkelijke
            besparing zowel positief als negatief beïnvloeden. Gebruik de uitkomst als vertrekpunt,
            niet als exacte voorspelling.
          </p>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="border-border bg-muted/40 flex flex-col items-start gap-4 rounded-3xl border p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Klaar voor de volgende stap?</h2>
              <p className="text-muted-foreground mt-1">
                Vind de batterij die bij jouw verbruik en budget past.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={"/beslishulp" as Route}
                className={cn(buttonVariants({ size: "lg" }), "shrink-0")}
              >
                Start de beslishulp <ArrowRight className="size-4" />
              </Link>
              <Link
                href={"/batterijen" as Route}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "shrink-0")}
              >
                Bekijk alle batterijen
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
