# P0: zoek- en listing-URL scan (Data + QA)

Elke Data-run (ochtend + avond) en elke QA-dagrun **moet** dit uitvoeren vóór andere taken.
Geen actieve offer mag een zoek- of categoriepagina als outbound hebben.

Code-gate: `src/features/offers-pricing/offer-eligibility.ts` → `isSearchOrListingUrl()`.
Bol deeplink: `buildBolPartnerDeeplink()` in `src/features/catalog-discovery/bol-client.ts`.

## Wat telt als zoek/listing (blokkeren)

| Patroon | Voorbeeld |
|---------|-----------|
| bol zoek | `bol.com/.../s/` of `?searchtext=` |
| Coolblue zoek | `coolblue.nl/zoeken?query=` |
| WordPress zoek | `?s=` op homepage (`solarsale.nl/?s=...`) |
| Gamma categorie | `gamma.nl/assortiment/...` (geen productdetail) |
| Geen URL | shop-offer zonder `https://` |

Alleen toegestaan: echte product-URL (`bol.com/.../p/{id}/`, `coolblue.nl/product/{id}`, etc.)
+ voor Bol altijd `affiliate_deeplink` via `partner.bol.com/click?...&s=BOL_PUBLISHER_ID`.

## SQL: vind offenders (moet 0 rijen retourneren)

```sql
select p.slug, m.slug as merchant, o.affiliate_link_status,
       left(coalesce(o.affiliate_deeplink, o.affiliate_url), 120) as url
from offers o
join products p on p.id = o.product_id
join merchants m on m.id = o.merchant_id
where o.deleted_at is null
  and (
    coalesce(o.affiliate_deeplink, o.affiliate_url) ~* 'bol\\.com/.*/s(\\?|$)'
    or coalesce(o.affiliate_deeplink, o.affiliate_url) ~* 'searchtext='
    or coalesce(o.affiliate_deeplink, o.affiliate_url) ~* 'coolblue\\.nl/zoeken'
    -- WordPress ?s= telt alleen op een kale homepage. Bol partnerlinks
    -- gebruiken legitiem &s={publisher_id} en mogen hier niet matchen.
    or coalesce(o.affiliate_deeplink, o.affiliate_url)
       ~* '^https://[^/?#]+/?\?([^#&]+&)*s='
    -- Elke kale merchant-homepage is ongeschikt als product-outbound.
    or coalesce(o.affiliate_deeplink, o.affiliate_url)
       ~* '^https://[^/?#]+/?([?#].*)?$'
    or coalesce(o.affiliate_deeplink, o.affiliate_url) ~* 'gamma\\.nl/assortiment'
    or coalesce(o.affiliate_deeplink, o.affiliate_url) is null
    or coalesce(o.affiliate_deeplink, o.affiliate_url) !~* '^https://'
  )
order by m.slug, p.slug;
```

## Actie per rij

1. **Zoek/listing:** `deleted_at = now()`, `affiliate_link_status = 'broken'`, note
   `P0: zoek/listing soft-deleted`, `affiliate_link_checked_at = now()`.
2. **Echte product-URL gevonden:** update `affiliate_url`, zet Bol `affiliate_deeplink` via
   `buildBolPartnerDeeplink`, `affiliate_link_status = 'ok'` alleen na titel/SKU-verify.
3. **Geen productpagina:** offer deleted/broken laten; vermeld in Slack digest (product + merchant).
4. **Nooit** `affiliate_link_status = ok` op zoek-URL of verkeerde SKU.

## Seeds en discovery

- Nieuwe offers in `db/seed/*.sql` en Catalog Discovery: **alleen** product-URL's.
- Placeholder zoals bol `/s/?searchtext=` is verboden; liever geen offer dan zoek-URL.

## Slack digest regel

Rapporteer altijd: `P0 search-URL count: N` (moet **0** zijn na je run).
