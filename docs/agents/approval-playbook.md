# Goedkeurings-playbook (jouw 1-klik)

Alles wat geld, klanten of juridische aansprakelijkheid raakt, stopt bij jou. Agents bereiden
100% voor; jij reageert met ✅ of ❌ in Slack.

## Snelle reference

| Type | Waar zie je het | Jouw actie | Agent daarna |
|------|-----------------|------------|--------------|
| **Affiliate deeplink live** | Slack + admin `/admin/products` | ✅ + publisher-ID doorgeven | Vult in, test redirect, PR |
| **Commissie % wijziging** | Slack met bron-URL | ✅ of ❌ | Update DB of laat staan |
| **Lead follow-up** | `/admin/leads` + Slack | ✅ in admin | Markeert status; geen auto-mail |
| **Supplier order** | `/admin/orders/[id]` | ✅ "Goedkeuren & versturen" | Mail naar leverancier |
| **Support antwoord** | `/admin/support` | ✅ concept | Verstuurt mail |
| **Mollie refund** | Slack + admin | ✅ expliciet | Roept Mollie aan |
| **Checkout aanzetten** | Slack PR-voorstel | ✅ in Slack | Merge PR met `checkout: true` |
| **Juridische pagina's** | PR + preview link | ✅ na lezen | Merge |

---

## Affiliate publisher-ID (meest voorkomend)

**Jij (1× per netwerk):**

1. Account aanmaken (Bol, Awin, Daisycon — zie `docs/affiliate-signup.md`)
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

Agent post altijd:

- **Wat** wijzigt (offer, veld, oude → nieuwe waarde)
- **Bron-URL** + datum
- **Geschatte impact** (analytics only, geen "verdiend €X")

| Afwijking | Auto? |
|-----------|-------|
| Prijs <5% vs gisteren, zelfde merchant | Ja |
| Commissie % ongewijzigd, deeplink fix | Ja |
| Nieuwe commissie % of saldering/subsidie claim | **Nee — ✅** |
| Nieuwe merchant/offer | **Nee — ✅** |

---

## Leads (vaste batterij)

1. Lead komt binnen via beslishulp → `/admin/leads` status `new`
2. Slack: "Nieuwe lead — [naam] — admin link"
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
| Mail naar leverancier | **Nee — admin ✅** |
| Track & trace naar klant | Admin "Markeer verzonden" |
| Refund | **Nee — ✅ in Slack** |

---

## Slack-reactie conventie

| Reactie | Betekenis |
|---------|-----------|
| ✅ | Goedgekeurd — agent mag uitvoeren |
| ❌ | Afwijzen — agent stopt of past aan |
| 💬 | Vraag — agent antwoordt in thread, wacht op ✅ |

Bij twijfel: **❌** is altijd veilig. Agents mogen nooit boos worden.

---

## Escalatie

Als een agent 24u geen reactie krijgt op een 🔒-bericht:

- Herinnering in Slack (automation kan daily digest herhalen)
- Geen auto-execute — item blijft pending

Als productie down is:

- QA-agent post 🚨 + fix PR of `vercel rollback`
- Jij hoeft alleen te ✅ als rollback bevestiging gevraagd wordt
