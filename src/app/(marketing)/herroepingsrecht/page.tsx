import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPage,
  LegalSection,
  LegalParagraph,
  LegalList,
} from "@/components/patterns/legal-page";
import { legalConfig, formattedAddress } from "@/config/legal";

export const metadata: Metadata = {
  title: "Herroepingsrecht & retourneren",
  description:
    "Je hebt 14 dagen bedenktijd bij aankopen op afstand. Lees hoe je herroept, welke uitzonderingen gelden en gebruik het modelformulier voor herroeping.",
  alternates: { canonical: "/herroepingsrecht" },
};

const days = legalConfig.withdrawalPeriodDays;

export default function WithdrawalPage() {
  return (
    <LegalPage
      eyebrow="Retour & bedenktijd"
      title="Herroepingsrecht & retourneren"
      intro={`Bij een aankoop op afstand heb je als consument een wettelijke bedenktijd van ${days} dagen. Binnen die termijn mag je de overeenkomst zonder opgave van redenen ontbinden. Hieronder lees je precies hoe dat werkt.`}
    >
      <LegalSection id="bedenktijd" heading={`De bedenktijd van ${days} dagen`}>
        <LegalList
          items={[
            `Je hebt het recht de overeenkomst binnen ${days} dagen zonder opgave van redenen te ontbinden.`,
            `De bedenktijd gaat in op de dag nadat jij (of een door jou aangewezen derde, niet de vervoerder) het product hebt ontvangen.`,
            "Bestel je meerdere producten in één bestelling die apart worden geleverd? Dan gaat de bedenktijd in op de dag waarop je het laatste product hebt ontvangen.",
            "Tijdens de bedenktijd ga je zorgvuldig om met het product en de verpakking. Je mag het product uitpakken en beoordelen zoals dat in een winkel zou mogen. Verder gebruik dan nodig om de aard en werking vast te stellen kan leiden tot waardevermindering die voor jouw rekening komt.",
          ]}
        />
      </LegalSection>

      <LegalSection id="herroepen" heading="Hoe herroep je?">
        <LegalList
          ordered
          items={[
            <>
              Meld binnen de bedenktijd dat je van de aankoop afziet. Dit kan via een
              ondubbelzinnige verklaring per e-mail aan{" "}
              <a href={`mailto:${legalConfig.contact.email}`}>{legalConfig.contact.email}</a>, of
              met het modelformulier hieronder.
            </>,
            `Stuur het product daarna zo snel mogelijk, maar in elk geval binnen 14 dagen na je melding, compleet en indien mogelijk in de originele staat en verpakking terug.`,
            "De rechtstreekse kosten van het terugzenden zijn voor jouw rekening, tenzij anders vermeld of anders overeengekomen.",
            "Bewaar het verzendbewijs van je retourzending tot de terugbetaling is afgerond.",
          ]}
        />
      </LegalSection>

      <LegalSection id="terugbetaling" heading="Terugbetaling">
        <LegalList
          items={[
            "We betalen het aankoopbedrag inclusief de standaard leveringskosten uiterlijk 14 dagen na ontvangst van je herroeping terug.",
            "We mogen wachten met terugbetalen tot we het product retour hebben ontvangen, of tot je hebt aangetoond dat je het hebt teruggezonden, afhankelijk van welk moment eerder valt.",
            "Terugbetaling gebeurt met hetzelfde betaalmiddel als waarmee je hebt betaald, tenzij je uitdrukkelijk met een andere methode instemt. Er worden geen kosten in rekening gebracht voor de terugbetaling.",
            "Koos je voor een duurdere leveringswijze dan de standaard? Dan hoeven de meerkosten van die duurdere levering niet te worden terugbetaald.",
          ]}
        />
      </LegalSection>

      <LegalSection id="dropshipping" heading="Levering, retour en dropshipping">
        <LegalParagraph>
          Een deel van ons assortiment wordt rechtstreeks vanaf de leverancier of fabrikant
          verzonden (dropshipping). Dit heeft gevolgen voor de levering en retour die we transparant
          willen houden:
        </LegalParagraph>
        <LegalList
          items={[
            "Levertijden kunnen langer zijn en producten uit één bestelling kunnen in aparte zendingen aankomen.",
            "Voor een retour kan een specifiek retouradres of een retourinstructie gelden dat afwijkt van ons vestigingsadres. Meld je retour daarom altijd eerst bij ons, dan ontvang je het juiste retouradres en de instructies.",
            "Je herroepingsrecht en terugbetalingstermijnen blijven volledig gelden, ongeacht van waaruit het product is verzonden.",
          ]}
        />
      </LegalSection>

      <LegalSection id="uitzonderingen" heading="Uitzonderingen op het herroepingsrecht">
        <LegalParagraph>
          Voor sommige producten geldt het herroepingsrecht niet of vervalt het. De belangrijkste
          wettelijke uitzonderingen zijn:
        </LegalParagraph>
        <LegalList
          items={[
            "Producten die op maat zijn gemaakt of duidelijk voor een specifieke persoon zijn bestemd.",
            "Verzegelde producten die om redenen van gezondheidsbescherming of hygiëne niet geschikt zijn om te worden teruggezonden en waarvan de verzegeling na levering is verbroken.",
            "Producten die na levering door hun aard onherroepelijk vermengd zijn met andere zaken.",
            "Verzegelde audio-, video-opnamen of computersoftware waarvan de verzegeling na levering is verbroken.",
            "De levering van digitale inhoud die niet op een materiële drager is geleverd, als de uitvoering met jouw uitdrukkelijke voorafgaande toestemming is begonnen en je hebt verklaard je herroepingsrecht daarmee te verliezen.",
          ]}
        />
        <LegalParagraph>
          Als voor een product een uitzondering geldt, vermelden we dat duidelijk bij het product en
          in het bestelproces.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="modelformulier" heading="Modelformulier voor herroeping">
        <LegalParagraph>
          Dit formulier hoef je alleen in te vullen en terug te sturen als je de overeenkomst wilt
          herroepen. Mailen van een eigen, duidelijke verklaring mag ook.
        </LegalParagraph>
        <div className="border-border bg-muted/40 text-foreground rounded-2xl border p-5 text-sm leading-relaxed sm:p-6">
          <p>Aan {formattedAddress()}</p>
          <p className="mt-1">
            E-mail: <a href={`mailto:${legalConfig.contact.email}`}>{legalConfig.contact.email}</a>
          </p>
          <div className="mt-4 space-y-3">
            <p>
              Ik/Wij (*) deel/delen (*) u hierbij mede dat ik/wij (*) onze overeenkomst betreffende
              de verkoop van de volgende producten herroep/herroepen (*):
            </p>
            <p>_______________________________________________</p>
            <p>Besteld op (*)/Ontvangen op (*): _______________</p>
            <p>Naam consument(en): _______________</p>
            <p>Adres consument(en): _______________</p>
            <p>Handtekening consument(en) (alleen bij papieren formulier): _______________</p>
            <p>Datum: _______________</p>
            <p className="text-muted-foreground">(*) Doorhalen wat niet van toepassing is.</p>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="meer" heading="Meer weten?">
        <LegalParagraph>
          Dit retourbeleid is onderdeel van onze{" "}
          <Link href="/algemene-voorwaarden">algemene voorwaarden</Link>. Vragen over een retour?
          Neem gerust contact op via{" "}
          <a href={`mailto:${legalConfig.contact.email}`}>{legalConfig.contact.email}</a>.
        </LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}
