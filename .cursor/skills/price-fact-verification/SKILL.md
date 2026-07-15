---
name: price-fact-verification
description: Verification gate for any researched price, spec, or factual claim (saldering, subsidies, regulation, warranty) on Stekkerbatterij Vergelijker. Decides what may auto-update within a margin versus what needs a 1-click Slack approval with source citation. Use before publishing any price change or factual statement.
---

# Price & fact verification gate

The single human carve-out in an otherwise fully-automatic system. Protects accuracy and trust.

## Decision flow

```
1. Gather the value + a trusted source (merchant/manufacturer page). Record URL + checked-at.
2. Classify the change:
   A) Existing offer, price move within margin (default ≤ 10%)  → AUTO-UPDATE (still cite source)
   B) Price move larger than margin                              → SLACK APPROVAL
   C) New product / offer via Catalog Discovery with high-confidence
      SKU match AND outbound verify status ok                    → AUTO-PUBLISH
   D) New product / offer with low match, search/homepage URL,
      or title/SKU mismatch                                      → SLACK APPROVAL (needs_review)
   E) New/changed factual claim (saldering, subsidy, rule, ...)  → SLACK APPROVAL
   F) Cannot find a citable source                              → DO NOT PUBLISH; ask in Slack
3. Auto-updates: ship via `ship-via-pr` with sources in the PR body + Slack digest
   (or run pipeline + Slack digest when only data changed).
4. Approval items: post a Slack request and wait for the 1-click approve before shipping.
5. Never set affiliate_link_status=ok when merchant page title/tokens disagree with our SKU.
```

## Slack approval request template

```
🔎 Verification needed — <product/merchant>
Change: <old> → <new>  (<why: price move X% / new claim / new offer>)
Source: <url>  (checked <UTC timestamp>)
Impact: <what changes on the site>
Approve to publish? ✅ / ❌
```

## Rules

- Every published price/claim carries a **source URL** and a **checked-at timestamp**.
- Margin is configurable; when in doubt, treat as approval-required.
- Price history is append-only — never rewrite past points.
- Never invent, estimate, or "reasonably assume" a price or legal/subsidy fact.
