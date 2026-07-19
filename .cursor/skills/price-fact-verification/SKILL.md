---
name: price-fact-verification
description: Verification gate for any researched price, spec, or factual claim (saldering, subsidies, regulation, warranty) on Stekkerbatterij Vergelijker. Decides what may auto-update within a margin versus what needs explicit owner approval with source citation. Use before publishing any price change or factual statement.
---

# Price & fact verification gate

The single human carve-out in an otherwise fully-automatic system. Protects accuracy and trust.

## Decision flow

```
1. Gather the value + a trusted source (merchant/manufacturer page). Record URL + checked-at.
2. Classify the change:
   A) Existing offer, price move within margin (default ≤ 10%)  → AUTO-UPDATE (still cite source)
   B) Price move larger than margin                              → OWNER APPROVAL
   C) New product / offer via Catalog Discovery with high-confidence
      SKU match AND outbound verify status ok                    → AUTO-PUBLISH
   D) New product / offer with low match, search/homepage URL,
      or title/SKU mismatch                                      → OWNER APPROVAL (needs_review)
   E) New/changed factual claim (saldering, subsidy, rule, ...)  → OWNER APPROVAL
   F) Cannot find a citable source                              → DO NOT PUBLISH; ask owner
3. Auto-updates: ship via `ship-via-pr` with sources in the PR body + short digest
   (or run pipeline + digest when only data changed).
4. Approval items:
   - Open the PR first (even if still draft).
   - If owner is in Cursor chat: present change + source, wait for clear ✅ / "akkoord",
     then EXECUTE immediately. Do NOT also require Slack ✅.
   - If unattended (Cloud Agent / no chat): post 🔒 Slack with PR URL + EXECUTE steps;
     wait for Slack ✅ (automation "Slack ✅ execute approval").
5. Never set affiliate_link_status=ok when merchant page title/tokens disagree with our SKU.
```

## Cursor chat approval (preferred when owner is present)

When the owner is in this conversation, ask once with source + impact. On clear approval
(✅, "doe maar", "akkoord", "goedkeuren", "ja zo doen"), run EXECUTE without Slack.

```
Goedkeuring nodig: <korte titel>

Change: <old> → <new>  (<why>)
Source: <url>  (checked <UTC timestamp>)
Impact: <what changes on the site>
PR: https://github.com/vastgoedgrunn/stekkerbatterij-vergelijker/pull/<N>

EXECUTE bij jouw ✅:
- Ready + auto-merge PR #<N>
- <eventuele DB/admin stap>
```

## Slack approval request template (alleen unattended)

Elke gate-post **moet** starten met `🔒`, een GitHub PR-URL bevatten, en uitvoerbare
`EXECUTE:`-regels. Zonder PR kan ✅-automation niet mergen.

```
🔒 Goedkeuring: <korte titel>

Change: <old> → <new>  (<why: price move X% / new claim / new offer>)
Source: <url>  (checked <UTC timestamp>)
Impact: <what changes on the site>

PR: https://github.com/vastgoedgrunn/stekkerbatterij-vergelijker/pull/<N>

EXECUTE:
- Ready + auto-merge PR #<N>
- <eventuele DB/admin stap, of "geen extra data-stap">

Reageer ✅ om uit te voeren · ❌ om af te wijzen
```

## Rules

- Every published price/claim carries a **source URL** and a **checked-at timestamp**.
- Margin is configurable; when in doubt, treat as approval-required.
- Price history is append-only — never rewrite past points.
- Never invent, estimate, or "reasonably assume" a price or legal/subsidy fact.
- Never post a 🔒 Slack approval without a PR URL (except pure admin gates: lead/refund with admin URL).
- Never make the owner approve the same item twice (Cursor then Slack).
