---
name: price-fact-verification
description: Verification rules for researched prices, specs, and factual claims on Stekkerbatterij Vergelijker. Owner policy (2026-07): full auto when a citable source exists. No Slack/Cursor ✅ for routine price or fact updates.
---

# Price & fact verification (full auto)

Owner policy: **geen goedkeuringsritueel.** Agents publiceren zelf zodra er een
betrouwbare bron is. Slack/Cursor ✅ is niet nodig voor prijzen, catalogus of
claim-updates met bron.

## Decision flow

```
1. Gather the value + trusted source (merchant/manufacturer/official). Record URL + checked-at.
2. Classify:
   A) Existing offer price (any % change) with merchant/API source     → AUTO-UPDATE
   B) New product/offer, high-confidence SKU + outbound verify ok      → AUTO-PUBLISH
   C) Low match / search-URL / title mismatch                          → needs_review in queue;
      agent blijft zelf fixen (juiste product-URL). Geen 🔒, geen owner ✅.
      Nooit affiliate_link_status=ok op verkeerde SKU of zoek-URL.
   D) New/changed factual claim WITH citable source                    → AUTO-PUBLISH via PR
      (bron-URL + checked-at in PR/seed). Geen owner ✅.
   E) Cannot find a citable source                                     → DO NOT PUBLISH;
      note in digest, probeer later opnieuw. Geen 🔒 tenzij P0 site-down.
3. Ship via `ship-via-pr` (label agent + department). Auto-merge wanneer CI groen is.
4. Optional Slack/Cursor digest: wat veranderde + PR-link. Geen actie vragen.
```

## Rules

- Elke gepubliceerde prijs/claim heeft **bron-URL** + **checked-at**.
- Price history is append-only.
- Nooit verzinnen, schatten of "redelijkerwijs aannemen".
- Nooit `affiliate_link_status=ok` als merchant-titel/tokens niet matchen met onze SKU.
- **Geen** 🔒 Slack en **geen** Cursor-✅ vragen voor prijs/catalogus/feiten met bron.
- Uitzondering (geld uitgeven): refunds / betaalde supplier-acties blijven commerce-ops
  met bestaande admin-flow; dat is geen content/price gate.
