import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PlugZap, Wrench } from "lucide-react";
import { Container } from "@/components/patterns/section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Thuisbatterijen vergelijken",
  description:
    "Kies je pad: stekkerbatterijen (plug-and-play) of vaste thuisbatterijen met installatie en offerte.",
  alternates: { canonical: "/batterijen" },
};

export default function BatterijenHubPage() {
  return (
    <main id="main-content">
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">Catalogus</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Welke thuisbatterij past bij jou?
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
            Stekkerbatterijen koop je direct online. Vaste systemen vraag je aan via een
            installateur. Kies hieronder je pad.
          </p>
        </Container>
      </div>

      <Container className="py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/stekkerbatterijen"
            className="border-border bg-card hover:border-primary/40 group flex flex-col rounded-3xl border p-8 transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
              <PlugZap className="size-6" />
            </span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight">Stekkerbatterijen</h2>
            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
              Plug-and-play, zonder installateur. Vergelijk prijzen bij webshops en ga direct door
              naar de aanbieder.
            </p>
            <span className={cn(buttonVariants({ size: "sm" }), "mt-6 w-fit")}>
              Bekijk stekkerbatterijen <ArrowRight className="size-4" />
            </span>
          </Link>

          <Link
            href="/vaste-thuisbatterijen"
            className="border-border bg-card hover:border-primary/40 group flex flex-col rounded-3xl border p-8 transition-colors"
          >
            <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
              <Wrench className="size-6" />
            </span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight">Vaste thuisbatterijen</h2>
            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
              Meer capaciteit met professionele installatie. Vergelijk topmodellen en vraag een
              vrijblijvende offerte aan.
            </p>
            <span className={cn(buttonVariants({ size: "sm" }), "mt-6 w-fit")}>
              Bekijk vaste systemen <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          Twijfel je? Start de{" "}
          <Link href="/beslishulp" className="text-primary font-semibold hover:underline">
            beslishulp
          </Link>{" "}
          voor een persoonlijk advies.
        </p>
      </Container>
    </main>
  );
}
