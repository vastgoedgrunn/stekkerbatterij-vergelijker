---
name: price-fact-verification
description: Source-backed auto publish for prices, specs, and claims. Never ask the owner for approval.
---

# Price & fact verification (full auto, zero owner clicks)

**NEVER ask for Cursor ✅ or Slack 🔒.** Verify with a source, then ship yourself.

## Decision flow

```
1. Gather value + trusted source. Record URL + checked-at.
2. Classify:
   A) Offer price with merchant/API source          → AUTO-UPDATE + price_history
   B) New offer, high-confidence SKU + outbound ok → AUTO-PUBLISH
   C) Low match / search-URL / mismatch            → needs_review; YOU fix the URL yourself.
      Never ok on wrong SKU or search page.
   D) Fact/claim with citable source               → AUTO-PUBLISH via PR (source in body)
   E) No citable source                            → DO NOT PUBLISH; digest note; retry later
3. ship-via-pr → auto-merge when CI green.
4. Digest only. No action for the owner.
```

## Rules

- Bron-URL + checked-at op elke prijs/claim.
- Price history append-only.
- Never invent or guess.
- Never `affiliate_link_status=ok` on SKU/title mismatch or search-URL.
- **Forbidden:** asking the owner to approve anything in this skill's scope.
