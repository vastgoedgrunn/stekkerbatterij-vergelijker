# Awin: EcoFlow NL (+ Coolblue scaffolding)

Status per 20 juli 2026: code + partner_programs klaar. Live deeplinks wachten op
publisher-goedkeuring en `AWIN_PUBLISHER_ID` in Vercel.

## Campagnes (aanbevolen)

| Campagne | Awin mid | Model | Status |
|---|---|---|---|
| **EcoFlow NL** | `123332` | CPS ~5%, cookie 7d | Aangevraagd / wacht op goedkeuring |
| Coolblue NL | `85161` | CPS | Alleen bij echte product-URL’s |
| Coolblue Energie NL | `85163` | CPA leads | Optioneel voor vaste batterij / energie |

## Env (Vercel)

Na goedkeuring EcoFlow:

```
AWIN_PUBLISHER_ID=<jouw awinaffid>
# optioneel override:
# AWIN_ECOFLOW_ADVERTISER_ID=123332
```

Production + Preview zetten. Daarna seed/admin: EcoFlow-offers van `pending` → `ok`
met product-URL (`nl.ecoflow.com/...`) en eventueel voorgemaakte cread-deeplink.

## Linkstructuur

```
https://www.awin1.com/cread.php?awinmid=123332&awinaffid=PUBLISHER&ued=https%3A%2F%2Fnl.ecoflow.com%2F...&clickref=CLICK_REF
```

Helper: `src/lib/affiliate/awin.ts` (`buildAwinDeeplink`, `ensureAwinDeeplink`).
`/api/go/[offerId]` wrapt EcoFlow-domeinen automatisch wanneer `AWIN_PUBLISHER_ID` gezet is.

## Niet opnieuw aanvragen

- Zendure: live via **Daisycon** (niet Awin).
- Anker op Bol: al via **Bol Partner**. Anker SOLIX DE Awin is alleen `.de`.
