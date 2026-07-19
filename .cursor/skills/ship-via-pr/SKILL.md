---
name: ship-via-pr
description: Standard shipping workflow for every autonomous department agent on Stekkerbatterij Vergelijker — work on a branch, open a labelled PR, let all required checks gate auto-merge, verify the preview, and report to Slack. Use whenever an agent is about to change code or content and ship it.
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
- [ ] 6. If price/fact gate applies:
      - Owner in Cursor chat → ask once with source + EXECUTE; on ✅ execute immediately
        (no Slack ritual).
      - Unattended Cloud Agent → post 🔒 Slack WITH this PR URL + EXECUTE; wait for ✅.
      Do not ask for ✅ before the PR exists. Do not double-ask (Cursor + Slack).
- [ ] 7. Else (no gate): enable auto-merge when checks can run
- [ ] 8. Let CI + Lighthouse + broken-link checks run; auto-merge when ALL are green
- [ ] 9. Check the Vercel preview before it promotes
- [ ] 10. After merge, confirm production is healthy
- [ ] 11. Short summary in Cursor (and optional Slack digest: what changed, PR link, checks)
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
- If a change touches prices or factual claims, run `price-fact-verification` first.
- Required checks that must be green: **CI (typecheck, lint, format, build)**, **Lighthouse CI
  (perf/a11y/SEO budgets)**, **Broken-link check**.
- Unattended gate Slack posts always use the 🔒 template in `docs/agents/slack-ops.md`
  (PR URL + EXECUTE). Cursor-chat approval counts as the human gate when the owner is present.
