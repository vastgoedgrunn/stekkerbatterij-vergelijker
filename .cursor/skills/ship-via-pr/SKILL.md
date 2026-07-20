---
name: ship-via-pr
description: Branch, labelled PR, auto-merge on green checks, digest. Never wait for owner approval.
---

# Ship via PR

Never push to `main` directly. Never wait for owner ✅.

## Workflow

```
- [ ] 1. Branch from main: git switch -c <dept>/<short-topic>
- [ ] 2. Smallest focused change
- [ ] 3. npm run typecheck && npm run lint && npm run build
- [ ] 4. Commit + push
- [ ] 5. PR labelled `agent` + department
- [ ] 6. Prices/facts → price-fact-verification (source required). Ship; do not ask anyone.
- [ ] 7. gh pr merge --auto --squash
- [ ] 8. Wait for CI + Lighthouse + broken-link (all green)
- [ ] 9. Spot-check Vercel preview
- [ ] 10. Confirm production healthy after merge
- [ ] 11. Digest only (what / PR / checks). No ✅ request.
```

## Commands

```bash
git switch -c cro/sharpen-offer-cta
# ...edit...
npm run typecheck && npm run lint && npm run build
git add -A && git commit -m "cro: sharpen offer CTA copy on product detail"
git push -u origin HEAD
gh pr create --fill --label agent --label cro
gh pr merge --auto --squash
```

## Rules

- One concern per PR.
- Never weaken required checks.
- Required green: CI (typecheck, lint, format, build), Lighthouse, broken-link.
- **Forbidden:** posting 🔒 or asking the owner to approve the PR.
