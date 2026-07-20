/** Gerelateerde gidsen voor interne linking (geen nieuwe feiten/prijzen). */

export type RelatedGuideLink = {
  slug: string;
  title: string;
};

const RELATED: Record<string, RelatedGuideLink[]> = {
  "stekkerbatterij-koopgids": [
    { slug: "hoeveel-kwh-stekkerbatterij", title: "Hoeveel kWh heb je nodig?" },
    {
      slug: "stekkerbatterij-vs-vaste-thuisbatterij",
      title: "Stekkerbatterij vs vaste thuisbatterij",
    },
    { slug: "stekkerbatterij-zonder-zonnepanelen", title: "Stekkerbatterij zonder zonnepanelen" },
  ],
  "hoeveel-kwh-stekkerbatterij": [
    { slug: "stekkerbatterij-koopgids", title: "Koopgids stekkerbatterij" },
    {
      slug: "stekkerbatterij-vs-vaste-thuisbatterij",
      title: "Stekkerbatterij vs vaste thuisbatterij",
    },
    { slug: "balkon-of-thuisbatterij", title: "Balkonbatterij of thuisbatterij?" },
  ],
  "stekkerbatterij-installeren": [
    { slug: "stekkerbatterij-koopgids", title: "Koopgids stekkerbatterij" },
    { slug: "hoeveel-kwh-stekkerbatterij", title: "Hoeveel kWh heb je nodig?" },
    { slug: "stekkerbatterij-zonder-zonnepanelen", title: "Zonder zonnepanelen" },
  ],
  "stekkerbatterij-zonder-zonnepanelen": [
    { slug: "dynamisch-contract-batterij", title: "Dynamisch contract en batterij" },
    { slug: "stekkerbatterij-koopgids", title: "Koopgids stekkerbatterij" },
    { slug: "saldering-afbouw", title: "Saldering afbouw" },
  ],
  "stekkerbatterij-vs-vaste-thuisbatterij": [
    { slug: "stekkerbatterij-koopgids", title: "Koopgids stekkerbatterij" },
    { slug: "balkon-of-thuisbatterij", title: "Balkonbatterij of thuisbatterij?" },
    { slug: "hoeveel-kwh-stekkerbatterij", title: "Hoeveel kWh heb je nodig?" },
  ],
  "balkon-of-thuisbatterij": [
    { slug: "stekkerbatterij-vs-vaste-thuisbatterij", title: "Stekker vs vaste thuisbatterij" },
    { slug: "stekkerbatterij-koopgids", title: "Koopgids stekkerbatterij" },
    { slug: "hoeveel-kwh-stekkerbatterij", title: "Hoeveel kWh heb je nodig?" },
  ],
  "dynamisch-contract-batterij": [
    { slug: "stekkerbatterij-zonder-zonnepanelen", title: "Zonder zonnepanelen" },
    { slug: "saldering-afbouw", title: "Saldering afbouw" },
    { slug: "stekkerbatterij-koopgids", title: "Koopgids stekkerbatterij" },
  ],
  "saldering-afbouw": [
    { slug: "dynamisch-contract-batterij", title: "Dynamisch contract en batterij" },
    { slug: "stekkerbatterij-koopgids", title: "Koopgids stekkerbatterij" },
    { slug: "stekkerbatterij-vs-vaste-thuisbatterij", title: "Stekker vs vaste thuisbatterij" },
  ],
};

const FALLBACK: RelatedGuideLink[] = [
  { slug: "stekkerbatterij-koopgids", title: "Koopgids stekkerbatterij" },
  { slug: "hoeveel-kwh-stekkerbatterij", title: "Hoeveel kWh heb je nodig?" },
  { slug: "stekkerbatterij-vs-vaste-thuisbatterij", title: "Stekker vs vaste thuisbatterij" },
];

export function getRelatedGuides(slug: string): RelatedGuideLink[] {
  return RELATED[slug] ?? FALLBACK.filter((g) => g.slug !== slug).slice(0, 3);
}
