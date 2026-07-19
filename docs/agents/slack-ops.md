# Slack: digest en backup-goedkeuring

Agents doen het werk. Als je in Cursor chat zit, keur je daar goed (✅ / "akkoord"); agents
voeren dan meteen uit. Slack is voor digests en voor unattended Cloud Agent-runs waar jij
niet in de chat zit.

## Kanalen (aanbevolen)

| Kanaal | Doel | Wie post |
|--------|------|----------|
| `#all-stekkerbatterij-vergelijker` | Dagelijkse digest + wekelijks plan (nu) | Alle agents |
| `#ops-stekkerbatterij` *(optioneel)* | Alleen goedkeuringen + alerts | Orchestrator + jij |
| `#agent-prs` *(optioneel)* | PR-links + CI-status | Elke agent na ship |

**Start simpel:** gebruik `#all-stekkerbatterij-vergelijker` (`C0BHETBV3EY`) voor alles tot het druk
wordt.

Maak `#ops-stekkerbatterij` aan als je goedkeuringen wilt scheiden van nieuws.

---

## Jouw interactie (1-klik)

| Jij doet | Agent doet daarna |
|----------|-------------------|
| **✅ / akkoord in Cursor chat** (preferred) | Agent voert EXECUTE meteen uit; geen Slack ✅ nodig |
| Reageer **✅** op een 🔒-bericht in Slack | Automation **Slack ✅ execute approval**: Ready + auto-merge, EXECUTE, bevestigt in thread |
| Reageer **❌** + korte reden | Sluit af of vraagt om verduidelijking |
| `@Cursor Data: refresh Bol prijzen` | Data-agent start on-demand run |
| `@Cursor CRO: sterkere CTA productpagina` | CRO-agent start run |
| Niets | Agents draaien op schema; alleen unattended gate-items wachten op jou |

**Verplicht voor agents bij Slack-gates:** elk 🔒-bericht heeft een **PR-URL** (of admin-URL
bij lead/refund) plus `EXECUTE:`-regels. Eerst PR openen, dan pas 🔒. Post geen 🔒 als de
owner al in Cursor heeft goedgekeurd.

---

## Berichtsjablonen (agents MOETEN dit formaat gebruiken)

### Dagelijkse digest (Data / QA / Commerce)

```
📊 Stekkerbatterij: dagelijkse update (Data)

✅ Auto (geen actie nodig)
• 3 prijzen bijgewerkt (binnen marge)
• 11 affiliate deeplinks OK
• 0 broken links

⏳ Wacht op jou (reageer ✅)
• Bol publisher-ID invullen → deeplinks nog placeholder `PUBLISHER_ID`
  Bron: docs/affiliate-signup.md stap 8

🔗 PR: https://github.com/.../pull/XX (CI: groen)
```

### Goedkeuring prijs/claim (verification gate)

Altijd: `🔒` + PR-URL + `EXECUTE:`. Geen uitzonderingen voor data/content/code.

```
🔒 Goedkeuring: commissie % Anker SOLIX

Voorstel: 8% CPS op offer `anker-solix × coolblue`
Bron: https://www.ankersolix.com/eu/become-an-affiliate (2026-07-15)
Huidige waarde in DB: 8% (ongewijzigd) / NIEUW: 10%

PR: https://github.com/vastgoedgrunn/stekkerbatterij-vergelijker/pull/XX

EXECUTE:
- Ready + auto-merge PR #XX
- Update commissie in Supabase offers zoals in PR-body

Reageer ✅ om uit te voeren · ❌ om af te wijzen
```

### Lead / fulfilment / refund (NOOIT auto-mail)

Geen code-PR verplicht; wel admin-URL + EXECUTE. Agent stuurt nooit zelf mail naar klant.

```
🔒 Goedkeuring: lead doorsturen

Lead: Jan Jansen · jan@example.nl · 1234AB
Bron: beslishulp · geschatte commissie €100
Admin: https://stekkerbatterijvergelijker.com/admin/leads

EXECUTE:
- Markeer lead goedgekeurd in admin (geen auto-mail)

Reageer ✅ = EXECUTE · ❌ = afwijzen
```

### Wekelijks plan (Orchestrator, maandag)

```
📋 Weekplan: Stekkerbatterij Vergelijker

1. [Data] Bol deeplinks live zodra publisher-ID binnen is → +affiliate clicks
2. [CRO] Sterkere "Bekijk aanbieders" op PDP hero → offer_clicked
3. [Content] Gids saldering internal links → SEO/time-on-guide

Open PRs: #12 (data), geen blockers
KPI vorige week: offer_clicked X (Plausible)
```

---

## On-demand commando's (copy-paste in Slack)

| Commando | Agent |
|----------|-------|
| `Data: affiliate deeplinks checken + prijzen Bol/Coolblue` | Data |
| `Data: publisher-ID PUBLISHER_ID bol invullen` | Data |
| `QA: production health + broken links` | QA |
| `CRO: test sterkere CTA beslishulp resultaat` | CRO |
| `Content: meta tags batterijen pagina` | Content |
| `Commerce: pending approval_actions overzicht` | Commerce ops |
| `Orchestrator: prioriteiten deze week` | Orchestrator |

---

## MCP's per automation (in Cursor Automations editor)

Schakel deze **Use MCP server** tools in:

| MCP | Gebruik |
|-----|---------|
| **GitHub** | PR's, checks, merge status |
| **Supabase** | Migraties, seed, data fixes |
| **Vercel** | Deployments, env vars, logs |
| **Slack** | Post + read (goedkeuringen) |

Optioneel later: **Sentry** (QA), **Plausible** (Analytics, tot API gekoppeld).

---

## Wat agents WEL autonoom mogen

- Code/content/data fixes via PR (label `agent`)
- Affiliate deeplinks **implementeren** na jouw publisher-ID
- Prijzen binnen marge (+/- verification rules)
- QA fixes, broken links, CI groen maken
- Concept support-antwoorden (niet versturen)

## Wat NOOIT zonder jouw ✅

- Affiliate **account** aanmaken
- Commissie % **>5% afwijking** of nieuwe feitelijke claims
- Lead doorsturen / mail naar klant
- Supplier-order mail / Mollie refund
- `checkout: true` of live Mollie key activeren
- Juridische teksten definitief publiceren

---

## Setup-checklist (eenmalig, ~20 min)

1. [ ] Cursor → **Automations** → alle 12 uit `automations.md` aanmaken (Cloud agent aan)
2. [ ] Per automation: **Post to Slack** + **Read Slack** → `#all-stekkerbatterij-vergelijker`
3. [ ] GitHub MCP + Supabase MCP + Vercel MCP authenticated in Cursor Settings
4. [ ] GitHub: auto-merge aan + branch protection checks (zie `AGENTS.md`)
5. [ ] Test: post `QA: health check` in Slack → agent antwoordt binnen ~5 min

Zie ook: [automations.md](./automations.md) · [approval-playbook.md](./approval-playbook.md)
