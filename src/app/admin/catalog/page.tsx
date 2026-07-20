import Link from "next/link";
import type { Route } from "next";
import { getCatalogCompletenessReport } from "@/features/products/catalog-completeness";
import {
  listCatalogCandidates,
  listRecentCatalogRuns,
} from "@/features/catalog-discovery/queries.server";
import { getBolClientStatus } from "@/features/catalog-discovery/bol-client";
import {
  approveCatalogCandidateAction,
  refreshBolPricesAction,
  refreshProductImagesAction,
  rejectCatalogCandidateAction,
  runCatalogDiscoveryAction,
} from "@/features/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminCatalogHealthPage() {
  let report: Awaited<ReturnType<typeof getCatalogCompletenessReport>> | null = null;
  let loadError: string | null = null;
  let candidates: Awaited<ReturnType<typeof listCatalogCandidates>> = [];
  let runs: Awaited<ReturnType<typeof listRecentCatalogRuns>> = [];
  const bolStatus = getBolClientStatus();

  try {
    report = await getCatalogCompletenessReport();
    candidates = await listCatalogCandidates(40);
    runs = await listRecentCatalogRuns(5);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Kon catalogus-health niet laden.";
  }

  const needsReview = candidates.filter((c) => c.status === "needs_review");
  const recent = candidates.slice(0, 20);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">Catalogus-health</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Completeness per marquee-merk, discovery-queue (SKU-match) en affiliate-linkstatus.
      </p>

      <section className="border-border mt-6 rounded-xl border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Catalog Discovery</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Bol: {bolStatus.mode}
              {" · "}
              {bolStatus.detail}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={runCatalogDiscoveryAction}>
              <Button type="submit" size="sm">
                Run discovery nu
              </Button>
            </form>
            <form action={refreshBolPricesAction}>
              <Button type="submit" size="sm" variant="outline">
                Vernieuw Bol-prijzen
              </Button>
            </form>
            <form action={refreshProductImagesAction}>
              <Button type="submit" size="sm" variant="outline">
                Vernieuw productfoto&apos;s
              </Button>
            </form>
          </div>
        </div>
        {runs.length > 0 && (
          <ul className="text-muted-foreground mt-3 space-y-1 text-xs">
            {runs.map((run) => (
              <li key={run.id}>
                {new Date(run.started_at).toLocaleString("nl-NL")} · {run.trigger_source}
                {run.finished_at ? " · klaar" : " · bezig"}
              </li>
            ))}
          </ul>
        )}
      </section>

      {needsReview.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Review-queue (lage SKU-match)</h2>
          <ul className="mt-4 space-y-3">
            {needsReview.map((c) => (
              <li key={c.id} className="border-border rounded-xl border px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{c.raw_title}</p>
                  <Badge variant="warning">
                    score {c.match_score != null ? c.match_score.toFixed(2) : "-"}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {c.brand_slug ?? "onbekend merk"} · {c.source}
                </p>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary mt-1 block truncate text-xs hover:underline"
                >
                  {c.url}
                </a>
                {c.match_notes && (
                  <p className="text-muted-foreground mt-2 text-xs">{c.match_notes}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={approveCatalogCandidateAction}>
                    <input type="hidden" name="candidateId" value={c.id} />
                    <Button type="submit" size="sm">
                      Approve &amp; publish
                    </Button>
                  </form>
                  <form action={rejectCatalogCandidateAction}>
                    <input type="hidden" name="candidateId" value={c.id} />
                    <Button type="submit" size="sm" variant="outline">
                      Reject
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Recente candidates</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {recent.map((c) => (
              <li
                key={c.id}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
              >
                <span>
                  <span className="font-medium">{c.raw_title}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {c.brand_slug ?? "?"} · score{" "}
                    {c.match_score != null ? c.match_score.toFixed(2) : "-"}
                  </span>
                </span>
                <Badge variant={c.status === "published" ? "success" : "muted"}>{c.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

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
