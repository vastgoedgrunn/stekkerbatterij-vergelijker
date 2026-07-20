import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, PackageCheck, Truck } from "lucide-react";
import { Container } from "@/components/patterns/section";
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
    "P1 meters, slimme stekkers, splitters, kabels en uitbreidingsbatterijen voor je thuisbatterij. Bestel snel en eenvoudig in onze shop.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Slimme Energie Shop",
    description:
      "Alles voor meten, sturen en uitbreiden rond je thuisbatterij. Duidelijke producten, actuele prijzen.",
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
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Slimme Energie Shop
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Alles voor je thuisbatterij, op één plek
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
            Van P1 meter tot uitbreidingsbatterij. Kies wat je nodig hebt, bestel direct en ga
            verder met besparen.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
            <li className="flex items-center gap-2 font-medium">
              <PackageCheck className="text-primary size-4 shrink-0" aria-hidden />
              Geselecteerd voor stekkerbatterijen en slimme meters
            </li>
            <li className="flex items-center gap-2 font-medium">
              <Truck className="text-primary size-4 shrink-0" aria-hidden />
              Snelle levering en actuele prijzen
            </li>
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#section-meten"
              className={cn(buttonVariants({ size: "lg" }), "justify-center")}
            >
              Bekijk producten
            </a>
            <Link
              href={"/beslishulp" as Route}
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "justify-center")}
            >
              Hulp bij kiezen
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
                Extra modules en accessoires die bij jouw merk passen. Filter op merk zodat je
                precies de juiste uitbreiding bestelt.
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
                Kant-en-klare sets voor meten, sturen of uitbreiden. Bestel elk onderdeel met één
                klik.
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
            Nog niet zeker welke batterij past?
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-base">
            Meet eerst met een P1 Meter, of start onze beslishulp. In een paar stappen zie je welke
            stekkerbatterij bij jouw situatie past.
          </p>
          <Link
            href={"/beslishulp" as Route}
            className={cn(buttonVariants({ size: "lg", className: "mt-5" }))}
          >
            Start de beslishulp
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Container>
    </main>
  );
}
