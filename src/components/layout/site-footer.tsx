import Link from "next/link";
import { siteConfig } from "@/config/site";

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

export function SiteFooter() {
  return (
    <footer className="border-border bg-muted/30 mt-16 border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-2">
          <p className="font-bold">{siteConfig.shortName}</p>
          <p className="text-muted-foreground text-sm">{siteConfig.description}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-sm font-semibold">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm"
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
          © {new Date().getFullYear()} {siteConfig.name}. Onafhankelijk vergelijkingsplatform.
          Prijzen zijn indicatief en incl. btw; controleer altijd de actuele prijs bij de aanbieder.
        </p>
      </div>
    </footer>
  );
}
