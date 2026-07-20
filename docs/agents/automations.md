# Cursor Automations: schedules for the digital company

## Hoe dit werkt (belangrijk)

Cloud agents starten op **`main`** en lezen hun **volledige takenlijst uit deze repo**:

| Wat | Waar (bron van waarheid) |
|-----|--------------------------|
| Afdeling + checklist | `.cursor/rules/<dept>-agent.mdc` → sectie **Scheduled run** |
| P0 zoek-URL scan (Data + QA) | `docs/agents/checklists/p0-outbound-scan.md` |
| Ship workflow | `.cursor/skills/ship-via-pr/SKILL.md` |
| Prijs/feit-gate | `.cursor/skills/price-fact-verification/SKILL.md` |
| Slack formaat | `docs/agents/slack-ops.md` |

**Jij hoeft Automation-prompts niet handmatig bij te werken** zodra ze het korte sjabloon
hieronder gebruiken. Wijzig taken in `.cursor/rules/` (via PR); de volgende run pakt de nieuwe
checklist automatisch op.

Dit bestand beschrijft **wanneer** elke agent draait (cron) en het **minimale startprompt**
(voor de Automations editor). De inhoud staat in de rule files.

**Slack:** `#all-stekkerbatterij-vergelijker` (`C0BHETBV3EY`). Zie
[slack-ops.md](./slack-ops.md), [approval-playbook.md](./approval-playbook.md),
[weekly-schedule.md](./weekly-schedule.md). Cron = UTC in de editor.

### Standaard instellingen (elke automation)

- **Repo:** `vastgoedgrunn/stekkerbatterij-vergelijker` · branch **`main`**
- **Compute:** Cloud agent
- **Tools:** Post to Slack + Read Slack; Comment on PRs; MCP: GitHub, Supabase, Vercel
- **Slack kanaal:** `#all-stekkerbatterij-vergelijker`

### Standaard prompt (kopieer + pas RUN MODE + RULE FILE aan)

```
You are the <Department> agent for Stekkerbatterij Vergelijker.
RUN MODE: <run-mode-id> (see rule file Scheduled run section).

1. Checkout main and read .cursor/rules/<dept>-agent.mdc — execute the Scheduled run checklist
   for this RUN MODE in full. Do not skip steps.
2. Data/QA: run docs/agents/checklists/p0-outbound-scan.md first when the rule says so.
3. Follow .cursor/skills/ship-via-pr/SKILL.md; use price-fact-verification when prices/facts change.
4. Post Slack digest to #all-stekkerbatterij-vergelijker per docs/agents/slack-ops.md (no ✅ asks).
5. Never post 🔒 or wait for owner approval. Auto-merge labelled PRs when checks are green.
```

---

## 1. Catalog Discovery daily (ochtend)

- **Cron:** `0 5 * * *` (07:00 CEST)
- **Rule file:** `.cursor/rules/data-prices-agent.mdc`
- **RUN MODE:** `morning-catalog` → sectie **Morning run**

```
You are the Data & prices agent. RUN MODE: morning-catalog.
Read and execute .cursor/rules/data-prices-agent.mdc (Morning run) in full.
Follow ship-via-pr and price-fact-verification. Slack per slack-ops.md.
```

## 1b. Data morning follow-up

- **Cron:** `0 6 * * *` (08:00 CEST)
- **Rule file:** `.cursor/rules/data-prices-agent.mdc`
- **RUN MODE:** `morning-followup` → sectie **Morning follow-up**

```
You are the Data & prices agent. RUN MODE: morning-followup.
Read and execute .cursor/rules/data-prices-agent.mdc (Morning follow-up) in full.
Follow ship-via-pr and price-fact-verification. Slack per slack-ops.md.
```

## 2. QA & monitoring daily

- **Cron:** `0 7 * * *`
- **Rule file:** `.cursor/rules/qa-monitoring-agent.mdc`
- **RUN MODE:** `daily-qa` → sectie **Daily run**
- **Ook event-driven:** `post-deploy-health.yml`, Sentry alerts

```
You are the QA & monitoring agent. RUN MODE: daily-qa.
Read and execute .cursor/rules/qa-monitoring-agent.mdc (Daily run) in full.
Follow ship-via-pr. Slack per slack-ops.md.
```

## 3. Content & SEO weekly

- **Cron:** `0 8 * * 2` (Tuesday)
- **Rule file:** `.cursor/rules/content-seo-agent.mdc`

```
You are the Content & SEO agent. RUN MODE: weekly-content.
Read and execute .cursor/rules/content-seo-agent.mdc (Scheduled run) in full.
Follow ship-via-pr and price-fact-verification. Slack per slack-ops.md.
```

## 4. Tech & maintenance weekly

- **Cron:** `0 8 * * 3` (Wednesday)
- **Rule file:** `.cursor/rules/tech-maintenance-agent.mdc`

```
You are the Tech & maintenance agent. RUN MODE: weekly-tech.
Read and execute .cursor/rules/tech-maintenance-agent.mdc (Scheduled run) in full.
Follow ship-via-pr. Slack per slack-ops.md.
```

## 5. Conversion / CRO biweekly

- **Cron:** `0 9 1,15 * *`
- **Rule file:** `.cursor/rules/conversion-cro-agent.mdc`

```
You are the Conversion/CRO agent. RUN MODE: biweekly-cro.
Read and execute .cursor/rules/conversion-cro-agent.mdc (Scheduled run) in full.
Follow ship-via-pr. Slack per slack-ops.md.
```

## 6. Design & UX biweekly

- **Cron:** `0 9 8,22 * *`
- **Rule file:** `.cursor/rules/design-ux-agent.mdc`

```
You are the Design & UX agent. RUN MODE: biweekly-design.
Read and execute .cursor/rules/design-ux-agent.mdc (Scheduled run) in full.
Follow ship-via-pr. Slack per slack-ops.md.
```

## 7. Analytics & reporting (Monday)

- **Cron:** `0 7 * * 1`
- **Rule file:** `.cursor/rules/analytics-reporting-agent.mdc`

```
You are the Analytics & reporting agent. RUN MODE: monday-report.
Read and execute .cursor/rules/analytics-reporting-agent.mdc (Scheduled run + Weekly report).
Slack per slack-ops.md; hand off to orchestrator.
```

## 8. Orchestrator (Monday, na report)

- **Cron:** `0 8 * * 1`
- **Rule file:** `.cursor/rules/orchestrator-agent.mdc`

```
You are the Orchestrator/lead agent. RUN MODE: monday-plan.
Read and execute .cursor/rules/orchestrator-agent.mdc (Scheduled run + Do) in full.
Slack per slack-ops.md.
```

## 9. Commerce ops daily

- **Cron:** `0 6 * * *`
- **Rule file:** `.cursor/rules/commerce-ops-agent.mdc`

```
You are the Commerce ops agent. RUN MODE: daily-commerce.
Read and execute .cursor/rules/commerce-ops-agent.mdc (Scheduled run) in full.
Follow ship-via-pr. Slack per slack-ops.md.
```

## 10. Support email (on-demand)

- **Trigger:** on-demand tot inbound mailbox live is
- **Rule file:** `.cursor/rules/support-email-agent.mdc`

```
You are the Support email agent. RUN MODE: on-demand-support.
Read and execute .cursor/rules/support-email-agent.mdc (Scheduled run) in full.
Follow ship-via-pr. Slack per slack-ops.md.
```

## 11. Supplier sourcing weekly

- **Cron:** `0 10 * * 4` (Thursday)
- **Rule file:** `.cursor/rules/supplier-sourcing-agent.mdc`

```
You are the Supplier sourcing agent. RUN MODE: weekly-sourcing.
Read and execute .cursor/rules/supplier-sourcing-agent.mdc (Scheduled run) in full.
Slack per slack-ops.md.
```

## 12. Data evening (affiliate health)

- **Cron:** `0 18 * * *` (20:00 CEST)
- **Rule file:** `.cursor/rules/data-prices-agent.mdc`
- **RUN MODE:** `evening-affiliate` → sectie **Evening run**

```
You are the Data & prices agent. RUN MODE: evening-affiliate.
Read and execute .cursor/rules/data-prices-agent.mdc (Evening run) in full.
Follow ship-via-pr and price-fact-verification. Slack per slack-ops.md.
```

## 12b. Revenue snapshot

Optionele alias voor §12. Niet twee identieke evening jobs draaien.

## 13. Slack digest only (geen approval-automation meer)

Owner is hands-off. **Geen** ✅-execute automation nodig voor content/data.
Optioneel mag een oude ✅-automation blijven bestaan; agents posten geen 🔒 meer.

---

## On-demand from Slack

`@Cursor <Dept>: <taak>` → agent leest `.cursor/rules/<dept>-agent.mdc` (Mandate + Do) en
ship-via-pr. Voorbeeld: `@Cursor Data: refresh Bol prijzen`.

## Eenmalige setup (owner)

1. Maak automations §1–12 in Cursor (Cloud agent, repo `main`, Slack MCP).
2. Plak het **korte prompt** per sectie hierboven (niet de oude lange checklists).
3. Daarna: taken wijzigen = PR op `.cursor/rules/`; prompts blijven staan.

Zie ook [setup-priority.md](./setup-priority.md) · [AGENTS.md](../../AGENTS.md)
