import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPage,
  LegalSection,
  LegalParagraph,
  LegalList,
} from "@/components/patterns/legal-page";
import { legalConfig } from "@/config/legal";

export const metadata: Metadata = {
  title: "Garantie",
  description:
    "Je wettelijke garantie (conformiteit) en de aanvullende fabrieksgarantie per product bij Stekkerbatterij Vergelijker. Zo werkt garantie en zo dien je een claim in.",
  alternates: { canonical: "/garantie" },
};

export default function WarrantyPage() {
  return (
    <LegalPage
      eyebrow="Garantie"
      title="Garantie"
      intro="Op elk product heb je recht op wettelijke garantie (conformiteit). Daarnaast geldt bij veel producten een aanvullende fabrieksgarantie. Hieronder leggen we het verschil uit en hoe je een beroep op garantie doet."
    >
      <LegalSection id="wettelijke-garantie" heading="Wettelijke garantie (conformiteit)">
        <LegalParagraph>
          De wettelijke garantie houdt in dat een product moet voldoen aan wat je er redelijkerwijs
          van mag verwachten (conformiteit, art. 7:17 BW). Een product moet deugdelijk zijn en doen
          wat je ervan mag verwachten bij normaal gebruik.
        </LegalParagraph>
        <LegalList
          items={[
            "De wettelijke garantie kent geen vaste einddatum: hoe lang je recht hebt op een deugdelijk product hangt af van de verwachte levensduur en de aard van het product.",
            "Bij een gebrek heb je in beginsel recht op kosteloos herstel of vervanging. Is dat niet mogelijk of proportioneel, dan kun je recht hebben op (gedeeltelijke) terugbetaling of ontbinding.",
            "De wettelijke garantie staat los van, en komt bovenop, een eventuele fabrieksgarantie. Een fabrieksgarantie beperkt je wettelijke rechten nooit.",
          ]}
        />
      </LegalSection>

      <LegalSection id="fabrieksgarantie" heading="Fabrieksgarantie per product">
        <LegalParagraph>
          Veel fabrikanten van stekkerbatterijen geven een aanvullende fabrieksgarantie, vaak
          uitgedrukt in een aantal jaren en/of een aantal laadcycli of een gegarandeerde
          restcapaciteit. Deze garantie verschilt per merk en model.
        </LegalParagraph>
        <LegalList
          items={[
            "De exacte garantietermijn en -voorwaarden vind je bij de specificaties van elk product en in de garantiebepalingen van de fabrikant.",
            "Voor batterijen geldt de fabrieksgarantie vaak onder voorwaarden, zoals installatie en gebruik volgens de handleiding en binnen de opgegeven omstandigheden.",
            "Bewaar je aankoopbewijs; dit geldt als garantiebewijs.",
          ]}
        />
        <LegalParagraph>
          Vergelijk je meerdere modellen? De garantietermijn nemen we mee in onze{" "}
          <Link href="/vergelijken">vergelijker</Link>, zodat je garantie eenvoudig kunt meewegen in
          je keuze.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="uitzonderingen" heading="Wanneer geldt garantie niet?">
        <LegalParagraph>Garantie geldt niet bij gebreken die het gevolg zijn van:</LegalParagraph>
        <LegalList
          items={[
            "onjuiste installatie, onjuist of onoordeelkundig gebruik, of gebruik in strijd met de handleiding;",
            "normale slijtage of een normale, geleidelijke afname van de accucapaciteit binnen de door de fabrikant opgegeven marges;",
            "van buiten komende oorzaken, zoals schade door vallen, vocht of onjuiste spanning;",
            "zelf uitgevoerde reparaties of aanpassingen aan het product.",
          ]}
        />
      </LegalSection>

      <LegalSection id="claim" heading="Zo dien je een garantieclaim in">
        <LegalList
          ordered
          items={[
            <>
              Neem contact met ons op via{" "}
              <a href={`mailto:${legalConfig.contact.email}`}>{legalConfig.contact.email}</a> en
              omschrijf het gebrek zo duidelijk mogelijk, bij voorkeur met foto&apos;s of
              video&apos;s.
            </>,
            "Houd je bestelnummer en aankoopbewijs bij de hand.",
            "We beoordelen je melding en laten je weten hoe de afhandeling verloopt (herstel, vervanging of terugbetaling) en of het product moet worden teruggezonden of rechtstreeks door de fabrikant wordt afgehandeld.",
          ]}
        />
        <LegalParagraph>
          Omdat een deel van ons assortiment rechtstreeks vanaf de fabrikant of leverancier wordt
          verzonden (dropshipping), kan een garantieafhandeling via de fabrikant verlopen. We
          begeleiden je hierbij en blijven je aanspreekpunt.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="meer" heading="Meer informatie">
        <LegalParagraph>
          Dit garantiebeleid is onderdeel van onze{" "}
          <Link href="/algemene-voorwaarden">algemene voorwaarden</Link>. Wil je een product binnen
          de bedenktijd terugsturen in plaats van een garantieclaim indienen? Bekijk dan ons{" "}
          <Link href="/herroepingsrecht">herroepingsrecht &amp; retourbeleid</Link>.
        </LegalParagraph>
      </LegalSection>
    </LegalPage>
  );
}
