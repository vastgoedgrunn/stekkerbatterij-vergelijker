# Agent-team — weekschema (CEST / Amsterdam)

Alle tijden zijn **lokaal (CEST, UTC+2)**. Cron in Cursor staat in UTC — automations.md
gebruikt UTC; hier de menselijke klok.

## Dagelijks

| Tijd | Agent | Wat |
|------|-------|-----|
| **08:00** | Data & prices | Prijzen, deeplinks, commissie-check |
| **08:00** | Revenue refresh | `/admin/revenue` + broken deeplinks |
| **08:00** | Commerce ops | Pending orders/refunds (indien checkout aan) |
| **09:00** | QA & monitoring | Health, Sentry, broken links, deploy |

## Wekelijks

| Dag | Tijd | Agent | Wat |
|-----|------|-------|-----|
| **Ma** | 09:00 | Analytics | KPI-rapport + backlog |
| **Ma** | 10:00 | Orchestrator | Weekplan → Slack |
| **Di** | 10:00 | Content & SEO | Gidsen, meta, internal links |
| **Wo** | 10:00 | Tech | Deps, security, CI |
| **Do** | 12:00 | Supplier sourcing | Leveranciers research + outreach concept |
| **1e & 15e** | 11:00 | CRO | Conversie-experiment |
| **8e & 22e** | 11:00 | Design & UX | A11y, mobile, tokens |

## On-demand (altijd via Slack)

Support email · handmatige data refresh · incident triage · "prioriteer X"

---

## Eerste 2 weken na go-live (prioriteit)

| Week | Focus | Owner input nodig |
|------|-------|-----------------|
| **1** | Affiliate deeplinks live, Plausible events, QA groen | Bol + Anker publisher-ID's |
| **2** | Daisycon energie, CRO op PDP, eerste content refresh | Daisycon campaign-ID's |
| **3+** | Dropship voorbereiden, lead flow optimaliseren | Leverancier + Mollie (optioneel) |

Orchestrator herziet dit elke maandag na analytics-rapport.
