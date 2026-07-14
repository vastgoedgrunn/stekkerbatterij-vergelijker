import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Container } from "@/components/patterns/section";
import { legalConfig, formattedAddress, isLegalPlaceholder } from "@/config/legal";
import { cn } from "@/lib/utils";

/** Vaste, zichtbare disclaimer boven élke juridische pagina. */
function ConceptNotice() {
  return (
    <div
      role="note"
      className="border-warning/40 bg-warning/10 text-foreground flex items-start gap-3 rounded-2xl border p-4 sm:p-5"
    >
      <AlertTriangle className="text-warning mt-0.5 size-5 shrink-0" aria-hidden />
      <p className="text-sm leading-relaxed">
        <strong className="font-semibold">Let op — concepttekst.</strong> Dit is een concept dat de
        eigenaar (of een jurist) definitief moet controleren en vaststellen voordat er producten
        worden verkocht. Aan deze tekst kunnen geen rechten worden ontleend zolang de definitieve
        versie niet is vastgesteld.
      </p>
    </div>
  );
}

/** Kop + intro + conceptmelding + datum laatst bijgewerkt. */
export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <div className="border-border/70 from-primary/5 border-b bg-gradient-to-b to-transparent">
        <Container className="max-w-3xl! py-10 sm:py-14">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{intro}</p>
        </Container>
      </div>

      <Container className="max-w-3xl! py-10 sm:py-12">
        <ConceptNotice />
        <p className="text-muted-foreground mt-4 text-sm">
          Laatst bijgewerkt op{" "}
          {new Date(legalConfig.lastUpdated).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          .
        </p>
        <article className="[&_a]:text-primary mt-8 space-y-8 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-80">
          {children}
        </article>
      </Container>
    </main>
  );
}

/** Genummerd of ongenummerd artikel-blok met een h2-kop. */
export function LegalSection({
  id,
  heading,
  children,
}: {
  id?: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">{heading}</h2>
      <div className="text-muted-foreground space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}

export function LegalParagraph({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("leading-relaxed", className)} {...props} />;
}

/** Opsomming met nette bullets in de merkkleur. */
export function LegalList({
  items,
  ordered = false,
}: {
  items: React.ReactNode[];
  ordered?: boolean;
}) {
  const className = cn(
    "space-y-2 pl-5",
    ordered ? "list-decimal marker:text-muted-foreground" : "list-disc marker:text-primary",
  );
  return ordered ? (
    <ol className={className}>
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ol>
  ) : (
    <ul className={className}>
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Bedrijfsgegevens-kaart — leest álles uit `legalConfig`. Toont nog niet
 * ingevulde velden zichtbaar als "nog invullen" zodat er geen dummy-data
 * ongemerkt live gaat.
 */
export function CompanyDetails() {
  const rows: { label: string; value: string }[] = [
    { label: "Bedrijfsnaam", value: legalConfig.companyName },
    { label: "Handelsnaam", value: legalConfig.tradeName },
    { label: "Adres", value: formattedAddress() },
    { label: "KvK-nummer", value: legalConfig.kvkNumber },
    { label: "Btw-nummer", value: legalConfig.vatNumber },
    { label: "E-mail", value: legalConfig.contact.email },
    { label: "Telefoon", value: legalConfig.contact.phone },
  ];

  return (
    <dl className="border-border bg-muted/40 divide-border grid gap-0 divide-y rounded-2xl border">
      {rows.map((row) => {
        const placeholder = isLegalPlaceholder(row.value);
        return (
          <div key={row.label} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-foreground text-sm font-semibold">{row.label}</dt>
            <dd
              className={cn(
                "text-sm",
                placeholder ? "text-warning font-medium" : "text-muted-foreground",
              )}
            >
              {placeholder ? "Nog invullen door eigenaar" : row.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
