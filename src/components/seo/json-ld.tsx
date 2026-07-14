/**
 * Rendert JSON-LD structured data. Data is server-gegenereerd en bevat
 * geen gebruikersinvoer, dus veilig te serialiseren.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
