# Automations: aanmaakvolgorde (15 min)

Maak deze **in Cursor → Automations → New → Cloud agent**. Copy-paste prompt uit
[automations.md](./automations.md). Slack: `#all-stekkerbatterij-vergelijker`.

## Fase A: vandaag (5 stuks, ~12 min)

| # | Naam | Cron (UTC) | Waarom eerst |
|---|------|------------|--------------|
| 1 | **Data catalog morning** | `0 6 * * *` | Completeness + prijzen = claim + geld |
| 2 | **Data affiliate evening** | `0 18 * * *` | Deeplink-health alsof affiliate live |
| 3 | **QA daily** | `0 7 * * *` | Site blijft online |
| 4 | **Analytics Monday** | `0 7 * * 1` | KPI-rapport voedt het team |
| 5 | **Orchestrator** | `0 8 * * 1` | Weekplan / overleg maandag |

Tools per automation: ✅ Post Slack · ✅ Read Slack · ✅ Comment PR · MCP: github, supabase, vercel

## Fase B: SEO-snelheid + weekteam

| # | Naam | Cron (UTC) | Notitie |
|---|------|------------|---------|
| 6 | **Content SEO ship** | `0 8 * * 2,4,6` | Vervangt Content Tuesday (die verwijderen) |
| 6b | **SEO linkbuilding scout** | `0 11 * * 4` | Alleen shortlist + drafts, geen mail |
| 7 | Tech Wednesday | `0 8 * * 3` | |
| 8 | Supplier Thursday | `0 10 * * 4` | |

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
