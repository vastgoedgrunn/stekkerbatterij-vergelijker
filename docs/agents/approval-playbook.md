# Goedkeurings-playbook (jouw 1-klik)

Alles wat geld, klanten of juridische aansprakelijkheid raakt, stopt bij jou. Agents bereiden
100% voor (inclusief open PR). **Preferred:** ✅ / "akkoord" in Cursor chat → agent voert
EXECUTE meteen uit. Slack 🔒 is alleen voor unattended Cloud Agent-runs; daar triggert ✅
de automation **Slack ✅ execute approval**.

Agents mogen geen 🔒 posten zonder **PR-URL** + `EXECUTE:` (behalve lead/refund met admin-URL),
en posten geen 🔒 als jij al in Cursor hebt goedgekeurd. Zie `docs/agents/slack-ops.md`.

## Snelle reference

| Type | Waar zie je het | Jouw actie | Wat ✅ doet |
|------|-----------------|------------|-------------|
| **Affiliate deeplink / data-gate** | Cursor chat of 🔒 Slack + PR + bron | ✅ of ❌ | Ready + auto-merge PR + EXECUTE |
| **Commissie % wijziging** | Cursor chat of 🔒 Slack + PR + bron | ✅ of ❌ | Merge + DB zoals EXECUTE |
| **Lead follow-up** | `/admin/leads` (+ Slack als unattended) | ✅ in admin/chat/Slack | Markeert status; geen auto-mail |
| **Supplier order** | `/admin/orders/[id]` | ✅ "Goedkeuren & versturen" | Mail naar leverancier |
| **Support antwoord** | `/admin/support` | ✅ concept | Verstuurt mail |
| **Mollie refund** | Cursor chat of 🔒 Slack + admin | ✅ expliciet | Roept Mollie aan |
| **Checkout aanzetten** | Cursor chat of 🔒 Slack + PR | ✅ | Auto-merge PR met `checkout: true` |
| **Juridische pagina's** | Cursor chat of 🔒 Slack + PR + preview | ✅ na lezen | Auto-merge |

---

## Affiliate publisher-ID (meest voorkomend)

**Jij (1× per netwerk):**

1. Account aanmaken (Bol, Awin, Daisycon, zie `docs/affiliate-signup.md`)
2. In Slack posten:

```
Data: publisher-ID bol = JOUW_SITE_ID
Data: deeplink voorbeeld = [plak 1 URL uit partner dashboard]
```

**Agent doet automatisch:**

- Vervangt `PUBLISHER_ID` in Supabase/admin
- Test `/api/go/[offerId]` → 302 OK
- Post bevestiging + link `/admin/clicks`

---

## Commissie & feiten (verification gate)

Agent doet altijd **eerst** een PR, daarna goedkeuring vragen (Cursor chat als jij er bent,
anders 🔒 Slack) met:

- **PR-URL** (verplicht)
- **Wat** wijzigt (offer, veld, oude → nieuwe waarde)
- **Bron-URL** + datum
- **EXECUTE:** Ready + auto-merge + eventuele DB-stap
- **Geschatte impact** (analytics only, geen "verdiend €X")

| Afwijking | Auto? |
|-----------|-------|
| Prijs <5% vs gisteren, zelfde merchant | Ja |
| Commissie % ongewijzigd, deeplink fix | Ja |
| Nieuwe commissie % of saldering/subsidie claim | **Nee, ✅** |
| Nieuwe merchant/offer | **Nee, ✅** |

---

## Leads (vaste batterij)

1. Lead komt binnen via beslishulp → `/admin/leads` status `new`
2. Slack: "Nieuwe lead, [naam], admin link"
3. Jij: bekijk kwalificatie → **Goedkeuren** in admin
4. Jij: bel/mail klant zelf (of partner e-WNDR affiliate link)
5. **Markeer verzonden** → **Geconverteerd** wanneer deal rond is

Agents sturen **nooit** automatisch e-mail naar leads.

---

## Commerce (dropship, later)

Wanneer Mollie + leverancier live:

| Stap | Auto? |
|------|-------|
| Orderbevestiging na betaling | Ja (transactiemail) |
| Mail naar leverancier | **Nee, admin ✅** |
| Track & trace naar klant | Admin "Markeer verzonden" |
| Refund | **Nee, ✅ in Slack** |

---

## Slack-reactie conventie

| Reactie | Betekenis |
|---------|-----------|
| ✅ | Goedgekeurd, agent mag uitvoeren |
| ❌ | Afwijzen, agent stopt of past aan |
| 💬 | Vraag, agent antwoordt in thread, wacht op ✅ |

Bij twijfel: **❌** is altijd veilig. Agents mogen nooit boos worden.

---

## Escalatie

Als een agent 24u geen reactie krijgt op een 🔒-bericht:

- Herinnering in Slack (automation kan daily digest herhalen)
- Geen auto-execute, item blijft pending

Als productie down is:

- QA-agent post 🚨 + fix PR of `vercel rollback`
- Jij hoeft alleen te ✅ als rollback bevestiging gevraagd wordt
