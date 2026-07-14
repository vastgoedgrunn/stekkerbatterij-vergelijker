import type { Metadata } from "next";
import { ShieldCheck, Scale, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Over ons — onafhankelijk vergelijken",
  description:
    "Waarom je ons kunt vertrouwen: transparante en onafhankelijke vergelijkingen van stekkerbatterijen.",
  alternates: { canonical: "/over-ons" },
};

const principles = [
  {
    icon: Scale,
    title: "Onafhankelijk",
    text: "Onze rangschikking is gebaseerd op objectieve criteria — prijs, capaciteit, garantie en echte reviews — niet op wie het meest betaalt.",
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
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Over {siteConfig.name}</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Wij helpen huishoudens de juiste plug-and-play stekkerbatterij te kiezen. Het aanbod
          groeit snel en is onoverzichtelijk. Wij brengen prijzen, specificaties en ervaringen
          onafhankelijk bij elkaar, zodat jij met vertrouwen kiest.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        {principles.map((p) => (
          <Card key={p.title}>
            <CardHeader>
              <p.icon className="text-primary size-6" aria-hidden />
              <CardTitle className="text-base">{p.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{p.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section id="contact" className="mt-12">
        <h2 className="text-2xl font-bold">Contact</h2>
        <p className="text-muted-foreground mt-2">
          Vragen of feedback? Mail ons via{" "}
          <a href="mailto:info@example.com" className="text-primary hover:underline">
            info@example.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
