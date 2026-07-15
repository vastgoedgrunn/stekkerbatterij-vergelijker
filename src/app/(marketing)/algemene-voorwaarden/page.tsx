import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPage,
  LegalSection,
  LegalParagraph,
  LegalList,
  CompanyDetails,
} from "@/components/patterns/legal-page";
import { legalConfig } from "@/config/legal";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description:
    "De algemene voorwaarden voor de verkoop van producten aan consumenten via Stekkerbatterij Vergelijker.",
  alternates: { canonical: "/algemene-voorwaarden" },
};

const vatPercent = Math.round(legalConfig.vatRate * 100);

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Juridisch"
      title="Algemene voorwaarden"
      intro="Deze voorwaarden gelden voor iedere aanbieding en overeenkomst tussen onze webshop en een consument (koop van goederen op afstand). Ze zijn opgesteld met inachtneming van het Nederlandse consumentenrecht (Boek 6 en 7 BW) en de Europese richtlijn consumentenrechten."
    >
      <LegalSection id="artikel-1" heading="Artikel 1: Definities">
        <LegalList
          items={[
            <>
              <strong>Ondernemer:</strong> de hieronder genoemde onderneming die producten op
              afstand aan consumenten aanbiedt.
            </>,
            <>
              <strong>Consument:</strong> de natuurlijke persoon die niet handelt in de uitoefening
              van beroep of bedrijf en een overeenkomst aangaat met de ondernemer.
            </>,
            <>
              <strong>Overeenkomst op afstand:</strong> een overeenkomst die via de webshop tot
              stand komt zonder gelijktijdige persoonlijke aanwezigheid van ondernemer en consument.
            </>,
            <>
              <strong>Bedenktijd:</strong> de termijn waarbinnen de consument gebruik kan maken van
              het herroepingsrecht.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="artikel-2" heading="Artikel 2: Gegevens van de ondernemer">
        <LegalParagraph>
          De overeenkomst wordt gesloten met de onderstaande onderneming. Deze gegevens gelden als
          contact- en vestigingsgegevens.
        </LegalParagraph>
        <CompanyDetails />
      </LegalSection>

      <LegalSection id="artikel-3" heading="Artikel 3: Toepasselijkheid">
        <LegalList
          items={[
            "Deze algemene voorwaarden zijn van toepassing op elk aanbod van de ondernemer en op elke tot stand gekomen overeenkomst op afstand tussen ondernemer en consument.",
            "Voordat de overeenkomst wordt gesloten, wordt de tekst van deze voorwaarden langs elektronische weg aan de consument beschikbaar gesteld, zodat deze eenvoudig kan worden opgeslagen.",
            "Situaties die niet in deze voorwaarden zijn geregeld, worden beoordeeld naar de geest van deze voorwaarden en het toepasselijke recht.",
          ]}
        />
      </LegalSection>

      <LegalSection id="artikel-4" heading="Artikel 4: Het aanbod">
        <LegalList
          items={[
            "Als een aanbod een beperkte geldigheidsduur heeft of onder voorwaarden geschiedt, wordt dit nadrukkelijk vermeld.",
            "Het aanbod bevat een volledige en nauwkeurige omschrijving van de aangeboden producten. De beschrijving is voldoende gedetailleerd om een goede beoordeling mogelijk te maken.",
            "Kennelijke vergissingen of fouten in het aanbod binden de ondernemer niet.",
            "Elk product wordt zo getoond dat de consument duidelijk weet welke rechten en verplichtingen aan de aanvaarding van het aanbod zijn verbonden.",
          ]}
        />
      </LegalSection>

      <LegalSection id="artikel-5" heading="Artikel 5: De overeenkomst">
        <LegalList
          items={[
            "De overeenkomst komt tot stand op het moment dat de consument het aanbod aanvaardt en aan de daarbij gestelde voorwaarden voldoet.",
            "De ondernemer bevestigt de ontvangst van de aanvaarding van het aanbod langs elektronische weg (per e-mail). Zolang de ontvangst niet is bevestigd, kan de consument de overeenkomst ontbinden.",
            "De ondernemer treft passende technische en organisatorische maatregelen ter beveiliging van de elektronische overdracht van gegevens en zorgt voor een veilige webomgeving.",
          ]}
        />
      </LegalSection>

      <LegalSection id="artikel-6" heading="Artikel 6: Herroepingsrecht">
        <LegalParagraph>
          De consument kan een overeenkomst met betrekking tot de aankoop van een product gedurende
          een bedenktijd van {legalConfig.withdrawalPeriodDays} dagen zonder opgave van redenen
          ontbinden. Op de uitoefening, de termijnen, de uitzonderingen en het modelformulier is ons
          aparte <Link href="/herroepingsrecht">herroepingsrecht &amp; retourbeleid</Link> van
          toepassing, dat integraal onderdeel is van deze voorwaarden.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="artikel-7" heading="Artikel 7: De prijs">
        <LegalList
          items={[
            `Alle vermelde prijzen zijn in euro's en inclusief ${vatPercent}% btw, tenzij uitdrukkelijk anders vermeld. Eventuele verzendkosten worden vóór het afronden van de bestelling apart getoond.`,
            "Gedurende de in het aanbod vermelde geldigheidsduur worden de prijzen niet verhoogd, behoudens prijswijzigingen als gevolg van veranderingen in btw-tarieven.",
            "Prijzen op vergelijkings- en productpagina's zijn indicatief; de prijs die geldt is de prijs die bij het afrekenen wordt getoond en bevestigd.",
          ]}
        />
      </LegalSection>

      <LegalSection id="artikel-8" heading="Artikel 8: Betaling">
        <LegalList
          items={[
            "Betaling verloopt via de bij het afrekenen aangeboden betaalmethoden. De betaling wordt afgehandeld door onze betaaldienstverlener Mollie.",
            "Het verschuldigde bedrag dient te worden voldaan op het moment van bestelling, tenzij anders is overeengekomen. De levering start na ontvangst van de betaling.",
            "De consument is verplicht onjuistheden in verstrekte of vermelde betaalgegevens onverwijld aan de ondernemer te melden.",
          ]}
        />
      </LegalSection>

      <LegalSection id="artikel-9" heading="Artikel 9: Levering en uitvoering">
        <LegalList
          items={[
            "De ondernemer neemt de grootst mogelijke zorgvuldigheid in acht bij de uitvoering van bestellingen.",
            "Een deel van het assortiment wordt rechtstreeks vanaf de leverancier of fabrikant verzonden (dropshipping). Hierdoor kan de levertijd langer zijn en kunnen producten uit één bestelling in aparte zendingen aankomen. De verwachte levertijd wordt bij het product en/of tijdens het bestelproces vermeld.",
            "Als plaats van levering geldt het adres dat de consument aan de ondernemer kenbaar heeft gemaakt.",
            "De ondernemer voert geaccepteerde bestellingen met bekwame spoed doch uiterlijk binnen 30 dagen uit, tenzij een andere leveringstermijn is overeengekomen. Bij vertraging ontvangt de consument hiervan tijdig bericht en heeft deze het recht de overeenkomst kosteloos te ontbinden.",
            "Het risico van beschadiging en/of vermissing van producten berust bij de ondernemer tot het moment van bezorging aan de consument.",
          ]}
        />
      </LegalSection>

      <LegalSection id="artikel-10" heading="Artikel 10: Conformiteit en garantie">
        <LegalParagraph>
          De ondernemer staat ervoor in dat de producten voldoen aan de overeenkomst, aan de
          redelijke eisen van deugdelijkheid en/of bruikbaarheid en aan de wettelijke bepalingen die
          op de dag van de totstandkoming van de overeenkomst gelden. Naast deze wettelijke
          conformiteit kan een aanvullende fabrieksgarantie van toepassing zijn. Zie ons volledige{" "}
          <Link href="/garantie">garantiebeleid</Link> voor de details.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="artikel-11" heading="Artikel 11: Klachten">
        <LegalList
          items={[
            <>
              Klachten over de uitvoering van de overeenkomst moeten binnen bekwame tijd nadat de
              consument de gebreken heeft geconstateerd, volledig en duidelijk omschreven worden
              ingediend bij de ondernemer via{" "}
              <a href={`mailto:${legalConfig.contact.email}`}>{legalConfig.contact.email}</a>.
            </>,
            "Ingediende klachten worden binnen een termijn van 14 dagen na ontvangst beantwoord. Als een klacht een langere verwerkingstijd vraagt, ontvangt de consument binnen 14 dagen een bericht van ontvangst en een indicatie wanneer een uitvoeriger antwoord kan worden verwacht.",
            <>
              Komen consument en ondernemer er samen niet uit, dan kan de consument het geschil
              voorleggen aan de geschillencommissie of gebruikmaken van het Europese ODR-platform
              via{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
              >
                ec.europa.eu/consumers/odr
              </a>
              .
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="artikel-12" heading="Artikel 12: Toepasselijk recht">
        <LegalParagraph>
          Op overeenkomsten tussen de ondernemer en de consument waarop deze algemene voorwaarden
          betrekking hebben, is uitsluitend Nederlands recht van toepassing. Dwingendrechtelijke
          bepalingen van consumentenbescherming van het land waar de consument woont, blijven
          onverkort van kracht.
        </LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}
