import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Container, Section } from "@/components/patterns/section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

const title = "Beste stekkerbatterij voor appartement of met zonnepanelen";
const description =
  "Welke stekkerbatterij past bij een appartement, balkon of woning met zonnepanelen? Compacte plug-and-play opties en wanneer een vast systeem beter is.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/beste-stekkerbatterij-appartement" },
  openGraph: {
    title,
    description,
    url: `${siteConfig.url}/beste-stekkerbatterij-appartement`,
  },
};

export default function AppartementBatterijPage() {
  return (
    <main id="main-content">
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Situatiekeuze
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Beste stekkerbatterij voor appartement of met zonnepanelen
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
            In een appartement of bij een klein PV-dak wil je vaak plug-and-play, beperkt gewicht en
            duidelijke garantie. Met meer panelen en verbruik komt een vast systeem sneller in
            beeld.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={"/beste-stekkerbatterij" as Route}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Top 10 stekkerbatterijen
            </Link>
            <Link
              href={"/beslishulp" as Route}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Start de beslishulp
            </Link>
          </div>
        </Container>
      </div>
      <Section>
        <Container className="max-w-3xl space-y-4 text-sm leading-relaxed">
          <p>
            <strong>Appartement / balkon:</strong> kies compacte capaciteit, check VvE-regels en
            kijk naar merken met goede app-sturing. Een hoge prijs per kWh is soms acceptabel als
            installatie onmogelijk is.
          </p>
          <p>
            <strong>Met zonnepanelen:</strong> let op vermogen om overschot weg te schrijven en op
            uitbreidbaarheid. Vergelijk op €/kWh via onze{" "}
            <Link
              href={"/stekkerbatterijen" as Route}
              className="text-primary font-medium hover:underline"
            >
              catalogus
            </Link>
            .
          </p>
          <p>
            Meer context:{" "}
            <Link
              href={"/gidsen/balkon-of-thuisbatterij" as Route}
              className="text-primary font-medium hover:underline"
            >
              stekker vs vaste thuisbatterij
            </Link>
            .
          </p>
        </Container>
      </Section>
    </main>
  );
}
