import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ShieldCheck, Scale, Eye, Mail, ArrowRight } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/patterns/section";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/patterns/stat";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Over ons: onafhankelijk vergelijken",
  description:
    "Waarom je ons kunt vertrouwen: transparante en onafhankelijke vergelijkingen van stekkerbatterijen.",
  alternates: { canonical: "/over-ons" },
};

const principles = [
  {
    icon: Scale,
    title: "Onafhankelijk",
    text: "Onze rangschikking is gebaseerd op objectieve criteria zoals prijs, capaciteit, garantie en echte reviews, niet op wie het meest betaalt.",
  },
  {
    icon: Eye,
    title: "Transparant",
    text: "Waar we zelf verkopen of een vergoeding ontvangen, laten we dat duidelijk zien. Advertenties zijn altijd gelabeld.",
  },
  {
    icon: ShieldCheck,
    title: "Betrouwbaar",
    text: "We tonen actuele prijzen met bronvermelding en de laagste prijs van de afgelopen 30 dagen, conform de regels.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">Over ons</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Onafhankelijk vergelijken, zonder ruis
            </h1>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Wij helpen huishoudens de juiste plug-and-play stekkerbatterij te kiezen. Het aanbod
              groeit snel en is onoverzichtelijk. Wij brengen prijzen, specificaties en ervaringen
              onafhankelijk bij elkaar, zodat jij met vertrouwen kiest.
            </p>
            <Link
              href={"/over-ons/hoe-wij-vergelijken" as Route}
              className="text-primary mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
            >
              Hoe wij vergelijken <ArrowRight className="size-4" />
            </Link>
          </div>
          <dl className="border-border/70 mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t pt-8">
            <Stat value="100%" label="Onafhankelijk" />
            <Stat value="Dagelijks" label="Prijzen bijgewerkt" />
            <Stat value="30 dagen" label="Prijshistorie & Omnibus" />
          </dl>
        </Container>
      </div>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Onze principes"
            title="Waar we voor staan"
            description="Drie beloftes die de basis vormen van alles wat we publiceren."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {principles.map((p) => (
              <Card key={p.title} className="p-6">
                <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                  <p.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{p.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{p.text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div
            id="contact"
            className="border-border bg-muted/40 flex flex-col items-start gap-4 rounded-3xl border p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10"
          >
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Vragen of feedback?</h2>
              <p className="text-muted-foreground mt-1">
                We horen graag van je, of het nu gaat om een product, een prijs of een suggestie.
              </p>
            </div>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className={cn(buttonVariants({ size: "lg" }), "shrink-0")}
            >
              <Mail className="size-4" /> Mail ons
            </a>
          </div>
        </Container>
      </Section>
    </main>
  );
}
