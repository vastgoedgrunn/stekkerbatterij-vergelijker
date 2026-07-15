import Link from "next/link";
import type { Route } from "next";
import { getCatalogCompletenessReport } from "@/features/products/catalog-completeness";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminCatalogHealthPage() {
  let report: Awaited<ReturnType<typeof getCatalogCompletenessReport>> | null = null;
  let loadError: string | null = null;
  try {
    report = await getCatalogCompletenessReport();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Kon catalogus-health niet laden.";
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">Catalogus-health</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Completeness per marquee-merk (min. 2 SKUs) en affiliate-linkstatus (ok / pending / broken).
        Gebruikt door de dagelijkse Data-agent.
      </p>

      {loadError ? (
        <p className="text-destructive mt-6 text-sm">{loadError}</p>
      ) : report ? (
        <div className="mt-8 space-y-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="Merken onder minimum"
              value={String(report.summary.brandsBelowMin)}
              bad={report.summary.brandsBelowMin > 0}
            />
            <Stat
              label="Merken op target (4+)"
              value={String(report.summary.brandsAtTarget)}
              bad={false}
            />
            <Stat
              label="Pending/broken offers"
              value={String(report.summary.pendingOrBrokenOffers)}
              bad={report.summary.pendingOrBrokenOffers > 0}
            />
          </div>

          <section>
            <h2 className="text-lg font-semibold">Per merk</h2>
            <ul className="mt-4 space-y-3">
              {report.brands.map((brand) => (
                <li
                  key={brand.brandSlug}
                  className="border-border rounded-xl border px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{brand.brandName}</p>
                    <Badge variant={brand.skuGap > 0 ? "warning" : "success"}>
                      {brand.publishedCount}/{brand.minRequired} SKUs
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    image {brand.withImage} · offer {brand.withOffer} · outbound{" "}
                    {brand.withOutboundOffer} · target {brand.target}
                  </p>
                  {brand.issues.length > 0 && (
                    <ul className="text-muted-foreground mt-2 list-inside list-disc text-xs">
                      {brand.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {report.unhealthyOffers.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">Affiliate attention</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {report.unhealthyOffers.map((offer) => (
                  <li
                    key={offer.offerId}
                    className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                  >
                    <span>
                      <Link
                        href={`/batterijen/${offer.productSlug}` as Route}
                        className="font-medium hover:underline"
                      >
                        {offer.productSlug}
                      </Link>
                      <span className="text-muted-foreground"> · {offer.merchantName}</span>
                    </span>
                    <Badge variant="warning">{offer.status}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="text-muted-foreground text-xs">
            Laatste check: {new Date(report.checkedAt).toLocaleString("nl-NL")}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, bad }: { label: string; value: string; bad: boolean }) {
  return (
    <div className="border-border rounded-xl border px-4 py-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${bad ? "text-warning" : ""}`}>{value}</p>
    </div>
  );
}
