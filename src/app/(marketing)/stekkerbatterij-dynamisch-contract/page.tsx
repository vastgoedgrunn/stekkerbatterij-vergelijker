import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Container, Section } from "@/components/patterns/section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

const title = "Stekkerbatterij met dynamisch energiecontract";
const description =
  "Hoe een stekkerbatterij samenwerkt met een dynamisch contract: laden bij lage prijzen, ontladen bij pieken. Vergelijk geschikte plug-and-play modellen.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/stekkerbatterij-dynamisch-contract" },
  openGraph: {
    title,
    description,
    url: `${siteConfig.url}/stekkerbatterij-dynamisch-contract`,
  },
};

export default function DynamischContractPage() {
  return (
    <main id="main-content">
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Dynamisch contract
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Stekkerbatterij met dynamisch energiecontract
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
            Bij uurtarieven telt timing. Een stekkerbatterij kan goedkoop laden en duurder ontladen,
            zonder dat je meteen een vaste installatie nodig hebt.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={"/stekkerbatterijen" as Route}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Vergelijk stekkerbatterijen
            </Link>
            <Link
              href={"/gidsen/dynamisch-contract-batterij" as Route}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Lees de gids
            </Link>
          </div>
        </Container>
      </div>
      <Section>
        <Container className="max-w-3xl space-y-4 text-sm leading-relaxed">
          <p>
            Kijk bij dynamisch gebruik vooral naar vermogen (laden/ontladen), app-sturing en
            uitbreidbaarheid. Prijs per kWh blijft belangrijk, maar een iets duurder model met
            betere sturing kan meer opleveren.
          </p>
          <p>
            Start met de{" "}
            <Link
              href={"/beslishulp" as Route}
              className="text-primary font-medium hover:underline"
            >
              beslishulp
            </Link>{" "}
            of bereken een indicatieve terugverdientijd via de{" "}
            <Link
              href={"/tools/terugverdientijd" as Route}
              className="text-primary font-medium hover:underline"
            >
              rekentool
            </Link>
            .
          </p>
        </Container>
      </Section>
    </main>
  );
}
