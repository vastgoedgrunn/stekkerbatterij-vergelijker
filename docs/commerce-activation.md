# Commerce & ops: activatiechecklist (eigenaar)

De webshop-backend staat klaar maar is **standaard uit** (`featureFlags.checkout` / `shipping`).
Geen geld- of klantactie gaat automatisch zonder jouw goedkeuring in admin (of Slack).

## 1. Omgeving (Vercel Production)

| Variabele | Doel |
|---|---|
| `MOLLIE_API_KEY` | Betalingen |
| `RESEND_API_KEY` + `EMAIL_FROM` | Transactie- & goedgekeurde mails |
| `SUPABASE_SERVICE_ROLE_KEY` | Orders/webhook/admin (server-only) |

## 2. Database

Migraties `0006` t/m `0009` toegepast op Supabase (commerce, admin, fulfilment, support).

## 3. Leverancier

1. Admin → **Leveranciers**: naam + **contact e-mail** (dropship-order).
2. Admin → **Producten**: koppel `supplier_id`, SKU, inkoopprijs.
3. Self-merchant offer + checkout-flag aan per product.

## 4. Feature flags (`src/config/feature-flags.ts`)

- `checkout: true`: winkelmand/afrekenen zichtbaar
- `shipping: true`: na betaling: shipment + leverancier-mail in goedkeuringswachtrij

## 5. Goedkeuringsflow

| Actie | Auto? |
|---|---|
| Orderbevestiging na betaling | Ja (transactie) |
| Mail naar leverancier | **Nee**, admin “Goedkeuren & versturen” |
| Track & trace naar klant | Admin “Markeer verzonden” (= jouw OK) |
| Support-antwoord | **Nee**, concept → goedkeuren |
| Mollie-refund | **Nee**, aanvragen → goedkeuren |

## 6. Support inbound (later)

Koppel Gmail/Workspace of helpdesk; zet daarna de inbound-seam in
`src/features/support/support.server.ts` (`isSupportInboundConfigured`).

## 7. Juridisch

Vul `src/config/legal.ts` in; laat concept-juridische pagina’s reviewen vóór eerste verkoop.
