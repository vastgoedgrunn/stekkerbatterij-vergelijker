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
  title: "Privacybeleid",
  description:
    "Hoe Stekkerbatterij Vergelijker omgaat met je persoonsgegevens: welke gegevens we verwerken, waarom, hoe lang en welke rechten je hebt (AVG/GDPR).",
  alternates: { canonical: "/privacybeleid" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacybeleid"
      intro="We gaan zorgvuldig om met je persoonsgegevens en verwerken deze conform de Algemene verordening gegevensbescherming (AVG/GDPR). In dit beleid lees je welke gegevens we verwerken, met welk doel en welke rechten je hebt."
    >
      <LegalSection id="verwerkingsverantwoordelijke" heading="1. Verwerkingsverantwoordelijke">
        <LegalParagraph>
          De verwerkingsverantwoordelijke voor de verwerking van je persoonsgegevens is:
        </LegalParagraph>
        <CompanyDetails />
      </LegalSection>

      <LegalSection id="welke-gegevens" heading="2. Welke gegevens we verwerken">
        <LegalList
          items={[
            <>
              <strong>Accountgegevens (Supabase Auth):</strong> e-mailadres en authenticatiegegevens
              wanneer je een account aanmaakt of inlogt.
            </>,
            <>
              <strong>Bestel- en betaalgegevens:</strong> naam, (verzend)adres, e-mailadres,
              telefoonnummer, bestelde producten en betaalstatus wanneer je een bestelling plaatst.
              Volledige betaalgegevens (zoals kaartnummers) verwerken wij niet zelf; deze worden
              afgehandeld door onze betaaldienstverlener.
            </>,
            <>
              <strong>Reviews:</strong> de inhoud van een review en de bijbehorende beoordeling die
              je vrijwillig plaatst.
            </>,
            <>
              <strong>Contactgegevens:</strong> de gegevens die je meestuurt als je ons e-mailt of
              een vraag stelt.
            </>,
            <>
              <strong>Gebruiksstatistieken (Plausible Analytics):</strong> geaggregeerde, cookieloze
              statistieken zoals bezochte pagina&apos;s en verwijzende bronnen. Plausible plaatst
              géén cookies en verzamelt geen persoonlijke, identificeerbare gegevens.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="rechtsgronden" heading="3. Doeleinden en rechtsgronden">
        <LegalList
          items={[
            <>
              <strong>Uitvoeren van de overeenkomst</strong> (art. 6 lid 1 sub b AVG): het verwerken
              en leveren van je bestelling, betaling en klantcontact.
            </>,
            <>
              <strong>Wettelijke verplichting</strong> (art. 6 lid 1 sub c AVG): het bewaren van
              factuur- en administratiegegevens voor de fiscale bewaarplicht.
            </>,
            <>
              <strong>Gerechtvaardigd belang</strong> (art. 6 lid 1 sub f AVG): het beveiligen en
              verbeteren van onze website en het meten van gebruik via cookieloze analytics.
            </>,
            <>
              <strong>Toestemming</strong> (art. 6 lid 1 sub a AVG): waar we je expliciet om
              toestemming vragen, bijvoorbeeld voor een nieuwsbrief. Je kunt toestemming altijd weer
              intrekken.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="bewaartermijnen" heading="4. Bewaartermijnen">
        <LegalList
          items={[
            "Bestel- en factuurgegevens bewaren we minimaal 7 jaar in verband met de wettelijke fiscale bewaarplicht.",
            "Accountgegevens bewaren we zolang je een account hebt. Verwijder je je account, dan verwijderen of anonimiseren we deze gegevens, behoudens gegevens die we wettelijk moeten bewaren.",
            "Contactcorrespondentie bewaren we niet langer dan nodig voor de afhandeling van je vraag.",
            "Analytics-gegevens zijn geaggregeerd en niet tot een persoon herleidbaar.",
          ]}
        />
      </LegalSection>

      <LegalSection id="verwerkers" heading="5. Ontvangers en verwerkers">
        <LegalParagraph>
          We schakelen zorgvuldig geselecteerde dienstverleners in die als verwerker namens ons
          gegevens verwerken. Met deze partijen sluiten we verwerkersovereenkomsten. Het gaat om:
        </LegalParagraph>
        <LegalList
          items={[
            <>
              <strong>Supabase</strong> — database, authenticatie en opslag van account-, bestel- en
              reviewgegevens.
            </>,
            <>
              <strong>Vercel</strong> — hosting van de website en verwerking van technische
              logbestanden.
            </>,
            <>
              <strong>Mollie</strong> — afhandeling van betalingen.
            </>,
            <>
              <strong>Resend</strong> — verzending van transactionele e-mails (zoals order- en
              verzendbevestigingen).
            </>,
            <>
              <strong>Plausible Analytics</strong> — cookieloze, privacyvriendelijke
              websitestatistieken (verwerkt binnen de EU).
            </>,
          ]}
        />
        <LegalParagraph>
          Daarnaast kunnen leveranciers die producten rechtstreeks verzenden (dropshipping) de
          benodigde verzendgegevens ontvangen om je bestelling te bezorgen.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="doorgifte" heading="6. Doorgifte buiten de EER">
        <LegalParagraph>
          We streven ernaar gegevens binnen de Europese Economische Ruimte (EER) te verwerken. Waar
          een verwerker gegevens buiten de EER verwerkt, zorgen we voor passende waarborgen, zoals
          de modelcontractbepalingen (SCC&apos;s) van de Europese Commissie.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="cookies" heading="7. Cookies">
        <LegalParagraph>
          We gebruiken alleen functionele cookies die noodzakelijk zijn voor het functioneren van de
          website (zoals het onthouden van je sessie en winkelmand). Voor onze statistieken
          gebruiken we Plausible, dat volledig cookieloos werkt. We plaatsen geen tracking- of
          advertentiecookies.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="rechten" heading="8. Je rechten">
        <LegalParagraph>Je hebt op grond van de AVG de volgende rechten:</LegalParagraph>
        <LegalList
          items={[
            "Recht op inzage in de persoonsgegevens die we van je verwerken.",
            "Recht op rectificatie van onjuiste of onvolledige gegevens.",
            "Recht op verwijdering (‘recht om vergeten te worden’).",
            "Recht op beperking van de verwerking.",
            "Recht op dataportabiliteit (overdracht van je gegevens).",
            "Recht van bezwaar tegen verwerking op basis van gerechtvaardigd belang.",
            "Recht om gegeven toestemming op elk moment in te trekken.",
          ]}
        />
        <LegalParagraph>
          Je kunt een verzoek indienen via{" "}
          <a href={`mailto:${legalConfig.contact.email}`}>{legalConfig.contact.email}</a>. We
          reageren binnen de wettelijke termijn van één maand. Je hebt ook het recht een klacht in
          te dienen bij de Autoriteit Persoonsgegevens via{" "}
          <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">
            autoriteitpersoonsgegevens.nl
          </a>
          .
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="beveiliging" heading="9. Beveiliging">
        <LegalParagraph>
          We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen
          tegen verlies of onrechtmatige verwerking, waaronder versleutelde verbindingen (HTTPS) en
          toegangsbeperking tot persoonsgegevens.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="wijzigingen" heading="10. Wijzigingen">
        <LegalParagraph>
          We kunnen dit privacybeleid van tijd tot tijd aanpassen. De meest actuele versie vind je
          altijd op deze pagina. Vragen? Neem contact op via{" "}
          <a href={`mailto:${legalConfig.contact.email}`}>{legalConfig.contact.email}</a> of lees
          onze <Link href="/algemene-voorwaarden">algemene voorwaarden</Link>.
        </LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}
