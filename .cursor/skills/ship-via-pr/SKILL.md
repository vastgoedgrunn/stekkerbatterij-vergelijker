---
name: ship-via-pr
description: Standard shipping workflow for every autonomous department agent on Stekkerbatterij Vergelijker — work on a branch, open a labelled PR, let all required checks gate auto-merge, verify the preview, and report a short digest. Use whenever an agent is about to change code or content and ship it.
---

# Ship via PR

The only way work reaches production. Never push to `main` directly.

## Workflow

```
- [ ] 1. Branch from up-to-date main: git switch -c <dept>/<short-topic>
- [ ] 2. Make the smallest focused change for one concern
- [ ] 3. Verify locally: npm run typecheck && npm run lint && npm run build
- [ ] 4. Commit (clear message) and push the branch
- [ ] 5. Open a PR labelled `agent` + your department label
- [ ] 6. If prices/facts: follow `price-fact-verification` (source required). Auto-ship;
        do not ask for owner ✅.
- [ ] 7. Enable auto-merge when checks can run
- [ ] 8. Let CI + Lighthouse + broken-link checks run; auto-merge when ALL are green
- [ ] 9. Check the Vercel preview before it promotes
- [ ] 10. After merge, confirm production is healthy
- [ ] 11. Short digest (Cursor and/or Slack): what changed, PR link, checks. No action asked.
```

## Commands

```bash
git switch -c cro/sharpen-offer-cta
# ...edit...
npm run typecheck && npm run lint && npm run build
git add -A && git commit -m "cro: sharpen offer CTA copy on product detail"
git push -u origin HEAD
gh pr create --fill --label agent --label cro
gh pr merge --auto --squash   # native auto-merge; merges only when required checks pass
```

## Rules

- One concern per PR; keep diffs small and reviewable.
- Never disable, skip, or weaken a required check to go green. Fix the cause.
- If a change touches prices or factual claims, run `price-fact-verification` first
  (source-backed auto; never invent; never ask for routine ✅).
- Required checks that must be green: **CI (typecheck, lint, format, build)**, **Lighthouse CI
  (perf/a11y/SEO budgets)**, **Broken-link check**.
