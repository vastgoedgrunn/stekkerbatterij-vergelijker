# Automations: aanmaakvolgorde (15 min)

Maak deze **in Cursor → Automations → New → Cloud agent**. Copy-paste prompt uit
[automations.md](./automations.md). Slack: `#all-stekkerbatterij-vergelijker`.

## Fase A: vandaag (4 stuks, ~10 min)

| # | Naam | Cron (UTC) | Waarom eerst |
|---|------|------------|--------------|
| 1 | **Data daily** | `0 6 * * *` | Affiliate + prijzen = geld |
| 2 | **QA daily** | `0 7 * * *` | Site blijft online |
| 3 | **Revenue refresh** | `0 6 * * *` | Klikken/leads zichtbaar |
| 4 | **Orchestrator** | `0 8 * * 1` | Weekplan maandag |

Tools per automation: ✅ Post Slack · ✅ Read Slack · ✅ Comment PR · MCP: github, supabase, vercel

## Fase B: deze week (4 stuks)

| # | Naam | Cron |
|---|------|------|
| 5 | Analytics Monday | `0 7 * * 1` |
| 6 | Content Tuesday | `0 8 * * 2` |
| 7 | Tech Wednesday | `0 8 * * 3` |
| 8 | Supplier Thursday | `0 10 * * 4` |

## Fase C: wanneer checkout aan gaat

| # | Naam |
|---|------|
| 9 | Commerce ops daily |
| 10 | Support on-demand |

## Fase D: optimalisatie

| # | Naam |
|---|------|
| 11 | CRO biweekly |
| 12 | Design biweekly |

---

## Test na aanmaak

1. Slack: `QA: run health check on production`
2. Wacht op agent-reply in `#all-stekkerbatterij-vergelijker`
3. Check GitHub voor branch `agent/…` of PR met label `agent`

Als Cloud agent niet start: Cursor → Dashboard → Cloud Agents → credits/enable.
