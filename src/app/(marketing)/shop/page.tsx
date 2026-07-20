import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { Container } from "@/components/patterns/section";
import { AffiliateDisclosure } from "@/components/patterns/affiliate-disclosure";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { SHOP_BUNDLES, SHOP_ITEMS, SHOP_SECTIONS } from "@/features/energie-shop/catalog";
import { getShopOffersBySlug } from "@/features/energie-shop/queries";
import { ShopSectionNav } from "@/features/energie-shop/shop-section-nav";
import { ShopProductCard } from "@/features/energie-shop/shop-product-card";
import { ShopBundleCard } from "@/features/energie-shop/shop-bundle-card";
import { ShopExpandFilter } from "@/features/energie-shop/shop-expand-filter";

export const metadata: Metadata = {
  title: "Slimme Energie Shop",
  description:
    "P1 meters, slimme stekkers, splitters, kabels en uitbreidingsbatterijen. Je koopt via bol, wij helpen je kiezen. Geen eigen magazijn.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Slimme Energie Shop",
    description: "Meet je energie, stuur slimmer en breid je batterij uit. Affiliate via bol.",
    url: `${siteConfig.url}/shop`,
  },
};

export const revalidate = 3600;

export default async function SlimmeEnergieShopPage() {
  const offersMap = await getShopOffersBySlug();
  const offersRecord = Object.fromEntries(offersMap);

  return (
    <main id="main-content">
      <div className="border-border/70 relative overflow-hidden border-b">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.52_0.114_159_/_0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_oklch(0.82_0.13_78_/_0.1),_transparent_45%)]"
          aria-hidden
        />
        <Container className="relative py-10 sm:py-14">
          <p className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide uppercase">
            <ShoppingBag className="size-4" aria-hidden />
            Slimme Energie Shop
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Meet, stuur en breid uit. Zonder zelf te verkopen.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
            Accessoires vóór, tijdens en na je thuisbatterij. Je betaalt en ontvangt via bol. Wij
            selecteren alleen geverifieerde productpagina&apos;s.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
            <li className="flex items-center gap-2 font-medium">
              <ShieldCheck className="text-primary size-4 shrink-0" aria-hidden />
              Je koopt bij bol of de verkoper op bol
            </li>
            <li className="flex items-center gap-2 font-medium">
              <Sparkles className="text-primary size-4 shrink-0" aria-hidden />
              Geen checkout of magazijn bij ons
            </li>
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#section-meten"
              className={cn(buttonVariants({ size: "lg" }), "justify-center")}
            >
              Begin met meten
            </a>
            <Link
              href={"/beslishulp" as Route}
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "justify-center")}
            >
              Liever eerst beslishulp
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <ShopSectionNav />

        <div className="mt-8 space-y-14 sm:mt-10 sm:space-y-16">
          {SHOP_SECTIONS.filter((s) => s.id !== "pakketten" && s.id !== "uitbreiden").map(
            (section) => {
              const items = SHOP_ITEMS.filter((item) => item.section === section.id);
              return (
                <section key={section.id} id={`section-${section.id}`} className="scroll-mt-32">
                  <header className="mb-5 max-w-2xl">
                    <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed sm:text-base">
                      {section.subtitle}
                    </p>
                  </header>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <ShopProductCard
                        key={item.slug}
                        item={item}
                        offer={offersMap.get(item.slug)}
                      />
                    ))}
                  </div>
                </section>
              );
            },
          )}

          <section id="section-uitbreiden" className="scroll-mt-32">
            <header className="mb-5 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight">Batterij uitbreiden</h2>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed sm:text-base">
                Extra modules en accessoires. Filter op merk zodat je geen verkeerde uitbreiding
                koopt. BP1600 voor Solarbank 2 staat momenteel niet stabiel op bol; wel BP2700 voor
                Solarbank 3.
              </p>
            </header>
            <ShopExpandFilter
              items={SHOP_ITEMS.filter((item) => item.section === "uitbreiden")}
              offers={offersRecord}
            />
          </section>

          <section id="section-pakketten" className="scroll-mt-32">
            <header className="mb-5 max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight">Slimme pakketten</h2>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed sm:text-base">
                Samengestelde sets. Je klikt per onderdeel door naar bol (aparte winkelwagens). Zo
                blijven prijzen en voorraad actueel.
              </p>
            </header>
            <div className="grid gap-4 lg:grid-cols-2">
              {SHOP_BUNDLES.map((bundle) => (
                <ShopBundleCard
                  key={bundle.slug}
                  bundle={bundle}
                  items={SHOP_ITEMS}
                  offers={offersRecord}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="border-border/70 from-primary/5 mt-14 rounded-3xl border bg-gradient-to-br to-transparent p-6 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Klaar om te kiezen welke batterij past?
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-base">
            Na meten met een P1 Meter helpt onze beslishulp je naar de juiste stekkerbatterij. De
            vergelijker blijft onafhankelijk: shopselectie beïnvloedt de ranking niet.
          </p>
          <Link
            href={"/beslishulp" as Route}
            className={cn(buttonVariants({ size: "lg", className: "mt-5" }))}
          >
            Start de beslishulp
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <AffiliateDisclosure className="mt-10" />
        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
          Prijzen op bol.com, gecontroleerd 20 juli 2026. Actuele prijs en voorraad zie je op bol.
          Er is geen vaste P1-kabel van 1 meter als los HomeWizard-artikel op bol; kies 3, 5 of 10
          meter RJ12, of een splitter met korte aansluitkabel.
        </p>
      </Container>
    </main>
  );
}
