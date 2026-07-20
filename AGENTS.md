# Stekkerbatterij Vergelijker — the digital company

This repo is maintained by autonomous AI agents. The owner stays **fully hands-off**:
agents verify, fix, ship via PR + auto-merge, and never ask for ✅ in Slack or Cursor.
This file is the map; enforceable rules live in `.cursor/rules/` (especially
`.cursor/rules/00-agent-operating-system.mdc`).

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
| Data & prices (full auto) | `.cursor/rules/data-prices-agent.mdc` | daily |
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

Reusable skills: `.cursor/skills/ship-via-pr` and
`.cursor/skills/price-fact-verification` (source-backed auto; never ask owner).
Automation schedules: `docs/agents/automations.md`.
Slack digests only: `docs/agents/slack-ops.md`.

## Full-auto guardrails

- All work via **branch + PR**, labelled `agent`. No direct pushes to `main`.
- Auto-merge only when ALL required checks pass: CI, Lighthouse, broken-link.
- Vercel preview verified; production auto-rolls back on health degradation.
- Prices/facts with source: auto-publish. Without source: skip. Never invent.
- Never mark outbound `ok` on search-URLs or SKU mismatches.
- **Never ask the owner for ✅** in Cursor or Slack.

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
