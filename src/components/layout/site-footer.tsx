import Link from "next/link";
import { ShieldCheck, Scale, TrendingDown } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/brand/logo";

const columns = [
  {
    title: "Vergelijken",
    links: [
      { href: "/batterijen", label: "Alle batterijen" },
      { href: "/vergelijken", label: "Vergelijker" },
      { href: "/beslishulp", label: "Beslishulp" },
    ],
  },
  {
    title: "Kennis",
    links: [
      { href: "/gidsen", label: "Koopgidsen" },
      { href: "/gidsen/stekkerbatterij-koopgids", label: "Koopgids 2026" },
    ],
  },
  {
    title: "Over ons",
    links: [
      { href: "/over-ons", label: "Onafhankelijkheid" },
      { href: "/over-ons#contact", label: "Contact" },
    ],
  },
] as const;

const trust = [
  { icon: Scale, label: "100% onafhankelijk" },
  { icon: TrendingDown, label: "Dagelijks actuele prijzen" },
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

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-4 sm:col-span-2 md:col-span-1">
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
                    href={link.href}
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
        <p className="text-muted-foreground mx-auto w-full max-w-6xl px-4 py-6 text-xs">
          &copy; {new Date().getFullYear()} {siteConfig.name}. Onafhankelijk vergelijkingsplatform.
          Prijzen zijn indicatief en incl. btw; controleer altijd de actuele prijs bij de aanbieder.
        </p>
      </div>
    </footer>
  );
}
