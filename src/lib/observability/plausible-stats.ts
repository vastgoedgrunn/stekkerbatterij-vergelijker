import "server-only";
import { unstable_cache } from "next/cache";
import { serverEnv } from "@/lib/env/server";
import { clientEnv } from "@/lib/env/client";

export type PlausiblePeriod = "day" | "7d" | "30d" | "91d";

export type PlausibleAggregate = {
  visitors: number;
  pageviews: number;
  visits: number;
  bounceRate: number | null;
  visitDuration: number | null;
};

export type PlausibleTimeseriesPoint = {
  date: string;
  visitors: number;
  pageviews: number;
};

export type PlausibleBreakdownRow = {
  label: string;
  visitors: number;
  pageviews?: number;
  events?: number;
};

export type PlausibleDashboard = {
  configured: boolean;
  period: PlausiblePeriod;
  siteId: string | null;
  aggregate: PlausibleAggregate | null;
  timeseries: PlausibleTimeseriesPoint[];
  sources: PlausibleBreakdownRow[];
  pages: PlausibleBreakdownRow[];
  devices: PlausibleBreakdownRow[];
  countries: PlausibleBreakdownRow[];
  offerClicks: number | null;
  error: string | null;
};

type QueryResult = {
  results?: Array<{ metrics: unknown[]; dimensions: unknown[] }>;
  error?: string;
};

function plausibleHost(): string {
  return (clientEnv.NEXT_PUBLIC_PLAUSIBLE_HOST ?? "https://plausible.io").replace(/\/$/, "");
}

function siteId(): string | null {
  return clientEnv.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() || null;
}

export function isPlausibleStatsConfigured(): boolean {
  return Boolean(serverEnv.PLAUSIBLE_API_KEY && siteId());
}

async function queryPlausible(body: Record<string, unknown>): Promise<QueryResult> {
  const key = serverEnv.PLAUSIBLE_API_KEY;
  const site = siteId();
  if (!key || !site) {
    return { error: "PLAUSIBLE_API_KEY of NEXT_PUBLIC_PLAUSIBLE_DOMAIN ontbreekt." };
  }

  const res = await fetch(`${plausibleHost()}/api/v2/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ site_id: site, ...body }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      error: `Plausible API ${res.status}${text ? `: ${text.slice(0, 180)}` : ""}`,
    };
  }

  return (await res.json()) as QueryResult;
}

function metricNumber(metrics: unknown[], index: number): number {
  const raw = metrics[index];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
}

async function fetchDashboardUncached(period: PlausiblePeriod): Promise<PlausibleDashboard> {
  const site = siteId();
  const base: PlausibleDashboard = {
    configured: isPlausibleStatsConfigured(),
    period,
    siteId: site,
    aggregate: null,
    timeseries: [],
    sources: [],
    pages: [],
    devices: [],
    countries: [],
    offerClicks: null,
    error: null,
  };

  if (!base.configured) {
    base.error =
      "Zet PLAUSIBLE_API_KEY (Stats API) en NEXT_PUBLIC_PLAUSIBLE_DOMAIN in Vercel om verkeer te tonen.";
    return base;
  }

  const dateRange = period;
  const [aggRes, seriesRes, sourcesRes, pagesRes, devicesRes, countriesRes, goalsRes] =
    await Promise.all([
      queryPlausible({
        metrics: ["visitors", "pageviews", "visits", "bounce_rate", "visit_duration"],
        date_range: dateRange,
      }),
      queryPlausible({
        metrics: ["visitors", "pageviews"],
        date_range: dateRange,
        dimensions: ["time:day"],
        include: { time_labels: true },
      }),
      queryPlausible({
        metrics: ["visitors", "pageviews"],
        date_range: dateRange,
        dimensions: ["visit:source"],
        order_by: [["visitors", "desc"]],
        pagination: { limit: 10, offset: 0 },
      }),
      queryPlausible({
        metrics: ["visitors", "pageviews"],
        date_range: dateRange,
        dimensions: ["event:page"],
        order_by: [["visitors", "desc"]],
        pagination: { limit: 10, offset: 0 },
      }),
      queryPlausible({
        metrics: ["visitors"],
        date_range: dateRange,
        dimensions: ["visit:device"],
        order_by: [["visitors", "desc"]],
        pagination: { limit: 8, offset: 0 },
      }),
      queryPlausible({
        metrics: ["visitors"],
        date_range: dateRange,
        dimensions: ["visit:country_name"],
        order_by: [["visitors", "desc"]],
        pagination: { limit: 8, offset: 0 },
      }),
      queryPlausible({
        metrics: ["events", "visitors"],
        date_range: dateRange,
        filters: [["is", "event:goal", ["offer_clicked"]]],
      }),
    ]);

  const firstError =
    aggRes.error ??
    seriesRes.error ??
    sourcesRes.error ??
    pagesRes.error ??
    devicesRes.error ??
    countriesRes.error ??
    goalsRes.error;
  if (firstError && !aggRes.results) {
    base.error = firstError;
    return base;
  }

  const aggRow = aggRes.results?.[0];
  if (aggRow) {
    base.aggregate = {
      visitors: metricNumber(aggRow.metrics, 0),
      pageviews: metricNumber(aggRow.metrics, 1),
      visits: metricNumber(aggRow.metrics, 2),
      bounceRate: metricNumber(aggRow.metrics, 3) || null,
      visitDuration: metricNumber(aggRow.metrics, 4) || null,
    };
  }

  base.timeseries = (seriesRes.results ?? []).map((row) => ({
    date: String(row.dimensions[0] ?? ""),
    visitors: metricNumber(row.metrics, 0),
    pageviews: metricNumber(row.metrics, 1),
  }));

  const mapBreakdown = (res: QueryResult, withPageviews = false): PlausibleBreakdownRow[] =>
    (res.results ?? []).map((row) => ({
      label: String(row.dimensions[0] ?? "(direct)").trim() || "(direct)",
      visitors: metricNumber(row.metrics, 0),
      ...(withPageviews ? { pageviews: metricNumber(row.metrics, 1) } : {}),
    }));

  base.sources = mapBreakdown(sourcesRes, true);
  base.pages = mapBreakdown(pagesRes, true);
  base.devices = mapBreakdown(devicesRes);
  base.countries = mapBreakdown(countriesRes);

  const goalRow = goalsRes.results?.[0];
  if (goalRow) {
    base.offerClicks = metricNumber(goalRow.metrics, 0);
  } else if (!goalsRes.error) {
    base.offerClicks = 0;
  }

  if (firstError) base.error = firstError;
  return base;
}

/** Cached dashboard (10 min) per periode. */
export async function getPlausibleDashboard(period: PlausiblePeriod): Promise<PlausibleDashboard> {
  const cached = unstable_cache(
    () => fetchDashboardUncached(period),
    ["plausible-dashboard", period, siteId() ?? "none"],
    { revalidate: 600 },
  );
  return cached();
}

export async function getPlausibleVisitorSummary(): Promise<{
  today: number | null;
  last7Days: number | null;
  configured: boolean;
}> {
  if (!isPlausibleStatsConfigured()) {
    return { today: null, last7Days: null, configured: false };
  }
  const cached = unstable_cache(
    async () => {
      const [today, week] = await Promise.all([
        queryPlausible({ metrics: ["visitors"], date_range: "day" }),
        queryPlausible({ metrics: ["visitors"], date_range: "7d" }),
      ]);
      return {
        today: today.results?.[0] ? metricNumber(today.results[0].metrics, 0) : null,
        last7Days: week.results?.[0] ? metricNumber(week.results[0].metrics, 0) : null,
        configured: true as const,
      };
    },
    ["plausible-visitor-summary", siteId() ?? "none"],
    { revalidate: 600 },
  );
  return cached();
}
