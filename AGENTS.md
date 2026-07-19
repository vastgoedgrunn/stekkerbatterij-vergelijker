# Stekkerbatterij Vergelijker — the digital company

This repo is maintained and improved by an autonomous team of AI agents ("departments"), so the
owner can stay in Slack-approve mode. This file is the map; the enforceable rules live in
`.cursor/rules/` (the global guardrails in `.cursor/rules/00-agent-operating-system.mdc` always apply).

## Hoe automations taken krijgen

Cursor Cloud Agents checken **`main`** uit en lezen hun checklist uit **`.cursor/rules/<dept>-agent.mdc`**
(sectie **Scheduled run**). Gedeelde P0-outbound scan:
`docs/agents/checklists/p0-outbound-scan.md`. De Automations editor bepaalt alleen **wanneer** een
agent start (cron); de **inhoud** wijzig je via PR op de rule files. Korte startprompts staan in
`docs/agents/automations.md`.

## Departments (rules)

| Department | Rule | Cadence |
|---|---|---|
| Content & SEO | `.cursor/rules/content-seo-agent.mdc` | weekly + on-demand |
| Conversion / CRO | `.cursor/rules/conversion-cro-agent.mdc` | biweekly + after report |
| Data & prices (verification gate) | `.cursor/rules/data-prices-agent.mdc` | daily |
| Tech & maintenance | `.cursor/rules/tech-maintenance-agent.mdc` | weekly + on alerts |
| Design & UX | `.cursor/rules/design-ux-agent.mdc` | biweekly + on-demand |
| QA & monitoring | `.cursor/rules/qa-monitoring-agent.mdc` | daily + event-driven |
| Analytics & reporting | `.cursor/rules/analytics-reporting-agent.mdc` | Monday |
| Orchestrator (lead) | `.cursor/rules/orchestrator-agent.mdc` | Monday (after report) |
| Commerce ops | `.cursor/rules/commerce-ops-agent.mdc` | daily + on paid orders |
| Support email | `.cursor/rules/support-email-agent.mdc` | on-demand (inbound pending) |
| Supplier sourcing | `.cursor/rules/supplier-sourcing-agent.mdc` | weekly |

## Schrijfstijl

Geen AI-achtige gedachtestreepjes in zichtbare teksten. Em-dashes (`—`) en en-dashes (`–`) zijn
verboden in UI-copy, metadata, content, koppen, alt-teksten, Slack-berichten en commit/PR-teksten;
herschrijf met natuurlijk Nederlands (komma, punt, of woorden als "tot"). Zie de altijd geldende
rule `.cursor/rules/copy-style-no-dashes.mdc`.

Reusable skills: `.cursor/skills/ship-via-pr` (how work ships) and
`.cursor/skills/price-fact-verification` (the human carve-out gate).
Automation schedules to create in Cursor: `docs/agents/automations.md`.
Slack ops + 1-click approvals: `docs/agents/slack-ops.md`, `docs/agents/approval-playbook.md`.

## Full-auto guardrails

- All work via **branch + PR**, labelled `agent`. No direct pushes to `main`.
- Auto-merge (`.github/workflows/auto-merge.yml`) enables **only** when ALL required checks pass:
  CI (typecheck, lint, format, build), Lighthouse CI budgets, broken-link check.
- Vercel preview verified before promote; production auto-rolls back on health degradation
  (`.github/workflows/post-deploy-health.yml`).
- Only human step: the **price/fact verification gate** (1-click Slack approve with source).

## KPIs (Plausible custom events — `src/lib/observability/analytics.ts`)

- **Primary:** `offer_clicked` (outbound "Bekijk aanbieders").
- **Secondary:** `decision_wizard_completed`, `comparison_started`, `comparison_product_added`,
  `product_detail_viewed`, `review_submitted`.
- **Commerce (when checkout live):** `cart_add`, `checkout_started`, `order_paid` (value in cents).

## One-time manual setup (owner)

1. **GitHub → Settings → General:** enable **Allow auto-merge**.
2. **GitHub → Settings → Branches → `main` protection:** require pull request + require these
   status checks to pass: `Typecheck, Lint, Format & Build`, `Lighthouse CI (perf/a11y/SEO budgets)`,
   `Broken-link check`. (This is what makes auto-merge safe.)
3. **Plausible:** create a site for the production domain and set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
   in Vercel (Production env). Analytics + events then activate automatically.
4. **(Optional) Auto-rollback:** add repo secrets `VERCEL_TOKEN` (and `VERCEL_SCOPE` = team slug)
   so `post-deploy-health.yml` can auto-roll back. Without them it still alerts + opens an issue.
   Manual rollback is one command: `vercel rollback`.
5. **Cursor Cloud Agents:** connect this GitHub repo and create the automations in
   `docs/agents/automations.md`.
6. **Later:** affiliate/merchant API keys and price-source API tokens for the Data agent.

## One-command rollback

```bash
vercel rollback            # roll back production to the previous deployment
```

## Cursor Cloud specific instructions

Single Next.js 16 app (App Router), npm, Node 22 (see `.nvmrc`). The startup update script runs
`npm ci`. Standard commands live in `package.json` scripts.

- **Run (dev):** `npm run dev` serves on `http://localhost:3000`. The app boots with **no env
  config**: every integration (Supabase, Mollie, Sendcloud, Resend, Plausible, Sentry, Daisycon,
  Bol) is optional and degrades gracefully (`isSupabaseConfigured()` + `.optional()` Zod schemas
  in `src/lib/env/{client,server}.ts`).
- **Gotcha, do NOT copy `.env.example` to `.env.local` verbatim.** Its values are empty strings
  (`""`), which the Zod env schemas reject (empty string fails `.url()` / `.min(1)`); only an
  *unset* var counts as "not configured". Either leave `.env.local` absent, or fill vars with
  real values. Copying the template with blanks makes `npm run dev` and `npm run build` throw
  "Ongeldige omgevingsvariabelen".
- **Lint/typecheck/format:** `npm run check` (runs `typecheck` + `lint` + `format:check`). This
  is the CI gate. There is no unit-test suite (`package.json` has no `test` script).
- **Build:** `npm run build`. Without real secrets it needs `SKIP_ENV_VALIDATION=true` (this is
  what CI sets), otherwise the empty/missing `NEXT_PUBLIC_*` values fail validation during page
  data collection.
- **DB-backed pages need seeded data.** Catalog (`/batterijen`), comparison (`/vergelijken`) and
  the decision wizard (`/beslishulp`) render empty-state messages until a Supabase project is
  provisioned and `db/migrations/*` + `db/seed/*` are applied (there is no npm migration runner;
  apply via the Supabase MCP/CLI or `psql "$DATABASE_URL"`). DB-free features such as the payback
  calculator (`/tools/terugverdientijd`) and static/content pages work out of the box.
