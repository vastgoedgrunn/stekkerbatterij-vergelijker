import Link from "next/link";
import type { Route } from "next";
import { ShieldCheck, Scale, TrendingDown } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/brand/logo";

const columns = [
  {
    title: "Vergelijken",
    links: [
      { href: "/batterijen", label: "Alle batterijen" },
      { href: "/stekkerbatterijen", label: "Stekkerbatterijen" },
      { href: "/vaste-thuisbatterijen", label: "Vaste thuisbatterijen" },
      { href: "/vergelijken", label: "Vergelijker" },
      { href: "/beslishulp", label: "Beslishulp" },
    ],
  },
  {
    title: "Populair",
    links: [
      { href: "/beste-stekkerbatterij", label: "Beste stekkerbatterij" },
      { href: "/beste-vaste-thuisbatterij", label: "Beste vaste thuisbatterij" },
      { href: "/shop", label: "Slimme Energie Shop" },
      { href: "/merken", label: "Merken" },
      { href: "/homewizard-plug-in-battery-prijs", label: "HomeWizard prijs" },
      { href: "/energie", label: "Energie vergelijken" },
    ],
  },
  {
    title: "Kennis",
    links: [
      { href: "/gidsen", label: "Koopgidsen" },
      { href: "/tools/terugverdientijd", label: "Terugverdientijd" },
      { href: "/over-ons/hoe-wij-vergelijken", label: "Hoe wij vergelijken" },
      { href: "/beslishulp", label: "Beslishulp" },
    ],
  },
  {
    title: "Over ons",
    links: [
      { href: "/over-ons", label: "Onafhankelijkheid" },
      { href: "/over-ons#contact", label: "Contact" },
    ],
  },
  {
    title: "Juridisch",
    links: [
      { href: "/algemene-voorwaarden", label: "Algemene voorwaarden" },
      { href: "/herroepingsrecht", label: "Herroepingsrecht" },
      { href: "/garantie", label: "Garantie" },
      { href: "/privacybeleid", label: "Privacybeleid" },
    ],
  },
] as const;

const trust = [
  { icon: Scale, label: "100% onafhankelijk" },
  { icon: TrendingDown, label: "Prijzen met controledatum" },
  { icon: ShieldCheck, label: "Transparant over aanbieders" },
];

export function SiteFooter() {
  return (
    <footer className="border-border bg-muted/40 mt-24 border-t">
      <div className="border-border/70 border-b">
        <ul className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
          {trust.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5 text-sm font-medium">
              <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
                <item.icon className="size-4" />
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <div className="space-y-4 sm:col-span-2 md:col-span-3 lg:col-span-1">
          <Logo />
          <p className="text-muted-foreground max-w-xs text-sm">{siteConfig.description}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-sm font-semibold">{col.title}</p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as Route}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-border border-t">
        <p className="text-muted-foreground mx-auto w-full max-w-6xl px-4 py-6 text-xs leading-relaxed">
          &copy; {new Date().getFullYear()} {siteConfig.name}. Onafhankelijk vergelijkingsplatform.
          Prijzen zijn indicatief en incl. btw; controleer altijd de actuele prijs bij afronden. Bij
          aankoop via onze links kunnen wij een kleine vergoeding ontvangen, zonder extra kosten
          voor jou. Dat beïnvloedt onze ranking niet.{" "}
          <Link
            href={"/over-ons/hoe-wij-vergelijken" as Route}
            className="underline-offset-2 hover:underline"
          >
            Meer over hoe wij vergelijken
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
